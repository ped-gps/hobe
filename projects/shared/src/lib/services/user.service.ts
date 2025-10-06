import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { environment } from '../../environments/environment';
import { UserProfile } from '../enums/user-profile';
import { AlertService } from './alert.service';

@Injectable({
	providedIn: 'root',
})
export class UserService {
	protected _baseURL = environment.API + '/users';

	constructor(
		private readonly _alertService: AlertService,
		private readonly _http: HttpClient,
	) {}

	emailVerify(email: string, code: string, profile: UserProfile) {
		return new Promise<boolean>((resolve, reject) => {
			const body = { email, code, profile };

			this._http.post(`${this._baseURL}/email-verify`, body).subscribe({
				complete: () => {
					resolve(true);
				},

				error: (error) => {
					console.error(error);
					this._alertService.handleError(error);
					reject(false);
				},
			});
		});
	}

	resendCode(email: string) {
		return new Promise((resolve, reject) => {
			const body = { email, profile: UserProfile.PARTNER };

			this._http
				.post(`${this._baseURL}/resend-email-verify`, body)
				.subscribe({
					complete: () => {
						resolve(true);
					},

					error: (error) => {
						console.error(error);
						this._alertService.handleError(error);
						reject(false);
					},
				});
		});
	}
}
