import { AbstractModel } from './abstract-model';

export interface OAuthToken extends AbstractModel {
	accessToken: string;
	refreshToken: string;
	expiresIn: number;
}
