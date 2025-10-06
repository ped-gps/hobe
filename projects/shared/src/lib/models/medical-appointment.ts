import { MedicalAppointmentSituation } from '../enums/medical-appointment-situation';
import { AbstractModel } from './abstract-model';
import { Anamnesis } from './anamnesis';
import { Appointment } from './appointments';
import { Client } from './client';
import { HealthProfessional } from './health-professional';
import { MedicalObservation } from './medical-observation';
import { Prescription } from './prescription';

export interface MedicalAppointment extends AbstractModel {
	client: Client;
	mainComplaint: string;
	currentIllnessHistory: string;
	medicalHistory: string;
	physicalExam: string;
	height: number;
	weight: number;
	imc: number;
	diagnosis: string;
	medicalConduct: string;
	prescription: Prescription;
	anamnesis: Anamnesis;
	situation: MedicalAppointmentSituation;
	documents: File[];
	payoutTotal: number;
	attachments: File[];
	duration: any;
	healthProfessional: HealthProfessional;
	medicalObservation: MedicalObservation;
	appointment: Appointment;
}
