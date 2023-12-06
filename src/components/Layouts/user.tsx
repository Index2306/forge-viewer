import React, { ReactNode, useCallback, useEffect, useState } from 'react'
import { LayoutProps } from '@/models'
import { useRouter } from 'next/router'
import { Col, Row } from 'antd'
import SideBar from '@/components/SideBar'
import Cookies from 'js-cookie'
import { HomeContext } from '@/context/HomeContext'
import ProjectModal from '@/components/Project/ProjectCard/ProjectModal'
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
    const [isTool, setIsTool] = useState<boolean>(false)
    const [isOpenCreateProjectModal, setIsOpenCreateProjectModal] = useState<boolean>(false)
    const [headElement, setHeadElement] = useState<ReactNode>(<></>)

    const dispatch = useAppDispatch()

    useEffect(() => {
        if (!token || !user) {
            push('/auth/login', '/auth/login', { locale })
        } else {
            setIsLogout(false)
        }
    }, [locale, push, token, user])

    // Helper clear data after Get out of tool page

    const handleCloseModal = useCallback(() => {
        setIsOpenCreateProjectModal(false)
    }, [])

    const renderNormalPage = (): ReactNode => {
        return (
            <>
                {/* <Row className={cx('layout-content-main')}>
                <Col xs={3} sm={4} md={2} lg={2} xl={1} xxl={1}>
                    <SideBar />
                </Col>
                <Col xs={21} sm={20} md={22} lg={22} xl={23} xxl={23}>
                    {children}
                </Col>
                </Row> */}

                <div className={cx('layout-content-main')}>
                    <div className={cx('layout-content-main__left__app-sidebar')}>
                        <SideBar />
                    </div>
                    <div className={cx('layout-content-main__right__content')}
                    >{children}</div>
                </div>
                <ProjectModal
                    isOpen={isOpenCreateProjectModal}
                    onClose={handleCloseModal}
                    projectModal={{ type: 'create', project: undefined }}
                />
            </>
        )
    }

    const renderToolPage = (): ReactNode => {
        return <div className={cx('layout-content-main')}>{children}</div>
    }

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
                                isOpenCreateProjectModal,
                                setIsOpenCreateProjectModal,
                                setHeadElement,
                                setIsTool,
                            }}
                        >
                            {isTool ? renderToolPage() : renderNormalPage()}
                        </HomeContext.Provider>
                    </div>
                </div>
            </AppConnection>
        )
    }

    return renderUi()
}

export default React.memo(UserLayout)
