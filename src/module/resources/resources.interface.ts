import { ResourceType } from "../../../generated/prisma/enums";

export interface ResourceData {
    name:string,
    type:ResourceType,
    description?:string,
    capacity:number,
    priceCentsPerHour:number,
    amenityIds?: string[];

}
export interface GetResourcesQuery {
  type?: "ROOM" | "DESK" | "EQUIPMENT";
  minCapacity?: number;
  amenity?: string;
  availableFrom?: string;
  availableTo?: string;
  sortBy?: "priceCentsPerHour" | "capacity";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}