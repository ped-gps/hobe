import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { filter } from 'rxjs/operators';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';

import { environment } from '../../environments/environment';
import { AuthenticationService } from './authentication.service';
import { WebSocketEvent } from '../models/websocket-event';

@Injectable({
    providedIn: 'root',
})
export class WebsocketService {
    private _socket$: WebSocketSubject<any> | null = null;
    private _messages$ = new Subject<WebSocketEvent>();
    private _connected$ = new BehaviorSubject<boolean>(false);

    private reconnectTimer: any = null;
    private reconnectAttempts = 0;
    private readonly maxBackoffMs = 30000;
    private heartbeatTimer: any = null;

    constructor(private readonly _auth: AuthenticationService) {
        this._connect();
    }

    getConnected() {
        return this._connected$.asObservable();
    }

    getMessage() {
        return this._messages$.asObservable();
    }

    getMessageFrom(topic: string) {
        return this._messages$.pipe(
            filter((m: any) => (m as any)?.topic === topic)
        );
    }

    async subscribe(topic: string) {
        if (!this._socket$ || this._connected$.value === false) return;
        topic = topic.startsWith('/') ? topic : '/' + topic;
        topic = `/topic${topic}`;

        this._socket$.next({ action: 'subscribe', topic });
        return topic;
    }

    async unsubscribe(topic: string) {
        if (!this._socket$ || this._connected$.value === false) return;
        this._socket$.next({ action: 'unsubscribe', topic });
    }

    // ----------------- conexão -----------------

    private _connect() {
        this._auth.getAuthentication().subscribe(async (auth) => {
            if (!auth) return;

            const token = auth?.idToken;
            const user = await this._auth.retrieveUser();
            const url = `${environment.API_WS}?token=${encodeURIComponent(
                token
            )}`;

            this._socket$ = webSocket<WebSocketEvent>({
                url,
                deserializer: this._deserializer,
                serializer: (v) => JSON.stringify(v),
                openObserver: {
                    next: () => this._onOpen(user.id!),
                },
                closeObserver: {
                    next: (ev: CloseEvent) => this._onClose(ev),
                },
            });

            this._socket$.subscribe({
                next: (evt) => this._onMessage(evt),
                error: (err) => this._onError(err),
            });
        });
    }

    private _deserializer(event: MessageEvent<any>) {
        if (!event || !event.data) return null;

        const data = event.data;

        // Se for string, tentar fazer parse
        if (typeof data === 'string') {
            try {
                return JSON.parse(data);
            } catch {
                // Não é JSON → tratar como mensagem crua
                return { type: 'raw', data };
            }
        }

        // Se não for string (ex.: ArrayBuffer, Blob), apenas retornar como raw
        return { type: 'raw', data };
    }

    private _onOpen(userId: string) {
        console.info('Conexão WebSocket estabelecida!');
        this._connected$.next(true);
        this.reconnectAttempts = 0;
        this._clearReconnect();
        this._startHeartbeat();

        this._socket$?.next({
            action: 'subscribe',
            topic: `/topic/${userId}/chats`,
        });
    }

    private _onMessage(message: any) {
        if (!message) return;

        if (message.type === 'pong') return; // heartbeat

        if (message.type === 'raw') {
            console.log(message.data);
            return;
        }

        // Evento válido vindo do backend
        if (message.type && message.object) {
            this._messages$.next(message);
        }
    }

    private _onError(error: any) {
        console.error('Erro na conexão WebSocket:', error);
        this._connected$.next(false);
        this._scheduleReconnect();
    }

    private _onClose(ev: CloseEvent) {
        console.warn('WebSocket fechado:', ev.code, ev.reason || '');
        this._connected$.next(false);
        this._stopHeartbeat();
        this._scheduleReconnect();
    }

    // ----------------- reconexão -----------------

    private _scheduleReconnect() {
        if (this.reconnectTimer) return;

        const delay = Math.min(
            1000 * Math.pow(2, this.reconnectAttempts++),
            this.maxBackoffMs
        );
        console.info(`Tentando reconectar em ${Math.round(delay / 1000)}s...`);

        this.reconnectTimer = setTimeout(() => {
            this.reconnectTimer = null;
            this._connect();
        }, delay);
    }

    private _clearReconnect() {
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
    }

    // ----------------- heartbeat -----------------

    private _startHeartbeat() {
        this._stopHeartbeat();
        // manda ping a cada 2 minutos
        this.heartbeatTimer = setInterval(() => {
            if (this._socket$ && this._connected$.value) {
                this._socket$.next({ action: 'ping' });
            }
        }, 120000);
    }

    private _stopHeartbeat() {
        if (this.heartbeatTimer) {
            clearInterval(this.heartbeatTimer);
            this.heartbeatTimer = null;
        }
    }
}
