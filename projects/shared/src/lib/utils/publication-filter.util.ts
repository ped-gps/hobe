import { PublicationFilter } from '../enums/publication-filter';

export class PublicationFilterUtils {

    static getFriendlyName(publicationFilter: PublicationFilter) {

        switch (publicationFilter) {
            case PublicationFilter.COMMENTS:
                return "Comentários";
            case PublicationFilter.DATE:
                return "Data de criação";
            case PublicationFilter.LIKES:
                return "Curtidas";
            case PublicationFilter.SAVEDS:
                return "Salvos";
        }
    }
}
