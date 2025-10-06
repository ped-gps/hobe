import { ModelType } from '../enums/model-type';
import { AbstractModel } from './abstract-model';
import { User } from './user';

export interface Notification extends AbstractModel {
	title: string;
	content: string;
	sender: User;
	type: ModelType;
	objectId: string;
}
