import { AbstractModel } from './abstract-model';
import { File } from './file';
import { Partner } from './partner';
import { Schedule } from './schedule';

export interface Service extends AbstractModel {
	name: string;
	description: string;
	professional: string;
	professionalRegistration: string;
	value: number;
	categories: Array<string>;
	availability: boolean;
	schedules: Array<Schedule>;
	hasAppointment: boolean;
	partner: Partner;
	pictures: Array<File>;
	code: string;
	type: 'SERVICE';
}
