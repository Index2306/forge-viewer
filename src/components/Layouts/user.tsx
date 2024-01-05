import React, { ReactNode, useCallback, useEffect, useState } from 'react'
import { LayoutProps } from '@/models'
import { useRouter } from 'next/router'
import { Col, Row } from 'antd'
import Cookies from 'js-cookie'
import { HomeContext } from '@/context/HomeContext'
import AppConnection from '../AppConnection'
import { useAppDispatch } from '@/hooks'
import Navigation from '../Navigation'

import styles from './Layout.module.scss'
import classNames from 'classnames/bind'
const cx = classNames.bind(styles)

const UserLayout = ({ children }: LayoutProps) => {
    const token = Cookies.get('access_token')
    const user = Cookies.get('user')
    const { locale, push } = useRouter()

    const [isLogout, setIsLogout] = useState<boolean>(true)
    const [headElement, setHeadElement] = useState<ReactNode>(<></>)

    const dispatch = useAppDispatch()

    useEffect(() => {
        if (!token || !user) {
            // push('/auth/login', '/auth/login', { locale })
            setIsLogout(false)
        } else {
            setIsLogout(false)
        }
    }, [locale, push, token, user])

    // Helper clear data after Get out of tool page

    const renderUi = () => {
        if (isLogout) return <></>
        return (
            <AppConnection>
                <div className={cx('layout-container')}>
                    {/* --------------------------------------- Navigation */}

                    <Navigation />

                    <div className={cx('layout-content-wrapper')}>
                        {/* --------------------------------------- Header element */}

                        <section className={cx('layout-content-header')}>{headElement}</section>

                        {/* --------------------------------------- Page Content */}

                        <HomeContext.Provider
                            value={{
                                setHeadElement,
                            }}
                        >
                            <div className={cx('layout-content-main')}>{children}</div>
                        </HomeContext.Provider>
                    </div>
                </div>
            </AppConnection>
        )
    }

    return renderUi()
}

export default React.memo(UserLayout)
