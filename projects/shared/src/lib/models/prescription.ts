import { AbstractModel } from "./abstract-model";
import { PrescribedExam } from "./prescribed-exam";
import { PrescribedMedication } from "./prescribed-medication";
import { PrescribedVaccine } from "./prescribed-vaccine";

export interface Prescription extends AbstractModel {
    medications: Array<PrescribedMedication>;
    exams: Array<PrescribedExam>;
    vaccines: Array<PrescribedVaccine>;
}