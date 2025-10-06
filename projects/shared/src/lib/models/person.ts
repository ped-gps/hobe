import { Status } from '../enums/status';
import { AbstractModel } from './abstract-model';
import { Address } from './address';
import { File } from './file';

export interface Person extends AbstractModel {
	name: string;
	email: string;
	phone: string;
	address?: Address;
	password: string;
	status: Status;
	picture?: File;
	kind: 'ADMINISTRATOR' | 'HEALTH_PROFESSIONAL' | 'PARTNER';
}
