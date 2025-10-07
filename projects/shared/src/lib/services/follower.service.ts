import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { environment } from '../../environments/environment';
import { AbstractService } from './abstract-service';
import { AlertService } from './alert.service';
import { Follower } from '../models/follower';
import { Page } from '../models/page';

@Injectable({
    providedIn: 'root'
})
export class FollowerService extends AbstractService<Follower> {


    protected readonly _baseURL = `${environment.API}/followers`;

    constructor(
        protected readonly _http: HttpClient,
        protected readonly _alertService: AlertService
    ) {
        super(); 
    }

    override search(
        page: number, 
        size: number, 
        sort: string, 
        direction: string, 
        filters: {
            profileId: string,
            followerName?: string
        }
    ): Promise<Page<Follower>> {
        return super.search(page, size, sort, direction, filters);
    }
}
