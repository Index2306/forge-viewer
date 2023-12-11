import {LayerKey, LayerStatus, PolygonType} from '@/contants/tool'
import {useAppDispatch, useAppSelector} from '@/hooks'
import {LayerItemModel} from '@/models'
import {selectTool} from '@/store/slices/tool/tool.slice'
import {useEffect} from 'react'
import {algorithmSupport} from "@/store/actions/tool.action";
import {errorToast} from "@/helpers/Toast";
import {startToolWiring} from "@/ForgeViewer/CustomTool/Wiring";
import {useTranslation} from "next-i18next";
import {deleteShapeByType} from "@/ForgeViewer/CustomTool/Edit2D";

interface useWiringType {
    devicesGroupTool?: string[],
    layerList: LayerItemModel[],
    groupTools: Record<string, string[]>
}

/**
 * compare 2 array
 * @param A
 * @param B
 * @returns
 */
function compareArr(A: string[], B: string[]) {
    return A.length === B.length && A.every((v, i) => B[i] === v)
}

export const useWiringView = ({
                                  devicesGroupTool,
                                  layerList,
                                  groupTools
                              }: useWiringType) => {
    const dispatch = useAppDispatch()
    const {t} = useTranslation(['tool'])

    const {currentFile} = useAppSelector(selectTool)

    const smokeDectectorTool = groupTools.smoke_detector_tool

    /**
     * Handle toggle draw devices with selected id on viewer
     */
    const onHandleToggleDeviceOnViewer = (isShow: boolean) => {
        // deleteShapeByType(PolygonType.WIRING)
        const roomsData = currentFile?.fileData?.rooms
        const bmz = currentFile?.fileData?.bmz

        if (!roomsData || !isShow) return
        const request = {
            dataRoom: JSON.stringify(roomsData),
            dataBmz: JSON.stringify(bmz?.map(b => b.position) ?? [])
        }

        dispatch(algorithmSupport(request))
            .unwrap()
            .then((response: any) => {
                startToolWiring(response.result)
            })
            .catch((err) => {
                errorToast(t('wiring_error', {ns: 'tool'}))
            })

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
            compareArr(smokeDectectorTool, devicesGroupTool)
        ) return
        //
        // Support for activate Drawing function of this Tool when user click to LayerItem
        const isActive = isCurrentLayerItemActive(layerList, LayerKey.WIRING, LayerStatus.OPEN)
        onHandleToggleDeviceOnViewer(isActive)
        // // when component is un-mount
        return () => {
            onHandleToggleDeviceOnViewer(false)
            deleteShapeByType(PolygonType.WIRING)
        }

    }, [layerList])
}


















