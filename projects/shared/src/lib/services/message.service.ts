import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { environment } from '../../environments/environment';
import { Message } from '../models/message';
import { Page } from '../models/page';
import { FileLoaded } from './../utils/file.util';
import { AbstractService } from './abstract-service';
import { AlertService } from './alert.service';

@Injectable({
	providedIn: 'root'
})
export class MessageService extends AbstractService<Message> {

	protected _baseURL = environment.API + '/messages';
	
	constructor(
		protected _alertService: AlertService,
		protected _http: HttpClient,
	) {
		super();
	}

	saveWithFiles(
		message: Message, 
		files: Array<FileLoaded>,
		options?: {
            showSuccessMessage?: boolean,
            showErrorMessage?: boolean,
        }
	): Promise<Message> {

		if (!options) {
            options = {
                showErrorMessage: true,
                showSuccessMessage: true
            }
        }

		return new Promise<Message>((resolve, reject) => {

			const formData = new FormData();

			formData.append('message', new Blob([JSON.stringify(message)], { type: 'application/json' }));

			if (files && files.length > 0) {
				
				files.forEach(file => {
					formData.append('files', new Blob([file.file!], { type: 'multipart/form-data' }), file.file!.name)
				});
			}

			this._http.post<Message>(this._baseURL, formData).subscribe({

				next: (item) => {
                    options?.showSuccessMessage && this._alertService.handleSuccess("Cadastrado com sucesso!");
                    resolve(item);
                },

                error: (error) => {
                    console.error(error);
                    options?.showErrorMessage && this._alertService.handleError(error);
                    reject(error);
                }
			});
		});
	}

	override search(
		page: number, 
		size: number, 
		sort: string, 
		direction: string, 
		filters: {
			chatId?: string,
		}
	): Promise<Page<Message>> {
		return super.search(page, size, sort, direction, filters);
	}

	updateViews(id: string, viewer: string) {

		return new Promise<Message>((resolve, reject) => {

			const requestBody = {
				viewer
			}

			this._http.put<Message>(`${this._baseURL}/${id}/views`, requestBody).subscribe({
				next: (response)  => resolve(response),
				error: (error) => {
                    console.error(error);
                    this._alertService.handleError(error);
                    reject(error);
                }
			});
		});
	}
}