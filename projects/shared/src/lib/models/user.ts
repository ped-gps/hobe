import { UserProfile } from "../enums/user-profile";
import { HealthProfessional } from "./health-professional";
import { Partner } from "./partner";
import { Receptionist } from "./receptionist";

export interface User extends HealthProfessional, Partner, Receptionist {
    profile: UserProfile;
}