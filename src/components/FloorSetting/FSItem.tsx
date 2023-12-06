import { useEffect, useMemo, useState } from 'react'
import { RgbColorPicker } from 'react-colorful'
import InputCustom from '../InputCustom'
import { Col, Row } from 'antd'
import { rgbToHex } from '@/helpers/Color'
import { useTranslation } from 'next-i18next'
import FloorSettingTableOfRoom from './FSTableOfRooms'
import { DataItemType, RgbColor, RoomDataModalCustom } from './types'
import { useDebounce } from 'ahooks'
import { observeAndTransformRoomListData } from './share'

const DEFAULT_COLOR: RgbColor = { r: 0, g: 0, b: 0 }

export function FloorSettingItem({
    isShown,
    roomList,
    dataSource,
    onChangeFloorSettingItem,
    name,
}: FloorSettingItemProps) {
    const [rgbColor, setRgbColor] = useState<RgbColor>(dataSource?.color ?? DEFAULT_COLOR)

    const [nameInput, setNameInput] = useState<{ name: string; value: any }>({
        name: 'rename_room',
        value: dataSource?.setting?.value ?? '',
    })

    const nameInputDebounce = useDebounce(nameInput, { maxWait: 300 })
    const rgbColorDebounce = useDebounce(rgbColor, { maxWait: 200 })

    const [dataItem, setDataItem] = useState<DataItemType>({
        itemName: name,
        color: rgbColorDebounce,
        setting: { name: 'rename_room', value: dataSource?.setting?.value ?? '' },
        rooms: dataSource?.rooms ?? [],
    })


    useEffect(() => {
        setDataItem((prev) => {
            return {
                ...prev,
                setting: { name: nameInputDebounce.name, value: nameInputDebounce.value },
            }
        })
    }, [nameInputDebounce])

    const { t } = useTranslation(['tool', 'common'])

    // -------------------------------------------------------

    const roomsDataSource = useMemo(() => {
        if (
            dataSource?.rooms &&
            Array.isArray(dataSource?.rooms) &&
            dataSource?.rooms?.length > 0
        ) {
            // When some room in roomList is removed
            // should compare rooms length of DataSource and RoomList
            // and filter out the remained rooms
            const transformDataSource = observeAndTransformRoomListData(dataSource, roomList)
            return transformDataSource.rooms
        }
        return roomList
    }, [roomList, dataSource])

    // -------------------------------------------------------

    useEffect(() => {
        dataSource = observeAndTransformRoomListData(dataItem, roomList)
        onChangeFloorSettingItem(dataSource)
    }, [dataItem, roomList])

    // -------------------------------------------------------

    const hexColor = useMemo(() => {
        const color = { r: rgbColorDebounce.r, g: rgbColorDebounce.g, b: rgbColorDebounce.b }

        setDataItem((prev) => {
            return { ...prev, color }
        })

        return rgbToHex({ ...color, a: 1 })
    }, [rgbColorDebounce])

    const handleChangeValue = (name?: string, value?: any) => {
        setNameInput((prev: any) => {
            return { ...prev, name, value }
        })
    }

    // -------------------------------------------------------
    const handleChangeRoomDataTable = (rooms: RoomDataModalCustom[]) => {
        setDataItem((prev) => {
            return { ...prev, rooms }
        })
    }

    return (
        <div style={{ display: isShown ? 'block' : 'none' }}>
            <div style={{ marginTop: '24px', marginBottom: '16px' }}>
                <Row gutter={[16, 16]} style={{ width: '100%' }}>
                    {/* --------- Render Setting name & Color name ---------*/}
                    <Col span={24}>
                        <Row gutter={[16, 16]}>
                            <Col flex={1}>
                                <InputCustom
                                    name={'rename_room'}
                                    label={t('rename_room')}
                                    required={false}
                                    initValue={dataItem?.setting?.value}
                                    changeValue={(name, value) => {
                                        handleChangeValue(name, value)
                                    }}
                                />
                            </Col>
                            <Col>
                                <div
                                    style={{
                                        color: `white`,
                                        background: hexColor,
                                        height: '40px',
                                        borderRadius: '8px',
                                        width: '80px',
                                        textAlign: 'center',
                                        paddingTop: '8px',
                                        fontSize: '1rem',
                                    }}
                                >
                                    {hexColor}
                                </div>
                            </Col>
                        </Row>
                    </Col>
                    {/* -------------- Render Color picker ---------------*/}
                    <Col span={24}>
                        <RgbColorPicker
                            color={rgbColor}
                            onChange={setRgbColor}
                            style={{
                                width: '100%',
                            }}
                        />
                    </Col>
                    {/* ------------------ Render Table ------------------*/}
                    <Col span={24}>
                        <FloorSettingTableOfRoom
                            roomList={roomsDataSource}
                            onChangeRoomDataTable={handleChangeRoomDataTable}
                        />
                    </Col>
                </Row>
            </div>
        </div>
    )
}

type FloorSettingItemProps = {
    isShown: boolean
    roomList: RoomDataModalCustom[]
    dataSource: DataItemType | null
    onChangeFloorSettingItem: (body: DataItemType) => void
    name: string,
}
