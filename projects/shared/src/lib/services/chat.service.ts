import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { environment } from '../../environments/environment';
import { Chat } from '../models/chat';
import { Page } from '../models/page';
import { AbstractService } from './abstract-service';
import { AlertService } from './alert.service';

@Injectable({
	providedIn: 'root',
})
export class ChatService extends AbstractService<Chat> {
	protected _baseURL = environment.API + '/chats';

	constructor(
		protected _alertService: AlertService,
		protected _http: HttpClient,
	) {
		super();
	}

	findByCode(code: string, options?: { showErrorMessage?: boolean }) {
		options = { showErrorMessage: true, ...options };

		return new Promise<Chat>((resolve, reject) => {
			this._http.get<Chat>(`${this._baseURL}/code/${code}`).subscribe({
				next: (chat) => {
					resolve(chat);
				},

				error: (error) => {
					console.error(error);
					options.showErrorMessage &&
						this._alertService.handleError(error);
					reject(error);
				},
			});
		});
	}

	override search(
		page: number,
		size: number,
		sort: string,
		direction: string,
		filters: {
			memberId?: string;
		},
	): Promise<Page<Chat>> {
		return super.search(page, size, sort, direction, filters);
	}
}
