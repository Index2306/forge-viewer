import React, { ReactNode } from 'react'
import { Tooltip } from 'antd'

import styles from './ToolRightSidebar.module.scss'
import classNames from 'classnames/bind'
const cx = classNames.bind(styles)

const ToolItemRightSidebar: React.FC<ToolItemRightSidebarProps> = ({
    className,
    selected,
    data,
    onClick,
    children,
}) => {
    const renderIcon = () => {
        let content = null

        if (data?.iconImgSymbol) {
            content = (
                <div
                    className={cx('tool-item-right-sidebar__icon-img', {
                        'is-active': selected,
                    })}
                >
                    {data?.iconImgSymbol}
                </div>
            )
        }

        if (data?.iconImg) {
            content = (
                <div
                    className={cx('tool-item-right-sidebar__icon', {
                        'img--is-active': selected,
                    })}
                >
                    {data?.iconImg}
                </div>
            )
        }

        if (data?.icon) {
            content = (
                <div
                    className={cx('tool-item-right-sidebar__icon', {
                        'is-active': selected,
                    })}
                >
                    {data?.icon}
                </div>
            )
        }

        return content
    }

    return (
        <div className={cx('tool-item-right-sidebar', className)}>
            <Tooltip placement='left' title={data.name} color={'var(--secondary-color)'}>
                <div onClick={onClick}>{renderIcon()}</div>
            </Tooltip>
            {selected && children}
        </div>
    )
}

export default React.memo(ToolItemRightSidebar)

export interface ToolItemRightSidebarProps {
    className?: string
    selected: boolean
    data: any
    onClick: (e?: any) => void
    children?: ReactNode | undefined
}
