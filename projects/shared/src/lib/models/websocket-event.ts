import { ModelAction } from '../enums/model-action';
import { ModelType } from '../enums/model-type';

export interface WebSocketEvent {
	timestamp: number;
	topic: string;
	object: any;
	type: ModelType | string;
	action: ModelAction;
}
