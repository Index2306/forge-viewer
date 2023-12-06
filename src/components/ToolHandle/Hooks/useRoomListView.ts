import { drawRoom } from '@/ForgeViewer/CustomTool/Edit2D/draw'
import { LayerKey, LayerStatus } from '@/contants/tool'
import { useAppSelector } from '@/hooks'
import { LayerItemModel, RoomDataModel } from '@/models'
import { selectTool } from '@/store/slices/tool/tool.slice'
import { useEffect, useMemo } from 'react'

/**
 * compare 2 array
 * @param A
 * @param B
 * @returns
 */
function compareArr(A: string[], B: string[]) {
    return A.length === B.length && A.every((v, i) => B[i] === v)
}

export const useRoomListView = ({
    currentGroupTool,
    layerList,
    groupTools,
}: {
    currentGroupTool?: string[]
    layerList: LayerItemModel[]
    groupTools: Record<string, string[]>
}) => {
    const { currentFile } = useAppSelector(selectTool)

    const roomTool = groupTools.room_tool

    const roomList = useMemo(() => {
        if (!currentFile?.fileData?.rooms) return []
        return currentFile?.fileData?.rooms.filter((r) => r.id !== 'outside')
    }, [currentFile])

    /**
     * Handle draw room with selected id on viewer
     */
    const onHandleToggleRoomOnViewer = async (rooms: RoomDataModel[]) => {
        rooms.forEach((r) => {
            drawRoom(r.roomId, r.name, r.boundary_layer, true)
        })
    }
    /**
     * Handle un-draw room with selected id on viewer
     */
    const onHandleUndrawRoomOnViewer = async (rooms: RoomDataModel[]) => {
        rooms.forEach((r) => {
            drawRoom(r.roomId, undefined, [], false)
        })
    }

    /**
     * Checking the activation of current layer item
     * @param layers
     * @returns
     */
    const isCurrentLayerItemActive = (layers: LayerItemModel[]) => {
        return (layerKey: string, layerStatus: number): boolean => {
            const currentLayer = layers.find(
                (layer) => layer.key === layerKey && layer.status === layerStatus,
            )
            return Boolean(currentLayer)
        }
    }

    //
    // Start: Draw or Undraw
    //
    useEffect(() => {
        // Important checker!
        if (!window.NOP_VIEWER) return
        if (!window.edit2d) return
        if (!currentGroupTool) return
        if (roomList?.length < 1) return

        //
        // Check current tool is actually desired tool
        if (compareArr(roomTool, currentGroupTool)) {
            return
        }

        //
        // Support for activate Drawing function of this Tool when user click to LayerItem
        const isActive = isCurrentLayerItemActive(layerList)(LayerKey.ROOMS, LayerStatus.OPEN)

        if (!isActive) {
            onHandleUndrawRoomOnViewer(roomList)
            return
        }

        //
        // This code apply toggle for all rooms
        onHandleToggleRoomOnViewer(roomList)

        // when component is un-mount
        return () => {
            onHandleUndrawRoomOnViewer(roomList)
        }
    }, [layerList, currentGroupTool, groupTools, roomList])
}
