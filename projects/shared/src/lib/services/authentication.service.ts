import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { CookieService } from 'ngx-cookie-service';
import { BehaviorSubject } from 'rxjs';

import { environment } from '../../environments/environment';
import { Route } from '../enums/route';
import { toUserProfile } from '../enums/user-profile';
import { Authentication } from '../models/authentication';
import { Credentials } from '../models/credentials';
import { User } from '../models/user';
import { AlertService } from './alert.service';

@Injectable({
	providedIn: 'root',
})
export class AuthenticationService {
	private readonly _baseURL: string = `${environment.API}/auth`;
	private readonly _jwtHelper: JwtHelperService;
	private readonly _authentication: BehaviorSubject<Authentication | null>;
	private readonly _user: BehaviorSubject<User | null>;

	constructor(
		private readonly _alertService: AlertService,
		private readonly _cookieService: CookieService,
		private readonly _http: HttpClient,
		private readonly _router: Router,
	) {
		this._jwtHelper = new JwtHelperService();
		this._authentication = new BehaviorSubject<Authentication | null>(null);
		this._user = new BehaviorSubject<User | null>(null);
	}

	getAuthentication() {
		return this._authentication.asObservable();
	}

	setAuthentication(authentication: Authentication | null) {
		this._authentication.next(authentication);
	}

	getUser() {
		return this._user.asObservable();
	}

	setUser(user: User | null) {
		this._user.next(user);
	}

	retrieveUser() {
		return new Promise<User>((resolve) => {
			this._user.asObservable().subscribe((user) => {
				if (user) {
					resolve(user);
				}
			});
		});
	}

	async init() {
		const idToken = this._cookieService.get('idToken');

		if (idToken) {
			const authentication = this._decodeToken(idToken);
			this.setAuthentication(authentication);
			const user = await this._getUser();
			this.setUser(user);
		}
	}

	isAuthenticated(): boolean {
		const idToken = this._cookieService.get('idToken');
		return !!idToken && !this._jwtHelper.isTokenExpired(idToken);
	}

	async logout(): Promise<void> {
		const promise = new Promise<boolean>((resolve) => {
			this._http.post(`${this._baseURL}/logout`, {}).subscribe({
				complete: () => {
					resolve(true);
				},
			});
		});

		const complete = await Promise.resolve(promise);

		if (complete) {
			this.setAuthentication(null);
			this.setUser(null);
			this._router.navigate([Route.SIGN_IN]);
		}
	}

	token(credentials: Credentials) {
		return new Promise((resolve, reject) => {
			this._http.post(`${this._baseURL}/token`, credentials).subscribe({
				next: (response) => {
					resolve(response);
				},

				error: (error) => {
					console.error(error);
					this._alertService.handleError(error);
					reject(error);
				},
			});
		});
	}

	private _decodeToken(idToken: string): Authentication {
		const decodedToken = this._jwtHelper.decodeToken(idToken);
		const authentication: Authentication = {
			idToken: idToken,
			username: decodedToken.sub,
			expires: decodedToken.exp * 1000,
			roles: decodedToken.scope || [],
			profile: decodedToken.profile,
		};

		return authentication;
	}

	private _getUser() {
		return new Promise<User>((resolve, reject) => {
			const { profile } = this._authentication.value!;

			this._http.get<User>(`${this._baseURL}/user`).subscribe({
				next: (response) => {
					resolve({
						...response,
						profile: toUserProfile(profile)!,
					});
				},

				error: (error) => {
					console.error(error);
					this._alertService.handleError(error);
					reject(error);
				},
			});
		});
	}
}
