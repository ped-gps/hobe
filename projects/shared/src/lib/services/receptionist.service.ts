import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { environment } from '../../environments/environment';
import { Page } from '../models/page';
import { Receptionist } from '../models/receptionist';
import { FileLoaded } from '../utils/file.util';
import { AbstractService } from './abstract-service';
import { AlertService } from './alert.service';

@Injectable({
    providedIn: 'root',
})
export class ReceptionistService extends AbstractService<Receptionist> {

    protected _baseURL = `${environment.API}/receptionists`;

    constructor(
        protected _http: HttpClient,
        protected _alertService: AlertService
    ) {
        super();
    }

    override save(
        receptionist: Receptionist,
        options?: {
            picture?: FileLoaded,
            showSuccessMessage?: boolean, 
            showErrorMessage?: boolean
        }
    ) {

        return new Promise<Receptionist>(async (resolve) => {

            const hasUnsavedPicture = options && options.picture && !options.picture.saved;
            receptionist = await super.save(receptionist, { showSuccessMessage: !hasUnsavedPicture });
            
            if (hasUnsavedPicture) {
                receptionist = await this.savePicture(receptionist, options!.picture!);
            }

            resolve(receptionist);
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
    ): Promise<Page<Receptionist>> {
        return super.search(page, size, sort, direction, filters, options);
    }

    override update(
        receptionist: Receptionist,
        options?: {
            picture?: FileLoaded,
            showSuccessMessage?: boolean, 
            showErrorMessage?: boolean
        }
    ) {

        return new Promise<Receptionist>(async (resolve) => {
            
            const hasUnsavedPicture = options && options.picture && !options.picture.saved;
            receptionist = await super.update(receptionist, { showSuccessMessage: !hasUnsavedPicture });
            
            if (hasUnsavedPicture) {
                receptionist = await this.savePicture(receptionist, options!.picture!);
            }

            resolve(receptionist);
        });
    }

    private savePicture(receptionist: Receptionist, picture: FileLoaded) {
    
        return new Promise<Receptionist>((resolve) => {

            const formData = new FormData();
            formData.append('picture', picture.file!, picture.file!.name);
            
            this._http.put<Receptionist>(`${this._baseURL}/${receptionist.id}/picture`, formData).subscribe({

                next: (response) => {
                    resolve(response);
                },

                error: (error) => {
                    console.error(error);
                    this._alertService.handleError(error);
                }
            });
        });
    }
}
