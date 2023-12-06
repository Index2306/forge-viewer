import React, { useCallback, useContext, useEffect } from 'react'
import { ToolName } from '@/contants/tool'
import { BiEdit } from 'react-icons/bi'

import ToolItemRightSidebar from '@/components/Tool/ToolRightSidebar/ToolItemRightSidebar'

import { useTranslation } from 'next-i18next'
import { changeTool } from '@/ForgeViewer/CustomTool'
import {
    convertPointModelToLayer,
    getPolygonInformationFromBoundary,
} from '@/ForgeViewer/CustomTool/Point'
import { DoorDataModel, RoomDataModel } from '@/models'
import {
    addNewDeviceInfo,
    selectTool,
    setEditedRoom,
    updateRoomDoorData,
} from '@/store/slices/tool/tool.slice'
import { useAppDispatch, useAppSelector } from '@/hooks'
import { HubConnectionContext } from '@/context/HubConnectionContext'
import { turnOffSelectionInViewer } from '@/ForgeViewer/CustomTool/Edit2D/draw'
import Cookies from 'js-cookie'
import { errorToast } from '@/helpers/Toast'
import { useActiveGroupToolsOnViewer } from '@/hooks/useActiveGroupToolsOnViewer'

const toolName = ToolName.EDIT_ROOM

const groupToolNames = [
    toolName,
    ToolName.ROOM_TOOL,
]

