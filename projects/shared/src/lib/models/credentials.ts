import { AppType } from "../enums/app-type";

export interface Credentials {
    username: string;
    password: string;
    appType: AppType;
}