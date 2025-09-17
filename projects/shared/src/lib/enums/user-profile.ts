export enum UserProfile {
    ADMINISTRATOR = 'ADMINISTRATOR',
    CLIENT = 'CLIENT',
    PARTNER = 'PARTNER',
    HEALTH_PROFESSIONAL = 'HEALTH_PROFESSIONAL',
    RECEPTIONIST = 'RECEPTIONIST',
}

export function toUserProfile(value: string): UserProfile | undefined {
    switch (value) {
        case UserProfile.ADMINISTRATOR:
            return UserProfile.ADMINISTRATOR;
        case UserProfile.CLIENT:
            return UserProfile.CLIENT;
        case UserProfile.PARTNER:
            return UserProfile.PARTNER;
        case UserProfile.HEALTH_PROFESSIONAL:
            return UserProfile.HEALTH_PROFESSIONAL;
        case UserProfile.RECEPTIONIST:
            return UserProfile.RECEPTIONIST;
        default:
            return undefined;
    }
}