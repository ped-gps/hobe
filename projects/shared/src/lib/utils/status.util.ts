import { Status } from "../enums/status";

export abstract class StatusUtils {

    static getFriendlyName(value: Status) {

        switch(value) {
            case Status.ACTIVE:
                return "Ativo";
            case Status.DISABLED:
                return "Inativo";
            case Status.DISAPPROVED:
                return "Reprovado";
            case Status.PENDING:
                return "Pendente";
        }
    }
}