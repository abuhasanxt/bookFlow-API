import { ResourceType } from "../../../generated/prisma/enums";

export interface ResourceData {
    name:string,
    type:ResourceType,
    description?:string,
    capacity:number,
    priceCentsPerHour:number,
    amenityIds?: string[];

}