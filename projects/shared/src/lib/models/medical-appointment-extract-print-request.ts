import { HealthProfessional } from "./health-professional";
import { MedicalAppointment } from "./medical-appointment";

export interface MedicalAppointmentExtractPrintRequest {
    healthProfessional: HealthProfessional;
    medicalAppointments: MedicalAppointment[];
    startDate: string;
    endDate: string;
    payoutTotal: number;
}
