import React, { useCallback, useEffect, useState } from 'react'
import { AiOutlinePlusCircle } from 'react-icons/ai'
import { FaUsers } from 'react-icons/fa'
import { BiArchive } from 'react-icons/bi'
import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { HiOutlineWrenchScrewdriver } from 'react-icons/hi2'

import styles from './SideBar.module.scss'
import classNames from 'classnames/bind'
import TooltipApp from "@/components/TooltipApp";
const cx = classNames.bind(styles)

interface SidebarMenuItem {
    key: string
    icon?: React.ReactNode | null
    path: string
    callback?: (...args: any[]) => any
}

const SideBar: React.FC = () => {
    const { locale, pathname } = useRouter()
    const { t } = useTranslation()

    const [selectedPath, setSelectedPath] = useState<string>()

    useEffect(() => {
        setSelectedPath(pathname)
    }, [pathname])

    const menu: SidebarMenuItem[] = [
        {
            key: 'project_list',
            icon: <BiArchive />,
            path: '/',
        },
        {
            key: 'project_create',
            icon: <AiOutlinePlusCircle />,
            path: '/create',
        },
        {
            key: 'customer',
            icon: <FaUsers />,
            path: '/customer',
        },
        {
            key: 'operator',
            icon: <HiOutlineWrenchScrewdriver />,
            path: '/operator',
        },
    ]

    const selectedMenuItem = useCallback((path: string) => {
        setSelectedPath(path)
    }, [])

    return (
        <div className={cx('app-sidebar')}>
            {menu.map((element: SidebarMenuItem, index) => {
                return (
                    <div className={cx('app-sidebar__menu-item')} key={index}>
                        {element.path ? (
                            <Link
                                className={cx('app-sidebar__menu-item__link')}
                                href={element.path}
                                locale={locale}
                                onClick={() => selectedMenuItem(element.path)}
                            >
                                {/* ------------------------------------------ ICON */}

                                <TooltipApp
                                    placement='right'
                                    title={t(element.key ?? 'unknown')}
                                >
                                    <div
                                        className={cx('app-sidebar__menu-item__icon', {
                                            'is-active': element.path === selectedPath,
                                        })}
                                    >
                                        {element.icon}
                                    </div>
                                </TooltipApp>
                            </Link>
                        ) : (
                            <div
                                onClick={() => element?.callback}
                                className={cx('app-sidebar__menu-item__link')}
                            >
                                {/* ------------------------------------------ ICON */}

                                <TooltipApp
                                    placement='right'
                                    title={t(element.key ?? 'unknown')}
                                >
                                    <div
                                        className={cx('app-sidebar__menu-item__icon', {
                                            'is-active': element.path === selectedPath,
                                        })}
                                    >
                                        {element.icon}
                                    </div>
                                </TooltipApp>
                            </div>
                        )}
                    </div>
                )
            })}
        </div>
    )
}

export default SideBar
