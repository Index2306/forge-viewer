import Head from 'next/head'
import UserLayout from "@/components/Layouts/user";
import {GetStaticProps} from "next";
import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import {useRouter} from "next/router";
import React, {ReactNode, useCallback, useContext, useEffect, useState} from "react";
import {useTranslation} from "next-i18next";
import {Space, Spin, Tooltip} from "antd";
import {useAppDispatch, useAppSelector} from "@/hooks";
import AppEmpty from "@/components/Empty";
import DataLoading from "@/components/AppLoading/DataLoading";
import {HomeContext} from "@/context/HomeContext";
import {SyncOutlined} from "@ant-design/icons";

import styles from '@/styles/Home.module.scss';
import classNames from 'classnames/bind';
import Image from 'next/image';
import IconAction from '@/components/IconAction';
import PageLoading from "@/components/AppLoading/PageLoading";
const cx = classNames.bind(styles)

function Home() {
    const {locale} = useRouter()

    const {t} = useTranslation();
    const titlePage = process.env.NEXT_PUBLIC_APP_NAME;

    const {setHeadElement} = useContext(HomeContext)
    const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
    const [search, setSearch] = useState<string | undefined>(undefined);
    const [isLoadData, setIsLoadData] = useState<boolean>(false);

    const dispatch = useAppDispatch()

    // ------------------------------------------------------ Render Element Header

    useEffect(() => {

        return () => {
            setIsOpenModal(false)
            setSearch(undefined)
            setIsLoadData(false)
        }
    }, [setHeadElement])

    useEffect(() => {
        setIsOpenModal(false)
        setSearch(undefined)
        setIsLoadData(false)
    }, [])

    return (
        <>
            <Head>
                <title>{titlePage}</title>
            </Head>
            <div className={styles.container}>
            </div>
        </>
    )
}

Home.Layout = UserLayout;

export default Home;

export const getStaticProps: GetStaticProps = async ({locale}) => {
    return {
        props: {
            ...(await serverSideTranslations(locale ?? "en"))
        }
    }
}
