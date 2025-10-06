import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { environment } from '../../environments/environment';
import { AlertType } from '../enums/alert-type';
import { Country } from '../enums/country';
import { Address } from '../models/address';
import { StateUtils } from '../utils/state.util';
import { AlertService } from './alert.service';

@Injectable({
	providedIn: 'root',
})
export class AddressService {
	private readonly _baseURL = environment.VIA_CEP_API;

	constructor(
		private _alertService: AlertService,
		private _http: HttpClient,
	) {}

	getByZipCode(zipCode: string) {
		return new Promise<Address>((resolve, reject) => {
			this._http.get<any>(`${this._baseURL}/${zipCode}/json`).subscribe({
				next: (response) => {
					const address: Address = {
						street: response.logradouro,
						city: response.localidade,
						state: StateUtils.getStateByUf(response.uf)!,
						zipCode: zipCode,
						number: '',
						neighborhood: response.bairro,
						country: Country.BRAZIL,
						complement: '',
					};

					resolve(address);
				},

				error: (error) => {
					console.error(error);
					this._alertService.showMessage(
						AlertType.ERROR,
						'Erro',
						'Não foi possível buscar o endereço!',
					);
					reject(error);
				},
			});
		});
	}
}
