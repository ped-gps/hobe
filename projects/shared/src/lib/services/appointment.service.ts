import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { environment } from '../../environments/environment';
import { AlertType } from '../enums/alert-type';
import { AppointmentSituation } from '../enums/appointment-situation';
import { AppointmentStatistics } from '../models/appointment-statistics';
import { Appointment } from '../models/appointments';
import { Page } from '../models/page';
import { AbstractService } from './abstract-service';
import { AlertService } from './alert.service';

@Injectable({
	providedIn: 'root',
})
export class AppointmentService extends AbstractService<Appointment> {
	protected _baseURL = `${environment.API}/appointments`;

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
			partnerId?: string;
			healthProfessionalId?: string;
			startDate?: string;
			endDate?: string;
			situation?: AppointmentSituation;
		},
		options?: {
			showErrorMessage?: boolean;
		},
	): Promise<Page<Appointment>> {
		return super.search(page, size, sort, direction, filters, options);
	}

	statistics(
		partnerId: string,
		healthProfessionalId: string,
		startDate: string,
		endDate: string,
	) {
		return new Promise<AppointmentStatistics>((resolve, reject) => {
			const params: any = {
				partnerId,
				healthProfessionalId,
				startDate,
				endDate,
			};

			this._http
				.get<AppointmentStatistics>(`${this._baseURL}/statistics`, {
					params: params,
				})
				.subscribe({
					next: (response) => {
						resolve(response);
					},

					error: (error) => {
						console.error(error);
						this._alertService.showMessage(
							AlertType.ERROR,
							'Erro',
							'Não foi possível obter os dados estatísticos dos agendamentos!',
						);
						reject(error);
					},
				});
		});
	}
}
