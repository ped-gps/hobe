import { TherapeuticClass } from "../enums/therapeutic-class";

export abstract class TherapeuticClassUtils {

    static getFriendlyName(value: TherapeuticClass) {
        switch(value) {
            case TherapeuticClass.ANTIBIOTIC:
                return "Antibiótico";
            case TherapeuticClass.ANTI_INFLAMMATORY:
                return "Anti-inflamatório";
            case TherapeuticClass.OTHER:
                return "Outro";
            case TherapeuticClass.PAIN_RELIEVER:
                return "Analgésico";
            default:
                return "Desconhecida";
        }
    }
}