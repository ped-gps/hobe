import { MedicalAppointmentSituation } from '../enums/medical-appointment-situation';

export abstract class MedicalAppointmentSituationUtils {
	static getFriendlyName(value: MedicalAppointmentSituation) {
		switch (value) {
			case MedicalAppointmentSituation.CONCLUDED:
				return 'Concluído';
			case MedicalAppointmentSituation.IN_PROGRESS:
				return 'Em andamento';
			default:
				return 'Valor desconhecido';
		}
	}
}
