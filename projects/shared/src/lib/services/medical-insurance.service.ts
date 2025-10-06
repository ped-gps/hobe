import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { environment } from '../../environments/environment';
import { MedicalInsurance } from '../models/medical-insurance';
import { Page } from '../models/page';
import { AbstractService } from './abstract-service';
import { AlertService } from './alert.service';

@Injectable({
	providedIn: 'root',
})
export class MedicalInsuranceService extends AbstractService<MedicalInsurance> {
	protected _baseURL = `${environment.API}/medical-insurances`;

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
			code?: string;
			partnerId?: string;
		},
		options?: {
			showErrorMessage?: boolean;
		},
	): Promise<Page<MedicalInsurance>> {
		return super.search(page, size, sort, direction, filters, options);
	}
}
