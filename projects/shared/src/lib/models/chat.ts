import { AbstractModel } from './abstract-model';
import { File } from './file';
import { Message } from './message';
import { ObjectReference } from './object-reference';

export interface Chat extends AbstractModel {
	code?: string;
	chatName?: string;
	chatPicture?: File;
	hasNewMessages?: boolean;
	members: Array<ObjectReference>;
	lastMessage?: Message;
	isOnline?: boolean;
}
