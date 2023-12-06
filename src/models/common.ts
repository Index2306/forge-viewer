import {ReactElement, ReactNode} from "react";
import {NextPage} from "next";
import {AppProps} from "next/app";
import {TFunction} from "next-i18next";

export interface LayoutProps {
    children: ReactNode,
}

export type NextPageWithLayout = NextPage & {
    Layout?: (props: LayoutProps) => ReactElement
}

export type AppPropsWithLayout = AppProps & {
    Component: NextPageWithLayout
}

export interface NewFieldType {
    name: string,
    value?: string | null,
    hide: boolean
}

export interface SortType {
    name: string,
    status: number
}