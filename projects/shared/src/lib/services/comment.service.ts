import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { environment } from '../../environments/environment';
import { Comment } from '../models/comment';
import { Page } from '../models/page';
import { AbstractService } from './abstract-service';
import { AlertService } from './alert.service';

@Injectable({
    providedIn: 'root'
})
export class CommentService extends AbstractService<Comment> {

    protected _baseURL = environment.API + '/comments';

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
            publicationId?: string
        }
    ): Promise<Page<Comment>> {
        return super.search(page, size, sort, direction, filters);
    }
}