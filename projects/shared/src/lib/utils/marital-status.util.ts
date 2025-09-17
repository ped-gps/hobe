import { MaritalStatus } from "../enums/marital-status";

export abstract class MaritalStatusUtils {

    static getFriendlyName(value: MaritalStatus) {

        switch(value) {
            case MaritalStatus.DIVORCED:
                return "Divorciado(a)";
            case MaritalStatus.MARRIED:
                return "Casado(a)";
            case MaritalStatus.SEPARATED:
                return "Separado(a)";
            case MaritalStatus.SINGLE:
                return "Solteiro(a)";
            case MaritalStatus.WIDOWED:
                return "Viúvo(a)";
        }
    }
}