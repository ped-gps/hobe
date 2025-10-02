import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { environment } from '../../environments/environment';
import { Page } from '../models/page';
import { Vaccine } from '../models/vaccine';
import { AbstractService } from './abstract-service';
import { AlertService } from './alert.service';

@Injectable({
    providedIn: 'root'
})
export class VaccineService extends AbstractService<Vaccine> {
    protected _baseURL = environment.API + '/vaccines';

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
    ): Promise<Page<Vaccine>> {
        return super.search(page, size, sort, direction, filters);
    }
}
