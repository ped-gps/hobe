import { OrderStatus } from "../enums/order-status";
import { AbstractModel } from "./abstract-model";
import { Address } from "./address";
import { Client } from "./client";
import { Item } from "./item";
import { Payment } from "./payment";

export interface Order extends AbstractModel {
    number: string;
    items: Array<Item>;
    client: Client;
    status: OrderStatus;
    payment: Payment;
    total: number;
    trackingNumber: string;
    carrier: string;
    deliveryAddress: Address;
    deliveryEstimate: Date;
    deliveredDate: Date;
    deliveredTime: string;
    trackingLink: string;
    cancellationDate: Date;
    cancellationReason: string;
}