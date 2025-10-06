import { FileType } from '../enums/file-type';
import { AbstractModel } from './abstract-model';

export interface File extends AbstractModel {
	name: string;
	originalName: string;
	path: string;
	type: FileType;
	position: number;
}
