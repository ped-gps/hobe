import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { environment } from '../../environments/environment';
import { Page } from '../models/page';
import { Service } from '../models/service';
import { AbstractService } from './abstract-service';
import { AlertService } from './alert.service';

@Injectable({
    providedIn: 'root',
})
export class ServiceService extends AbstractService<Service> {
    
	protected _baseURL = `${environment.API}/services`;

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
            name?: string,
			code?: string,
			partnerId?: string,
            medicalInsuranceId?: string,
            healthProfessionalId?: string
        },
        options?: {
            showErrorMessage?: boolean;
        }
    ): Promise<Page<Service>> {
        return super.search(page, size, sort, direction, filters, options);
    }
}