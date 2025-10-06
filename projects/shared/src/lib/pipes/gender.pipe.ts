import { Pipe, PipeTransform } from '@angular/core';
import { Gender } from '../enums/gender';

@Pipe({
	name: 'gender',
})
export class GenderPipe implements PipeTransform {
	transform(value: Gender | undefined): string | null {
		if (!value) {
			return null;
		}

		switch (value) {
			case Gender.FEMININE:
				return 'Feminino';
			case Gender.MASCULINE:
				return 'Masculino';
			case Gender.OTHER:
				return 'Outro';
			default:
				return null;
		}
	}
}
