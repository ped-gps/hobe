import { AbstractModel } from "./abstract-model";
import { Partner } from "./partner";
import { Procedure } from "./procedure";
import { Service } from "./service";

export interface MedicalInsurance extends AbstractModel {
    name: string;
    email: string;
    phone: string;
    code: string;
    procedures: Array<Procedure>;
    services: Array<Service>;
    partner: Partner;
}