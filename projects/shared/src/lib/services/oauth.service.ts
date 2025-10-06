import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { AlertService } from './alert.service';

@Injectable({
	providedIn: 'root',
})
export class OauthService {
	private readonly _baseURL = environment.API + '/oauth';

	constructor(
		private readonly _alertService: AlertService,
		private readonly _http: HttpClient,
	) {}

	deleteByPartner(partnerId: string) {
		return new Promise<Boolean>((resolve) => {
			this._http.delete<any>(`${this._baseURL}/${partnerId}`).subscribe({
				next: (response) => {
					resolve(response.unsync);
				},

				error: (error) => {
					console.error(error);
					this._alertService.handleError(error);
					resolve(false);
				},
			});
		});
	}

	generate(code: string) {
		return new Promise<Boolean>((resolve) => {
			this._http
				.get(`${this._baseURL}/generate-token`, {
					params: {
						code,
					},
				})
				.subscribe({
					complete: () => {
						resolve(true);
					},

					error: (error) => {
						console.error(error);
						this._alertService.handleError(error);
						resolve(false);
					},
				});
		});
	}
}
