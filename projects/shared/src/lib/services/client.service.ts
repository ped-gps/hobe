import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { environment } from '../../environments/environment';
import { Client } from '../models/client';
import { Page } from '../models/page';
import { AbstractService } from './abstract-service';
import { AlertService } from './alert.service';

@Injectable({
    providedIn: 'root',
})
export class ClientService extends AbstractService<Client> {

    protected _baseURL = `${environment.API}/clients`;

    constructor(
        protected _http: HttpClient,
        protected _alertService: AlertService
    ) {
        super();
    }

	override search(
		page: number,
		size: number,
		sort: string,
		direction: string,
		filters: {
			name?: string;
			cpf?: string;
		},
		options?: {
			showErrorMessage?: boolean;
		}
	): Promise<Page<Client>> {
		return super.search(page, size, sort, direction, filters, options);
	}
}
