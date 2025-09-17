import { Gender } from "../enums/gender";

export abstract class GenderUtils {

    static getFriendlyName(value: Gender) {

        switch(value) {
            case Gender.FEMININE:
                return "Feminino";
            case Gender.MASCULINE:
                return "Masculino";
            case Gender.OTHER:
                return "Outro";
        }
    }
}