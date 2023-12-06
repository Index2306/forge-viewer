import { useState } from 'react'

import styles from './DropdownNav.module.scss'
import classNames from 'classnames/bind'
const cx = classNames.bind(styles)

export default function DropdownNav({ items: menuItems, onOpenChange }: DropdownNavProps) {
    const [openMenus, setOpenMenus] = useState<number[]>([])

    const toggleMenu = (index: number) => {
        if (openMenus.includes(index)) {
            // Close the menu if it's already open
            setOpenMenus(openMenus.filter((item) => item !== index))
        } else {
            // Open the menu
            setOpenMenus([...openMenus, index])
        }
    }

    const renderMenuItems = (items: DropdownNavMenuItemType[], depth = 1) => {
        return (
            <ul className={cx(`menu-level-${depth}`)}>
                {items.map((item, index) => (
                    <li key={index}>
                        <div
                            className={cx('menu-item', `level-${depth}`)}
                            onClick={() => {
                                if (item.children.length > 0) {
                                    toggleMenu(index)
                                } else {
                                    onOpenChange(false)
                                    setTimeout(() => {
                                        setOpenMenus([])
                                    }, 200)
                                }
                            }}
                        >
                            {item.label}
                        </div>
                        {item.children.length > 0 &&
                            openMenus.includes(index) &&
                            renderMenuItems(item.children, depth + 1)}
                    </li>
                ))}
            </ul>
        )
    }

    return <div className={cx('multi-level-dropdown')}>{renderMenuItems(menuItems)}</div>
}

interface DropdownNavProps {
    items: DropdownNavMenuItemType[]
    onOpenChange: React.Dispatch<React.SetStateAction<boolean>>
}

export interface DropdownNavMenuItemType {
    label: string | React.ReactNode
    children: DropdownNavMenuItemType[]
}
