import { ExamType } from '../enums/exam-type';

export abstract class ExamTypeUtils {
	static getFriendlyName(value: ExamType) {
		switch (value) {
			case ExamType.CARDIOLOGY:
				return 'Cardiológico';
			case ExamType.IMAGING:
				return 'Imagem';
			case ExamType.LABORATORY:
				return 'Laboratorial';
			case ExamType.OTHER:
				return 'Outro';
		}
	}
}
