import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { environment } from '../../environments/environment';
import { AlertType } from '../enums/alert-type';
import { Country } from '../enums/country';
import { Address } from '../models/address';
import { ViaCepAddress } from '../models/via-cep-address';
import { StateUtils } from '../utils/state.util';
import { AlertService } from './alert.service';

@Injectable({
	providedIn: 'root',
})
export class ViaCepService {
	private readonly _baseURL = environment.VIA_CEP_API;

	constructor(
		private readonly _alertService: AlertService,
		private readonly _http: HttpClient,
	) {}

	findByCEP(cep: string) {
		return new Promise<Address>((resolve, reject) => {
			this._http
				.get<ViaCepAddress>(`${this._baseURL}/${cep}/json`)
				.subscribe({
					next: (response) => {
						if (!response.erro) {
							const address: Address = {
								street: response.logradouro,
								number: '',
								neighborhood: response.bairro,
								complement: response.complemento,
								city: response.localidade,
								state: StateUtils.getStateByUf(response.uf)!,
								zipCode: cep,
								country: Country.BRAZIL,
							};

							resolve(address);
						} else {
							reject();
						}
					},

					error: (error) => {
						this._alertService.showMessage(
							AlertType.ERROR,
							'Erro',
							'Não foi possível obter os dados do endereço!',
						);
						console.error(error);
						reject(error);
					},
				});
		});
	}
}
