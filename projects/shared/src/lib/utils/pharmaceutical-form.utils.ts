import { PharmaceuticalForm } from '../enums/pharmaceutical-form';

export abstract class PharmaceuticalFormUtils {
	static getFriendlyName(value: PharmaceuticalForm) {
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
