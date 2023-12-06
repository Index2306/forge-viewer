import {PolygonType, ToolName} from "@/contants/tool";
import React, {useCallback, useContext, useEffect, useState} from "react";
import {useTranslation} from "next-i18next";
import {ForgeViewerContext} from "@/context/ForgeViewerContext";

// import ToolItem from "@/components/Tool/ToolList/ToolItem";
import ToolItemRightSidebar from "@/components/Tool/ToolRightSidebar/ToolItemRightSidebar";

import {changeTool} from "@/ForgeViewer/CustomTool";
import CallPointList from "@/components/ToolHandle/ManualCallPointTool/CallPointListTool/CallPointList";
import {useAppDispatch, useAppSelector} from "@/hooks";
import {selectTool, updateDataExitPoint, updateRoomDoorData} from "@/store/slices/tool/tool.slice";
import {convertPointLayerToModel, convertPointModelToLayer} from "@/ForgeViewer/CustomTool/Point";
import {DoorDataModel, ExitPointDataModel, Point3D, RoomDataModel} from "@/models";
import Cookies from "js-cookie";
import {v4 as uuid} from "uuid";
import {HubConnectionContext} from "@/context/HubConnectionContext";
import { useActiveGroupToolsOnViewer } from "@/hooks/useActiveGroupToolsOnViewer";
import SubToolRightSidebar from "@/components/Tool/ToolRightSidebar/SubToolSidebar";
import { BiListUl } from "react-icons/bi";

const toolName = ToolName.CALL_POINT_LIST;

const groupToolNames = [
    toolName,
    ToolName.CALL_POINT_SET,
]

const CallPointListTool : React.FC<CallPointListToolProps> = ({isFirst}) => {
    const {t} = useTranslation(['common', 'config', 'tool']);

    const dispatch = useAppDispatch();
    const {connected, hubConnection} = useContext(HubConnectionContext)
    const {currentFile} = useAppSelector(selectTool)

    const {activeTool, setActiveTool, isActiveCurrentTool} = useActiveGroupToolsOnViewer({groupToolNames})

    const data = {
        keyName: toolName,
        icon: <BiListUl />,
        name: t('call_point_list', {ns: 'tool'}),
    }

    useEffect(() => {
        const exitPoints = [...currentFile?.fileData?.exitPoints ?? []]
        if (exitPoints.length < 1) {
            onHandleUpdateManualCallPointByDoorExit()
        }
    }, [])

    useEffect(() => {
        window.removeEventListener('endDragMoveManualCallPoint', endDragMoveManualCallPoint)

        window.addEventListener('endDragMoveManualCallPoint', endDragMoveManualCallPoint, { passive: true })

        return () => {
            window.removeEventListener('endDragMoveManualCallPoint', endDragMoveManualCallPoint)
        }
    }, [currentFile?.fileData?.exitPoints])

    const onHandleOnClick = useCallback((event?: any) => {
        if (activeTool === toolName) {
            changeTool(ToolName.MANUAL_CALL_POINT_TOOL)
            setActiveTool(ToolName.MANUAL_CALL_POINT_TOOL)
        } else {
            changeTool(toolName, onHandleMoveEditPolygon)
            setActiveTool(toolName)
        }
    }, [activeTool, setActiveTool])


    const onHandleMoveEditPolygon = (...params: any[]) => {
        const poly = params[0];
        new Promise(() => {
            if (poly) {
                poly.planeMesh.position.set(poly.centerX, poly.centerY, 3);
                window.NOP_VIEWER.impl.invalidate(true, true, true);
            }
        })
    }

    const endDragMoveManualCallPoint = (e: any) => {
        const polyArr = e?.detail;
        if (!polyArr || polyArr.length < 1) return;
        new Promise(() => {
            const poly = polyArr[0];
            if (poly.type === PolygonType.MANUAL_CALL_POINT) {
                const polyId = poly.name;
                const newPositionLayer: Point3D = {x: poly.centerX, y: poly.centerY, z: 0};
                const newPositionModel: Point3D = convertPointLayerToModel(newPositionLayer);

                let newArrDataExitPoint = [...(currentFile?.fileData?.exitPoints ?? [])].map((point: ExitPointDataModel) => {
                    if (point.id === polyId) {
                        return {
                            ...point,
                            position_layer: newPositionLayer,
                            position: newPositionModel,
                            isShow: true,
                            isManual: true
                        }
                    }
                    return point
                });

                dispatch(updateDataExitPoint(newArrDataExitPoint));
            }
        })
    }


    // Get manual call point data for the first time after changing unit file
    const onHandleUpdateManualCallPointByDoorExit = useCallback(() => {
        new Promise(() => {
            if (connected && hubConnection && hubConnection.state === 'Connected') {
                const data = {
                    dataRoom: [...(currentFile?.fileData?.rooms) ?? []],
                    dataDoor:  [...(currentFile?.fileData?.doors) ?? []],
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
                        }
                    });
            }
        })
    }, [dispatch, connected, hubConnection, currentFile?.fileData?.rooms, currentFile?.fileData?.doors])

    if (isFirst) {
        return null;
    }
    return (
    <>
        <ToolItemRightSidebar selected={isActiveCurrentTool} data={data} onClick={onHandleOnClick}>
            <SubToolRightSidebar selected={isActiveCurrentTool} title={data.name}>
                <CallPointList activeCurrentTool={isActiveCurrentTool} />
            </SubToolRightSidebar>
        </ToolItemRightSidebar>
    </>
    )
};

export default CallPointListTool;

interface CallPointListToolProps {
    isFirst: boolean
}