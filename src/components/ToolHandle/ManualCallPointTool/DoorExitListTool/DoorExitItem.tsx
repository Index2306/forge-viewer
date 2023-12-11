import React, {ReactElement, useCallback, useContext, useEffect, useState} from "react";
import {useTranslation} from "next-i18next";
import {ToolContext} from "@/context/ToolContext";
import {useAppDispatch, useAppSelector} from "@/hooks";
import {removeDoor, selectTool, updateRoomDoorData} from "@/store/slices/tool/tool.slice";
import {selectLayer} from "@/store/slices/tool/layer.slice";
import {CheckboxChangeEvent} from "antd/es/checkbox";
import {LayerKey} from "@/contants/tool";
import {Checkbox} from "antd";
import {DoorDataModel, ExitPointDataModel, RoomDataModel} from "@/models";
import {DrawDoorExit} from "@/ForgeViewer/CustomTool/Edit2D/door-exit";
import {Vector2} from "three";
import DoorExitItemPopover from "@/components/ToolHandle/ManualCallPointTool/DoorExitListTool/DoorExitItemPopover";
import Cookies from "js-cookie";
import {convertPointModelToLayer} from "@/ForgeViewer/CustomTool/Point";
import {v4 as uuid} from "uuid";
import {HubConnectionContext} from "@/context/HubConnectionContext";

import styles from "./DoorExitListTool.module.scss";
import classNames from "classnames/bind";
const cx = classNames.bind(styles)

const DoorExitItem : React.FC<DoorExitItemProps> = ({indeterminate, isShow, name, id, data, onChangeView}) => {
    const {t} = useTranslation(['common', 'tool'])
    const dispatch = useAppDispatch()
    const {connected, hubConnection} = useContext(HubConnectionContext)
    const {currentFile} = useAppSelector(selectTool);
    const {isLayerToolActive, layerList} = useAppSelector(selectLayer)

    const onChange = useCallback((e: CheckboxChangeEvent) => {
        if (onChangeView) {
            onChangeView(e.target.checked as boolean, id)
        }
    }, [onChangeView, id]);

    useEffect(() => {
        onHandleRemoveDoorOnViewer()
        if (isLayerToolActive) {
            const activeRoomTool = layerList.find(layer => layer.key === LayerKey.DOORS && layer.status === 1);
            if (isShow && activeRoomTool) {
                onHandleDrawDoorOnViewer();
            }
        }
    }, [id, layerList, isLayerToolActive, isShow])

    // Handle show door shape on the Viewer
    const onHandleDrawDoorOnViewer = useCallback(() => {
        if (data) {
            const startPoint = new Vector2().set(data.start_layer.x, data.start_layer.y);
            const endPoint = new Vector2().set(data.end_layer.x, data.end_layer.y);
            DrawDoorExit(data.doorId, name ?? '', startPoint, endPoint)
        }
    }, [data])

    // Handle remove door shape on the Viewer
    const onHandleRemoveDoorOnViewer = useCallback(() => {
        if (id) {
            DrawDoorExit(id, name ?? '', undefined, undefined, false)
        }
    }, [id])

    const onHandleRemoveDoorExit = useCallback(() => {
        if (!data) return;
        const doorRemoveId = data.doorId;
        const newDataDoor = [...(currentFile?.fileData?.doors) ?? []].filter((door: DoorDataModel) => door.doorId !== doorRemoveId);

        new Promise(() => {
            if (connected && hubConnection && hubConnection.state === 'Connected') {
                const data = {
                    dataRoom: [...(currentFile?.fileData?.rooms) ?? []],
                    dataDoor: newDataDoor,
                    unit: currentFile?.fileData?.units
                }
                const request = {
                    data,
                    type: 3
                }

                hubConnection.invoke('algorithmSupport', request, Cookies.get('app_locale'))
                    .then((response) => {
                        if (response.isSuccess) {
                            const data = response.data;
                            const rooms = data.rooms.map((room: RoomDataModel) => {
                                return {
                                    ...room,
                                    boundary_layer: room.boundary.map(p => convertPointModelToLayer(p)),
                                    centroid_layer: convertPointModelToLayer(room.centroid),
                                }
                            });

                            let doors = data.doors.map((door: DoorDataModel) => {
                                const d = {
                                    ...door,
                                    name: door.isExist ? door.name : undefined,
                                    start_layer: convertPointModelToLayer(door.start),
                                    end_layer: convertPointModelToLayer(door.end),
                                    mid_layer: convertPointModelToLayer(door.mid),
                                }
                                return d;
                            });

                            // Update the list of locations for "manual call point" signs
                            const newExitPointArray = [...(currentFile?.fileData?.exitPoints ?? [])].filter((ep: ExitPointDataModel) => ep.isManual);

                            data.exitPoints.map((point: any) => {
                                const existManual =
                                    newExitPointArray
                                        .find((ep: ExitPointDataModel) => ep.position_origin.x === point.x && ep.position_origin.y === point.y);
                                if (!existManual) {
                                    const newExitPoint: ExitPointDataModel = {
                                        id: uuid(),
                                        isManual: false,
                                        position: point,
                                        position_origin: point,
                                        position_layer: convertPointModelToLayer(point)
                                    }
                                    newExitPointArray.push(newExitPoint)
                                }
                            })

                            dispatch(updateRoomDoorData({rooms, doors, exitPoints: newExitPointArray}));
                            onHandleRemoveDoorOnViewer()
                        }
                    })
            }
        })
    }, [dispatch, data, onHandleRemoveDoorOnViewer, connected, hubConnection, currentFile?.fileData?.rooms, currentFile?.fileData?.doors])

    const onCancelRemoveDoorExit = useCallback(() => {
        // cancel remove door exit logic, if any
    }, [])

    return (
        <div className={cx(id === 'all' ? 'door-exit-item__all' : 'door-exit-item')}>
            <div className={cx('flex--justify-center')}>
                <Checkbox className={cx('door-exit-item__checkbox')}
                          indeterminate={indeterminate}
                          checked={isShow}
                          onChange={onChange}>
                    <span
                        data-class='label__page-tool__tool-right-sidebar__subtool_list-item'
                        className={cx('door-exit-item__label')} >{name ? name : t('unknown', {ns: 'common'})}</span>
                </Checkbox>
                {id !== 'all' ?
                    <DoorExitItemPopover id={id} name={name}
                                         onRemoveDoorExit={onHandleRemoveDoorExit}
                                         onCancelRemoveDoorExit={onCancelRemoveDoorExit}/> : null}
            </div>
        </div>
    );
};

export default React.memo(DoorExitItem);

interface DoorExitItemProps {
    id: string
    isShow?: boolean
    children?: ReactElement
    name: string | undefined
    data?: DoorDataModel
    onChangeView?: (status: boolean, id: string | number) => void
    width?: string | number
    length?: string | number
    indeterminate?: boolean
}