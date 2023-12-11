import React, {ReactElement, useCallback, useEffect, useState} from 'react';
import {useTranslation} from "next-i18next";
import {useAppDispatch, useAppSelector} from "@/hooks";
import {removeManualCallPoint} from "@/store/slices/tool/tool.slice";
import {selectLayer} from "@/store/slices/tool/layer.slice";
import {CheckboxChangeEvent} from "antd/es/checkbox";
import {LayerKey} from "@/contants/tool";
import {insertSymbolManualCallPoint} from "@/ForgeViewer/CustomTool/Edit2D/draw";

import {Checkbox} from "antd";
import {Point3D} from "@/models";
import {Vector2} from "three";
import {removeSymbolPlaneMesh} from "@/ForgeViewer/CustomTool/Edit2D";
import CallPointItemPopover from "@/components/ToolHandle/ManualCallPointTool/CallPointListTool/CallPointItemPopover";

import styles from "./CallPoint.module.scss";
import classNames from 'classnames/bind';
const cx = classNames.bind(styles)


const CallPointItem : React.FC<CallPointItemProps> = ({indeterminate, isShow, name, id, point, size, onChangeView}) => {
    const {t} = useTranslation(['common', 'tool'])
    const dispatch = useAppDispatch()
    const {isLayerToolActive, layerList} = useAppSelector(selectLayer)

    const [isOpenModal, setIsOpenModal] = useState<boolean>(false)

    const onChange = useCallback((e: CheckboxChangeEvent) => {
        if (onChangeView) {
            onChangeView(e.target.checked as boolean, id)
        }
    }, [onChangeView, id]);

    useEffect(() => {
        return () => {
            // onHandleRemoveManualCallPointOnViewer()
            setIsOpenModal(false)
        }
    }, [])

    useEffect(() => {
        onHandleRemoveManualCallPointOnViewer()
        if (isLayerToolActive) {
            const activeRoomTool = layerList.find(layer => layer.key === LayerKey.MANUAL_CALL_POINT && layer.status === 1);
            if (isShow && activeRoomTool) {
                onHandleDrawManualCallPointOnViewer();
                return ;
            }
        }

        return () => {
            onHandleRemoveManualCallPointOnViewer()
        }
    }, [id, layerList, isLayerToolActive, isShow, size])

    useEffect(() => {
        if (!isShow && isOpenModal) {
            setIsOpenModal(false)
        }
    }, [isShow])

    useEffect(() => {
        if (!isShow && isOpenModal && onChangeView) {
            onChangeView(true, id)
        }
    }, [isOpenModal])

    const onHandleDrawManualCallPointOnViewer = useCallback(() => {
        insertSymbolManualCallPoint(id, point, size)
    }, [id, point, size])

    const onHandleRemoveManualCallPointOnViewer = useCallback(() => {
        const planeMesh = window.manualCallPointList?.find(p => p.id === id);
        if (planeMesh) {
            // Remove manual call point from list
            window.manualCallPointList = window.manualCallPointList.filter(p => p.id !== id)

            // Remove manual call point from Viewer
            removeSymbolPlaneMesh(planeMesh.planeMesh, id)
        }
    }, [id, window.manualCallPointList])

    const onHandleRemoveCallPointData = useCallback(() => {
        if (!id) return;
        // Remove manual call point from Store data
        dispatch(removeManualCallPoint(id))

        // Remove manual call point from Viewer
        onHandleRemoveManualCallPointOnViewer()
    }, [dispatch, id, onHandleRemoveManualCallPointOnViewer])

    return (
        <div className={cx(id === 'all' ? 'call-point-item__all' : 'call-point-item')}>
            <div className={cx('flex--justify-center')}>
                <Checkbox className={cx('call-point-item__checkbox')}
                          indeterminate={indeterminate}
                          checked={isShow}
                          onChange={onChange}>
                    <span
                        data-class='label__page-tool__tool-right-sidebar__subtool_list-item'
                        className={cx('call-point-item__label')} >{name ? name : t('unknown', {ns: 'common'})}</span>
                </Checkbox>
                {id !== 'all' ? <CallPointItemPopover id={id} name={name} size={size}
                                                      onRemoveCallPoint={onHandleRemoveCallPointData}
                                                      isOpenModal={isOpenModal}
                                                      setIsOpenModal={setIsOpenModal}/> : null}
            </div>
        </div>
    );
};

export default React.memo(CallPointItem);

interface CallPointItemProps {
    id: string
    isShow?: boolean
    children?: ReactElement
    name: string | undefined
    point?: Point3D | Vector2
    size: number
    onChangeView?: (status: boolean, id: string | number) => void
    width?: string | number
    length?: string | number
    indeterminate?: boolean
}