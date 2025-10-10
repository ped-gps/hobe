import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { environment } from '../../environments/environment';
import { FileRequestOrder } from '../models/file-request-order';
import { Page } from '../models/page';
import { Publication } from '../models/publication';
import { FileLoaded } from '../utils/file.util';
import { AbstractService } from './abstract-service';
import { AlertService } from './alert.service';

@Injectable({
	providedIn: 'root',
})
export class PublicationService extends AbstractService<Publication> {

	protected _baseURL = environment.API + '/publications';

	constructor(
		protected _http: HttpClient,
		protected _alertService: AlertService,
	) {
		super();
	}

	override save(
		publication: Publication,
		options: {
			files: Array<FileLoaded>;
			showSuccessMessage?: boolean;
			showErrorMessage?: boolean;
		} = {
            files: [],
            showErrorMessage: true,
            showSuccessMessage: true,
        },
	): Promise<Publication> {
        
		return new Promise<Publication>(async (resolve, reject) => {
			const formData = new FormData();
            const files = options.files;

			formData.append(
				'publication',
				new Blob([JSON.stringify(publication)], {
					type: 'application/json',
				}),
			);

			if (files && files.length > 0) {
				const filesRequestOrder: Array<FileRequestOrder> = [];

				files.forEach((media) => {
					filesRequestOrder.push({
						name: media.file!.name,
						position: media.position!,
					});
				});

				formData.append(
					'filesRequestOrder',
					new Blob([JSON.stringify(filesRequestOrder)], {
						type: 'application/json',
					}),
				);

				files.forEach((file) => {
					formData.append(
						'files',
						new Blob([file.file!], {
							type: 'multipart/form-data',
						}),
						file.file!.name,
					);
				});
			}

			this._http.post<Publication>(this._baseURL, formData).subscribe({
				next: (item) => {
					options?.showSuccessMessage &&
						this._alertService.handleSuccess(
							'Cadastrado com sucesso!',
						);
					resolve(item);
				},

				error: (error) => {
					console.error(error);
					options?.showErrorMessage &&
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
			authorId: string;
		},
	): Promise<Page<Publication>> {
		return super.search(page, size, sort, direction, filters);
	}

	override update(
		publication: Publication,
		options: {
			files: Array<FileLoaded>;
			showSuccessMessage?: boolean;
			showErrorMessage?: boolean;
		} = {
            files: [],
            showErrorMessage: true,
            showSuccessMessage: true,
        },
	): Promise<Publication> {

		return new Promise<Publication>(async (resolve, reject) => {
			const formData = new FormData();
			const files = options.files;

			formData.append(
				'publication',
				new Blob([JSON.stringify(publication)], {
					type: 'application/json',
				}),
			);

			if (files && files.length > 0) {
				const filesRequestOrder: Array<FileRequestOrder> = [];

				files.forEach((file) => {
					const name = file.saved ? file.id?.toString() : file.file!.name;
					
                    filesRequestOrder.push({
						name: name!,
						position: file.position!,
					});
				});

				formData.append(
					'filesRequestOrder',
					new Blob([JSON.stringify(filesRequestOrder)], {
						type: 'application/json',
					}),
				);

				files
					.filter((file) => !file.saved)
					.forEach((file) => {
						formData.append(
							'files',
							new Blob([file.file!], {
								type: 'multipart/form-data',
							}),
							file.file!.name,
						);
					});
			}

			this._http
				.put<Publication>(
					`${this._baseURL}/${publication.id}`,
					formData,
				)
				.subscribe({
					next: (item) => {
						options?.showSuccessMessage &&
							this._alertService.handleSuccess(
								'Atualizado com sucesso!',
							);
						resolve(item);
					},

					error: (error) => {
						console.error(error);
						options?.showErrorMessage &&
							this._alertService.handleError(error);
						reject(error);
					},
				});
		});
	}
}
