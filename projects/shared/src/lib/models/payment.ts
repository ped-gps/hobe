import { PaymentMethod } from "../enums/payment-method";
import { PaymentMethodType } from "../enums/payment-method-type";
import { PaymentStatus } from "../enums/payment-status";
import { AbstractModel } from "./abstract-model";

export interface Payment extends AbstractModel {
    paymentMethod: PaymentMethod;
    paymentMethodTypeId: PaymentMethodType;
    status: PaymentStatus;
    dateApproved: Date;
    dateCreated: Date;
    dateLastUpdated: Date;
    dateOfExpiration: Date;
    mercadoPagoPaymentId: number;
    amount: number;
}