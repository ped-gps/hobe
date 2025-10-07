import { PaymentStatus } from "../enums/payment-status";

export abstract class PaymentStatusUtils {

    static getFriendlyName(value: PaymentStatus) {

        switch (value) {
            case PaymentStatus.APPROVED:
                return "Aprovado";
            case PaymentStatus.CANCELLED:
                return "Cancelado";
            case PaymentStatus.CHARGEDBACK:
                return "Estornado pelo Cliente";
            case PaymentStatus.INMEDIATION:
                return "Em Mediação";
            case PaymentStatus.INPROCESS:
                return "Em Processamento";
            case PaymentStatus.PENDING:
                return "Pendente";
            case PaymentStatus.REFUNDED:
                return "Reembolsado";
            case PaymentStatus.REJECTED:
                return "Recusado";
            default:
                return "Status Desconhecido";
        }
    }
}
