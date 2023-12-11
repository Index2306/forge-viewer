import React, {useCallback, useEffect, useState} from 'react';
import {Checkbox, Popover} from "antd";
import {CheckboxChangeEvent} from "antd/es/checkbox";
import {DeviceRoomModel} from "@/models";
import {useAppDispatch, useAppSelector} from "@/hooks";
import {selectTool, updateDataRoom} from "@/store/slices/tool/tool.slice";
import {drawSmokeDetector} from "@/ForgeViewer/CustomTool/Edit2D/draw";
import ConfirmDelete from "@/components/ConfirmDelete";
import {LayerKey, LayerStatus} from "@/contants/tool";
import {changeActiveLayerTool, changeStatusKey, selectLayer} from "@/store/slices/tool/layer.slice";

import styles from './SmokeDetectorList.module.scss'
import classNames from 'classnames/bind';
import IconAction from '@/components/IconAction';

const cx = classNames.bind(styles)

const SmokeDetectorViewItem : React.FC<SmokeDetectorViewItemProps> = ({id, name, isShow, device, indeterminate, onCheckAllChange, onCheckChange, checkAll}) => {
    const {currentFile} = useAppSelector(selectTool);
    const dispatch = useAppDispatch();
    const {isLayerToolActive, layerList} = useAppSelector(selectLayer)

    const [isOpenPopover, setIsOpenPopover] = useState<boolean>(false)
    const [checkShow, setCheckShow] = useState<boolean | undefined>(undefined)


    useEffect(() => {
        return () => {
            setIsOpenPopover(false)
            setCheckShow(undefined)
            handleRemoveDetector()
            dispatch(changeStatusKey({
                key: LayerKey.SMOKE_DETECTOR,
                status: LayerStatus.OPEN
            }))
        }
    }, [])

    useEffect(() => {
        setCheckShow(isShow)
        dispatch(changeActiveLayerTool({
            key: LayerKey.SMOKE_DETECTOR,
            status: LayerStatus.OPEN
        }))
        // if (isShow === checkShow) return;
        handleRemoveDetector();

        // if (isLayerToolActive) {
        //     const activeRoomTool = layerList.find(layer => layer.key === LayerKey.SMOKE_DETECTOR && layer.status === LayerStatus.OPEN);
        //     const isShowLayer = activeRoomTool !== undefined;
        // if (isShow && isShowLayer) {

        if (isShow) return handleDrawDetector();
        // }


    }, [device, isShow])

    // useEffect(() => {
    //
    //     const activeDetectorTool = layerList.find(layer => layer.key === LayerKey.SMOKE_DETECTOR && layer.status === LayerStatus.OPEN);
    //     handleRemoveDetector();
    //
    //     if (activeDetectorTool) handleDrawDetector();
    //
    // }, [layerList])

    const handleDrawDetector = useCallback(() => {
        const deviceData = currentFile?.fileData?.devices;
        if (device && deviceData && deviceData.length > 0) {
            const deviceInfo = deviceData.find(d => d.roomId === device.roomId);

            const room = currentFile?.fileData?.rooms?.find(r => r.roomId === device.roomId);
            drawSmokeDetector(room, deviceInfo, device);
        }
    }, [currentFile?.fileData?.devices, device])

    const handleRemoveDetector = useCallback(() => {
        if (device) {
            drawSmokeDetector(undefined, undefined, device, false);
        }
    }, [device])

    const handleOnCheckChange = useCallback((e: CheckboxChangeEvent) => {
        if (onCheckChange && device) {
            onCheckChange(device.roomId, device.id, e.target.checked)
        }
    }, [device, onCheckChange])

    const onCancelRemoveDetector = useCallback(() => {
        setIsOpenPopover(false)
    }, [])

    const onHandleRemoveDetector = useCallback(() => {
        if (!device) return;
        const room = currentFile?.fileData?.rooms?.find(r => r.roomId === device.roomId);
        if (room) {
            const updateRoom = {
                ...room,
                devices: room.devices.filter(d => d.id !== device.id)
            }
            dispatch(updateDataRoom({id: room.roomId, data: updateRoom}))
            handleRemoveDetector()
            onCancelRemoveDetector()
        }

    }, [device, handleRemoveDetector, onCancelRemoveDetector])

    return (
        <div className={cx(id === 'all' ? 'smoke-detector-item-all' : 'smoke-detector-item')}>
            <div className={cx('flex--justify-center')}>
                <Checkbox
                    className={cx('smoke-detector-item__checkbox')}
                    indeterminate={device ? false : indeterminate} onChange={device ? handleOnCheckChange : onCheckAllChange} checked={device ? device.isShow : checkAll}>
                    <span
                        data-class='label__page-tool__tool-right-sidebar__subtool_list-item'
                        className={cx('smoke-detector-item__label')} >{name}</span>
                </Checkbox>
                {onCheckAllChange === undefined ? <Popover
                    onOpenChange={setIsOpenPopover}
                    open={isOpenPopover}
                    key={`$delete_hide`}
                    placement="top"
                    content={<ConfirmDelete name={name} onHandleDelete={onHandleRemoveDetector} onCancel={onCancelRemoveDetector} />}
                    trigger="click">
                        <IconAction src="/assets/icons/icon_delete.svg" title="Trash Icon" size='medium'/>
                </Popover> : null}
            </div>
        </div>
    );
};

export default React.memo(SmokeDetectorViewItem);

interface SmokeDetectorViewItemProps {
    id: string;
    name: string | undefined
    device?: DeviceRoomModel
    checkAll?: boolean
    isShow?: boolean
    indeterminate?: boolean
    onCheckAllChange?: (e: CheckboxChangeEvent) => void
    onCheckChange?: (roomId: any, id: any, value: boolean) => void
}