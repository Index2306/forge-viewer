import React from 'react'

import styles from '@/components/Tool/ToolLeftSidebar//ToolLeftSidebar.module.scss'
import classNames from 'classnames/bind'
const cx = classNames.bind(styles)

const DividerTLS: React.FC<DividerTLSProps> = ({ content }) => {
    return (
        <>
            {content ? (
                <>
                    <div className={cx('tool-left-sideBar__divider')} />
                    {content}
                    <div className={cx('tool-left-sideBar__divider')} />
                </>
            ) :
            (
                <div className={cx('tool-left-sideBar__divider')} />
            )}
        </>
    )
}

interface DividerTLSProps {
    content?: React.ReactNode
}

export default DividerTLS
