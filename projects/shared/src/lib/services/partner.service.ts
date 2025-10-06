import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { environment } from '../../environments/environment';
import { Partner } from '../models/partner';
import { FileLoaded } from './../utils/file.util';
import { AbstractService } from './abstract-service';
import { AlertService } from './alert.service';

@Injectable({
	providedIn: 'root',
})
export class PartnerService extends AbstractService<Partner> {
	protected _baseURL = environment.API + '/partners';

	constructor(
		protected _http: HttpClient,
		protected _alertService: AlertService,
	) {
		super();
	}

	saveWithFiles(
		partner: Partner,
		files: Array<FileLoaded>,
		options?: {
			showSuccessMessage?: boolean;
			showErrorMessage?: boolean;
		},
	): Promise<Partner> {
		return new Promise((resolve, reject) => {
			const formData = new FormData();

			formData.append(
				'partner',
				new Blob([JSON.stringify(partner)], {
					type: 'application/json',
				}),
			);

			if (files) {
				files.forEach((file) => {
					formData.append(
						'files',
						new Blob([file.file!], { type: 'multipart/form-data' }),
						file.file!.name,
					);
				});
			}

			this._http.post<Partner>(this._baseURL, formData).subscribe({
				next: (partner) => {
					options?.showSuccessMessage &&
						this._alertService.handleSuccess(
							'Cadastrado com sucesso!',
						);
					resolve(partner);
				},

				error: (error) => {
					console.error(error);
					this._alertService.handleError(error);
					reject(error);
				},
			});
		});
	}

	updateWithPicture(
		partner: Partner,
		picture: FileLoaded,
		options?: {
			showSuccessMessage?: boolean;
			showErrorMessage?: boolean;
		},
	): Promise<Partner> {
		return new Promise<Partner>(async (resolve, reject) => {
			const formData = new FormData();

			formData.append(
				'partner',
				new Blob([JSON.stringify(partner)], {
					type: 'application/json',
				}),
			);
			formData.append(
				'picture',
				new Blob([picture.file!], { type: 'multipart/form-data' }),
				picture.file!.name,
			);

			this._http
				.put<Partner>(`${this._baseURL}/${partner.id}`, formData)
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
