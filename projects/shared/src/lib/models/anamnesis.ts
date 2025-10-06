import { AbstractModel } from './abstract-model';

export interface Anamnesis extends AbstractModel {
	clinicalHistory: string;
	surgicalHistory: string;
	familyBackground: string;
	habits: string;
	allergies: string;
	medicationsInUse: string;
}
