import { AbstractModel } from "./abstract-model";
import { File } from "./file";
import { Publication } from "./publication";

export interface Comment extends AbstractModel {
    content: string;
    authorId: string;
    authorType: string;
    authorName: string;
    authorPicture?: File;
    publication: Publication;
}