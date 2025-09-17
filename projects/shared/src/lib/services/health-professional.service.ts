import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { environment } from '../../environments/environment';
import { HealthProfessional } from '../models/health-professional';
import { Page } from '../models/page';
import { FileLoaded } from '../utils/file.util';
import { AbstractService } from './abstract-service';
import { AlertService } from './alert.service';

@Injectable({
    providedIn: 'root',
})
export class HealthProfessionalService extends AbstractService<HealthProfessional> {
    
    protected _baseURL = `${environment.API}/health-professionals`;

    constructor(
        protected _http: HttpClient,
        protected _alertService: AlertService
    ) {
        super();
    }

    override save(
        healthProfessional: HealthProfessional,
        options?: {
            picture?: FileLoaded;
            showSuccessMessage?: true;
            showErrorMessage?: true;
        }
    ): Promise<HealthProfessional> {

        return new Promise<HealthProfessional>(async (resolve, reject) => {
            try {
                const hasUnsavedPicture = options && options.picture && !options.picture.saved;
 
                healthProfessional = await super.save(healthProfessional, {
                    showSuccessMessage: !hasUnsavedPicture,
                });

                if (hasUnsavedPicture) {
                    healthProfessional = await this.savePicture(
                        healthProfessional,
                        options!.picture!
                    );
                }

				options?.showSuccessMessage && this._alertService.handleSuccess('Cadastrado com sucesso!');
                resolve(healthProfessional);
            } catch (error) {
                reject(error);
            }
        });
    }

    override search(
        page: number,
        size: number,
        sort: string,
        direction: string,
        filters: {
            name?: string;
            partnerId?: string;
        },
        options?: {
            showErrorMessage?: boolean;
        }
    ): Promise<Page<HealthProfessional>> {
        return super.search(page, size, sort, direction, filters, options);
    }

    override update(
        healthProfessional: HealthProfessional,
        options?: {
            picture?: FileLoaded;
            showSuccessMessage?: boolean;
            showErrorMessage?: boolean;
        }
    ) {
        return new Promise<HealthProfessional>(async (resolve, reject) => {
            try {
				const hasUnsavedPicture = options && options.picture && !options.picture.saved;

				healthProfessional = await super.update(healthProfessional, {
					showSuccessMessage: !hasUnsavedPicture,
				});

				if (hasUnsavedPicture) {
					healthProfessional = await this.savePicture(
						healthProfessional,
						options!.picture!
					);
				}

				resolve(healthProfessional);
			} catch (error) {
				reject(error);
			}
        });
    }

    private savePicture(
        healthProfessional: HealthProfessional,
        picture: FileLoaded
    ): Promise<HealthProfessional> {

        return new Promise<HealthProfessional>((resolve, reject) => {
            const formData = new FormData();
            formData.append('picture', picture.file!, picture.file!.name);

            this._http.put<HealthProfessional>(`${this._baseURL}/${healthProfessional.id}/picture`, formData)
                .subscribe({
                    next: (response) => resolve(response),
                    error: (error) => {
                        console.error(error);
                        this._alertService.handleError(error);
                        reject(error); // <- importante!
                    },
                })
			;
        });
    }
}
