import { Pipe, PipeTransform } from '@angular/core';
import { format } from 'date-fns';

@Pipe({
	name: 'relativeTime'
})
export class RelativeTimePipe implements PipeTransform {

	transform(value: Date | string | number): string {
		const date = new Date(value);
		const now = new Date();

		const isDifferentDay = now.getDate() !== date.getDate() || now.getMonth() !== date.getMonth() || now.getFullYear() !== date.getFullYear();

		const differenceInTime = date.getTime() - now.getTime();
		const differenceInDays = differenceInTime / (1000 * 3600 * 24);

		if (isDifferentDay && differenceInDays > -1) {
			const formatDate = format(date, 'HH:mm');
			return 'Ontem às ' + formatDate;
		}
		
		else if (differenceInDays <= -1) {
			return format(date, 'dd/MM HH:mm');
		}

		else {
			return format(date, 'HH:mm');
		}
	}
}
