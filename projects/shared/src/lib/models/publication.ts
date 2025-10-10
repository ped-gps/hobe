import { ModelType } from "../enums/model-type";
import { AbstractModel } from "./abstract-model";
import { File } from "./file";

export interface Publication extends AbstractModel {
    description: string;
    files: Array<File>;
    authorId: string;
    authorType: ModelType
    likesCount: number;
    commentsCount: number;
    saveCount: number;
}
