import { State } from "../enums/state";

export class StateUtils {
    
    static getFriendlyName(state: State) {
        switch (state) {
            case State.ACRE:
                return "Acre";
            case State.ALAGOAS:
                return "Alagoas";
            case State.AMAPA:
                return "Amapá";
            case State.AMAZONAS:
                return "Amazonas";
            case State.BAHIA:
                return "Bahia";
            case State.CEARA:
                return "Ceará";
            case State.DISTRITO_FEDERAL:
                return "Distrito Federal";
            case State.ESPIRITO_SANTO:
                return "Espírito Santo";
            case State.GOIAS:
                return "Goiás";
            case State.MARANHAO:
                return "Maranhão";
            case State.MATO_GROSSO:
                return "Mato Grosso";
            case State.MATO_GROSSO_DO_SUL:
                return "Mato Grosso do Sul";
            case State.MINAS_GERAIS:
                return "Minas Gerais";
            case State.PARA:
                return "Pará";
            case State.PARAIBA:
                return "Paraíba";
            case State.PARANA:
                return "Paraná";
            case State.PERNAMBUCO:
                return "Pernambuco";
            case State.PIAUI:
                return "Piauí";
            case State.RIO_DE_JANEIRO:
                return "Rio de Janeiro";
            case State.RIO_GRANDE_DO_NORTE:
                return "Rio Grande do Norte";
            case State.RIO_GRANDE_DO_SUL:
                return "Rio Grande do Sul";
            case State.RONDONIA:
                return "Rondônia";
            case State.RORAIMA:
                return "Roraima";
            case State.SANTA_CATARINA:
                return "Santa Catarina";
            case State.SAO_PAULO:
                return "São Paulo";
            case State.SERGIPE:
                return "Sergipe";
            case State.TOCANTINS:
                return "Tocantins";
            default:
                return "";
        }
    }

    static getStateByUf(uf: string): State | undefined {

        switch (uf.toUpperCase()) {
            case "AC":
                return State.ACRE;
            case "AL":
                return State.ALAGOAS;
            case "AP":
                return State.AMAPA;
            case "AM":
                return State.AMAZONAS;
            case "BA":
                return State.BAHIA;
            case "CE":
                return State.CEARA;
            case "DF":
                return State.DISTRITO_FEDERAL;
            case "ES":
                return State.ESPIRITO_SANTO;
            case "GO":
                return State.GOIAS;
            case "MA":
                return State.MARANHAO;
            case "MT":
                return State.MATO_GROSSO;
            case "MS":
                return State.MATO_GROSSO_DO_SUL;
            case "MG":
                return State.MINAS_GERAIS;
            case "PA":
                return State.PARA;
            case "PB":
                return State.PARAIBA;
            case "PR":
                return State.PARANA;
            case "PE":
                return State.PERNAMBUCO;
            case "PI":
                return State.PIAUI;
            case "RJ":
                return State.RIO_DE_JANEIRO;
            case "RN":
                return State.RIO_GRANDE_DO_NORTE;
            case "RS":
                return State.RIO_GRANDE_DO_SUL;
            case "RO":
                return State.RONDONIA;
            case "RR":
                return State.RORAIMA;
            case "SC":
                return State.SANTA_CATARINA;
            case "SP":
                return State.SAO_PAULO;
            case "SE":
                return State.SERGIPE;
            case "TO":
                return State.TOCANTINS;
            default:
                return undefined;
        }
    }
}
