import { AppointmentSituation } from "../enums/appointment-situation";
import { AbstractModel } from "./abstract-model";
import { Address } from "./address";
import { Client } from "./client";
import { HealthProfessional } from "./health-professional";
import { MedicalInsurance } from "./medical-insurance";
import { Partner } from "./partner";
import { Procedure } from "./procedure";
import { Service } from "./service";

export interface Appointment extends AbstractModel {
    service: Service;
    procedure: Procedure;
    value: number;
    client: Client;
    location: Address;
    date: Date;
    time: string;
    notifiedTwentyFourHours: boolean;
    notifiedElevenHours: boolean;
    notifiedOneHour: boolean;
    partner: Partner;
    situation: AppointmentSituation;
    healthProfessional: HealthProfessional;
    medicalInsurance: MedicalInsurance;
}