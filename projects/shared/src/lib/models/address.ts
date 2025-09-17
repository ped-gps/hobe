import { Country } from "../enums/country";
import { State } from "../enums/state";
import { AbstractModel } from "./abstract-model";

export interface Address extends AbstractModel {
    street: string;
    city: string;
    state: State;
    zipCode: string;
    number: string;
    neighborhood: string;
    country: Country;
    complement: string;
}
