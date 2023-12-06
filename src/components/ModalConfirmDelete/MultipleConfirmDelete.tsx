import React, {ReactNode, useEffect, useState} from 'react';
import {useTranslation} from "next-i18next";
import ModalApp from '../ModalApp';
import IconAction from '../IconAction';
import AppButton from "@/components/Button";

import styles from './ModalConfirmDelete.module.scss';
import classNames from "classnames/bind";
const cx = classNames.bind(styles);

const MultipleConfirmDelete: React.FC<MultipleConfirmDeleteProps> = ({
                                                                         isOpen,
                                                                         children,
                                                                         onOk,
                                                                         onCancel,
                                                                         okText,
                                                                         cancelText,
                                                                         title,
                                                                         content,
                                                                         footer
                                                                     }) => {
    const {t} = useTranslation();
    const [open, setOpen] = useState<boolean>(false)

    useEffect(() => {
        setOpen(isOpen ?? false)
    }, [isOpen])

    const onClickYes = () => {
        setOpen(false)
        onOk?.()
    }

    const onClickCancel = () => {
        setOpen(false)
        onCancel?.()
    }

    return (
        <>
            <div className={cx('modal-confirm-delete__trash-icon')} onClick={() => setOpen(true)}>
                <IconAction
                    src='/assets/icons/icon_delete.svg'
                    title='Trash Icon'
                    size='large'
                />
            </div>
            <ModalApp
                key={'parent_modal'}
                title={title ? title : t('delete_confirmation')}
                open={open}
                onCancel={onClickCancel}
                width={400}
                renderFooter={
                    <div style={{display: 'flex', justifyContent: 'flex-end'}}>
                        <AppButton onClick={() => onClickYes()}>
                            {okText ? okText : t('confirm')}
                        </AppButton>
                        <AppButton type='ghost' onClick={() => onClickCancel()}>
                            {cancelText ? cancelText : t('cancel')}
                        </AppButton>
                    </div>
                }
            >
                <div className={cx('modal-confirm-delete__content')}>
                    {content ? content : t('question_delete')}
                </div>
            </ModalApp>
            {children}
        </>
    );
};

export default MultipleConfirmDelete;

interface MultipleConfirmDeleteProps {
    isOpen?: boolean
    onOk?: (val?: any) => void
    onCancel?: (val?: any) => void
    children: ReactNode
    title?: string | ReactNode
    content?: string | ReactNode
    footer?: ReactNode
    okText?: string
    cancelText?: string
}