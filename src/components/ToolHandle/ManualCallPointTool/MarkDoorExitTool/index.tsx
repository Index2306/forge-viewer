import {ToolName} from "@/contants/tool";
import React, {useCallback, useContext, useEffect, useState} from "react";
import {useTranslation} from "next-i18next";
import {ForgeViewerContext} from "@/context/ForgeViewerContext";

// import ToolItem from "@/components/Tool/ToolList/ToolItem";
import ToolItemRightSidebar from "@/components/Tool/ToolRightSidebar/ToolItemRightSidebar";

import {changeTool} from "@/ForgeViewer/CustomTool";
import {BsPencil} from "react-icons/bs";
import {DoorDataModel, ExitPointDataModel, RoomDataModel} from "@/models";
import {
    convertPointLayerToModel,
    convertPointModelToLayer,
    getPointBetweenAny,
} from "@/ForgeViewer/CustomTool/Point";
import {
    selectTool,
    updateRoomDoorData
} from "@/store/slices/tool/tool.slice";;
import {v4 as uuid} from "uuid";
import {deleteShapeById} from "@/ForgeViewer/CustomTool/Edit2D";
import {useAppDispatch, useAppSelector} from "@/hooks";
import {HubConnectionContext} from "@/context/HubConnectionContext";
import Cookies from "js-cookie";
import {errorToast, warningToast} from "@/helpers/Toast";
import {drawRoomList} from "@/ForgeViewer/CustomTool/Edit2D/draw";

const toolName = ToolName.MARK_EMERGENCY_EXIT;

const MarkDoorExitTool : React.FC<MarkDoorExitToolProps> = ({isFirst}) => {
    const {t} = useTranslation(['common', 'config', 'tool']);
    const {currentFile} = useAppSelector(selectTool)
    const dispatch = useAppDispatch()

    const {connected, hubConnection} = useContext(HubConnectionContext)
    const {activeTool, setActiveTool} = useContext(ForgeViewerContext)

    const [isActiveCurrentTool, setIsActiveCurrentTool] = useState<boolean>(false)

    const data = {
        keyName: toolName,
        icon: <BsPencil />,
        name: t('mark_emergency_exit', {ns: 'tool'}),
    }

    useEffect(() => {
        setIsActiveCurrentTool(activeTool === toolName)
    }, [activeTool])

    const onHandleOnClick = useCallback((event?: any) => {
        if (activeTool === toolName) {
            changeTool(ToolName.MANUAL_CALL_POINT_TOOL)
            setActiveTool(ToolName.MANUAL_CALL_POINT_TOOL)
        } else {
            changeTool(toolName, onCallbackEndMarkDoor)
            setActiveTool(toolName)
        }
    }, [activeTool, setActiveTool])

    useEffect(() => {
        if (isActiveCurrentTool) {
            drawRoomList(currentFile?.fileData?.rooms.filter(r => r.id !== 'outside') ?? [], true, false)
        } else {
            drawRoomList(currentFile?.fileData?.rooms ?? [], false)
        }

        return () => {
            // drawRoomList(currentFile?.fileData?.rooms ?? [], false)
        }
    }, [isActiveCurrentTool])

    const getDoorName = (doorList: DoorDataModel[]): string => {
        if (doorList.length === 0) return "No. 1";
        const maxNameArr = (doorList ?? []).filter((d: DoorDataModel) => d.name).map((d: DoorDataModel) => +(d.name?.replace('No. ', '') ?? '0'));
        const maxNameNumber = Math.max(...maxNameArr);

        return `No. ${maxNameNumber + 1}`
    }

    const onCallbackEndMarkDoor = (e: any) => {
        const poly = e.detail;
        if (!poly || poly._loops.length < 0 || poly._loops[0].length < 2) return;

        const startLayer = poly._loops[0][0]
        const endLayer = poly._loops[0][1]
        if (startLayer.x.toFixed(4) === endLayer.x.toFixed(4) && startLayer.y.toFixed(4) === endLayer.y.toFixed(4 )) {
            return;
        }

        new Promise(() => {
            const dataDoor = [...(currentFile?.fileData?.doors ?? [])];
            const doorId = uuid()
            const name = getDoorName(dataDoor.filter(d => d.isExist))

            const startModel = convertPointLayerToModel(startLayer)
            const endModel = convertPointLayerToModel(endLayer)

            const newDoor: DoorDataModel = {
                doorId,
                start: startModel,
                end: endModel,
                start_layer: startLayer,
                end_layer: endLayer,
                direction: {x: 0, y: 0, z: 0},
                mid: getPointBetweenAny(startModel, endModel),
                mid_layer: getPointBetweenAny(startLayer, endLayer),
                isExist: true,
                isShow: true,
                name
            }

            if (connected && hubConnection && hubConnection.state === 'Connected') {
                const data = {
                    dataRoom: currentFile?.fileData?.rooms,
                    dataDoor: [...dataDoor, newDoor],
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

                        let isExistNewDoorInNewList = false;
                        let doors = data.doors.map((door: DoorDataModel) => {
                            const d = {
                                ...door,
                                name: door.isExist ? door.name : undefined,
                                start_layer: convertPointModelToLayer(door.start),
                                end_layer: convertPointModelToLayer(door.end),
                                mid_layer: convertPointModelToLayer(door.mid),
                            }
                            if (d.doorId === doorId) {
                                d.isShow = true;
                                if (d.isExist) {
                                    isExistNewDoorInNewList = true;
                                }
                            }
                            return d;
                        });

                        // Check if new "Door exit" is marked correctly?
                        // If not correctly, display a warning and remove it from the list
                        if (!isExistNewDoorInNewList) {
                            warningToast(t('emergency_exit_mark_incorrectly', {ns: 'tool'}), 5000, "top-center")
                            doors = doors.filter((d: DoorDataModel) => d.doorId !== newDoor.doorId);
                        }

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

                        console.log('---------------- doors: ', doors)
                        dispatch(updateRoomDoorData({rooms, doors, exitPoints: newExitPointArray}));
                    } else {
                        errorToast(t('error_mark_door_exit', {ns: 'tool'}))
                    }
                })
                    .catch((err) => {
                        errorToast(t('error_mark_door_exit', {ns: 'tool'}))
                    })
                    .finally(() => deleteShapeById([poly.id]))
            }
        })
    }

    useEffect(() => {
        window.addEventListener(
            "endMarkDoor",
            onCallbackEndMarkDoor,
            false,
        );

        return () => {
            window.removeEventListener("endMarkDoor", onCallbackEndMarkDoor)
        }
    }, [currentFile?.fileData])

    if (isFirst) {
        return null;
    }
    return <ToolItemRightSidebar selected={isActiveCurrentTool} data={data} onClick={onHandleOnClick} />
};

export default MarkDoorExitTool;

interface MarkDoorExitToolProps {
    isFirst: boolean
}