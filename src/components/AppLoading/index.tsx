import React, { useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { AppContext } from '@/context/AppContext'

import styles from './AppLoading.module.scss'
import classNames from 'classnames/bind'
import Image from 'next/image'
const cx = classNames.bind(styles)

const speamLoadingS1 = '/assets/img/speam__loading-spinner--small-1.gif'
const speamLoadingS2 = '/assets/img/speam__loading-spinner--small-2.gif'

const AppLoading: React.FC = () => {
    const router = useRouter()

    const [pageLoading, setPageLoading] = useState<boolean>(false)
    const { setLoading } = useContext(AppContext)

    useEffect(() => {
        const handleRouteChange = (url: any) => {
            if (setLoading) setLoading(true)
            setPageLoading(true)
            return
        }

        const handleRouteComplete = (url: any) => {
            if (setLoading) setLoading(false)
            setPageLoading(false)
            return
        }

        router.events.on('routeChangeStart', handleRouteChange)
        router.events.on('routeChangeComplete', handleRouteComplete) // If the component is unmounted, unsubscribe

        // from the event with the `off` method:
        return () => {
            router.events.off('routeChangeStart', handleRouteChange)
            router.events.off('routeChangeComplete', handleRouteComplete)
        }
    }, [setLoading])
    
    return !pageLoading ? (
        <div></div>
    ) : (
        <div className={cx('app-loading')}>
                <Image
                    className={cx('app-loading__spinner')}
                    src={speamLoadingS1}
                    width={80}
                    height={80}
                    alt={'speam_loading'}
                />
            {/* <div className={cx('app-loading__content')}> */}
            {/* </div> */}
        </div>
    )
}

export default AppLoading
