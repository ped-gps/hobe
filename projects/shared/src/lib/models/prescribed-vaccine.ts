import { AbstractModel } from './abstract-model';
import { Vaccine } from './vaccine';

export interface PrescribedVaccine extends AbstractModel {
	vaccine: Vaccine;
	dosage: string;
	quantity: number;
}
