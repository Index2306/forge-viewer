import React, {ReactNode} from 'react'

import styles from '@/components/Tool/ToolLeftSidebar/ToolLeftSidebar.module.scss'
import classNames from 'classnames/bind'
import TooltipApp from "@/components/TooltipApp";

const cx = classNames.bind(styles)

const ToolItemLeftSidebar: React.FC<ToolItemLeftSidebarProps> = ({className, selected, data, onClick, children}) => {

    const renderIcon = () => {
        let content = null

        if (data?.icon) {
            content = (
                <div
                    className={cx('tool-item-left-sidebar__icon', {
                        'is-active': selected,
                    })}
                >
                    {data?.icon}
                </div>
            )
        }
        if (data?.iconImg) {
            content = (
                <div
                    className={cx('tool-item-left-sidebar__icon', {
                        'img--is-active': selected,
                    })}
                >
                    {data?.iconImg}
                </div>
            )
        }

        return content
    }

    return (
        <div className={cx('tool-item-left-sidebar', className)}>
            <TooltipApp placement='right' title={data.name}>
                <div onClick={onClick}>{renderIcon()}</div>
            </TooltipApp>
            {children}
        </div>
    )
}

export default React.memo(ToolItemLeftSidebar)

export interface ToolItemLeftSidebarProps {
    className?: string
    selected: boolean
    data: any
    onClick: (e?: any) => void
    children?: ReactNode | undefined
}
