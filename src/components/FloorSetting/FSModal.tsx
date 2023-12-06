import React, { useEffect, useMemo, useState } from 'react'
import ModalDraggable from '../ModalDraggable'
import { useAppDispatch, useAppSelector } from '@/hooks'
import { addFloorSetting, selectTool } from '@/store/slices/tool/tool.slice'
import { useTranslation } from 'next-i18next'
import { Button, Col, Row } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { NewFieldType } from '@/models'
import { FloorSettingItem } from './FSItem'
import FloorSettingNewFields from './FSNewFields'
import { DataItemType, FloorSettingDataType, RoomDataModalCustom } from './types'
import { toggleRoomWithColor } from '@/ForgeViewer/CustomTool/Edit2D/draw'
import { RgbColor } from 'react-colorful'
import { selectLayer } from '@/store/slices/tool/layer.slice'
import { LayerKey } from '@/contants/tool'
import { ALARM_AREAS, FIRE_COMPARTMENTS, observeAndTransformRoomListData } from './share'

const CustomTitle: React.FC<{
    haveTitleIcon: boolean
    setHaveTitleIcon: React.Dispatch<React.SetStateAction<boolean>>
    titleName: string
    onSelectedTitle: (name: string) => void
}> = ({ haveTitleIcon, setHaveTitleIcon, titleName, onSelectedTitle }) => {
    const { t } = useTranslation(['tool'])
    return (
        <Row
            justify='start'
            align='middle'
            gutter={[4, 4]}
            wrap={false}
            style={{ width: '100%', marginLeft: '4px' }}
        >
            <Col>
                {haveTitleIcon ? (
                    <Button
                        icon={<PlusOutlined key='0' style={{ fontSize: '18px' }} />}
                        style={{ border: 0, color: 'var(--primary-color)', borderRadius: '100%' }}
                        onClick={() => {
                            setHaveTitleIcon((prev) => !prev)
                            onSelectedTitle(titleName)
                        }}
                    ></Button>
                ) : null}
            </Col>
            <Col
                style={{
                    border: 0,
                    color: 'var(--primary-color)',
                    fontSize: '1.05rem',
                    fontWeight: 'Bold',
                    cursor: 'pointer',
                    userSelect: 'none',
                }}
                onClick={() => {
                    setHaveTitleIcon((prev) => !prev)
                    onSelectedTitle(titleName)
                }}
            >
                {t(titleName)}
            </Col>
        </Row>
    )
}

const RenderTitleFireCompartments: React.FC<{
    currentTitleName: string
    controlContentBaseTitleName: { name: string; haveContent: boolean }
    onSelectedTitle: (name: string, shouldShowContent: boolean) => void
}> = ({ controlContentBaseTitleName, currentTitleName, onSelectedTitle }) => {
    const [haveTitleIcon, setHaveTitleIcon] = useState<boolean>(true)

    useEffect(() => {
        if (controlContentBaseTitleName.name !== currentTitleName) {
            setHaveTitleIcon(true)
        }
    }, [controlContentBaseTitleName.name, currentTitleName])

    return (
        <div style={{ width: '200px'}}>
            <CustomTitle
                haveTitleIcon={haveTitleIcon}
                setHaveTitleIcon={setHaveTitleIcon}
                titleName={currentTitleName}
                onSelectedTitle={(name) => {
                    onSelectedTitle(name, haveTitleIcon)
                }}
            />
        </div>
    )
}

const RenderTitleAlarmArea: React.FC<{
    currentTitleName: string
    controlContentBaseTitleName: { name: string; haveContent: boolean }
    onSelectedTitle: (name: string, shouldShowContent: boolean) => void
}> = ({ controlContentBaseTitleName, currentTitleName, onSelectedTitle }) => {
    const [haveTitleIcon, setHaveTitleIcon] = useState<boolean>(true)

    useEffect(() => {
        if (controlContentBaseTitleName.name !== currentTitleName) {
            setHaveTitleIcon(true)
        }
    }, [controlContentBaseTitleName.name, currentTitleName])

    return (
        <div
            style={{
                color: '#eb5849',
                display: 'flex',
                justifyContent: 'flex-start',
                marginInline: '-6px',
                flexDirection: 'column',
            }}
        >
            <CustomTitle
                haveTitleIcon={haveTitleIcon}
                setHaveTitleIcon={setHaveTitleIcon}
                titleName={ALARM_AREAS}
                onSelectedTitle={(name) => {
                    onSelectedTitle(name, haveTitleIcon)
                }}
            ></CustomTitle>
        </div>
    )
}

