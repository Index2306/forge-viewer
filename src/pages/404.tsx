import React from 'react'
import { Result } from 'antd'
import { useTranslation } from 'next-i18next'
import Link from 'next/link'
import { GetStaticPaths, GetStaticProps } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import AppButton from '@/components/Button'

import styles from '../styles/404.module.scss'
import classNames from 'classnames/bind'
import Image from 'next/image'
const cx = classNames.bind(styles)

const page404Icon = '/assets/icons/icon_break-01.svg'
const leftArrowIcon = '/assets/icons/icon_arrow-left_thin.svg'

const NotFoundPage = () => {
    const { t } = useTranslation()

    return (
        <div className={cx('page-404')}>
            <Result
                icon={
                    <div className={cx('page-404__page-icon-wrapper')}>
                        <Image src={page404Icon} width={120} height={120} alt='page_404' style={{margin: '0 auto'}} />
                    </div>
                }
                title={<div className={cx('page-404__title-wrapper')}>404</div>}
                subTitle={
                    <div className={cx('page-404__sub-title-wrapper')}>{t('page_not_found')}</div>
                }
                extra={
                    <div className={cx('page-404__btn-wrapper')}>
                        <Link href='/'>
                            <AppButton
                                largeWidth
                                icon={
                                    <Image
                                        src={leftArrowIcon}
                                        width={16}
                                        height={16}
                                        alt='left_arrow_icon'
                                    />
                                }
                            >
                                {t('back')}
                            </AppButton>
                        </Link>
                    </div>
                }
            />
        </div>
    )
}

export default NotFoundPage

export const getStaticProps: GetStaticProps = async ({ locale }) => {
    return {
        props: {
            ...(await serverSideTranslations(locale ?? 'en', ['common'])),
        },
    }
}
