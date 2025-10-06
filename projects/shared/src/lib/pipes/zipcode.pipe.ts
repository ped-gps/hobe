import { Injectable, Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'zipCode',
})
@Injectable({
	providedIn: 'root', // Permite que seja injetado em qualquer classe do projeto
})
export class ZipCodePipe implements PipeTransform {
	transform(value: string | undefined | null): string {
		if (!value) {
			return '';
		}

		let cep = value.replace(/\D/g, '');

		if (cep.length !== 8) {
			return value;
		}

		return cep.replace(/(\d{5})(\d{3})/, '$1-$2');
	}
}
