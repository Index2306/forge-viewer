import React, {Fragment, useRef, useState} from 'react';
import {Modal} from "antd";
import { Icon } from '@chakra-ui/react';
import { MdClose } from 'react-icons/md';
import DraggableSetting from './DraggableSetting'

const ModalDraggable : React.FC<ModalDraggableProps> = ({
    title,
    children,
    open,
    onCancel,
    onOk,
    mask,
    width,
    renderCloseIcon,
    renderFooter,
    maskClosable,
    renderTitle,
    notShowHeaderDivider,
}) => {
    const [disabled, setDisabled] = useState(true);

    const handleOk = (e: React.MouseEvent<HTMLElement>) => {
        onCancel()
    };

    const handleCancel = (e: React.MouseEvent<HTMLElement>) => {
        onCancel()
    };

    const DefaultCloseIcon = (
        <div>
            <Icon
                as={MdClose}
                sx={{
                    fontSize: '28px',
                    cursor: 'pointer',
                    color: '#4a4948',
                }}
                onClick={(e: any) => handleCancel(e)}
            />
        </div>
    )

    return (
            <Modal
                data-id={maskClosable ? 'modal-draggable' : false }
                title={
                    <div
                        style={{
                            color: '#eb5849',
                            position: 'relative',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginInline: '-6px',
                            fontSize: '1.3rem',
                            cursor: 'move',
                        }}
                        onMouseOver={() => {
                            if (disabled) {
                                setDisabled(false);
                            }
                        }}
                        onMouseOut={() => {
                            setDisabled(true);
                        }}
                        // fix eslintjsx-a11y/mouse-events-have-key-events
                        // https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/blob/master/docs/rules/mouse-events-have-key-events.md
                        onFocus={() => {}}
                        onBlur={() => {}}
                    >
                        {/* ----------------------------- */}
                        {/* title */}
                        {/* ----------------------------- */}
                        {renderTitle ? (renderTitle) : (
                            <h3 style={{ userSelect: 'none', pointerEvents: 'none', }} >{title || ''}</h3>
                        )}

                        {/* ----------------------------- */}
                        {/* Close Icon */}
                        {/* ----------------------------- */}
                        {renderCloseIcon ? (renderCloseIcon) : (DefaultCloseIcon)}

                        {/* ----------------------------- */}
                        {/* Divide line */}
                        {/* ----------------------------- */}
                        {notShowHeaderDivider ? (
                            null
                        ) :  (
                            <div
                                style={{
                                    width: '99.5%',
                                    borderBottom: '1px solid #c6c6c5',
                                    position: 'absolute',
                                    left: '0',
                                    top: '3rem',
                                    zIndex: 1,
                                }}
                            ></div>
                        )}
                    </div>
                }
                closable={false}
                open={open}
                onOk={onOk}
                onCancel={handleCancel}
                mask={mask}
                width={width ? width : 200}
                modalRender={(modal) => (<DraggableSetting modal={modal} disabled={disabled}/>)}
                footer={renderFooter ? (renderFooter) : null}
            >
                {children}
            </Modal>
    );
};

export default ModalDraggable;

interface ModalDraggableProps {
    title?: React.ReactNode | string,
    children?: React.ReactNode
    open: boolean,
    onCancel: () => void
    onOk?: () => void
    mask?: boolean
    maskClosable?: boolean
    width?: number
    renderCloseIcon?: React.ReactNode
    renderFooter?: React.ReactNode | null
    renderTitle?: React.ReactNode | null
    notShowHeaderDivider?: boolean
}