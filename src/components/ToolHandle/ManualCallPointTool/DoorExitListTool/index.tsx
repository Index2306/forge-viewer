import {PolygonType, ToolName} from "@/contants/tool";
import React, {useCallback, useContext, useEffect, useState} from "react";
import {useTranslation} from "next-i18next";
import {ForgeViewerContext} from "@/context/ForgeViewerContext";

// import ToolItem from "@/components/Tool/ToolList/ToolItem";
import ToolItemRightSidebar from "@/components/Tool/ToolRightSidebar/ToolItemRightSidebar";

import {changeTool} from "@/ForgeViewer/CustomTool";
import DoorExitList from "@/components/ToolHandle/ManualCallPointTool/DoorExitListTool/DoorExitList";
import {ImExit} from "react-icons/im";
import {useAppDispatch, useAppSelector} from "@/hooks";
import {selectTool, updateRoomDoorData} from "@/store/slices/tool/tool.slice";
import {DoorDataModel, ExitPointDataModel, RoomDataModel} from "@/models";
import {convertPointLayerToModel, convertPointModelToLayer} from "@/ForgeViewer/CustomTool/Point";
import Cookies from "js-cookie";
import {errorToast} from "@/helpers/Toast";
import {deleteAllDoorExitShape} from "@/ForgeViewer/CustomTool/Edit2D";
import {HubConnectionContext} from "@/context/HubConnectionContext";
import {v4 as uuid} from "uuid";
import SubToolRightSidebar from "@/components/Tool/ToolRightSidebar/SubToolSidebar";
import { useActiveGroupToolsOnViewer } from "@/hooks/useActiveGroupToolsOnViewer";

const toolName = ToolName.EMERGENCY_EXIT_LIST;

const groupToolNames = [
    toolName,
    ToolName.MARK_EMERGENCY_EXIT,
]

const DoorExitListTool : React.FC<DoorExitListToolProps> = ({isFirst}) => {
    const {t} = useTranslation(['common', 'config', 'tool']);

    const {activeTool, setActiveTool, isActiveCurrentTool} = useActiveGroupToolsOnViewer({groupToolNames})

    const dispatch = useAppDispatch()

    const {connected, hubConnection} = useContext(HubConnectionContext)
    const {currentFile} = useAppSelector(selectTool)

    const [dataDoor, setDataDoor] = useState<DoorDataModel[]>([])

    const data = {
        keyName: toolName,
        icon: <ImExit />,
        name: t('emergency_exit_list', {ns: 'tool'}),
    }

    useEffect(() => {
        const isDifferentGroupTool = !groupToolNames.includes(activeTool)
        if (isDifferentGroupTool) {
            deleteAllDoorExitShape();
        }
    }, [activeTool])

    useEffect(() => {
        const newData = [...(currentFile?.fileData?.doors ?? [])];
        if (JSON.stringify(newData) !== JSON.stringify(dataDoor)) {
            setDataDoor(newData)
        }
        return () => {
            setDataDoor([])
        }
    }, [currentFile?.fileData?.doors])

    const onHandleOnClick = useCallback((event?: any) => {
        if (activeTool === toolName) {
            changeTool(ToolName.MANUAL_CALL_POINT_TOOL)
            setActiveTool(ToolName.MANUAL_CALL_POINT_TOOL)
        } else {
            changeTool(toolName, onCallbackMoveDoor)
            setActiveTool(toolName)
        }
    }, [activeTool, setActiveTool])

    useEffect(() => {
        window.removeEventListener("endMoveDoor", onCallbackMoveDoor)
        window.addEventListener(
            "endMoveDoor",
            onCallbackMoveDoor,
            { passive: true }
        );
        return () => {
            window.removeEventListener("endMoveDoor", onCallbackMoveDoor)
        }
    }, [dataDoor])

    const onCallbackMoveDoor = (payload: any) => {

        const poly = payload.detail;
        if (!poly || poly.type !== PolygonType.DOOR_EXIT) return;
        const currentDoors = [...dataDoor]

        const checkExist = currentDoors.find((d: DoorDataModel) => d.doorId === poly.name);
        if (checkExist) {
            const indexDoorArr = currentDoors.findIndex(d => d.doorId === checkExist.doorId);

            const newStartPoint = {...poly._loops[0][0]};
            const newEndPoint = {...poly._loops[0][1]};

            const newStartPointModel = convertPointLayerToModel(newStartPoint)
            const newEndPointModel = convertPointLayerToModel(newEndPoint)

            const newData = {
                ...checkExist,
                start_layer: newStartPoint,
                end_layer: newEndPoint,
                start: newStartPointModel,
                end: newEndPointModel,
            }

            currentDoors[indexDoorArr] = newData;
            // dispatch(updateDoor(newData))

            if (connected && hubConnection && hubConnection.state === 'Connected') {
                const data = {
                    dataRoom: currentFile?.fileData?.rooms ?? [],
                    dataDoor: currentDoors,
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
                            const doors = data.doors.map((door: DoorDataModel) => {
                                const currentDoor = currentDoors?.find(cD => cD.doorId === door.doorId);
                                let isShow = door.isShow;
                                if (currentDoor) {
                                    isShow = currentDoor.isShow;
                                }
                                const d = {
                                    ...door,
                                    name: door.isExist ? door.name : undefined,
                                    start_layer: convertPointModelToLayer(door.start),
                                    end_layer: convertPointModelToLayer(door.end),
                                    mid_layer: convertPointModelToLayer(door.mid),
                                    isShow: isShow
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
                        } else {
                            errorToast(t('error_edit_door_exit', {ns: 'tool'}))
                        }
                    })
                    .catch((err) =>errorToast(t('error_edit_door_exit', {ns: 'tool'})))
            }
        }
    }

    if (isFirst) {
        return null;
    }
    return (
        <>
            <ToolItemRightSidebar selected={isActiveCurrentTool} data={data} onClick={onHandleOnClick}>
                <SubToolRightSidebar selected={isActiveCurrentTool} title={data.name}>
                    <DoorExitList activeCurrentTool={isActiveCurrentTool} />
                </SubToolRightSidebar>
            </ToolItemRightSidebar>
        </>
    )
};

export default DoorExitListTool;

interface DoorExitListToolProps {
    isFirst: boolean
}