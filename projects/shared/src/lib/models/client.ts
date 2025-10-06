import { Ethnicity } from '../enums/ethnicity';
import { Gender } from '../enums/gender';
import { MaritalStatus } from '../enums/marital-status';
import { State } from '../enums/state';
import { Person } from './person';

export interface Client extends Person {
	birthDate: Date;
	gender: Gender;
	maritalStatus: MaritalStatus;
	nationality: string;
	birthState: State;
	birthCity: string;
	rg: string;
	rgIssuer: string;
	ethnicity: Ethnicity;
	cpf: string;
	nationalHealthCard: string;
	birthCertificateNumber: string;
	company: string;
	jobTitle: string;
	medicalRecord: number;
}
