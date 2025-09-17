import { FileType } from "../enums/file-type";

export abstract class FileTypeUtils {

    private static readonly FILE_TYPE_MAP: Map<string, FileType> = new Map([
        ['jpg', FileType.IMAGE],
        ['jpeg', FileType.IMAGE],
        ['png', FileType.IMAGE],
        ['mp4', FileType.VIDEO],
        ['avi', FileType.VIDEO],
        ['mov', FileType.VIDEO],
        ['mp3', FileType.AUDIO],
        ['wav', FileType.AUDIO],
        ['pdf', FileType.DOCUMENT],
        ['doc', FileType.DOCUMENT],
        ['docx', FileType.DOCUMENT],
        ['ppt', FileType.DOCUMENT],
        ['pptx', FileType.DOCUMENT],
        ['xls', FileType.DOCUMENT],
        ['xlsx', FileType.DOCUMENT],
        ['txt', FileType.DOCUMENT],
    ]);

    static getFriendlyName(value: FileType) {

        switch(value) {
            case FileType.AUDIO:
                return "Áudio";
            case FileType.DOCUMENT:
                return "Documento";
            case FileType.IMAGE:
                return "Imagem";
            case FileType.OTHER:
                return "Outros";
            case FileType.VIDEO:
                return "Vídeo";
        }
    }

    static getType(fileName: string): FileType {
        const extension = fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase();
        return this.FILE_TYPE_MAP.get(extension) || FileType.OTHER;
    }
}