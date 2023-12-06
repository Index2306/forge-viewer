import React, {useEffect, useState} from 'react'
import {useAppDispatch, useAppSelector} from '@/hooks'
import {changeLayerList, selectLayer} from '@/store/slices/tool/layer.slice'
import {LayerItemModel} from '@/models'
import LayerItem from '@/components/Tool/LayerFile/LayerItem'

import styles from './LayerFile.module.scss'
import classNames from 'classnames/bind'
import { useManualCallPointListView } from '@/components/ToolHandle/Hooks/useManualCallPointListView'
import {useIdentifyCurrentLayerTool} from "@/components/ToolHandle/Hooks/useIdentifyCurrentLayerTool";
import {useRoomListView} from "@/components/ToolHandle/Hooks/useRoomListView";
import {useDetectorView} from "@/components/ToolHandle/Hooks/useDetectorView";
import {useWiringView} from "@/components/ToolHandle/Hooks/useWiringView";

const cx = classNames.bind(styles)

const LayerContent: React.FC<LayerContentProps> = () => {
    const dispatch = useAppDispatch()

    const [layerList, setLayerList] = useState<LayerItemModel[]>([])

    const { layerList: layerListFromStore, isLayerToolActive } = useAppSelector(selectLayer)

    // ----------------------------------------------------------------------------------

    // Helper for Identify Current Layer Tool that supports for Show/Draw Tool
    const { currentGroupTool, groupTools, changeStatusKeyLayer } = useIdentifyCurrentLayerTool({ setLayerList })

    // Helper for Toggle Room List on viewer
    useRoomListView({ currentGroupTool, layerList, groupTools })

    // Helper for Toggle Call Point List on viewer
    useManualCallPointListView({currentGroupTool, layerList, groupTools})

    // Helper for Detector on viewer
    useDetectorView({
        devicesGroupTool: currentGroupTool,
        layerList,
        groupTools
    })

    // Helper for Wiring on viewer
    useWiringView({
        devicesGroupTool: currentGroupTool,
        layerList,
        groupTools
    })

    // ----------------------------------------------------------------------------------

    useEffect(() => {
        setLayerList(layerListFromStore)
    }, [])

    useEffect(() => {
        dispatch(changeLayerList(layerList))
    }, [layerList])

    // ----------------------------------------------------------------------------------

    const handleToggleLayerItem = (key: string, status: number) => {
        // dispatch(changeStatusKey({key, status}))
        changeStatusKeyLayer({key, status})
    }

    // --------------------------------------------------------------------------

    return (
        <div className={cx('layer-file__feature-wrapper')}>
            <div className={cx('layer-file__list-feature')}>
                {layerList.map((l: any, index: number) => (
                    <LayerItem
                        key={index}
                        keyName={l.key}
                        active={isLayerToolActive}
                        status={l.status}
                        changeShow={handleToggleLayerItem}
                    />
                ))}
            </div>
        </div>
    )
}

export default LayerContent

export interface LayerContentProps {}
