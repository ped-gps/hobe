import { MedicalSpecialty } from "../enums/medical-specialty";

export abstract class MedicalSpecialtyUtils {

    static getFriendlyName(value: MedicalSpecialty): string {
    
        switch (value) {
            case MedicalSpecialty.CARDIOLOGY:
                return "Cardiologia";
            case MedicalSpecialty.DERMATOLOGY:
                return "Dermatologia";
            case MedicalSpecialty.ENDOCRINOLOGY:
                return "Endocrinologia";
            case MedicalSpecialty.GASTROENTEROLOGY:
                return "Gastroenterologia";
            case MedicalSpecialty.GERIATRICS:
                return "Geriatria";
            case MedicalSpecialty.GYNECOLOGY:
                return "Ginecologia";
            case MedicalSpecialty.HEMATOLOGY:
                return "Hematologia";
            case MedicalSpecialty.INFECTIOUS_DISEASES:
                return "Doenças Infecciosas";
            case MedicalSpecialty.NEPHROLOGY:
                return "Nefrologia";
            case MedicalSpecialty.NEUROLOGY:
                return "Neurologia";
            case MedicalSpecialty.OPHTHALMOLOGY:
                return "Oftalmologia";
            case MedicalSpecialty.ONCOLOGY:
                return "Oncologia";
            case MedicalSpecialty.ORTHOPEDICS:
                return "Ortopedia";
            case MedicalSpecialty.OTOLARYNGOLOGY:
                return "Otorrinolaringologia";
            case MedicalSpecialty.PEDIATRICS:
                return "Pediatria";
            case MedicalSpecialty.PULMONOLOGY:
                return "Pneumologia";
            case MedicalSpecialty.PSYCHIATRY:
                return "Psiquiatria";
            case MedicalSpecialty.PSYCHOLOGY:
                return "Psicologia";
            case MedicalSpecialty.RHEUMATOLOGY:
                return "Reumatologia";
            case MedicalSpecialty.UROLOGY:
                return "Urologia";
            case MedicalSpecialty.OTHER:
                return "Outras Especialidades";
            default:
                return "Especialidade Desconhecida";
        }
    }
}