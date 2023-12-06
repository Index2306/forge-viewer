import { RoomDataModel, SortType } from "@/models"
import { DataItemType, RoomDataModalCustom } from "./types"
import words from "lodash/words"

export const FIRE_COMPARTMENTS = 'fire_compartments'
export const ALARM_AREAS = 'alarm_areas'

// Observe the changes of roomList like changes of each room's info
// or if room(s) is/are deleted, after that change the dataSource
// to the desired result
export const observeAndTransformRoomListData = (dataSource: DataItemType, roomList: RoomDataModalCustom[]): DataItemType => {
    const customDataSource = { ...dataSource }

    if (customDataSource.rooms.length > roomList.length) {
        const observedRoomKeyList: string[] = customDataSource.rooms.map(r => { return r.roomId })
        for (const key of observedRoomKeyList) {
            const hasRoomInRoomList = roomList.findIndex(r => r.roomId === key)
            if (hasRoomInRoomList === -1) {
                customDataSource.rooms = [...customDataSource.rooms].filter(r => r.roomId !== key)
            }
        }
        return customDataSource
    }

    let observer: Record<string, RoomDataModel> = {}

    roomList.forEach(r => {
        observer[r.roomId] = {...r, isShow: false}
    })

    customDataSource.rooms = customDataSource.rooms.map(r => {
        return {...observer[r.roomId], isShow: r.isShow}
    })

    return customDataSource
}

export const SORT_BY = {
    NAME: 'name',
    WIDTH: 'width',
    LENGTH: 'length',
} as const

export const SORT_STATUS = {
    ASC: 0,
    DSC: 1,
} as const

export const NONE_STATUS = 2

// ------------------------------------------------------------------

export function sortedHelper(sortedStatus: number, a: any, b: any) {
    switch (sortedStatus) {
        case SORT_STATUS.ASC:
            if (a < b) return -1
            if (a > b) return 1
            return 0
        case SORT_STATUS.DSC:
            if (a > b) return -1
            if (a < b) return 1
            return 0
        default:
            return 0
    }
}

export function sortTargetHelper(
    target: RoomDataModalCustom[],
    sorts: Record<string, SortType>,
    sortBy: string,
    callback: (data: RoomDataModalCustom[], status: number) => RoomDataModalCustom[],
) {
    const obj = sorts[sortBy] as SortType
    return callback(target, obj.status)
}

export function sortByName(rooms: RoomDataModalCustom[], sortedStatus: number): RoomDataModalCustom[] {
    const result = [...rooms]
    result.sort(function (a, b) {
        const current = a.name ?? ""
        const next = b.name ?? ""
        return sortedHelper(sortedStatus, current, next)
    })
    return result
}

export function sortByWidth(rooms: RoomDataModalCustom[], sortedStatus: number): RoomDataModalCustom[] {
    const result = [...rooms]
    result.sort(function (a, b) {
        let numbA = Number(a.width)
        let numbB = Number(b.width)
        return sortedHelper(sortedStatus, numbA, numbB)
    })
    return result
}

export function sortByLength(rooms: RoomDataModalCustom[], sortedStatus: number): RoomDataModalCustom[] {
    const result = [...rooms]
    result.sort(function (a, b) {
        let numbA = Number(a.length)
        let numbB = Number(b.length)
        return sortedHelper(sortedStatus, numbA, numbB)
    })
    return result
}