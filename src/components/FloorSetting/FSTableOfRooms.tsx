import { Checkbox, Table } from 'antd'
import React, { useEffect, useState } from 'react'
import AppEmpty from '../Empty'
import styles from './FloorSetting.module.scss'
import useSortRoomDataTable from './useSortRoomDataTable'
import { ColumnsType } from 'antd/es/table'
import { RoomDataModalCustom } from './types'
import { SORT_BY, SORT_STATUS, sortByName, sortTargetHelper } from './share'

export default function FloorSettingTableOfRoom({
    roomList,
    onChangeRoomDataTable,
}: FloorSettingTableOfRoomProps) {
    const [rooms, setRooms] = useState<RoomDataModalCustom[]>(roomList)

    const [checkAll, setCheckAll] = useState<boolean>(false)
    const [indeterminate, setIndeterminate] = useState<boolean>(false)

    // --- Hook supports sorting rooms array ---
    const [RoomHeaderTitle, WidthHeaderTitle, LengthHeaderTitle] = useSortRoomDataTable(setRooms)

    // -----------------------------------

    useEffect(() => {
        // Should Sort data by name of Room before move to the Store
        const objRooms: Record<string, RoomDataModalCustom> = {}
        rooms.forEach(room => {
            objRooms[room.id] = room
        })
        const observeRoom = roomList.map(r => {
            return objRooms[r.id]
        })

        onChangeRoomDataTable(observeRoom)
    }, [rooms])

    // -----------------------------------

    // --- Control Check All room ---
    useEffect(() => {
        const lengthChecked = rooms.filter((r) => r.isShow === true).length
        if (lengthChecked > 0) {
            if (lengthChecked === rooms.length) {
                setCheckAll(true)
                setIndeterminate(false)
            } else {
                setCheckAll(false)
                setIndeterminate(true)
            }
        } else {
            setIndeterminate(false)
        }
    }, [rooms])

    const handleHeaderCheckbox = (value: boolean) => {
        setRooms((prev) => [...prev].map((r) => ({ ...r, isShow: value })))
        setIndeterminate(false)
        setCheckAll(value)
    }

    // --- Control Check selected room ---
    const handleRowCheckbox = (record: RoomDataModalCustom) => {
        setRooms((prev) =>
            [...prev].map((room) => {
                if (record.id === room.id) {
                    return { ...room, isShow: !room.isShow }
                }
                return room
            }),
        )
    }

    const columns123: ColumnsType<RoomDataModalCustom> = [
        {
            title: RoomHeaderTitle(indeterminate, checkAll, handleHeaderCheckbox),
            dataIndex: 'name',
            render: (_, record) => {
                return (
                    <div
                        style={{
                            display: 'flex',
                            gap: '8px',
                            justifyContent: 'flex-start',
                            alignItems: 'center',
                            marginLeft: '-4px',
                        }}
                    >
                        <Checkbox checked={record.isShow} />
                        <span>{record.name}</span>
                    </div>
                )
            },
        },
        {
            title: WidthHeaderTitle,
            dataIndex: 'width',
        },
        {
            title: LengthHeaderTitle,
            dataIndex: 'length',
        },
    ]

    return (
        <Table
            className={styles.table}
            locale={{ emptyText: <AppEmpty /> }}
            columns={columns123}
            dataSource={rooms}
            pagination={false}
            rowKey={(row) => row.id}
            onRow={(record) => {
                return { onClick: () => handleRowCheckbox(record) }
            }}
        />
    )
}

type FloorSettingTableOfRoomProps = {
    roomList: RoomDataModalCustom[]
    onChangeRoomDataTable: (rooms: RoomDataModalCustom[]) => void
}
