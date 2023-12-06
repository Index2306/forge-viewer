import { AppPropsWithLayout } from '@/models'
import EmptyLayout from '@/components/Layouts/empty'
import Head from 'next/head'
import { ChakraProvider, extendTheme } from '@chakra-ui/react'
import { wrapper } from '@/store/store'
import { Provider } from 'react-redux'
import { appWithTranslation } from 'next-i18next'
import React, { useEffect, useState } from 'react'
import AppLoading from '@/components/AppLoading'
import { useRouter } from 'next/router'
import Cookies from 'js-cookie'
import { ToastContainer } from 'react-toastify'
import { AppContext } from '@/context/AppContext'
import { ConfigProvider } from 'antd'
import { ANT_THEME } from '@/contants/common'

// Setup global SCSS file
import '@/styles/globals.scss'

// Setup global react-toastify style
import 'react-toastify/dist/ReactToastify.css'
import { BrowserType } from '@/models/browser'


// Setup to remove chakra fonts
const chakraTheme = extendTheme({
    styles: {
        global: () => ({
            body: {
                fontFamily: '',
            },
        }),
    },
})

function App({ Component, ...rest }: AppPropsWithLayout) {
    const { locale } = useRouter()
    const { store, props } = wrapper.useWrappedStore(rest)
    const { pageProps } = props

    // -----------------------------------------------------------

    const [browser, setBrowser] = useState<BrowserType>('Unknown')

    useEffect(() => {
        function getBrowserName() {
            var userAgent = window?.navigator?.userAgent;
            if (userAgent.includes("Firefox")) {
                return "Firefox";
            } else if (userAgent.includes("Chrome")) {
                return "Chrome";
            } else if (userAgent.includes("Safari")) {
                return "Safari";
            } else if (userAgent.includes("Edge")) {
                return "Microsoft Edge";
            } else {
                return "Unknown";
            }
        }

        setBrowser(getBrowserName())
    }, [])

    // -----------------------------------------------------------
    const [isLoading, setIsLoading] = useState<boolean>(false)

    const setLoading = (value: boolean) => {
        setIsLoading(value)
    }

    const Layout = Component.Layout ?? EmptyLayout

    useEffect(() => {
        Cookies.set('app_locale', locale ?? 'en')
    }, [locale])

    return (
        <main>
            <Provider store={store}>
                <Layout>
                    <Head>
                        <meta name='viewport' content='width=device-width, initial-scale=1' />
                    </Head>
                    <ConfigProvider theme={ANT_THEME}>
                        <ChakraProvider
                            theme={
                                chakraTheme
                            } /* should use property 'resetCSS=false' to check before remove chakra UI */
                        >
                            <AppContext.Provider value={{ isLoading, setLoading, browser }}>
                                <div style={{position: 'relative'}}>
                                {/* Support for App loading... */}
                                    <AppLoading />
                                    <Component {...pageProps} />
                                    <ToastContainer />
                                </div>
                            </AppContext.Provider>
                        </ChakraProvider>
                    </ConfigProvider>
                </Layout>
            </Provider>
        </main>
    )
}

export default appWithTranslation(App)
