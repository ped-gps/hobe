import { Country } from "../enums/country";

export abstract class CountryUtils {

    static getFriendlyName(value: Country) {

        switch(value) {
            case Country.BRAZIL:
                return "Brasil";
        }
    }
}