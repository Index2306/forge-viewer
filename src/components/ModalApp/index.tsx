import { Modal, ModalProps } from 'antd'
import Icon from '@ant-design/icons'
import { MdClose } from 'react-icons/md'

import styles from './ModalApp.module.scss'
import classNames from 'classnames/bind'
const cx = classNames.bind(styles)

export default function ModalApp({
    title,
    children,
    open,
    onCancel,
    onOk,
    mask,
    width,
    renderCloseIcon,
    renderFooter,
    renderTitle,
    notShowHeaderDivider,
    ...props
}: ModalAppProps) {
    const DefaultCloseIcon = (
        <div>
            <Icon
                component={MdClose}
                className={styles['modal-app-title__close-icon']}
                onClick={() => onCancel()}
            />
        </div>
    )

    return (
        <>
            <Modal
                maskStyle={{
                    backgroundColor: 'hsla(5.5, 51%, 33.5%, 0.4)',
                    backdropFilter: 'grayscale(0.1) saturate(0.8)'
                }}
                title={
                    <div className={cx('modal-app-title')}>
                        {/* ----------------------------- */}
                        {/* title */}
                        {/* ----------------------------- */}
                        {renderTitle ? (
                            renderTitle
                        ) : (
                            <span 
                                data-class='label__modal-app__header'
                                className={cx('modal-app-title__label')}>{title || ''}</span>
                        )}

                        {/* ----------------------------- */}
                        {/* Close Icon */}
                        {/* ----------------------------- */}
                        {renderCloseIcon ? renderCloseIcon : DefaultCloseIcon}

                        {/* ----------------------------- */}
                        {/* Divide line */}
                        {/* ----------------------------- */}
                        {notShowHeaderDivider ? null : (
                            <div className={cx('modal-app-title__divider')}></div>
                        )}
                    </div>
                }
                closable={false}
                open={open}
                onOk={onOk}
                onCancel={onCancel}
                mask={mask}
                width={width ? width : 200}
                footer={renderFooter ? renderFooter : null}
                {...props}
            >
                {notShowHeaderDivider ? (
                    <div 
                        data-class='label__modal-app__content'
                    >{children}</div>
                ) : (
                    <div
                        data-class='label__modal-app__content'
                        className={cx('modal-app-content')}>{children}</div>
                )}
            </Modal>
        </>
    )
}

type ModalAppProps = {
    title?: React.ReactNode | string
    children?: React.ReactNode
    open: boolean
    onCancel: () => void
    onOk?: () => void
    mask?: boolean
    width?: number
    renderCloseIcon?: React.ReactNode
    renderFooter?: React.ReactNode | null
    renderTitle?: React.ReactNode | null
    notShowHeaderDivider?: boolean
    [key: string]: any
} & ModalProps
