import React from 'react'
import Image from 'next/image'

import styles from './AppLoading.module.scss'
import classNames from 'classnames/bind'

const cx = classNames.bind(styles)

const speamLoadingS1 = '/assets/img/speam__loading-spinner--small-1.gif'
const speamLoadingS2 = '/assets/img/speam__loading-spinner--small-2.gif'

const LOADING_TYPE = {
    small1: speamLoadingS1,
    small2: speamLoadingS2,
}

const DataLoading: React.FC<DataLoadingProps> = ({ title, size, type = 'small1' }) => {
    const src = type === 'small1' ? LOADING_TYPE.small1 : LOADING_TYPE.small2

    return (
        <div className={cx('data-loading')}>
            <div className={cx('data-loading__content')}>
                <Image
                    className={cx('data-loading__spinner')}
                    src={src}
                    width={80}
                    height={80}
                    alt={'speam_loading'}
                />
                <div className={cx('data-loading__title')}>{title}</div>
            </div>
        </div>
    )
}

export default DataLoading

interface DataLoadingProps {
    title?: any
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'xs' | undefined
    type?: 'small1' | 'small2'
}
