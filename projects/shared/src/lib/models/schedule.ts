import { DayOfWeek } from '../enums/day-of-week';
import { AbstractModel } from './abstract-model';

export interface Schedule extends AbstractModel {
	dayOfWeek: DayOfWeek;
	times: Array<string>;
}
