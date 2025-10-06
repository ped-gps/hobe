import { Location } from '@angular/common'; // Importar Location
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

import { ModelAction } from '../../enums/model-action';
import { ModelType } from '../../enums/model-type';
import Chat from '../../models/chat';
import { Message } from '../../models/message';
import { Notification } from '../../models/notification';
import { User } from '../../models/user';
import { AuthenticationService } from '../../services/authentication.service';
import { ChatService } from '../../services/chat.service';
import { NotificationService } from '../../services/notification.service';
import { WebsocketService } from '../../services/websocket.service';
import { FileTypeUtils } from '../../utils/file-type.util';
import { OperatorUtils } from '../../utils/operator.util';

@Component({
	selector: 'app-chats',
	templateUrl: './chats.component.html',
	styleUrl: './chats.component.scss',
})
export class ChatsComponent implements OnInit, OnDestroy {
	public chatSelected!: Chat;
	public chatsToShow: Array<Chat> = [];
	public user!: User;

	public searchText!: string;
	public isLoading: boolean = false;
	public totalElements: number = 0;
	public rows: number = 10;
	public first: number = 0;

	private _wsTopics: string[] = [];
	private _subscriptions: Subscription[] = [];
	private _time!: any;
	private _chats: Array<Chat> = [];

	constructor(
		private readonly _activatedRoute: ActivatedRoute,
		private readonly _authenticationService: AuthenticationService,
		private readonly _chatService: ChatService,
		private readonly _notificationService: NotificationService,
		private readonly _webSocketService: WebsocketService,
		private readonly _location: Location,
	) {}

	async ngOnInit(): Promise<void> {
		await this._fetchData();
		this._listenWebSocketConnection();
	}

	ngOnDestroy(): void {
		// Cancela listeners RxJS
		this._subscriptions.forEach((sub) => sub.unsubscribe());

		// Cancela listeners no WebSocket
		this._wsTopics.forEach((topic) => {
			this._webSocketService.unsubscribe(topic);
		});
	}

	public getLastMessageLabel(chat: Chat) {
		if (chat.lastMessage) {
			if (chat.lastMessage.content) {
				return chat.lastMessage.content;
			}

			if (chat.lastMessage.files && chat.lastMessage.files.length > 0) {
				const file = chat.lastMessage.files[0];
				return FileTypeUtils.getFriendlyName(file.type);
			}
		}

		return '';
	}

	public onChatPress(chat: Chat): void {
		this.chatSelected = chat;
		this._location.replaceState(`/chats/${chat.id}`);
	}

	public onInput(): void {
		clearTimeout(this._time);

		this._time = setTimeout(() => {
			const searchText = this.searchText.toLowerCase();

			if (this.searchText !== '') {
				this.chatsToShow = this._chats.filter((c) =>
					c.chatName?.toLowerCase().includes(searchText),
				);
			} else {
				this._updateChatsToShow();
			}

			this.totalElements = this.chatsToShow.length;
			this.first = 0;
		}, 500);
	}

	private async _fetchData(): Promise<void> {
		this.isLoading = true;
		await OperatorUtils.delay(500);

		try {
			this.user = await this._authenticationService.retrieveUser();
			const chatsPage = await this._chatService.search(
				-1,
				-1,
				'lastModifiedDate',
				'desc',
				{ memberId: this.user.id },
			);
			this._chats = chatsPage.content; // Armazena todos os chats
			this.totalElements = this._chats.length;
			this._updateChatsToShow();

			const id = this._activatedRoute.snapshot.paramMap.get('id');

			if (id) {
				this.chatSelected = await this._chatService.findById(id);
			}
		} finally {
			this.isLoading = false;
		}
	}

	private _updateChatsToShow(): void {
		const start = this.first;
		const end = this.first + this.rows;
		this.chatsToShow = this._chats.slice(start, end);
	}

	public async onPageChange(event: any): Promise<void> {
		this.first = event.first;
		this.rows = event.rows;
		this._updateChatsToShow();
	}

	private async _addListener(chat: Chat) {
		const topic = await this._webSocketService.subscribe(
			`/chats/${chat.id}`,
		);
		if (topic) this._wsTopics.push(topic);
	}

	private async _addListeners() {
		for (const chat of this._chats) {
			await this._addListener(chat);
		}
	}

	private _listenWebSocketConnection() {
		const subscription = this._webSocketService
			.getConnected()
			.subscribe(async (connected) => {
				if (connected) {
					await this._addListeners();
					this._listenMessages();
				}
			});

		this._subscriptions.push(subscription);
	}

	private _listenMessages(): void {
		const subscription = this._webSocketService
			.getMessage()
			.subscribe(async (webSocketMessage) => {
				if (webSocketMessage) {
					if (webSocketMessage.type === ModelType.CHAT) {
						const chat: Chat = webSocketMessage.object;
						const exists = this._chats.some(
							(c) => c.id === chat.id,
						);

						if (
							webSocketMessage.action === ModelAction.SAVE &&
							!exists
						) {
							const chatFindById =
								await this._chatService.findById(chat.id!);
							this._chats = [...this._chats, chatFindById];
							this.totalElements = this._chats.length;
							this._updateChatsToShow();
							this._addListener(chatFindById);
						}

						if (
							webSocketMessage.action === ModelAction.UPDATE &&
							exists
						) {
							const chatsIndex = this._chats.findIndex(
								(c) => c.id === chat.id,
							);

							if (chatsIndex !== -1) {
								const existingChat: Chat = {
									...this._chats[chatsIndex],
								};
								const updatedChat = {
									...existingChat,
									...chat,
								};
								this._chats.splice(chatsIndex, 1, updatedChat);
								this._updateChatsToShow();
							}
						}

						this._sortChats();
					}

					if (webSocketMessage.type === ModelType.MESSAGE) {
						const message: Message = webSocketMessage.object;

						if (webSocketMessage.action === ModelAction.SAVE) {
							const updateLastMessage = (chats: Chat[]) => {
								const chat = chats.find(
									(c) => c.id === message.chat.id,
								);
								if (chat) chat.lastMessage = message;
							};

							updateLastMessage(this._chats);
							updateLastMessage(this.chatsToShow);

							if (
								!this.chatSelected ||
								message.chat.id !== this.chatSelected.id
							) {
								const notification: Notification = {
									title: 'Nova mensagem',
									content: message.content,
									sender: {
										id: message.authorId,
										name: message.authorName,
										picture: message.authorPicture,
									} as User,
									type: ModelType.MESSAGE,
									objectId: message.id!,
								};

								this._notificationService.open(notification, {
									showNotification: false,
								});
							}
						}
					}
				}
			});

		this._subscriptions.push(subscription);
	}

	private _sortChats(): void {
		this._chats = this._chats.sort(
			(a, b) =>
				new Date(b.lastModifiedDate!).getTime() -
				new Date(a.lastModifiedDate!).getTime(),
		);
		this._updateChatsToShow();
	}
}
