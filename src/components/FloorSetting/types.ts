import { RoomDataModel } from '@/models'

export interface RgbColor {
    r: number
    g: number
    b: number
}

export type FloorSettingDataType = {
    fire_compartments: DataItemType | null
    alarm_areas: DataItemType | null
}

export type DataItemType = {
    itemName?: string
    color: RgbColor
    setting?: { name: string; value: string }
    rooms: RoomDataModalCustom[]
}

export type RoomDataModalCustom = {
    isShow: boolean
} & RoomDataModel