export default function FloorSettingModal({ open, onCancel, onChangeFloorSettingData }: FloorSettingModalProps) {
    const [controlContentBaseTitleName, setControlContentBaseTitleName] = useState<{
        name: string
        haveContent: boolean
    }>({ name: '', haveContent: false })

    // ---------------------------------------------------------------

    const { currentFile } = useAppSelector(selectTool)
    const dispatch = useAppDispatch()

    // ---------------------------------------------------------------

    const [newFields, setNewFields] = useState<NewFieldType[]>(
        currentFile?.fileData?.floorSetting?.dynamicFields ?? [],
    )

    const [floorSettingData, setFloorSettingData] = useState<FloorSettingDataType>({
        fire_compartments: currentFile?.fileData?.floorSetting?.fire_compartments ?? null,
        alarm_areas: currentFile?.fileData?.floorSetting?.alarm_areas ?? null,
    })

    // ---------------------------------------------------------------

    // --- Data source: list of rooms ---
    const roomList: RoomDataModalCustom[] = useMemo(() => {
        if (!open) return []
        if (!currentFile?.fileData?.rooms) return []

        const roomListNotIncludeOutside = [...currentFile?.fileData?.rooms].filter(r => r.name !== 'Outside')
        return roomListNotIncludeOutside.map((r) => {
            return {
                ...r,
                width: Number(Number(r.width).toFixed(2)),
                length: Number(Number(r.length).toFixed(2)),
                isShow: false,
            }
        })
    }, [currentFile?.fileData?.rooms, open])

    // --- Set data to store ---
    useEffect(() => {
        let fireCompartments = floorSettingData?.fire_compartments
        let alarmAreas = floorSettingData?.alarm_areas

        onChangeFloorSettingData({ ...floorSettingData, fire_compartments: fireCompartments, alarm_areas: alarmAreas })
        const payload = {
            fire_compartments: fireCompartments,
            alarm_areas: alarmAreas,
            dynamicFields: newFields,
        }
        dispatch(addFloorSetting({ ...payload }))
    }, [newFields, floorSettingData, roomList])

    // --- Function ---

    const handleSelectedTitle = (name: string, shouldShowContent: boolean) => {
        setControlContentBaseTitleName((prev) => {
            return {
                ...prev,
                name: name,
                haveContent: shouldShowContent,
            }
        })
    }

    // --- Function ---

    const handleChangeFloorSettingItem = (body: DataItemType) => {
        switch (body.itemName) {
            case FIRE_COMPARTMENTS:
                setFloorSettingData((prev) => {
                    return {
                        ...prev,
                        fire_compartments: { ...body },
                    }
                })
                break
            case ALARM_AREAS:
                setFloorSettingData((prev) => {
                    return {
                        ...prev,
                        alarm_areas: { ...body },
                    }
                })
                break
            default:
                break
        }
    }

    // --- Control draw room on viewer ---

    const { isLayerToolActive, layerList } = useAppSelector(selectLayer)

    useEffect(() => {
        if (!roomList) {
            return
        }
        if (floorSettingData.fire_compartments === null || floorSettingData.alarm_areas === null) {
            return
        }

        const turnOnPaintingRoom = async (
            partName: string,
            rooms: RoomDataModalCustom[],
            rgbColor: RgbColor,
        ) => {
            rooms.forEach((r) => {
                const roomId = `${partName}` + r.roomId
                if (r.isShow) {
                    toggleRoomWithColor(true, roomId, r.name!, r.boundary_layer, rgbColor)
                } else {
                    toggleRoomWithColor(false, roomId, r.name!, r.boundary_layer, rgbColor)
                }
            })
        }

        const turnOffPaintingRoom = async (
            partName: string,
            rooms: RoomDataModalCustom[],
            rgbColor: RgbColor,
        ) => {
            rooms.forEach((r) => {
                const roomId = `${partName}` + r.roomId
                toggleRoomWithColor(false, roomId, r.name!, r.boundary_layer, rgbColor)
            })
        }

        const fireCompartments = observeAndTransformRoomListData(floorSettingData.fire_compartments, roomList)
        const alarmAreas = observeAndTransformRoomListData(floorSettingData.alarm_areas, roomList)

        const activeFireCompartmentsLayer = layerList.find(
            (layer: any) => layer.key === LayerKey.FIRE_COMPARTMENTS && layer.status === 1,
        )
        const activeAlarmAreasLayer = layerList.find(
            (layer: any) => layer.key === LayerKey.ALARM_AREAS && layer.status === 1,
        )

        if (activeFireCompartmentsLayer) {
            turnOnPaintingRoom(FIRE_COMPARTMENTS, fireCompartments.rooms, fireCompartments.color)
        } else {
            turnOffPaintingRoom(FIRE_COMPARTMENTS, fireCompartments.rooms, fireCompartments.color)
        }

        if (activeAlarmAreasLayer) {
            turnOnPaintingRoom(ALARM_AREAS, alarmAreas.rooms, alarmAreas.color)
        } else {
            turnOffPaintingRoom(ALARM_AREAS, alarmAreas.rooms, alarmAreas.color)
        }

        if (!open) {
            turnOffPaintingRoom(FIRE_COMPARTMENTS, fireCompartments.rooms, fireCompartments.color)
            turnOffPaintingRoom(ALARM_AREAS, alarmAreas.rooms, alarmAreas.color)
        }
    }, [floorSettingData, isLayerToolActive, layerList, open, roomList])

    // --- Render Divider ---

    const Divider = (otherStyle?: any) => {
        const customStyle = {
            ...otherStyle,
            width: '96.0%',
            borderBottom: '1px solid #c6c6c5',
            zIndex: 1,
            display: 'block',
            marginTop: '12px',
        }
        return <div style={...customStyle}></div>
    }

    return (
        <ModalDraggable
            renderTitle={
                <RenderTitleFireCompartments
                    currentTitleName={FIRE_COMPARTMENTS}
                    onSelectedTitle={handleSelectedTitle}
                    controlContentBaseTitleName={controlContentBaseTitleName}
                />
            }
            open={open}
            onCancel={onCancel}
            width={400}
            mask={false}
            maskClosable
            notShowHeaderDivider
        >
            <div
                style={{
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    height: controlContentBaseTitleName.haveContent ? '600px' : 'auto',
                }}
            >
                {Divider({ marginBottom: '14px' })}

                <FloorSettingItem
                    isShown={
                        controlContentBaseTitleName.name === FIRE_COMPARTMENTS &&
                        controlContentBaseTitleName.haveContent
                    }
                    roomList={roomList}
                    name={FIRE_COMPARTMENTS}
                    dataSource={floorSettingData.fire_compartments}
                    onChangeFloorSettingItem={handleChangeFloorSettingItem}
                />

                <RenderTitleAlarmArea
                    currentTitleName={ALARM_AREAS}
                    onSelectedTitle={handleSelectedTitle}
                    controlContentBaseTitleName={controlContentBaseTitleName}
                />

                {Divider({ paddingTop: '4px' })}

                <FloorSettingItem
                    isShown={
                        controlContentBaseTitleName.name === ALARM_AREAS &&
                        controlContentBaseTitleName.haveContent
                    }
                    roomList={roomList}
                    name={ALARM_AREAS}
                    dataSource={floorSettingData.alarm_areas}
                    onChangeFloorSettingItem={handleChangeFloorSettingItem}
                />

                <FloorSettingNewFields newFields={newFields} setNewFields={setNewFields} />
            </div>
        </ModalDraggable>
    )
}

type FloorSettingModalProps = {
    open: boolean
    onCancel: () => void
    onChangeFloorSettingData: (data: FloorSettingDataType) => void
}
