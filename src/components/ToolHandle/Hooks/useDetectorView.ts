import {LayerKey, LayerStatus, PolygonType} from '@/contants/tool'
import {useAppSelector} from '@/hooks'
import {LayerItemModel} from '@/models'
import {selectTool} from '@/store/slices/tool/tool.slice'
import {useEffect, useMemo} from 'react'
import {drawSmokeDetectorList, insertSymbolToViewer} from "@/ForgeViewer/CustomTool/Edit2D/draw";
import {toolSymbol} from "@/components/ToolHandle/SmokeDetectorTool/BmzSetTool";
import {deleteAllBmz} from "@/ForgeViewer/CustomTool/Edit2D";
import {selectLayer} from "@/store/slices/tool/layer.slice";

/**
 * compare 2 array
 * @param A
 * @param B
 * @returns
 */
function compareArr(A: string[], B: string[]) {
    return A.length === B.length && A.every((v, i) => B[i] === v)
}

export const useDetectorView = ({
                                    devicesGroupTool,
                                    layerList,
                                    groupTools,
                                }: {
    devicesGroupTool?: string[]
    layerList: LayerItemModel[]
    groupTools: Record<string, string[]>
}) => {
    const {currentFile} = useAppSelector(selectTool)
    const {layerList: layerListFromStore} = useAppSelector(selectLayer)

    const smokeDetectorTool = groupTools.smoke_detector_tool

    const devicesList = useMemo(() => {
        if (!currentFile?.fileData?.devices) return []
        return [...currentFile?.fileData?.devices]
    }, [currentFile])

    /**
     * Handle toggle draw devices with selected id on viewer
     */
    const onHandleToggleDeviceOnViewer = (isShow: boolean) => {
        const devicesData = currentFile?.fileData?.devices;
        const roomsData = currentFile?.fileData?.rooms

        const bmz = currentFile?.fileData?.bmz
        if (!devicesData || !roomsData) return

        if (isShow) {
            if (bmz && bmz.length > 0) {
                const callback = (planeMesh: any) => {
                    window.bmzList.push({planeMesh: planeMesh, id: bmz[0].id})
                    window.NOP_VIEWER.overlays.addScene(`${planeMesh.uuid}`);
                    window.NOP_VIEWER.overlays.addMesh(planeMesh, `${planeMesh.uuid}`);
                    window.NOP_VIEWER.impl.invalidate(true, true, true);
                }
                insertSymbolToViewer(bmz[0].id, bmz[0].position_layer, PolygonType.BMZ, toolSymbol, callback, bmz[0].size)
            }
            drawSmokeDetectorList(roomsData, devicesData, true)
        } else {
            deleteAllBmz()
            drawSmokeDetectorList(roomsData, devicesData, false)
        }
    }


    /**
     * Checking the activation of current layer item
     * @param layers
     * @returns
     */
    const isCurrentLayerItemActive = (layers: LayerItemModel[], layerKey: string, layerStatus: number): boolean => {
        const currentLayer = layers.find(
            (layer) => layer.key === layerKey && layer.status === layerStatus,
        )
        return Boolean(currentLayer)
    }

    //
    // Start: Draw or Undraw
    //
    useEffect(() => {
        // Important checker!
        if (!window.NOP_VIEWER ||
            !window.edit2d ||
            !devicesGroupTool ||
            devicesList.length < 1 ||
            compareArr(smokeDetectorTool, devicesGroupTool)
        ) return
        console.log('checkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk')
        //
        // Support for activate Drawing function of this Tool when user click to LayerItem
        const isActive = isCurrentLayerItemActive(layerListFromStore, LayerKey.SMOKE_DETECTOR, LayerStatus.OPEN)

        onHandleToggleDeviceOnViewer(isActive)

        // // when component is un-mount
        return () => {
            onHandleToggleDeviceOnViewer(false)
            deleteAllBmz()
        }
    }, [layerList, devicesGroupTool, smokeDetectorTool, layerListFromStore])
}


















