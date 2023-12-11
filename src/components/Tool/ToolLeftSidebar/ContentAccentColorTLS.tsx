import React from 'react'

import styles from '@/components/Tool/ToolLeftSidebar/ToolLeftSidebar.module.scss'
import classNames from 'classnames/bind'
const cx = classNames.bind(styles)

export default function ContentAccentColorTLS({ children, label, id }: ContentAccentColorTLSProps) {
    return (
        <div id={id} className={cx('content-accent-color')}>
            {label && <div className={cx('content-accent-color__label')} data-class='label__page-tool__subtool'>{label}</div>}
            {children && (<>{children}</>)}
        </div>
    )
}

interface ContentAccentColorTLSProps {
    children?: React.ReactNode
    label?: string
    id?: string
}
