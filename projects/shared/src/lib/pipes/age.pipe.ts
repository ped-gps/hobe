import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'age',
})
export class AgePipe implements PipeTransform {

    transform(value: string | Date | null | undefined): number | null {
        
		if (!value) {
			return null;
		}
		
		const birthDate = typeof value === 'string' ? new Date(value) : value;
        
		if (!(birthDate instanceof Date) || isNaN(birthDate.getTime())) {
            return null;
		}
        
		const today = new Date();
		let age = today.getFullYear() - birthDate.getFullYear();
		const m = today.getMonth() - birthDate.getMonth();
        
		if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        
		return age;
    }
}
