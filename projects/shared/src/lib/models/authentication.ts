export interface Authentication {
    username: string;
    idToken: string;
    expires: number;
    roles: Array<string>;
    profile: string;
}