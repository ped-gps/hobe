import { OrderStatus } from "../enums/order-status";

export class OrderStatusUtils {

    static getFriendlyName(status: OrderStatus) {

        switch(status) {
            case OrderStatus.CANCELED:
                return "Cancelado";
            case OrderStatus.CONCLUDED:
                return "Concluído";
            case OrderStatus.DELIVERED:
                return "Entregue";
            case OrderStatus.PROCESSING:
                return "Em andamento";
            case OrderStatus.SHIPPED:
                return "Enviado";
            case OrderStatus.WAITING_PAYMENT:
                return "Aguardando pagamento";
        }
    }
}