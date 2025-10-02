import { Pipe, PipeTransform } from '@angular/core';
import { IMCCategory } from '../enums/imc-category';

@Pipe({
    name: 'imcCategory',
})
export class ImcCategoryPipe implements PipeTransform {

	transform(value: IMCCategory): string | null {
		
		if (!value) {
			return null;
		}

		switch (value) {
            case IMCCategory.UNDERWEIGHT:
                return "Magreza (IMC < 18,5)";
            case IMCCategory.NORMAL:
                return "Peso normal (18,5 ≤ IMC < 24,9)";
            case IMCCategory.OVERWEIGHT:
                return "Sobrepeso (25 ≤ IMC < 29,9)";
            case IMCCategory.OBESITY_GRADE_1:
                return "Obesidade grau 1 (30 ≤ IMC < 34,9)";
            case IMCCategory.OBESITY_GRADE_2:
                return "Obesidade grau 2 (35 ≤ IMC < 39,9)";
            case IMCCategory.OBESITY_GRADE_3:
                return "Obesidade grau 3 (IMC ≥ 40)";
            case IMCCategory.INVALID:
            default:
                return "IMC inválido!";
        }
	}
}
