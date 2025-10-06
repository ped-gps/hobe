import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { environment } from '../../environments/environment';
import { Exam } from '../models/exam';
import { Page } from '../models/page';
import { AbstractService } from './abstract-service';
import { AlertService } from './alert.service';

@Injectable({
	providedIn: 'root',
})
export class ExamService extends AbstractService<Exam> {
	protected _baseURL = environment.API + '/exams';

	constructor(
		protected _http: HttpClient,
		protected _alertService: AlertService,
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
			tussCode?: string;
		},
	): Promise<Page<Exam>> {
		return super.search(page, size, sort, direction, filters);
	}
}
