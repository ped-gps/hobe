import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { environment } from '../../environments/environment';
import { AlertType } from '../enums/alert-type';
import { HealthProfessional } from '../models/health-professional';
import { MedicalAppointment } from '../models/medical-appointment';
import { MedicalAppointmentOverview } from '../models/medical-appointment-overview';
import { Page } from '../models/page';
import { AbstractService } from './abstract-service';
import { AlertService } from './alert.service';

@Injectable({
    providedIn: 'root',
})
export class MedicalAppointmentService extends AbstractService<MedicalAppointment> {

    protected _baseURL = `${environment.API}/medical-appointments`;

    constructor(
        protected _http: HttpClient,
        protected _alertService: AlertService
    ) {
        super();
    }

    overview(
        healthProfessionalId: string,
        startDate: string,
        endDate: string
    ) {

        return new Promise<MedicalAppointmentOverview>((resolve, reject) => {

            const params: any = { healthProfessionalId, startDate, endDate };

            this._http.get<MedicalAppointmentOverview>(`${this._baseURL}/overview`, {
                params: params
            }).subscribe({

                next: (response) => {
                    resolve(response);
                },

                error: (error) => {
					console.error(error);
					this._alertService.showMessage(AlertType.ERROR, 'Erro', 'Não foi possível obter os dados estatísticos dos atendimentos!');
					reject(error);
				},
            })
        });
    }

    printExtract(
        healthProfessional: HealthProfessional, 
        medicalAppointments: Array<MedicalAppointment>,
        startDate: string,
        endDate: string,
        payoutTotal: number
    ) {

        return new Promise<Blob>((resolve, reject) => {

            const requestBody = {
                healthProfessional,
                medicalAppointments,
                startDate,
                endDate,
                payoutTotal
            }

            this._http.post(`${this._baseURL}/extract/print`, requestBody, {
                responseType: 'blob'
            }).subscribe({

                next: (response) => {
                    resolve(response);
                },

                error: (error) => {
					console.error(error);
					this._alertService.showMessage(AlertType.ERROR, 'Erro', 'Não foi possível imprimir o extrado de atendimento!');
					reject(error);
				},
            });
        });
    }

    override search(
        page: number,
        size: number,
        sort: string,
        direction: string,
        filters: {
            clientId?: string,
			healthProfessionalId?: string,
            startDate?: string,
            endDate?: string,
        },
        options?: {
            showErrorMessage?: boolean;
        }
    ): Promise<Page<MedicalAppointment>> {
        return super.search(page, size, sort, direction, filters, options);
    }
}
