import { ModelType } from '../enums/model-type';
import { AbstractModel } from './abstract-model';

export interface ObjectReference extends AbstractModel {
	objectId: string;
	type: ModelType;
}
