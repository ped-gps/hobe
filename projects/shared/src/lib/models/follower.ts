import { ModelType } from "../enums/model-type";
import { AbstractModel } from "./abstract-model";

export interface Follower extends AbstractModel {
    followerId : string;
    followerType: ModelType;
    followerName: string;
    followerPicture: File;
    profileId : string;
    profileType: ModelType;
}
