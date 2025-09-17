import { MedicalAppointmentSituation } from "../enums/medical-appointment-situation";
import { PayoutType } from "../enums/payout-type";
import { AbstractModel } from "./abstract-model";
import { Appointment } from "./appointments";
import { Client } from "./client";
import { File } from "./file";
import { HealthProfessional } from "./health-professional";
import { MedicalObservation } from "./medical-observation";
import { Prescription } from "./prescription";

export interface MedicalAppointment extends AbstractModel {
    client: Client;
    mainComplaint: string;
    currentIllnessHistory: string;
    medicalHistory: string;
    physicalExam: string;
    imc: number;
    diagnosis: string;
    medicalConduct: string;
    prescription: Prescription;
    documents: Array<File>;
    attachments: Array<File>;
    duration: number;
    situation: MedicalAppointmentSituation;
    healthProfessional: HealthProfessional;
    medicalObservation: MedicalObservation;
    appointment: Appointment;
    payoutType: PayoutType;
    payoutValue: number;
    payoutTotal: number;
}