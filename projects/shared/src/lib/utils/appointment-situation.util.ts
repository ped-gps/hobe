import { AppointmentSituation } from "../enums/appointment-situation";

export abstract class AppointmentSituationUtils {

    static getFriendlyName(value: AppointmentSituation) {

        switch(value) {
            case AppointmentSituation.ABSENT:
                return "Faltou";
            case AppointmentSituation.CONCLUDED:
                return "Concluido";
            case AppointmentSituation.IN_PROGRESS:
                return "Em andamento";
            case AppointmentSituation.PENDING:
                return "Pendente";
            case AppointmentSituation.WAITING:
                return "Aguardando";
        }
    }
}