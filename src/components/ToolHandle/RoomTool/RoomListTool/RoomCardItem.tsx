import React, { ReactElement, useCallback, useEffect, useState } from 'react'
import type { CheckboxChangeEvent } from 'antd/es/checkbox'
import { Checkbox, Popover } from 'antd'
import { useTranslation } from 'next-i18next'
import { useAppSelector } from '@/hooks'
import { selectTool } from '@/store/slices/tool/tool.slice'
import { drawRoom } from '@/ForgeViewer/CustomTool/Edit2D/draw'
import { selectLayer } from '@/store/slices/tool/layer.slice'
import { LayerKey, LayerStatus } from '@/contants/tool'
import { SettingOutlined } from '@ant-design/icons'
import ConfirmDelete from '@/components/ConfirmDelete'
import IconAction from '@/components/IconAction'

import styles from './RoomListTool.module.scss'
import classNames from 'classnames/bind'
import { RoomDataModel } from '@/models'
const cx = classNames.bind(styles)

const RoomCardItem: React.FC<RoomCardItemProps> = ({
    indeterminate,
    isShow,
    name,
    id,
    onChangeView,
    onRemoveRoomItem,
    onToggleModal,
    roomInfo,
}) => {
    const { t } = useTranslation(['common', 'tool'])
    const [isOpenPopover, setIsOpenPopover] = useState<boolean>(false)

    // Using Layer Tool to control Toggle of Room on Viewer
    const { isLayerToolActive, layerList } = useAppSelector(selectLayer)

    const onChange = useCallback(
        (e: CheckboxChangeEvent) => {
            // const checked = e.target.checked;

            if (onChangeView) {
                if (id === "all") {
                    onChangeView(e.target.checked, id)
                    return
                } else {
                    onChangeView(e.target.checked, id, roomInfo)
                }
            }
        },
        [id, roomInfo],
    )

    // useEffect(() => {
    //     // Remove this room first
    //     onHandleUndrawRoomOnViewer()

    //     if (isLayerToolActive) {
    //         const activeRoomTool = layerList.find((layer) =>
    //             layer.key === LayerKey.ROOMS && layer.status === LayerStatus.OPEN,
    //         )

    //         if (isShow && activeRoomTool) {
    //             onHandleDrawRoomOnViewer()
    //             return
    //         }
    //     }
    //     return () => {
    //         onHandleUndrawRoomOnViewer()
    //     }
    // }, [layerList, isLayerToolActive, isShow, id])

    // /**
    //  * Handle draw room with selected id on viewer
    //  */
    // const onHandleDrawRoomOnViewer = useCallback(() => {
    //     if (id === 'all') return

    //     if (roomInfo) {
    //         drawRoom(id, roomInfo.name, roomInfo.boundary_layer, true)
    //     }
    // }, [id])

    // /**
    //  * Handle un-draw room with selected id on viewer
    //  */
    // const onHandleUndrawRoomOnViewer = useCallback(() => {
    //     drawRoom(id, undefined, [], false)
    // }, [id])

    // --- Handling remove selected room from room list ----
    const handleCancel = () => setIsOpenPopover(false)
    const handleOpenChange = (newOpen: boolean) => setIsOpenPopover(newOpen)
    const handleDelete = () => {
        onRemoveRoomItem?.(id)
        setIsOpenPopover(false)
    }

    return (
        <div className={cx(id === 'all' ? 'room-card-item__all' : 'room-card-item')}>
            <div className={cx('flex--justify-center')}>
                <Checkbox
                    className={cx('room-card-item__checkbox')}
                    indeterminate={indeterminate}
                    checked={isShow}
                    onChange={onChange}
                >
                    <span
                        data-class='label__page-tool__tool-right-sidebar__subtool_list-item'
                        className={cx('room-card-item__label')}
                    >
                        {name ? name : t('unknown', { ns: 'common' })}
                    </span>
                </Checkbox>
                {id !== 'all' && (
                    <div className={cx('room-card-item__action-wrapper')}>
                        <SettingOutlined
                            className={cx('room-card-item__action-btn')}
                            onClick={() => {
                                if (onToggleModal) {
                                    onToggleModal({
                                        type: 'room-setting-modal',
                                        isOpen: true,
                                        keyId: id,
                                    })
                                }
                            }}
                        />
                        <Popover
                            onOpenChange={handleOpenChange}
                            open={isOpenPopover}
                            placement='top'
                            content={
                                <ConfirmDelete
                                    name={id}
                                    onHandleDelete={handleDelete}
                                    onCancel={handleCancel}
                                />
                            }
                            trigger='click'
                        >
                            <IconAction
                                src='/assets/icons/icon_delete.svg'
                                title='Trash Icon'
                                size='medium'
                            />
                        </Popover>
                    </div>
                )}
            </div>
        </div>
    )
}

export default RoomCardItem

interface RoomCardItemProps {
    id: string
    isShow?: boolean
    children?: ReactElement
    name: string | undefined
    onChangeView?: (status: boolean, id: string, roomInfo?: RoomDataModel) => void
    indeterminate?: boolean
    onRemoveRoomItem?: (roomId: string) => void
    onToggleModal?: (data: {
        type: string, isOpen: boolean, keyId: string
    }) => void
    roomInfo?: RoomDataModel
}
