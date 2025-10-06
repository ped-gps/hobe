import { ModelType } from '../enums/model-type';
import { AbstractModel } from './abstract-model';
import { Chat } from './chat';
import { File } from './file';

export interface Message extends AbstractModel {
	chat: Chat;
	views: Array<string>;
	content: string;
	files: Array<File>;
	authorId: string;
	authorType: ModelType;
	authorName: string;
	authorPicture: File;
}
