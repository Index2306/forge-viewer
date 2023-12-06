import React, {useCallback, useContext, useEffect, useState} from 'react'
import {ToolContext} from '@/context/ToolContext'
import {useAppDispatch, useAppSelector} from '@/hooks'
import {selectTool} from '@/store/slices/tool/tool.slice'
import {useTranslation} from 'next-i18next'
import ToolFileList from '@/components/Tool/ToolFile/ToolFileList'
import {useRouter} from 'next/router'
import AutoSaveData from '../AutoSaveData'
import ExportFile from '../ExportFile'

import styles from '@/components/Tool/ToolLeftSidebar/ToolLeftSidebar.module.scss'
import classNames from 'classnames/bind'

import DividerTLS from "@/components/Tool/ToolLeftSidebar/DividerTLS";
import ContentAccentColorTLS from "@/components/Tool/ToolLeftSidebar/ContentAccentColorTLS";
import ToolListLeftSidebar from "@/components/Tool/ToolLeftSidebar/ToolListLeftSidebar";

const cx = classNames.bind(styles)

const ToolLeftSidebar: React.FC<ToolLeftSidebarProps> = ({isShowTool}) => {
    const dispatch = useAppDispatch()
    const {t} = useTranslation(['tool'])
    const {toolFile, isToolReady} = useContext(ToolContext)

    const [isFirst, setIsFirst] = useState<boolean>(false)

    const { currentFile } = useAppSelector(selectTool)

    const { push, locale } = useRouter()

    useEffect(() => {
        if (currentFile) {
            const fileData = currentFile.fileData
            const checkData = fileData?.boundary && fileData?.boundary?.length > 0
            if (checkData) {
                setIsFirst(false)

            } else {
                setIsFirst(true)
            }
        } else {
            setIsFirst(true)
        }

        return () => setIsFirst(false)
    }, [currentFile])


    const handleClickBack = useCallback(() => {
        push('/', '/', {locale})
    }, [push, locale])

    return (
        <div className={cx('tool-left-sideBar')}>
            {/* -------------------------------------------- Back button */}

            <div className={cx('content-flat')}>
                <button
                    data-class='label__page-tool__tool-left-sidebar__main-btn'
                    className={cx('content-flat__btn-back')} onClick={() => handleClickBack()}>
                    {t('back', { ns: 'common' })}
                </button>
            </div>

            <DividerTLS />

            {/* -------------------------------------------- Save button */}

            <div className={cx('content-flat')}>
                <AutoSaveData className={cx('content-flat__btn')}/>
            </div>

            <DividerTLS />

            {/* -------------------------------------------- Export button */}

            <div className={cx('content-flat')}>
                <ExportFile className={cx('content-flat__btn')}/>
            </div>

            <DividerTLS />

            {/* -------------------------------------------- Render House File List */}

            <ToolFileList>{toolFile}</ToolFileList>

            {/* -------------------------------------------- Label: Tools */}

            <DividerTLS
                content={
                    <ContentAccentColorTLS
                        id={'id-tool-label'}
                        label={t('tools', { ns: 'tool' })}
                    />
                }
            />

            {/* -------------------------------------------- Render Tool list */}

            <ToolListLeftSidebar isFirst={isFirst} />
        </div>
    )
}

export default React.memo(ToolLeftSidebar)

export interface ToolLeftSidebarProps {
    isShowTool: boolean
}
