import { ReactElement, ReactNode } from 'react'

import styles from './ToolRightSidebar.module.scss'
import classNames from 'classnames/bind'
import ToolListTitle from '../ToolListTitle'
const cx = classNames.bind(styles)

export default function SubToolRightSidebar({ children, selected, title, className }: SubToolRightSidebarType) {
    return (
        <div
            className={cx('subtool-right-sidebar', className, {
                'is-hidden': !selected,
            })}
        >
            {title && <ToolListTitle title={title} />}
            {children}
        </div>
    )
}

interface SubToolRightSidebarType {
    children: ReactElement[] | ReactElement | ReactNode
    selected?: boolean
    title?: string
    className?: string
}
