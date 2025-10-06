import { AbstractModel } from './abstract-model';
import { Medication } from './medication';

export interface PrescribedMedication extends AbstractModel {
	medication: Medication;
	dosage: string;
	quantity: number;
}
