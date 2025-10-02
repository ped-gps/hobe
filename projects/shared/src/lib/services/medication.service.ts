import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { environment } from '../../environments/environment';
import { Medication } from '../models/medication';
import { Page } from '../models/page';
import { AbstractService } from './abstract-service';
import { AlertService } from './alert.service';

@Injectable({
    providedIn: 'root'
})
export class MedicationService extends AbstractService<Medication> {
    protected _baseURL = environment.API + '/medications';

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
        }
    ): Promise<Page<Medication>> {
        return super.search(page, size, sort, direction, filters);
    }
}
