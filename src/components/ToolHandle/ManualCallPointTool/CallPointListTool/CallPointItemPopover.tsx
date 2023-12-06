import React, {useCallback, useContext, useState} from 'react';
import {SettingOutlined} from "@ant-design/icons";
import {Col, Popover, Row, Space} from "antd";
import ConfirmDelete from "@/components/ConfirmDelete";
import {FaTrashAlt} from "react-icons/fa";
import CallPointModalSetting from "@/components/ToolHandle/ManualCallPointTool/CallPointListTool/CallPointModalSetting";
import {ToolContext} from "@/context/ToolContext";

import styles from "./CallPoint.module.scss";
import classNames from 'classnames/bind';
import IconAction from '@/components/IconAction';
const cx = classNames.bind(styles)

const CallPointItemPopover : React.FC<CallPointItemPopoverProps> = ({id, name, size, onRemoveCallPoint, isOpenModal, setIsOpenModal}) => {
    const [isPopoverDelete, setIsPopoverDelete] = useState<boolean>(false)

    const {isOpenSideBar} = useContext(ToolContext)

    const onHandleRemoveItem = useCallback(() => {
        onRemoveCallPoint()
        setIsPopoverDelete(false)
    }, [onRemoveCallPoint])

    const onHandleCancelRemoveItem = useCallback(() => {
        setIsPopoverDelete(false)
    }, [])

    const onHandleCancelSetting = useCallback(() => {
        setIsOpenModal(false)
    }, [setIsOpenModal])

    const onHandleOpenModalSetting = useCallback(() => {
        setIsOpenModal(!isOpenModal)
    }, [setIsOpenModal, isOpenModal])

    return (
        <div>
            <div className={cx('call-point-item__action-wrapper')}>
                <SettingOutlined className={cx('call-point-item__action-btn')} onClick={onHandleOpenModalSetting}/>
                <Popover
                    onOpenChange={setIsPopoverDelete}
                    open={isPopoverDelete}
                    key={`$delete_hide`}
                    placement="top"
                    content={<ConfirmDelete name={name} onHandleDelete={onHandleRemoveItem} onCancel={onHandleCancelRemoveItem} />}
                    trigger="click">
                        <IconAction src="/assets/icons/icon_delete.svg" title="Trash Icon" size='medium'/>
                </Popover>
            </div>
            <CallPointModalSetting id={id} name={name} size={size} isOpen={isOpenModal} onCancel={onHandleCancelSetting}/>
        </div>
    );
};

export default React.memo(CallPointItemPopover);

interface CallPointItemPopoverProps {
    id: string,
    name: string | undefined
    size: number
    onRemoveCallPoint: () => void,
    isOpenModal: boolean,
    setIsOpenModal: (val?: any) => void
}