import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { environment } from '../../environments/environment';
import { FileRequestOrder } from '../models/file-request-order';
import { Page } from '../models/page';
import { Product } from '../models/product';
import { FileLoaded } from './../utils/file.util';
import { AbstractService } from './abstract-service';
import { AlertService } from './alert.service';

@Injectable({
	providedIn: 'root'
})
export class ProductService extends AbstractService<Product> {

    protected _baseURL = environment.API + '/products';

    constructor(
        protected _http: HttpClient,
        protected _alertService: AlertService
    ) {
        super();
    }

    override save(
        product: Product,
        options: {
            pictures: FileLoaded[],
            showSuccessMessage?: boolean,
            showErrorMessage?: boolean,
        } = {
            pictures: [],
            showErrorMessage: true,
            showSuccessMessage: true
        }
    ): Promise<Product> {
        const formData = this._buildFormData(product, options.pictures);
        return this._sendRequest('post', this._baseURL, formData, options);
    }

    override search(
        page: number,
        size: number,
        sort: string,
        direction: string,
        filters: {
            partnerId: string,
            name?: string,
            category?: string,
            availability?: boolean,
        }
    ): Promise<Page<Product>> {
        return super.search(page, size, sort, direction, filters)
    }

    override update(
        product: Product,
        options: {
            pictures: FileLoaded[],
            showSuccessMessage?: boolean,
            showErrorMessage?: boolean,
        } = {
            pictures: [],
            showErrorMessage: true,
            showSuccessMessage: true
        }
    ): Promise<Product> {
        const formData = this._buildFormData(product, options.pictures);
        const url = `${this._baseURL}/${product.id}`;
        return this._sendRequest('put', url, formData, options);
    }

    private _buildFormData(product: Product, pictures: FileLoaded[]): FormData {
        const formData = new FormData();
        formData.append('product', new Blob([JSON.stringify(product)], { type: 'application/json' }));

        if (pictures && pictures.length > 0) {

            const filesRequestOrder: Array<FileRequestOrder> = [];

            pictures.forEach((picture, index) => {
                filesRequestOrder.push({ name: picture.file!.name, position: picture.position || index + 1 });
            });

            formData.append("filesRequestOrder", new Blob([JSON.stringify(filesRequestOrder)], { type: "application/json" }));

            pictures.forEach(picture => {
                formData.append("pictures", new Blob([picture.file!], { type: "multipart/form-data" }), picture.file!.name);
            });
        }

        return formData;
    }

    private _sendRequest(
        method: 'post' | 'put', 
        url: string,
        formData: FormData, 
        options: { 
            showSuccessMessage?: boolean, 
            showErrorMessage?: boolean,
        }
    ) {

        const message = method === 'post' ? 'Cadastrado com sucesso!' : 'Atualizado com sucesso!';
        
        return new Promise<Product>((resolve, reject) => {
            this._http.request<Product>(method, url, { body: formData }).subscribe({
                next: (item) => {
                    options.showSuccessMessage && this._alertService.handleSuccess(message);
                    resolve(item);
                },
                error: (error) => {
                    console.error(error);
                    options.showErrorMessage && this._alertService.handleError(error);
                    reject(error);
                }
            });
        });
    }
}
