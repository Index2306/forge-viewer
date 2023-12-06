import React, { useEffect, useState } from 'react'
import styles from './ExportFile.module.scss'
import { Select } from 'antd'
import { useTranslation } from 'next-i18next'
import ViewerPdfExport from '@/Pdf/ViewerPdfExport'
import { PdfCompressOption } from '@/Pdf'
import { useAppSelector } from '@/hooks'
import { selectTool } from '@/store/slices/tool/tool.slice'
import useViewerPDF from '@/Pdf/hook/useViewerPdf'

const Export = {
    PDF: 'pdf',
    DWG: 'dwg',
}

const ExportOption: React.FC<ExportOptionProps> = ({ onOpenPopover, parentOpen }) => {
    const { t } = useTranslation()

    const { getScalePdfFirstTime } = useViewerPDF()

    const [quality, setQuality] = useState<string>('MEDIUM')
    const [openType, setOpenType] = useState<string | undefined>(undefined)

    const { currentFile } = useAppSelector(selectTool)

    // Support for get scale the first time
    const [scaleFirstTime, setScaleFirstTime] = useState<boolean>(false)
    const [pdfOpenFirstTime, setPdfOpenFirstTime] = useState<boolean>(false)

    const onHandleExportDWG = (document: string) => {
        onOpenPopover(false) // close pop over
        setOpenType(document)
    }

    const onHandleExportPDF = (document: string) => {
        onOpenPopover(false) // close pop over
        setOpenType(document)
    }

    // ----------------------------- Handle Open Export PDF
    useEffect(() => {
        if (parentOpen) {
            // Support for get scale the first time
            let milliseconds = 0

            if (!scaleFirstTime) {
                getScalePdfFirstTime()
                milliseconds = 500
            }

            // Support for get scale the first time
            setTimeout(() => {
                onHandleExportPDF(Export.PDF)

                if (!pdfOpenFirstTime && !scaleFirstTime) {
                    setPdfOpenFirstTime(true)
                }
            }, milliseconds)
        }
    }, [parentOpen, scaleFirstTime])

    return (
        <div>
            {/* <button
                className={`${styles.title}`}
                onClick={() => onHandleExportDWG(Export.DWG)}
                disabled={!Boolean(currentFile?.fileData?.boundary)}
            >
                DWG
            </button>
            <div className={styles.titleDivider}></div>
            <button
                className={styles.title} onClick={() => onHandleExportPDF(Export.PDF)}
                disabled={!Boolean(currentFile?.fileData?.boundary)}
            >
                PDF
            </button>
            <div className=''>
                <span className={styles.desc}>{t('file_quality')}:</span>
            </div>
            <Select
                defaultValue={quality}
                value={quality}
                style={{ width: 100 }}
                onChange={(value) => setQuality(value)}
                options={[
                    { value: 'FAST', label: t('low') },
                    { value: 'MEDIUM', label: t('normal') },
                    { value: 'SLOW', label: t('high') },
                ]}
            /> */}
            {/* ---------------------------- */}
            {/*        Modal of Pdf          */}
            {/* ---------------------------- */}
            <ViewerPdfExport
                open={openType === Export.PDF}
                onClose={setOpenType}
                compressOption={quality as PdfCompressOption}
                pdfOpenFirstTime={pdfOpenFirstTime}
                setScaleFirstTime={setScaleFirstTime}
                scaleFirstTime={scaleFirstTime}
            />
        </div>
    )
}

export default React.memo(ExportOption)

export interface ExportOptionProps {
    onOpenPopover: (value: boolean) => void
    parentOpen?: boolean
}
