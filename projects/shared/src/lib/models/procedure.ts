import { PayoutType } from "../enums/payout-type";
import { AbstractModel } from "./abstract-model";
import { HealthProfessional } from "./health-professional";
import { Partner } from "./partner";

export interface Procedure extends AbstractModel {
    name: string;
    value: number;
    code: string;
    payoutType: PayoutType;
    payoutValue: number;
    healthProfessional: HealthProfessional;
    partner: Partner;
    type: 'PROCEDURE';
}