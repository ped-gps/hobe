import { AbstractModel } from "./abstract-model";
import { Address } from "./address";
import { Product } from "./product";
import { Service } from "./service";

export interface Item extends AbstractModel {
    product: Product;
    service: Service;
    serviceDate: Date;
    serviceTime: string;
    serviceAddress: Address;
    quantity: number;
    total: number;
}