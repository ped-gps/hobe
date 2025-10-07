import { PaymentMethodType } from "../enums/payment-method-type";

export abstract class PaymentMethodTypeUtils {

    static getFriendlyName(value: PaymentMethodType) {

        switch (value) {
            case PaymentMethodType.ACCOUNT_MONEY:
                return "Saldo em Conta";
            case PaymentMethodType.BANK_TRANSFER:
                return "Transação Bancária";
            case PaymentMethodType.CREDIT_CARD:
                return "Cartão de Crédito";
            case PaymentMethodType.DEBIT_CARD:
                return "Cartão de Débito";
            case PaymentMethodType.TICKET:
                return "Boleto Bancário";
            default:
                return "Método de Pagamento";
        }
    }
}
