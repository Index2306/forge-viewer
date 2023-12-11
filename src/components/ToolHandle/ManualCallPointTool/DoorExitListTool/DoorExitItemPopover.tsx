import React, {useCallback, useState} from 'react';
import ConfirmDelete from "@/components/ConfirmDelete";
import {Popover, Space} from "antd";
import IconAction from '@/components/IconAction';

import styles from './DoorExitListTool.module.scss'
import classNames from 'classnames/bind';
const cx = classNames.bind(styles)

const DoorExitItemPopover : React.FC<DoorExitItemPopoverProps> = ({id, name, onRemoveDoorExit, onCancelRemoveDoorExit}) => {
    const [openModal, setOpenModal] = useState<boolean>(false);
    const [isOpenPopover, setIsOpenPopover] = useState<boolean>(false)

    const onHandleRemoveItem = useCallback(() => {
        onRemoveDoorExit()
        setIsOpenPopover(false)
    }, [onRemoveDoorExit])

    const onHandleCancelRemoveItem = useCallback(() => {
        onCancelRemoveDoorExit()
        setIsOpenPopover(false)
    }, [onCancelRemoveDoorExit])

    return (
        <>
            <Popover
                onOpenChange={setIsOpenPopover}
                open={isOpenPopover}
                key={`$delete_hide`}
                placement="top"
                content={<ConfirmDelete name={name} onHandleDelete={onHandleRemoveItem} onCancel={onHandleCancelRemoveItem} />}
                trigger="click">
                    <IconAction src="/assets/icons/icon_delete.svg" title="Trash Icon" size='medium'/>
            </Popover>
        </>
    );
};

export default React.memo(DoorExitItemPopover);

interface DoorExitItemPopoverProps {
    id: string,
    name: string | undefined
    onRemoveDoorExit: () => void
    onCancelRemoveDoorExit: () => void
}