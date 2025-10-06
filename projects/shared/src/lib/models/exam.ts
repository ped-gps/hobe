import { ExamType } from '../enums/exam-type';
import { AbstractModel } from './abstract-model';

export interface Exam extends AbstractModel {
	name: string;
	type: ExamType;
	tussCode: string;
	enabled: boolean;
}
