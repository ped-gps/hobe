import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { environment } from '../../environments/environment';
import { Page } from '../models/page';
import { Procedure } from '../models/procedure';
import { AbstractService } from './abstract-service';
import { AlertService } from './alert.service';

@Injectable({
    providedIn: 'root',
})
export class ProcedureService extends AbstractService<Procedure> {
	
    protected _baseURL = `${environment.API}/procedures`;

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
    ): Promise<Page<Procedure>> {
        return super.search(page, size, sort, direction, filters, options);
    }
}
