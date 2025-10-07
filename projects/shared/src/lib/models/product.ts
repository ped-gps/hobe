import { AbstractModel } from "./abstract-model";
import { File } from "./file";
import { Partner } from "./partner";

export interface Product extends AbstractModel {
    name: string;
    value: number;
    description: string;
    pictures: Array<File>;
    categories: Array<string>;
    quantity: number;
    partner: Partner;
    availability: boolean;
    salesCount?: number;
    averageRating?: number;
}