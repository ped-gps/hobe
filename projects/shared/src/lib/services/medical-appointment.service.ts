import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { environment } from '../../environments/environment';
import { AlertType } from '../enums/alert-type';
import { MedicalAppointment } from '../models/medical-appointment';
import { MedicalAppointmentDocumentPrintRequest } from '../models/medical-appointment-document-print-request';
import { MedicalAppointmentExtractPrintRequest } from '../models/medical-appointment-extract-print-request';
import { MedicalAppointmentOverview } from '../models/medical-appointment-overview';
import { Page } from '../models/page';
import { PrescribedExamsPrintRequest } from '../models/prescribed-exams-print-request';
import { PrescribedMedicationsPrintRequest } from '../models/prescribed-medications-print-request';
import { PrescribedVaccinesPrintRequest } from '../models/prescribed-vaccines-print-request';
import { FileLoaded } from '../utils/file.util';
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

    findByAppointmentId(appointmentId: string) {

        return new Promise<MedicalAppointment>((resolve, reject) => {

            this._http.get<MedicalAppointment>(`${this._baseURL}/appointment/${appointmentId}`).subscribe({
                next: appointment => resolve(appointment),
                error: err => {
                    console.error(err);
                    this._alertService.handleError(err);
                    reject(err);
                }
            })
        })
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

    printDocumentsCertificates(id: string, payload: MedicalAppointmentDocumentPrintRequest): Promise<Blob> {
        return new Promise<Blob>((resolve, reject) => {
            this._http.post(`${this._baseURL}/${id}/documents/print`, payload,
                {
                    headers: new HttpHeaders({
                        'Content-Type': 'application/json; charset=utf-8',
                        'Accept': 'application/pdf'
                    }),
                    responseType: 'blob' as 'blob'
                }
            ).subscribe({
                next: (file: Blob) => resolve(file),
                error: (err) => reject(err)
            })
        })
    }

    printExtract(requestBody: MedicalAppointmentExtractPrintRequest): Promise<Blob> {
        return new Promise((resolve, reject) => {
            this._http.post(
                `${this._baseURL}/extract/print`,
                requestBody,
                {
                    headers: new HttpHeaders({
                        'Content-Type': 'application/json; charset=utf-8',
                        'Accept': 'application/pdf'
                    }),
                    responseType: 'blob' as 'blob'
                }
            ).subscribe({
                next: (file: Blob) => resolve(file),
                error: err => reject(err)
            });
        });
    }

    printPrescribedExams(id: string, payload: PrescribedExamsPrintRequest): Promise<Blob> {

        return new Promise<Blob>((resolve, reject) => {
            this._http.post(`${this._baseURL}/${id}/prescription/exams/print`, payload,
                {
                    headers: new HttpHeaders({
                        'Content-Type': 'application/json; charset=utf-8',
                        'Accept': 'application/pdf'
                    }),
                    responseType: 'blob' as 'blob'
                }
            ).subscribe({
                next: (file: Blob) => resolve(file),
                error: (err) => reject(err)
            })
        });
    }
    
    printPrescribedMedications(id: string, payload: PrescribedMedicationsPrintRequest): Promise<Blob> {

        return new Promise<Blob>((resolve, reject) => {
            this._http.post(`${this._baseURL}/${id}/prescription/medications/print`, payload,
                {
                    headers: new HttpHeaders({
                        'Content-Type': 'application/json; charset=utf-8',
                        'Accept': 'application/pdf'
                    }),
                    responseType: 'blob' as 'blob'
                }
            ).subscribe({
                next: (file: Blob) => resolve(file),
                error: (err) => reject(err)
            })
        });
    }
    
    printPrescribedVaccines(id: string, payload: PrescribedVaccinesPrintRequest): Promise<Blob> {

        return new Promise<Blob>((resolve, reject) => {
            this._http.post(`${this._baseURL}/${id}/prescription/vaccines/print`, payload,
                {
                    headers: new HttpHeaders({
                        'Content-Type': 'application/json; charset=utf-8',
                        'Accept': 'application/pdf'
                    }),
                    responseType: 'blob' as 'blob'
                }
            ).subscribe({
                next: (file: Blob) => resolve(file),
                error: (err) => reject(err)
            })
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

    updateWithFiles(
        appointment: MedicalAppointment,
        files: Array<FileLoaded>,
        options?: { showSuccessMessage?: boolean; showErrorMessage?: boolean }
    ): Promise<MedicalAppointment> {
        return new Promise<MedicalAppointment>(async (resolve, reject) => {
            try {
                const updated = await super.update(appointment, {
                    showSuccessMessage: false,
                    showErrorMessage: options?.showErrorMessage
                })

                if (files.length) {
                    const formData = new FormData();
                    files.forEach(media => {
                        if (media.file) {
                            formData.append('attachments', media.file, media.file.name);
                        }
                    })

                    await this._http.put(`${this._baseURL}/${updated.id}/attachments`, formData, {
                        reportProgress: true,
                        observe: 'events'
                    }).toPromise()
                }

                options?.showSuccessMessage && this._alertService.handleSuccess('Consulta atualizada com sucesso!');
                resolve(updated)
            } catch (err) {
                console.error(err);
                options?.showErrorMessage && this._alertService.handleError(err);
                reject(err);
            }
        });
    }
}
