export abstract class UUIDUtils {
    
    static async generateUniqueCode(...uuids: string[]): Promise<string> {
        uuids.sort();
        const concatenatedString = uuids.join("|");
        const hashedBytes = await UUIDUtils.calculateHash(concatenatedString);
        return UUIDUtils.bytesToHex(new Uint8Array(hashedBytes));
    }

    private static async calculateHash(input: string): Promise<ArrayBuffer> {
        const encoder = new TextEncoder();
        const data = encoder.encode(input);
        return crypto.subtle.digest("SHA-256", data);
    }

    private static bytesToHex(bytes: Uint8Array): string {
        return Array.from(bytes)
            .map(byte => byte.toString(16).padStart(2, "0"))
            .join("");
    }
}