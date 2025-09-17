import { AbstractModel } from "./abstract-model";

export interface Exam extends AbstractModel {
    name: string;
    tussCode: string;
}