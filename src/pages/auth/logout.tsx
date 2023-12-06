import React, {useEffect} from 'react';
import {useDispatch} from "react-redux";
import {useRouter} from "next/router";
import {logoutAuthAction} from "@/store/slices/auth.slice";
import styles from '@/styles/Login.module.scss';
import {useTranslation} from "next-i18next";
import Image from "next/image";
import Head from "next/head";

const LogOut = () => {
    const {locale, locales, push} = useRouter();
    const dispatch = useDispatch();
    const {t} = useTranslation();

    const titlePage = `${t('logout')} | ${process.env.NEXT_PUBLIC_APP_NAME}`;

    useEffect(() => {
        dispatch(logoutAuthAction());
        push('/auth/login', '/auth/login', {locale: locale})
    }, [])

    return (
        <>
            <Head>
                <title>{titlePage}</title>
            </Head>
            <div className={styles.logout}>
                <Image src='/assets/img/logo_speamplan--black.svg' alt="logo" width={300} height={1000}/>
                <h2>{t('logout')}...</h2>
            </div>
        </>
    );
};

export default LogOut;
