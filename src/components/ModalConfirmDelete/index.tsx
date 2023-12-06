import React, { ReactNode, useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'next-i18next'
import DataLoading from '@/components/AppLoading/DataLoading'
import IconAction from '../IconAction'
import ModalApp from '../ModalApp'
import AppButton from "@/components/Button";

import styles from './ModalConfirmDelete.module.scss'
import classNames from 'classnames/bind'
const cx = classNames.bind(styles)

const ModalConfirmDelete: React.FC<ModalConfirmDeleteProps> = ({
    title,
    content,
    callback,
    hideButton,
    isOpen,
    okText,
    cancelText,
    onCancel,
    isFetching,
}) => {
    const { t } = useTranslation()

    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        setOpen(isOpen !== undefined ? isOpen : false)
        return () => setOpen(false)
    }, [isOpen])

    useEffect(() => {
        setLoading(isFetching !== undefined ? isFetching : false)
        return () => setLoading(false)
    }, [isFetching])

    const showModal = () => {
        setOpen(true)
    }

    const hideModel = () => {
        setOpen(false)
    }

    const onClickYes = useCallback(() => {
        callback?.()
        if (isFetching === undefined) setOpen(false)
    }, [callback])

    const handleCancelModal = useCallback(() => {
        if (loading) return
        setOpen(false)
        onCancel?.()
    }, [loading, onCancel])

    return (
        <>
            {hideButton ? null : (
                <div className={cx('modal-confirm-delete__trash-icon')} onClick={() => setOpen(true)}>
                    <IconAction
                        src='/assets/icons/icon_delete.svg'
                        title='Trash Icon'
                        size='large'
                    />
                </div>
            )}

            <ModalApp
                title={title ? title : t('delete_confirmation')}
                open={open}
                onCancel={handleCancelModal}
                width={400}
                renderFooter={
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <AppButton onClick={() => onClickYes()}>
                            {okText ? okText : t('confirm')}
                        </AppButton>
                        <AppButton type='ghost' onClick={() => handleCancelModal()}>
                            {cancelText ? cancelText : t('cancel')}
                        </AppButton>
                    </div>
                }
            >
                <div style={{ position: 'relative' }}>
                    {loading ? <DataLoading /> : null}
                    <div className={cx('modal-confirm-delete__content')}>
                        {content ? content : t('question_delete')}
                    </div>
                </div>
            </ModalApp>
        </>
    )
}

export default React.memo(ModalConfirmDelete)

interface ModalConfirmDeleteProps {
    callback?: () => void
    hideButton?: boolean
    isOpen?: boolean
    title?: string | ReactNode
    content?: string | ReactNode
    okText?: string | ReactNode
    cancelText?: string | ReactNode
    onCancel?: (val?: any) => void
    isFetching?: boolean
}
