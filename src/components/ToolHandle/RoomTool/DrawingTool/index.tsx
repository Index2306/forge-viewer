import React, {useCallback, useContext, useEffect} from 'react';
import {ToolName} from "@/contants/tool";
import {useTranslation} from "next-i18next";
import {BiShapeSquare} from "react-icons/bi";

// import ToolItem from "@/components/Tool/ToolList/ToolItem";
import ToolItemRightSidebar from "@/components/Tool/ToolRightSidebar/ToolItemRightSidebar";

import {ForgeViewerContext} from "@/context/ForgeViewerContext";
import {changeTool} from "@/ForgeViewer/CustomTool";
import {useAppDispatch, useAppSelector} from "@/hooks";
import {
    addNewDeviceInfo,
    addNewRoom,
    selectTool,
    updateRoomDoorData
} from "@/store/slices/tool/tool.slice";
import {DoorDataModel, ExitPointDataModel, RoomDataModel} from "@/models";
import {v4 as uuid} from "uuid";
import {
    convertPointLayerToModel,
    convertPointModelToLayer,
    getDistancePoint,
    getPolyCentroid
} from "@/ForgeViewer/CustomTool/Point";
import {Box2, ShapeUtils} from "three";
import {HubConnectionContext} from "@/context/HubConnectionContext";
import {deleteShapeById} from "@/ForgeViewer/CustomTool/Edit2D";
import isClockWise = ShapeUtils.isClockWise;
import words from 'lodash/words';
import Cookies from "js-cookie";
import {errorToast} from "@/helpers/Toast";

const toolName = ToolName.DRAWING_ROOM;

const DrawingTool: React.FC<DrawingToolProps> = ({isFirst}) => {
    const {t} = useTranslation(['common', 'config', 'tool']);

    const dispatch = useAppDispatch()
    const {activeTool, setActiveTool} = useContext(ForgeViewerContext)
    const {currentFile} = useAppSelector(selectTool)
    const {connectionId, connected, hubConnection} = useContext(HubConnectionContext)

    const data = {
        keyName: toolName,
        icon: <BiShapeSquare/>,
        name: t('drawing_room', {ns: 'tool'})
    }

    const getRoomName = (roomList: RoomDataModel[]): string => {
        const ID = "ID"
        let target = ID + " "
        const getRoomNumberSuffix = (name?: string) => {
            return words(name as string)[1]
        }
        const observer: number[] = []

        const roomLength = roomList.length - 1

        roomList.forEach(r => {
            const numbSuffix = Number(getRoomNumberSuffix(r.name))
            if (!Number.isNaN(numbSuffix)) {
                observer.push(Number(numbSuffix))
            }
        })
        let maxNumber = 0
        if (observer.length > 0) {
            maxNumber = Math.max(...observer)
            if (maxNumber < roomLength) {
                maxNumber = roomLength
            }
        } else {
            maxNumber = roomLength
        }
        target += String(maxNumber + 1)
        return target
    }

    const onCallbackFinishPolygon = (e: any) => {
        const poly = e.detail;
        if (!poly) return;
        new Promise(() => {
            const roomsList = [...(currentFile?.fileData?.rooms ?? [])]
            const roomId = uuid()
            const name = getRoomName(roomsList)

            const boundary_layer = poly._loops[0]

            const isClockwise = isClockWise(boundary_layer);
            if (!isClockwise) {
                boundary_layer.reverse()
            }

            const boundary = boundary_layer.map((point: any) => convertPointLayerToModel(point))

            const centroid_layer = getPolyCentroid(boundary_layer);
            const centroid = convertPointLayerToModel(centroid_layer);

            const box2 = new Box2().setFromPoints(boundary_layer);
            const max = box2.max;
            const min = box2.min;

            const lengthPoint = [{x: min.x, y: min.y, z: 0}, {x: min.x, y: max.y, z: 0}]
            const widthPoint = [{...min, z: 0}, {x: max.x, y: min.y, z: 0}]

            const lengthModel = getDistancePoint(convertPointLayerToModel(lengthPoint[0]), convertPointLayerToModel(lengthPoint[1]))
            const widthModel = getDistancePoint(convertPointLayerToModel(widthPoint[0]), convertPointLayerToModel(widthPoint[1]));

            const newRoom: RoomDataModel = {
                id: roomId,
                roomId: roomId,
                name: name,
                info: {},
                height: 0,
                width: widthModel,
                length: lengthModel,
                devices: [],
                doorIds: [],
                boundary: boundary,
                boundary_layer,
                centroid: centroid,
                centroid_layer,
                isShow: true
            }

            if (connected && hubConnection && hubConnection.state === 'Connected') {
                const data = {
                    dataRoom: [...roomsList, newRoom],
                    dataDoor: currentFile?.fileData?.doors,
                    unit: currentFile?.fileData?.units
                }
                const request = {
                    data,
                    type: 3
                }
                hubConnection.invoke('addNewRoom', request, Cookies.get('app_locale'))
                    .then((response) => {
                        if (response.isSuccess) {
                            const data = response.data;
                            const newDevice = data.device;
                            let rooms = data.rooms.map((room: RoomDataModel) => {
                                return {
                                    ...room,
                                    boundary_layer: room.boundary.map(p => convertPointModelToLayer(p)),
                                    centroid_layer: convertPointModelToLayer(room.centroid),
                                    devices: room.devices.map((d) => {
                                        return {
                                            ...d,
                                            position_layer: convertPointModelToLayer(d.position)
                                        }
                                    })
                                }
                            });
                            const doors = data.doors.map((door: DoorDataModel) => {
                                return {
                                    ...door,
                                    name: door.isExist ? door.name : undefined,
                                    start_layer: convertPointModelToLayer(door.start),
                                    end_layer: convertPointModelToLayer(door.end),
                                    mid_layer: convertPointModelToLayer(door.mid),
                                }
                            });
                            const outside = rooms.find((r: RoomDataModel) => r.id === 'outside' || r.roomId === 'outside');
                            if (outside) {
                                rooms = [...rooms.filter((r: RoomDataModel) => r.id !== 'outside' && r.roomId !== 'outside'), outside];
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


                            dispatch(addNewDeviceInfo(newDevice))
                            dispatch(updateRoomDoorData({rooms, doors, newExitPointArray}));

                        } else {
                            errorToast(t('error_mark_room', {ns: 'tool'}))
                        }
                    })
                    .catch((err) => errorToast(t('error_mark_room', {ns: 'tool'})))
                    .finally(() => deleteShapeById([poly.id]))
            }
        })
    }

    useEffect(() => {
        window.addEventListener(
            "endDrawRoom",
            onCallbackFinishPolygon,
            false,
        );

        return () => {
            window.removeEventListener("endDrawRoom", onCallbackFinishPolygon)
        }
    }, [currentFile?.fileData?.rooms])

    const onHandleOnClick = useCallback((event?: any) => {
        if (activeTool === toolName) {
            changeTool(ToolName.ROOM_TOOL)
            setActiveTool(ToolName.ROOM_TOOL)
        } else {
            changeTool(toolName, onCallbackFinishPolygon)
            setActiveTool(toolName)
        }
    }, [activeTool, onCallbackFinishPolygon, setActiveTool])

    if (isFirst) {
        return null;
    }
    return (
        <>
            <ToolItemRightSidebar selected={activeTool === toolName} data={data} onClick={onHandleOnClick}/>
        </>
    );
};

export default React.memo(DrawingTool);

export interface DrawingToolProps {
    isFirst: boolean
}