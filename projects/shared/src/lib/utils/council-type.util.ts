import { CouncilType } from "../enums/council-type";

export abstract class CouncilTypeUtils {

    static getFriendlyName(value: CouncilType): string {
        switch (value) {
            case CouncilType.MEDICINE:
                return "Medicina";
            case CouncilType.PSYCHOLOGY:
                return "Psicologia";
            case CouncilType.PHYSIOTHERAPY:
                return "Fisioterapia";
            case CouncilType.DENTISTRY:
                return "Odontologia";
            case CouncilType.NURSING:
                return "Enfermagem";
            case CouncilType.PHARMACY:
                return "Farmácia";
            case CouncilType.VETERINARY:
                return "Medicina Veterinária";
            case CouncilType.SOCIAL_WORK:
                return "Serviço Social";
            case CouncilType.BIOMEDICINE:
                return "Biomedicina";
            case CouncilType.SPEECH_THERAPY:
                return "Fonoaudiologia";
            case CouncilType.OCCUPATIONAL_THERAPY:
                return "Terapia Ocupacional";
            case CouncilType.NUTRITION:
                return "Nutrição";
            case CouncilType.PHYSICAL_EDUCATION:
                return "Educação Física";
            case CouncilType.RADIOLOGY:
                return "Radiologia";
            case CouncilType.OPTOMETRY:
                return "Optometria";
            case CouncilType.SANITARY:
                return "Saúde Pública / Sanitarista";
            case CouncilType.NURSING_TECHNICIAN:
                return "Técnico/Auxiliar de Enfermagem";
            default:
                return "Desconhecido";
        }
    }
}