const EditRoomTool: React.FC<EditRoomToolProps> = ({ isFirst }) => {
    const { t } = useTranslation(['common', 'config', 'tool'])

    const { activeTool, setActiveTool, isActiveCurrentTool } = useActiveGroupToolsOnViewer({
        groupToolNames,
    })

    const { currentFile } = useAppSelector(selectTool)
    const { connected, hubConnection } = useContext(HubConnectionContext)
    const dispatch = useAppDispatch()

    const data = {
        keyName: toolName,
        icon: <BiEdit />,
        name: t('edit_room', { ns: 'tool' }),
    }

    useEffect(() => {
        if (isActiveCurrentTool) {
            changeTool(toolName, onCallbackDragPolygon)
            setActiveTool(toolName)
        }
    }, [isActiveCurrentTool])

    useEffect(() => {
        if (!window?.edit2dUndoStack) {
            return
        }

        window?.edit2dUndoStack?.addEventListener(
            Autodesk.Edit2D.UndoStack.AFTER_ACTION,
            onCallbackMoveEdgeOrVertexOfPolygon,
        )
        return () => {
            window?.edit2dUndoStack.removeEventListener(
                Autodesk.Edit2D.UndoStack.AFTER_ACTION,
                onCallbackMoveEdgeOrVertexOfPolygon,
            )
        }
    }, [])

    // Callback activate when user use mouse to move edge or vertex of polygon (room)
    const onCallbackMoveEdgeOrVertexOfPolygon = useCallback(
        (event: any) => {

            const polyOnViewer = { ...event?.action?.poly }

            if (polyOnViewer?.type === 'room') {
                // ----------------------------------------------------------------------------------
                const effectAsync = (): Promise<void> =>
                    new Promise((resolve, reject) => {
                        const roomList = [...(currentFile?.fileData?.rooms ?? [])]
                        const oldRoom = roomList.find((r) => r.roomId === polyOnViewer.name)
                        if (oldRoom) {
                            const oldIndex = roomList.findIndex((r) => r.roomId === oldRoom.roomId)
                            const {
                                boundary_layer,
                                boundary,
                                centroid_layer,
                                centroid,
                                lengthModel,
                                widthModel,
                            } = getPolygonInformationFromBoundary(polyOnViewer._loops[0])

                            const newRoom: RoomDataModel = {
                                ...oldRoom,
                                width: widthModel,
                                length: lengthModel,
                                boundary,
                                boundary_layer,
                                centroid,
                                centroid_layer,
                                isShow: true,
                            }

                            dispatch(setEditedRoom(JSON.parse(JSON.stringify(newRoom))))

                            if (connected && hubConnection && hubConnection.state === 'Connected') {
                                const dataRequest = {
                                    dataRoom: [
                                        ...roomList.filter((r) => r.roomId !== newRoom.roomId),
                                        newRoom,
                                    ],
                                    dataDoor: currentFile?.fileData?.doors,
                                    unit: currentFile?.fileData?.units,
                                }
                                const request = {
                                    data: dataRequest,
                                    type: 3,
                                }
                                hubConnection
                                    .invoke('addNewRoom', request, Cookies.get('app_locale'))
                                    .then((response) => {
                                        if (response.isSuccess) {
                                            const data = response.data
                                            const newDevice = data.device
                                            let rooms = data.rooms.map((room: RoomDataModel) => {
                                                return {
                                                    ...room,
                                                    boundary_layer: room.boundary.map((p) =>
                                                        convertPointModelToLayer(p),
                                                    ),
                                                    centroid_layer: convertPointModelToLayer(
                                                        room.centroid,
                                                    ),
                                                    devices: room.devices.map((d) => {
                                                        return {
                                                            ...d,
                                                            position_layer:
                                                                convertPointModelToLayer(
                                                                    d.position,
                                                                ),
                                                        }
                                                    }),
                                                }
                                            })
                                            const doors = data.doors.map((door: DoorDataModel) => {
                                                return {
                                                    ...door,
                                                    name: door.isExist ? door.name : undefined,
                                                    start_layer: convertPointModelToLayer(
                                                        door.start,
                                                    ),
                                                    end_layer: convertPointModelToLayer(door.end),
                                                    mid_layer: convertPointModelToLayer(door.mid),
                                                }
                                            })

                                            // Update room location outside with new room location in list
                                            const outside = rooms.find(
                                                (r: RoomDataModel) =>
                                                    r.id === 'outside' || r.roomId === 'outside',
                                            )
                                            if (outside) {
                                                rooms = [
                                                    ...rooms.filter(
                                                        (r: RoomDataModel) =>
                                                            r.id !== 'outside' &&
                                                            r.roomId !== 'outside',
                                                    ),
                                                    outside,
                                                ]
                                                const newRoomReplace = rooms.find(
                                                    (r: RoomDataModel) =>
                                                        r.roomId === newRoom.roomId,
                                                )
                                                if (newRoomReplace) {
                                                    rooms = rooms.filter(
                                                        (r: RoomDataModel) =>
                                                            r.roomId !== newRoomReplace.roomId,
                                                    )
                                                    rooms.splice(oldIndex, 0, newRoomReplace)
                                                }
                                            }

                                            dispatch(
                                                addNewDeviceInfo({ unique: true, data: newDevice }),
                                            )
                                            dispatch(updateRoomDoorData({ rooms, doors }))
                                        } else {
                                            errorToast(t('error_edit_room', { ns: 'tool' }))
                                        }
                                    })
                                    .catch((err) => {
                                        errorToast(t('error_edit_room', { ns: 'tool' }))
                                        reject(t('error_edit_room', { ns: 'tool' }))
                                    })
                            }
                        }
                        resolve()
                    })

                // ----------------------------------------------------------------------------------
                effectAsync()
            }
        },
        [currentFile, connected, hubConnection],
    )

    // Callback activate when user use mouse to drag polygon (room)
    const onCallbackDragPolygon = useCallback(
        (poly: any) => {
            const polyOnViewer = { ...poly }

            // --------------------------------------------------------------------------------
            const effectAsync = (): Promise<void> =>
                new Promise((resolve, reject) => {
                    const roomList = [...(currentFile?.fileData?.rooms ?? [])]
                    const oldRoom = roomList.find((r) => r.roomId === polyOnViewer.name)
                    if (oldRoom) {
                        const oldIndex = roomList.findIndex((r) => r.roomId === oldRoom.roomId)
                        const {
                            boundary_layer,
                            boundary,
                            centroid_layer,
                            centroid,
                            lengthModel,
                            widthModel,
                        } = getPolygonInformationFromBoundary(polyOnViewer._loops[0])

                        const newRoom: RoomDataModel = {
                            ...oldRoom,
                            width: widthModel,
                            length: lengthModel,
                            boundary,
                            boundary_layer,
                            centroid,
                            centroid_layer,
                            isShow: true,
                        }

                        // --------------------------------------------- DISPATCH
                        dispatch(setEditedRoom(JSON.parse(JSON.stringify(newRoom))))

                        if (connected && hubConnection && hubConnection.state === 'Connected') {
                            const dataRequest = {
                                dataRoom: [
                                    ...roomList.filter((r) => r.roomId !== newRoom.roomId),
                                    newRoom,
                                ],
                                dataDoor: currentFile?.fileData?.doors,
                                unit: currentFile?.fileData?.units,
                            }
                            const request = {
                                data: dataRequest,
                                type: 3,
                            }
                            hubConnection
                                .invoke('addNewRoom', request, Cookies.get('app_locale'))
                                .then((response) => {
                                    if (response.isSuccess) {
                                        const data = response.data
                                        const newDevice = data.device
                                        let rooms = data.rooms.map((room: RoomDataModel) => {
                                            return {
                                                ...room,
                                                boundary_layer: room.boundary.map((p) =>
                                                    convertPointModelToLayer(p),
                                                ),
                                                centroid_layer: convertPointModelToLayer(
                                                    room.centroid,
                                                ),
                                                devices: room.devices.map((d) => {
                                                    return {
                                                        ...d,
                                                        position_layer: convertPointModelToLayer(
                                                            d.position,
                                                        ),
                                                    }
                                                }),
                                            }
                                        })
                                        const doors = data.doors.map((door: DoorDataModel) => {
                                            return {
                                                ...door,
                                                name: door.isExist ? door.name : undefined,
                                                start_layer: convertPointModelToLayer(door.start),
                                                end_layer: convertPointModelToLayer(door.end),
                                                mid_layer: convertPointModelToLayer(door.mid),
                                            }
                                        })

                                        // Update room location outside with new room location in list
                                        const outside = rooms.find(
                                            (r: RoomDataModel) =>
                                                r.id === 'outside' || r.roomId === 'outside',
                                        )
                                        if (outside) {
                                            rooms = [
                                                ...rooms.filter(
                                                    (r: RoomDataModel) =>
                                                        r.id !== 'outside' &&
                                                        r.roomId !== 'outside',
                                                ),
                                                outside,
                                            ]
                                            const newRoomReplace = rooms.find(
                                                (r: RoomDataModel) => r.roomId === newRoom.roomId,
                                            )
                                            if (newRoomReplace) {
                                                rooms = rooms.filter(
                                                    (r: RoomDataModel) =>
                                                        r.roomId !== newRoomReplace.roomId,
                                                )
                                                rooms.splice(oldIndex, 0, newRoomReplace)
                                            }
                                        }

                                        // --------------------------------------------- DISPATCH
                                        dispatch(
                                            addNewDeviceInfo({ unique: true, data: newDevice }),
                                        )

                                        // --------------------------------------------- DISPATCH
                                        dispatch(updateRoomDoorData({ rooms, doors }))
                                    } else {
                                        errorToast(t('error_edit_room', { ns: 'tool' }))
                                    }
                                })
                                .catch((err) => {
                                    errorToast(t('error_edit_room', { ns: 'tool' }))
                                    reject(t('error_edit_room', { ns: 'tool' }))
                                })
                        }
                    }
                    resolve()
                })

            // --------------------------------------------------------------------------------
            effectAsync()
        },
        [currentFile, connected, hubConnection],
    )

    // Should Disable tool when user click to back button
    // useEffect(() => {
    //     if (activeTool && activeTool !== toolName) {
    //         turnOffSelectionInViewer()
    //         // onListenUndoStackAfterAction(onCallbackMoveEdgeOrVertexOfPolygon, false)
    //     }
    // }, [activeTool])

    // Should Activate or Disable tool when user click to other tool or back button
    const onHandleOnClick = useCallback(
        (event?: any) => {
            // ----------------------------- Note --------------------------------
            // Should only activate this tool when has at least one room is shown
            // -------------------------------------------------------------------
            if (!currentFile?.fileData?.hasAtLeastOneRoomIsShown) {
                return
            } else if (activeTool === toolName) {
                changeTool(ToolName.ROOM_TOOL)
                setActiveTool(ToolName.ROOM_TOOL)
                turnOffSelectionInViewer()
                // onListenUndoStackAfterAction(onCallbackMoveEdgeOrVertexOfPolygon, false)
            } else {
                changeTool(toolName, onCallbackDragPolygon)
                setActiveTool(toolName)
                turnOffSelectionInViewer()
                // onListenUndoStackAfterAction(onCallbackMoveEdgeOrVertexOfPolygon, true)
            }
        },
        [activeTool, setActiveTool],
    )

    // Get the latest data of roomList from HubConnection, and update Store
    // useEffect(() => {
    //     if (connected && hubConnection) {
    //         hubConnection.on('addNewRoom', (response) => {
    //             if (response.isSuccess) {
    //                 const parseData = response.data.room
    //                 const newRoom: RoomDataModel = {
    //                     ...parseData,
    //                     devices: parseData.devices.map((dev: any) => {
    //                         const newDeviceRoom: DeviceRoomModel = {
    //                             ...dev,
    //                             position: dev.position,
    //                             position_layer: convertPointModelToLayer(dev.position),
    //                         }
    //                         return newDeviceRoom
    //                     }),
    //                 }
    //
    //                 dispatch(addNewDeviceInfo({ unique: true, data: response.data.device }))
    //                 dispatch(updateDataRoom({ id: newRoom.roomId, data: newRoom }))
    //             } else {
    //                 console.error(response?.data)
    //             }
    //         })
    //     }
    // }, [connected])

    if (isFirst) {
        return null
    }
    return (
        <>
            <ToolItemRightSidebar
                selected={activeTool === toolName}
                data={data}
                onClick={onHandleOnClick}
            />
        </>
    )
}

export default React.memo(EditRoomTool)

export interface EditRoomToolProps {
    isFirst: boolean
}
