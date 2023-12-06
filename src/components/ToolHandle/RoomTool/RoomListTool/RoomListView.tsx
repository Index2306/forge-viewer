import React, { useContext, useEffect, useState } from 'react'
import RoomCardItem from './RoomCardItem'
import { useTranslation } from 'next-i18next'
import { DoorDataModel, ExitPointDataModel, LayerItemModel, RoomDataModel } from '@/models'
import { useAppDispatch, useAppSelector } from '@/hooks'
import {
    removeRoom,
    selectTool,
    setEditedRoom,
    setHasAtLeastOneRoomIsShown,
    updateRoomDoorData,
} from '@/store/slices/tool/tool.slice'
import {
    drawRoom,
    drawRoomList,
    turnOffSelectionInViewer,
} from '@/ForgeViewer/CustomTool/Edit2D/draw'
import { LayerKey, LayerStatus, ToolName } from '@/contants/tool'
import Cookies from 'js-cookie'
import { convertPointModelToLayer } from '@/ForgeViewer/CustomTool/Point'
import { HubConnectionContext } from '@/context/HubConnectionContext'
import { v4 as uuid } from 'uuid'

import { useActiveGroupToolsOnViewer } from '@/hooks/useActiveGroupToolsOnViewer'
import { selectLayer } from '@/store/slices/tool/layer.slice'
import RoomSettingModal from '@/components/RoomSetting/RoomSettingModal'

const toolName = ToolName.ROOM_LIST

const groupToolNames = [
    toolName,
    ToolName.ROOM_TOOL,
    ToolName.EDIT_ROOM,
    ToolName.DRAWING_ROOM,
    // -------------------------------------------------------------------------
    // ToolName.CHOOSE,
    // ToolName.DETECTOR_TOOL,
    // -------------------------------------------------------------------------
]

