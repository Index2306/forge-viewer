import React, {ReactNode, useCallback, useContext, useEffect, useState} from 'react';
import UserLayout from "@/components/Layouts/user";
import {GetStaticProps} from "next";
import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import {useRouter} from "next/router";
import {useTranslation} from "next-i18next";
import {HomeContext} from "@/context/HomeContext";
import TitlePage from "@/components/TitlePage";
import styles from "@/styles/Create.module.scss";
import Head from "next/head";
import {TabItem} from "@/components/AppTab";
import ConfigPage from "@/components/Project/ConfigPage";
import ProjectCreate from "@/components/Project/ProjectCreate";
import {ConfigItem} from "@/components/Project/ConfigPage/ConfigList";

const CreateProjectPage = () => {
    const {locale, push} = useRouter()
    const {t} = useTranslation();

    const [checkedList, setCheckedList] = useState<string[]>([]);
    const [activeKey, setActiveKey] = useState<string>('1');
    const [pageName, setPageName] = useState<string>('project_config');

    const titlePage = `${t(pageName)} | ${process.env.NEXT_PUBLIC_APP_NAME}`;

    const {setHeadElement, setIsTool} = useContext(HomeContext)

    const elementHeader = useCallback((): ReactNode => {
        return <TitlePage pageName='my_documents' name={pageName} />
    }, [pageName])

    useEffect(() => {
        setActiveKey('1')
        setCheckedList([])

        return () => {
            setActiveKey('1')
            setCheckedList([])
        }
    }, [])

    useEffect(() => {
        if (setIsTool) {
            setIsTool(false)
        }

        setHeadElement(elementHeader())

        return () => {
            if (setIsTool) {
                setIsTool(false)
            }
        }
    }, [setHeadElement, t, setIsTool, pageName])


    const onCheck = useCallback(
        (record: ConfigItem) => {
            const id = record.key;
            if (!checkedList.includes(id)) {
                if (record.unique && record.unique.length > 0) {
                    setCheckedList(prev => [...prev, id].filter(v1 => !record.unique?.includes(v1)))
                    return;
                }
                setCheckedList(prev => [...prev, id])
            } else {
                setCheckedList(prev => [...prev].filter(v => v !== id))
            }
        },
        [checkedList],
    );

    // const onHandleBackToListPage = useCallback(() => {
    //     push('/', '/', {locale})
    // }, [locale, push])

    const onNextPage = useCallback(
        () => {
            setActiveKey('2')
            onHandleSetPageName('2')
        },
        [],
    );

    const onHandleSetPageName = (key: string) => {
        if (key === "1") setPageName('project_config');
        else if (key === "2") setPageName('project_new');
    }

    return (
        <>
            <Head>
                <title>{titlePage}</title>
            </Head>
            <div className={styles.container}>
                <div className={`${styles.contentTab} ${activeKey === '1' ? styles.active : ''}`}>
                    <ConfigPage checkedList={checkedList} onCheck={onCheck} onNext={onNextPage}/>
                </div>
                <div className={`${styles.contentTabCreate} ${activeKey === '2' ? styles.active : ''}`}>
                    <ProjectCreate checkedList={checkedList}/>
                </div>
            </div>
        </>
    );
};

export default CreateProjectPage;

CreateProjectPage.Layout = UserLayout;

export const getStaticProps: GetStaticProps = async ({locale}) => {
    return {
        props: {
            ...(await serverSideTranslations(locale ?? "en", ["common", "config"]))
        }
    }
}
