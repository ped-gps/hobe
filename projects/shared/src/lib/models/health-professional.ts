import { CouncilType } from "../enums/council-type";
import { Gender } from "../enums/gender";
import { MaritalStatus } from "../enums/marital-status";
import { MedicalSpecialty } from "../enums/medical-specialty";
import { State } from "../enums/state";
import { Partner } from "./partner";
import { Person } from "./person";

export interface HealthProfessional extends Person {
    councilCode: string;
    councilType: CouncilType;
    cns: string;
    maritalStatus: MaritalStatus;
    gender: Gender;
    birthDate: Date;
    nationality: string;
    birthState: State;
    birthCity: string;
    rg: string;
    rgIssuer: string;
    cpf: string;
    specialty: MedicalSpecialty;
    partner: Partner;
}