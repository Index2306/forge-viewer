import { deleteAllManualCallPoint, removeSymbolPlaneMesh } from '@/ForgeViewer/CustomTool/Edit2D'
import { insertSymbolManualCallPoint } from '@/ForgeViewer/CustomTool/Edit2D/draw'
import { LayerKey, LayerStatus, ToolName } from '@/contants/tool'
import { useAppSelector } from '@/hooks'
import { ExitPointDataModel, LayerItemModel, ManualCallPointDataModel } from '@/models'
import { selectTool } from '@/store/slices/tool/tool.slice'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { Vector2 } from 'three'

/**
 * compare 2 array
 * @param A
 * @param B
 * @returns
 */
function compareArr(A: string[], B: string[]) {
    return A.length === B.length && A.every((v, i) => B[i] === v)
}

export const useManualCallPointListView = ({
    currentGroupTool,
    layerList,
    groupTools,
}: {
    currentGroupTool?: string[]
    layerList: LayerItemModel[]
    groupTools: Record<string, string[]>
}) => {
    const { currentFile } = useAppSelector(selectTool)

    const previousTool = useRef<any>(null);

    // Setup tool
    const manualCallPointGroup = groupTools.manual_call_point
    const chooseTool = groupTools.choose

    const callPointList = useMemo(() => {
        if (!currentFile?.fileData?.exitPoints) return []

        const arrPoint = currentFile?.fileData?.exitPoints?.map(
            (exitPoint: ExitPointDataModel, index) => {
                let name = exitPoint.name
                if (!name) {
                    name = `Sign ${index + 1}`
                }
                const centerPoint = new Vector2().set(
                    exitPoint.position_layer.x,
                    exitPoint.position_layer.y,
                )
                const size = exitPoint.size ?? 0.3

                const dataCallPoint: ManualCallPointDataModel = {
                    id: exitPoint.id,
                    name,
                    size,
                    point: centerPoint,
                }
                return dataCallPoint
            },
        )

        return arrPoint
    }, [currentFile])

    /**
     * Handle draw list of call points with selected id on viewer
     */
    const onHandleToggleCallPointsOnViewer = (callPoints: ManualCallPointDataModel[]) => {
        callPoints.forEach((cp) => {
            insertSymbolManualCallPoint(cp.id, cp.point, cp.size)
        })
    }
    /**
     * Handle un-draw list of call points with selected id on viewer
     */
    const onHandleUndrawCallPointsOnViewer = (callPoints: ManualCallPointDataModel[]) => {
        callPoints.forEach((cp) => {
            const planeMesh = window.manualCallPointList?.find((p) => p.id === cp.id)

            if (planeMesh) {
                // Remove manual call point from list
                window.manualCallPointList = window.manualCallPointList.filter(
                    (p) => p.id !== cp.id,
                )

                // Remove manual call point from Viewer
                removeSymbolPlaneMesh(planeMesh.planeMesh, cp.id)
            }
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
        if (callPointList?.length < 1) return

        //
        // Check current tool is actually desired tool
        if (compareArr(manualCallPointGroup, currentGroupTool)) {
            // Helper to prevent can not draw manual call points list correctly
            previousTool.current = manualCallPointGroup
            return
        }

        // Helper to prevent can not draw manual call points list correctly
        if (currentGroupTool.includes(ToolName.CHOOSE)) {
            if (previousTool.current === manualCallPointGroup) {
                setTimeout(() => {
                    onHandleToggleCallPointsOnViewer(callPointList)
                    previousTool.current = currentGroupTool
                }, 500)
                return
            }
        }

        //
        // Support for activate Drawing function of this Tool when user click to LayerItem
        const isActive = isCurrentLayerItemActive(layerList)(
            LayerKey.MANUAL_CALL_POINT,
            LayerStatus.OPEN,
        )

        if (!isActive) {
            onHandleUndrawCallPointsOnViewer(callPointList)
            return
        }

        onHandleToggleCallPointsOnViewer(callPointList)

        // when component is un-mount
        return () => {
            onHandleUndrawCallPointsOnViewer(callPointList)
        }
    }, [layerList, currentGroupTool, groupTools, callPointList])
}
