import { autoLineBreakText } from '@/helpers/StringHelper'
import { Alert } from 'antd'
import { useTranslation } from 'react-i18next'
import React from 'react'

import styles from './ToolContainer.module.scss'
import classNames from 'classnames/bind'
const cx = classNames.bind(styles)

export default function WarningChangeUnitBanner() {
    const { t } = useTranslation('tool')

    return (
        <div className={cx('warning-change-unit')}>
            <Alert
                className={cx('warning-change-unit__alert')}
                description={
                    <div
                        dangerouslySetInnerHTML={{
                            __html: autoLineBreakText(
                                t('desc_drawing_units', {
                                    ns: 'tool',
                                    tools: t('tools'),
                                    setUnit: t('set_unit', { ns: 'tool' }),
                                }),
                            ),
                        }}
                    ></div>
                }
                banner
            />
        </div>
    )
}

interface WarningChangeUnitBannerProps {
}
