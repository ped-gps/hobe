import { AbstractModel } from './abstract-model';
import { Exam } from './exam';

export interface PrescribedExam extends AbstractModel {
	exam: Exam;
	quantity: number;
}
