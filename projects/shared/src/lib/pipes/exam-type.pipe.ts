import { Pipe, PipeTransform } from '@angular/core';
import { ExamType } from '../enums/exam-type';

@Pipe({
  name: 'examType',
})
export class ExamTypePipe implements PipeTransform {

	transform(value: ExamType): string {
		
		switch(value) {
            case ExamType.CARDIOLOGY:
                return "Cardiológico";
            case ExamType.IMAGING:
                return "Imagem";
            case ExamType.LABORATORY:
                return "Laboratorial";
            case ExamType.OTHER:
                return "Outro";
        }
	}
}