import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'cpfCnpj',
})
export class CpfCnpjPipe implements PipeTransform {
	transform(value: unknown, ...args: unknown[]): string | null {
		if (!value) return null;

		let digits = value.toString().replace(/\D/g, '');

		if (digits.length === 11) {
			// Formata como CPF: 000.000.000-00
			return digits.replace(
				/(\d{3})(\d{3})(\d{3})(\d{2})/,
				'$1.$2.$3-$4',
			);
		} else if (digits.length === 14) {
			// Formata como CNPJ: 00.000.000/0000-00
			return digits.replace(
				/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
				'$1.$2.$3/$4-$5',
			);
		}

		return value.toString(); // Retorna como está se não tiver 11 ou 14 dígitos
	}
}
