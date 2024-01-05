import React, { useCallback, useContext, useEffect, useState } from 'react'
import { ToolContext } from '@/context/ToolContext'
import { useAppDispatch, useAppSelector } from '@/hooks'
import { changeResetViewer, selectTool } from '@/store/slices/tool/tool.slice'
import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'

import styles from '@/components/Tool/ToolLeftSidebar/ToolLeftSidebar.module.scss'
import classNames from 'classnames/bind'

import DividerTLS from "@/components/Tool/ToolLeftSidebar/DividerTLS";
import ContentAccentColorTLS from "@/components/Tool/ToolLeftSidebar/ContentAccentColorTLS";
import ToolListLeftSidebar from "@/components/Tool/ToolLeftSidebar/ToolListLeftSidebar";
import { Button, Col, Row } from 'antd'
import { ForgeViewerContext } from '@/context/ForgeViewerContext'

const cx = classNames.bind(styles)

const ToolLeftSidebar: React.FC<ToolLeftSidebarProps> = ({ isShowTool }) => {
    const dispatch = useAppDispatch()
    const { t } = useTranslation(['tool'])

    const { push, locale } = useRouter()

    const {setModelType} = useContext(ForgeViewerContext)

    const handleChangeModel = (value: string) => {
        if(value){
            setModelType?.(value)
            dispatch(changeResetViewer(true))
        }
    }

    return (
        <div className={cx('tool-left-sideBar')}>
            <DividerTLS
                content={
                    <ContentAccentColorTLS
                        id={'id-tool-model'}
                        label={t('model')}
                    />
                }
            />
            <Row>
                <Col span={12}><Button style={{ width: '100%' }} onClick={() => handleChangeModel('2d')}>2D</Button></Col>
                <Col span={12}><Button style={{ width: '100%' }} onClick={() => handleChangeModel('3d')}>3D</Button></Col>
            </Row>

            <DividerTLS
                content={
                    <ContentAccentColorTLS
                        id={'id-tool-label'}
                        label={t('tools', { ns: 'tool' })}
                    />
                }
            />

            {/* -------------------------------------------- Render Tool list */}

            <ToolListLeftSidebar />
        </div>
    )
}

export default React.memo(ToolLeftSidebar)

export interface ToolLeftSidebarProps {
    isShowTool: boolean
}
