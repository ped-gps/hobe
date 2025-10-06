import { AdministrationRoute } from '../enums/administration-route';
import { PharmaceuticalForm } from '../enums/pharmaceutical-form';
import { TherapeuticClass } from '../enums/therapeutic-class';
import { AbstractModel } from './abstract-model';

export interface Medication extends AbstractModel {
	name: string;
	activeIngredient: string;
	dosage: string;
	pharmaceuticalForm: PharmaceuticalForm;
	administrationRoute: AdministrationRoute;
	anvisaRegistration: string;
	therapeuticClass: TherapeuticClass;
	enabled: boolean;
}
