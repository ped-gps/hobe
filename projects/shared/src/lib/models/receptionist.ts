import { Gender } from '../enums/gender';
import { MaritalStatus } from '../enums/marital-status';
import { Partner } from './partner';
import { Person } from './person';

export interface Receptionist extends Person {
	maritalStatus: MaritalStatus;
	gender: Gender;
	birthDate: Date;
	cpf: string;
	partner: Partner;
}
