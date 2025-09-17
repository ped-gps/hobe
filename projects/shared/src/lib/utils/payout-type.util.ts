import { PayoutType } from "../enums/payout-type";

export abstract class PayoutTypeUtils {

    static getFriendlyName(value: PayoutType) {

        switch(value) {
            case PayoutType.FIXED:
                return "Fixo";
            case PayoutType.PERCENTAGE:
                return "Porcentagem";
        }
    }
}