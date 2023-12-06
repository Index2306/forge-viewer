import React, {useCallback, useContext, useState} from 'react'
import styles from './ExportFile.module.scss'
import { FaDownload } from 'react-icons/fa'
import { Popover } from 'antd'
import ExportOption from '@/components/Tool/ExportFile/ExportOption'
import { useTranslation } from 'next-i18next'
import {ToolContext} from "@/context/ToolContext";
import AppButton from '@/components/Button'

const ExportFile: React.FC<ExportFileProps> = ({className}) => {
    const { t } = useTranslation()
    const [open, setOpen] = useState(false)

    const {isToolReady} = useContext(ToolContext)

    const onHandleOpenPopover = useCallback(() => {
        if (!isToolReady) return;
        setOpen((prev) => !prev)
    }, [isToolReady])

    const exportData = {
        keyName: 'export_pdf',
        icon: <FaDownload />,
        name: t('export', {ns: 'common'})
    }

    return (
        <>
            <button
                data-class='label__page-tool__tool-left-sidebar__main-btn'
                className={className} onClick={onHandleOpenPopover}>
                {t('pdf_export', { ns: 'common' })}
            </button>

            {/* {open && (
            )} */}
            <ExportOption onOpenPopover={(value) => setOpen(value)} parentOpen={open} />

            {/* <div className={styles['export-file']} >
                <Popover
                    trigger='click'
                    content={<ExportOption onOpenPopover={(value) => setOpen(value)}/>}
                    open={open}
                    overlayClassName={styles['export-file__popover']}
                    arrow={false}
                    onOpenChange={onHandleOpenPopover}
                ></Popover>
            </div> */}
        </>
    )
}

export default React.memo(ExportFile)

export interface ExportFileProps {
    className: string
}
