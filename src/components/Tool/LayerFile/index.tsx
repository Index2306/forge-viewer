import React, {useCallback, useContext, useEffect, useState} from 'react'
import {BiLayer} from 'react-icons/bi'
import {useTranslation} from 'next-i18next'
import LayerContent from '@/components/Tool/LayerFile/LayerContent'
import {ToolContext} from '@/context/ToolContext'

import styles from './LayerFile.module.scss'
import classNames from 'classnames/bind'
import SubToolRightSidebar from '../ToolRightSidebar/SubToolSidebar'
import TooltipApp from "@/components/TooltipApp";
import {drawSmokeDetector} from "@/ForgeViewer/CustomTool/Edit2D/draw";
import {useAppDispatch, useAppSelector} from "@/hooks";
import {selectTool} from "@/store/slices/tool/tool.slice";
import {selectLayer} from "@/store/slices/tool/layer.slice";
import {LayerKey} from "@/contants/tool";

const cx = classNames.bind(styles)

const LayerFile: React.FC<LayerFileProps> = () => {
    const dispatch = useAppDispatch()
    const {t} = useTranslation()
    const [open, setOpen] = useState(false)

    const {isToolReady} = useContext(ToolContext)

    const {currentFile} = useAppSelector(selectTool)
    const {activeLayer} = useAppSelector(selectLayer)

    useEffect(() => {
        if (!activeLayer) return;
        const devicesData = currentFile?.fileData?.devices
        const roomsData = currentFile?.fileData?.rooms

        if (roomsData && devicesData) {
            if (activeLayer === LayerKey.SMOKE_DETECTOR) {
                for (let room of roomsData) {
                    for (let device of room.devices) {
                        const deviceInfo = devicesData.find(d => d.roomId === device.roomId);
                        //Remove old detector
                        drawSmokeDetector(undefined, undefined, device, false);
                        //Draw detector
                        drawSmokeDetector(room, deviceInfo, device);
                    }
                }
                return;
            }
        }

    }, [activeLayer])

    const onHandleOpenPopover = useCallback(() => {
        if (isToolReady) {
            setOpen((prev) => !prev)
        }
    }, [isToolReady])

    return (
        <div className={cx('layer-file')}>
            <div className={cx('layer-file__action')} onClick={() => onHandleOpenPopover()}>
                <div
                    className={cx('layer-file__action-icon', {
                        'is-active': open,
                    })}
                >
                    <TooltipApp placement='left' title={t('layers')}>
                        <BiLayer/>
                    </TooltipApp>
                </div>
            </div>

            <SubToolRightSidebar selected={open} className={cx('layer-file__sub-layer-content')} title={t('layers')}>
                <LayerContent/>
            </SubToolRightSidebar>
        </div>
    )
}

export default LayerFile

export interface LayerFileProps {}
