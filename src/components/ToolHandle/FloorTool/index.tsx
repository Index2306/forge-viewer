import React, { useCallback, useState } from 'react'
import { FiSettings } from 'react-icons/fi'
import { useTranslation } from 'next-i18next'
import FloorSettingModal from '@/components/FloorSetting/FSModal'
import { FloorSettingDataType, RoomDataModalCustom } from '@/components/FloorSetting/types'
import { deleteRoom, detachLabelFromRoom } from '@/ForgeViewer/CustomTool/Edit2D/draw'
import { ALARM_AREAS, FIRE_COMPARTMENTS } from '@/components/FloorSetting/share'

import styles from './FloorTool.module.scss'
import classNames from 'classnames/bind'
import TooltipApp from "@/components/TooltipApp";
const cx = classNames.bind(styles)

const FloorTool: React.FC<FloorToolProps> = () => {
    const { t } = useTranslation(['common', 'config', 'tool'])

    const [open, setOpen] = useState<boolean>(false)

    const [observedFloorSettingData, setObservedFloorSettingData] = useState<FloorSettingDataType>({
        fire_compartments: null,
        alarm_areas: null,
    })

    const handleOpenModal = (value: boolean) => {
        setOpen(value)
    }

    // Turn off all color, remove all shape, remove all states inside
    const handleCancelModal = useCallback(() => {
        handleOpenModal(false)

        if (observedFloorSettingData.fire_compartments && observedFloorSettingData.alarm_areas) {
            const unDrawColoredRoom = (partName: string) => (r: RoomDataModalCustom) => {
                const roomId = `${partName}` + r.roomId
                deleteRoom(roomId)
                const label = window?.roomLabelList.find((l) => l.roomId === roomId)
                if (label) {
                    detachLabelFromRoom(label)
                }
            }
            observedFloorSettingData.fire_compartments.rooms.forEach(
                unDrawColoredRoom(FIRE_COMPARTMENTS),
            )
            observedFloorSettingData.alarm_areas.rooms.forEach(unDrawColoredRoom(ALARM_AREAS))
        }
    }, [observedFloorSettingData])

    const handleChangeFloorSettingData = (data: FloorSettingDataType) => {
        setObservedFloorSettingData(data)
    }
    // ----------------------------------------

    return (
        <>
            <div className={cx('floor-tool')}>
                <div
                    className={cx('floor-tool__action')}
                    onClick={() => {
                        if (open) {
                            handleOpenModal(false)
                            handleCancelModal()
                        } else {
                            handleOpenModal(true)
                        }
                    }}
                >
                    <div
                        className={cx('floor-tool__action-icon', {
                            'is-active': open,
                        })}
                    >
                        <TooltipApp
                            placement='left'
                            title={t('settings')}
                        >
                            <FiSettings />
                        </TooltipApp>
                    </div>
                </div>
                <FloorSettingModal
                    open={open}
                    onCancel={handleCancelModal}
                    onChangeFloorSettingData={handleChangeFloorSettingData}
                />
            </div>
        </>
    )
}

export default React.memo(FloorTool)

export interface FloorToolProps {}