const RoomListView: React.FC<RoomListViewProps> = ({ onRoomListChange, roomsFromParent }) => {
    const { t } = useTranslation(['tool'])

    const [roomList, setRoomList] = useState<RoomDataModel[]>(
        roomsFromParent ? roomsFromParent : [],
    )
    const [indeterminate, setIndeterminate] = useState(false)
    const [checkAll, setCheckAll] = useState(false)
    const [selectedRoom, setSelectedRoom] = useState<RoomDataModel | undefined>(undefined)

    const [openModal, setOpenModal] = useState<{ type: string; isOpen: boolean; keyId: string }>({
        type: '',
        isOpen: false,
        keyId: '',
    })

    const { activeTool, isActiveCurrentTool } = useActiveGroupToolsOnViewer({ groupToolNames })

    const { connected, hubConnection } = useContext(HubConnectionContext)

    const { currentFile } = useAppSelector(selectTool)
    const { isLayerToolActive, layerList } = useAppSelector(selectLayer)

    const dispatch = useAppDispatch()

    // Support for activating Edit Room Tool
    useEffect(() => {
        const effectAsync = async (): Promise<void> =>
            new Promise((resolve) => {
                if (roomList && roomList.length < 1) return
                const isAtLeastOneRoomShown = roomList.some((r) => r.isShow)
                dispatch(setHasAtLeastOneRoomIsShown(isAtLeastOneRoomShown))

                resolve()
            })

        effectAsync()
    }, [roomList])

    useEffect(() => {
        if (!isActiveCurrentTool) {
             drawRoomList(roomList, false)
        }
    }, [isActiveCurrentTool, layerList])

    useEffect(() => {
        if (!currentFile?.fileData?.rooms) return

        // Get roomList data for the first time
        if (roomList.length === 0) {
            setRoomList((_) => {
                const rooms = currentFile?.fileData?.rooms as RoomDataModel[]
                return [...rooms]
                    .filter((r) => r.id !== 'outside')
                    .map((r) => ({ ...r, isShow: true }))
            })
            return
            // If a selected room is edited on viewer (resize room by mouse), change roomList
        } else if (currentFile?.fileData?.editedRoom) {
            const editedRoom = currentFile?.fileData?.editedRoom

            setRoomList((prev) => {
                let indexTarget = prev.findIndex((r) => r.roomId === editedRoom.roomId)
                const oldRoom =  prev[indexTarget];
                let isShow = editedRoom.isShow;
                if (oldRoom.isShow) {
                    isShow = true;
                }

                prev[indexTarget] = { ...editedRoom, isShow }
                return prev
            })
            return
            // Otherwise, change roomList (like delete room(s)...)
        } else {
            setRoomList((prev) => {
                const rooms = currentFile?.fileData?.rooms as RoomDataModel[]
                const newRoomList= rooms
                    ?.filter((r) => r.id !== 'outside')
                    ?.map((room) => {
                        const oldRoom = prev.find((r) => r.roomId === room.roomId)

                        let isShow = room.isShow;
                        if (oldRoom && oldRoom.isShow) {
                            isShow = true;
                        }

                        if (oldRoom) {
                            return {
                                ...oldRoom,
                                isShow
                            }
                        }
                        return {
                            ...room,
                            isShow
                        }
                    })
                return newRoomList
            })
            return
        }
    }, [currentFile?.fileData?.editedRoom, currentFile?.fileData?.rooms])

    // Important!
    // Observe editedRoom state in store and clear it
    useEffect(() => {
        if (currentFile?.fileData?.editedRoom) {
            dispatch(setEditedRoom(null))
        }
    }, [currentFile?.fileData?.editedRoom])

    useEffect(() => {
        // Make Async handle
        const effectAsync = async (): Promise<void> =>
            new Promise((resolve) => {
                const lengthChecked = roomList.filter((r) => r.isShow === true).length
                if (lengthChecked > 0) {
                    if (lengthChecked === roomList.length) {
                        setCheckAll(true)
                        setIndeterminate(false)
                    } else {
                        setCheckAll(false)
                        setIndeterminate(true)
                    }
                } else {
                    setIndeterminate(false)
                }

                resolve()
            })

        // Call Async handle
        effectAsync()

        return () => {
            setIndeterminate(false)
            setCheckAll(false)
        }
    }, [roomList])

    const handleChangeCheckedItemAsync = (
        isCheck: boolean,
        id: string,
        roomInfo?: RoomDataModel,
    ): Promise<void> => {
        // if (id === 'all') {
        //     setSelectedRoom(undefined)
        // }

        // if (roomInfo) {
        //     const room: RoomDataModel = { ...roomInfo, isShow: isCheck }
        //     setSelectedRoom(room)
        // }

        return new Promise(async (resolve, reject) => {
            if (id === 'all') {
                setSelectedRoom(undefined)

                setRoomList((prev) =>
                    [...prev].map((room) => ({ ...room, isShow: isCheck })),
                )
                setIndeterminate(false)
                setCheckAll(isCheck)

            } else {
                if (roomInfo) {
                    const room: RoomDataModel = { ...roomInfo, isShow: isCheck }
                    setSelectedRoom(room)
                }

                setRoomList(
                    (prev) =>
                    [...prev].map((room) => {
                        if (id === room.roomId) {
                            return { ...room, isShow: isCheck }
                        }
                        return room
                    }),
                )

            }

            resolve()
        })
    }

    const handleRemoveRoomItemAsync = async (roomId: string): Promise<void> => {
        return new Promise(async (resolve, reject) => {
            // Un-draw this room first
            turnOffSelectionInViewer()
            drawRoom(roomId, undefined, [], false)

            // update current room list
            setRoomList((prev) => {
                const remainedRooms = prev.filter((room) => room.roomId !== roomId)
                return [...remainedRooms]
            })

            // update rooms data in store
            dispatch(removeRoom(roomId))

            // Update door exit and manual call point
            if (connected && hubConnection && hubConnection.state === 'Connected') {
                const currentDoors = [...(currentFile?.fileData?.doors ?? [])]
                const data = {
                    dataRoom: [...roomList.filter((r) => r.roomId !== roomId)],
                    dataDoor: currentDoors,
                    unit: currentFile?.fileData?.units,
                }
                const request = {
                    data,
                    type: 3,
                }
                await hubConnection
                    .invoke('algorithmSupport', request, Cookies.get('app_locale'))
                    .then((response) => {
                        if (response.isSuccess) {
                            const data = response.data

                            const rooms = data.rooms.map((room: RoomDataModel) => {
                                return {
                                    ...room,
                                    boundary_layer: room.boundary.map((p) =>
                                        convertPointModelToLayer(p),
                                    ),
                                    centroid_layer: convertPointModelToLayer(room.centroid),
                                }
                            })

                            const doors = data.doors.map((door: DoorDataModel) => {
                                const currentDoor = currentDoors?.find(
                                    (cD) => cD.doorId === door.doorId,
                                )
                                let isShow = door.isShow
                                if (currentDoor) {
                                    isShow = currentDoor.isShow
                                }
                                const d = {
                                    ...door,
                                    name: door.isExist ? door.name : undefined,
                                    start_layer: convertPointModelToLayer(door.start),
                                    end_layer: convertPointModelToLayer(door.end),
                                    mid_layer: convertPointModelToLayer(door.mid),
                                    isShow: isShow,
                                }
                                return d
                            })

                            // Update the list of locations for "manual call point" signs
                            const newExitPointArray = [
                                ...(currentFile?.fileData?.exitPoints ?? []),
                            ].filter((ep: ExitPointDataModel) => ep.isManual)

                            data.exitPoints.map((point: any) => {
                                const existManual = newExitPointArray.find(
                                    (ep: ExitPointDataModel) =>
                                        ep.position_origin.x === point.x &&
                                        ep.position_origin.y === point.y,
                                )
                                if (!existManual) {
                                    const newExitPoint: ExitPointDataModel = {
                                        id: uuid(),
                                        isManual: false,
                                        position: point,
                                        position_origin: point,
                                        position_layer: convertPointModelToLayer(point),
                                    }
                                    newExitPointArray.push(newExitPoint)
                                }
                            })

                            dispatch(
                                updateRoomDoorData({ rooms, doors, exitPoints: newExitPointArray }),
                            )

                            resolve()
                        } else {
                            reject('Hub Connection Error: can not invoke algorithmSupport')
                        }
                    })
            }
        })
    }

    // ------------------------------------------------------------------------------------

    useEffect(() => {
        if (!window?.NOP_VIEWER) return
        if (!window?.edit2d) return

        /**
         * Handle draw room with selected id on viewer
         */
        const onHandleToggleRoomOnViewer = async (rooms: RoomDataModel[]) => {
            rooms.forEach((r) => {
                if (r.isShow) {
                    drawRoom(r.roomId, r.name, r.boundary_layer, true)
                } else {
                    drawRoom(r.roomId, undefined, [], false)
                }
            })
        }
        /**
         * Handle un-draw room with selected id on viewer
         */
        const onHandleUndrawRoomOnViewer = async (rooms: RoomDataModel[]) => {
            rooms.forEach((r) => {
                drawRoom(r.roomId, undefined, [], false)
            })
        }

        const isCurrentLayerItemActive = (layers: LayerItemModel[]) => {
            return (layerKey: string, layerStatus: number): boolean => {
                const currentLayer = layers.find(
                    (layer) => layer.key === layerKey && layer.status === layerStatus,
                )
                return Boolean(currentLayer)
            }
        }

        if (!isLayerToolActive) return

        const isActive = isCurrentLayerItemActive(layerList)(LayerKey.ROOMS, LayerStatus.OPEN)

        if (!isActive) {
            onHandleUndrawRoomOnViewer(roomList)
            setSelectedRoom(undefined)
            return
        }

        //
        // This code below helper increase performance when toggle only selected room
        if (selectedRoom) {
            if (selectedRoom.isShow) {
                drawRoom(selectedRoom.roomId, selectedRoom.name, selectedRoom.boundary_layer, true)
            } else {
                drawRoom(selectedRoom.roomId, undefined, [], false)
            }
        } else {
            //
            // This code apply toggle for all rooms
            onHandleToggleRoomOnViewer(roomList)
        }

        if (onRoomListChange) {
            onRoomListChange(roomList)
        }

        // when component is un-mount
        return () => {
            // onHandleUndrawRoomOnViewer(roomList)
            setSelectedRoom(undefined)
        }
    }, [selectedRoom, onRoomListChange, isLayerToolActive, layerList, roomList])
    // ------------------------------------------------------------------------------------

    // test

    if (!isActiveCurrentTool) return null
    return (
        <div>
            {/* ---------------------------------------------------- RoomCardItem Show All */}
            <RoomCardItem
                key='all'
                id='all'
                name={`${t('show_all', { ns: 'tool' })}`}
                onChangeView={async (status, id) => await handleChangeCheckedItemAsync(status, id)}
                indeterminate={indeterminate}
                isShow={checkAll}
            />

            {/* ---------------------------------------------------- RoomCardItem elements */}

            {roomList.map((room: RoomDataModel, index: number) => (
                <RoomCardItem
                    key={'RoomCardItem' + index}
                    id={room.roomId}
                    name={room.name}
                    onChangeView={async (status, id, roomInfo) =>
                        await handleChangeCheckedItemAsync(status, id, roomInfo)
                    }
                    isShow={room.isShow}
                    onRemoveRoomItem={async (roomId) => await handleRemoveRoomItemAsync(roomId)}
                    onToggleModal={setOpenModal}
                    roomInfo={room}
                />
            ))}

            {/* ---------------------------------------------------- RoomSettingForm */}

            {openModal.type == 'room-setting-modal' && openModal.isOpen === true && (
                <RoomSettingModal
                    isOpen={openModal.isOpen}
                    onCancel={() => setOpenModal({ type: '', isOpen: false, keyId: '' })}
                    id={openModal.keyId}
                />
            )}
        </div>
    )
}

export default RoomListView

interface RoomListViewProps {
    onRoomListChange?: (roomList: RoomDataModel[]) => void
    roomsFromParent?: RoomDataModel[]
}
