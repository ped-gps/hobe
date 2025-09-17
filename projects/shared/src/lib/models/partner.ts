import { PartnerType } from "../enums/partner-type";
import { File } from "./file";
import { OAuthToken } from "./oauth-token";
import { Person } from "./person";

export interface Partner extends Person {
    cnpj: string;
    type: PartnerType;
    followersCount: number;
    productsCount: number;
    servicesCount: number;
    publicationsCount: number;
    mercadoPagoUserId: number | null;
    oauthToken: OAuthToken | null;
    hasOauthToken: boolean;
    administratorName: string;
    administratorPhone: string;
    administratorEmail: string;
    stateRegistration: string;
    municipalRegistration: string;
    files: Array<File>;
}
