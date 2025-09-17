import { AbstractModel } from "./abstract-model";

export interface Vaccine extends AbstractModel {
    name: string;
    description: string;
    mandatory: boolean;
}