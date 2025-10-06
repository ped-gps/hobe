import { Pipe, PipeTransform } from '@angular/core';
import { PharmaceuticalForm } from '../enums/pharmaceutical-form';

@Pipe({
	name: 'pharmaceuticalForm',
})
export class PharmaceuticalFormPipe implements PipeTransform {
	transform(value: PharmaceuticalForm): string {
		switch (value) {
			case PharmaceuticalForm.CAPSULE:
				return 'Cápsula';
			case PharmaceuticalForm.INJECTABLE:
				return 'Injetável';
			case PharmaceuticalForm.OTHER:
				return 'Outro';
			case PharmaceuticalForm.SUSPENSION:
				return 'Suspensão';
			case PharmaceuticalForm.TABLET:
				return 'Comprimido';
			default:
				return 'Desconhecido';
		}
	}
}
