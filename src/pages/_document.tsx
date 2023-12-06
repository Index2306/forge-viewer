import { Html, Head, Main, NextScript } from 'next/document'
import { ColorModeScript } from '@chakra-ui/react'

export default function Document() {
    return (
        <Html lang='en'>
            <Head>
                <meta name='description' content={process.env.NEXT_PUBLIC_APP_NAME} />
                <link rel='icon' href='/icon.png' />
            </Head>
            <body>
                <ColorModeScript />
                <Main />
                <NextScript />
            </body>
        </Html>
    )
}
