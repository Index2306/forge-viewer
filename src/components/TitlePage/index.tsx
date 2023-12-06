import React, { ReactNode, useEffect, useState } from 'react'
import { useTranslation } from 'next-i18next'

import styles from './TitlePage.module.scss'
import classNames from 'classnames/bind'
import { SearchOutlined } from '@ant-design/icons'
import { SearchBarApp } from '../SearchBarApp'
const cx = classNames.bind(styles)

const TitlePage: React.FC<TitlePageProps> = ({ pageName, name, search, createButton }) => {
    const { t } = useTranslation()
    const [first, setFirst] = useState<string>('')
    const [second, setSecond] = useState<string>('')
    const [searchValue, setSearchValue] = useState<string>('')

    useEffect(() => {
        const translation = t(pageName)
        if (translation) {
            const arr = translation.split(' ')
            if (arr.length > 0) {
                setFirst(arr[0])

                if (arr.length > 1) {
                    setSecond(translation.replace(arr[0], ''))
                }
            }
        }

        return () => {
            setSearchValue('')
        }
    }, [t])

    const handleChangeSearch = (value: string) => {
        setSearchValue(value)
        if (search) {
            search(value)
        }
    }

    return (
        <div className={cx('title-page')}>
            <div className={cx('title-page__title-name')}
                 data-class='label__title-page__title-name'
            >
                <span className={cx('title-page__title-name__first-name')}>{first}</span>
                <span className={cx('title-page__title-name__second-name')}>{second}</span>
                <span className={cx('title-page__title-name__divider')}>|</span>
                <span className={cx('title-page__title-name__name')}>{t(name)}</span>
            </div>
            <div className={cx('title-page__functions')}>
                {/* ------------------------------------------------ Button custom */}
                <div className={cx('title-page__functions-btn')}>{createButton}</div>

                {/* ------------------------------------------------ Search bar */}
                { search ?
                    (<div className={cx('title-page__functions-search-bar')}>
                        <SearchBarApp searchValue={searchValue} onChangeSearch={handleChangeSearch} placeholder={`${t('search')}...`}/>
                    </div>
                ) : null}
            </div>
        </div>
    )
}

export default TitlePage

export interface TitlePageProps {
    pageName?: any | undefined
    name?: any | undefined
    search?: (value: string | undefined) => void
    createButton?: ReactNode | undefined
}
