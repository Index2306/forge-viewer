import {NewFieldType} from "@/models/common";
import {Vector2} from "three";
import { GeneralData } from "./general-data";

export interface LayerItemList {
    layerList: LayerItemModel[],
    isLayerToolActive: boolean,
    activeLayer: string | null
}

export interface LayerItemModel {
    key: string,
    status: number,
}

export interface FileData {
    boundary: Point3D[],
    boundary_layer: Point3D[],
    rooms: RoomDataModel[],
    doors: DoorDataModel[],
    devices: DeviceDataModel[],
    exitPoints: ExitPointDataModel[],
    totalArea: number,
    units: string,
    scale: number,
    length: number,
    pdfInfo: GeneralData
    editedRoom: RoomDataModel | null,
    bmz: BmzDataModel[],
    hasAtLeastOneRoomIsShown: boolean
    symbols: SymbolDataModel[]
}

export interface Point2D {
    x: number,
    y: number,
    z: number
}

export interface Point3D {
    x: number,
    y: number,
    z: number
}

export interface RoomDataModel {
    id: string,
    roomId: string,
    boundary: Point3D[] | Vector2[] | any[],
    boundary_layer: Point3D[],
    devices: DeviceRoomModel[],
    doorIds?: DoorDataModel[],
    width: number,
    length: number,
    centroid: Point3D | Vector2,
    centroid_layer: Point3D | Vector2,

    // data of Frontend
    height?: number
    name?: string,
    isShow?: boolean
    info?: RoomInformationModel
}

export interface RoomInformationModel {
    dynamicFields?: NewFieldType[] | any[],
    false_ceiling?: boolean
    raised_floor?: boolean
    detector_type?: string
    partitions_on_ceiling?: boolean
    ceiling_sloping?: boolean
    explosive_atmosphere?: boolean
    ceiling_vaulted?: boolean
    obstacles_to_installation?: boolean
    server_room?: boolean
    ceiling_sloping_length?: string
    ceiling_sloping_height?: string
    ceiling_vaulted_height?: string
    ceiling_vaulted_width?: string
    partitions_number?: string
    partitions_height?: string
    partitions_width?: string
    has_any_disturbances?: boolean
    any_disturbances?: string
}


export interface DoorDataModel {
    doorId: string,
    start: Point3D,
    start_layer: Point3D,
    end: Point3D,
    end_layer: Point3D,
    mid: Point3D,
    mid_layer: Point3D,
    direction: Point3D,
    isExist: boolean,

    isShow?: boolean,
    name?: string,
}

export interface DeviceRoomModel {
    id: string,
    roomId: string,
    position: Point3D,
    position_layer: Point3D | Vector2,

    isShow?: boolean
    radius?: number
    radius_layer?: number
}

export interface DeviceDataModel {
    id: string,
    roomId: string,
    width: number,
    length: number,
    amountSmokeAlarm: number,
    radius: number,
    distanceWallX: number,
    distanceWallY: number,
    distanceSmokeAlarmX: number,
    distanceSmokeAlarmY: number,
}

export interface ExitPointDataModel {
    id: string,
    isManual: boolean,
    position: Point2D,
    position_layer: Point2D,
    position_origin: Point2D,

    size?: number
    name?: string
    isShow?: boolean
}

export interface ManualCallPointDataModel {
    id: string,
    name?: string | undefined
    point: Point3D | Vector2
    isShow?: boolean
    size: number
}

export interface BmzDataModel {
    id: string,
    roomId?: string,
    position: Point3D
    position_layer: Point3D
    position_origin: Point3D
    isShow?: boolean
    size: number
}

export interface SymbolDataModel {
    id: string,
    code: string,
    folder: string
    ext?: string
    name: string
    ratio: number
    position: Point3D
    position_layer: Point3D
    position_origin: Point3D

    isShow?: boolean
    size: number
}