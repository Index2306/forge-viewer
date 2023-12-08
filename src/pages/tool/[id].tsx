import React, {ReactNode, useCallback, useEffect, useState} from 'react';
import {GetStaticPaths, GetStaticProps} from "next";
import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import {useRouter} from "next/router";
import {useTranslation} from "next-i18next";
import Head from "next/head";
import {useAppDispatch, useAppSelector} from "@/hooks";
import {errorToast} from "@/helpers/Toast";
import {ToolContext} from "@/context/ToolContext";
import UserLayout from "@/components/Layouts/user";

import PageLoading from "@/components/AppLoading/PageLoading";
import { getFileById } from '@/store/actions/file.action';

const ToolPage = () => {
    const {query} = useRouter()
    const {id} = query;
    const {t} = useTranslation();
    const titlePage = `${t('tool')} | ${process.env.NEXT_PUBLIC_APP_NAME}`;
    const dispatch = useAppDispatch()
    // const {data, isSuccess, isFetching, isError, errorMessage} = useAppSelector(selectGetProject)
    const [files, setFiles] = useState<any[]>([])
    const [toolFile, setToolFile] = useState<ReactNode>(<></>)
    const [isOpenSidebar, setIsOpenSidebar] = useState<boolean>(false)
    const [fileSelected, setFileSelected] = useState<any | undefined>(undefined)
    const [distanceWiring, setDistanceWiring] = useState<number | undefined>(NaN)
    const [isToolReady, setIsToolReady] = useState<boolean>(false)

    const [progressUnit, setProgressUnit] = useState<number>(0)
    const [errUnit, setErrUnit] = useState<string | null>(null)
    useEffect(() => {
        dispatch(getFileById(id as string))
        return () => {
            setFiles([])
            setToolFile(<></>)
            setFileSelected(undefined)
            setIsOpenSidebar(false)
        }
    }, [])

    // After the data of current project is gotten from api
    // Should set the field GeneralData of this data as a pdfInfo and
    // save to the store

    return (
        <>
            <Head>
                <title>{titlePage}</title>
            </Head>
            <ToolContext.Provider value={{
                isOpenSideBar: isOpenSidebar,
                setIsOpenSideBar: setIsOpenSidebar,
                toolFile: toolFile,
                fileSelected: fileSelected,
                // openFile: onHandleOpenFile,
                // onHandleAddNewFile: onHandleAddNewFile,
                distanceWiring: distanceWiring,
                setDistanceWiring: setDistanceWiring,
                isToolReady: isToolReady,
                setIsToolReady: setIsToolReady,
                progressUnit: progressUnit,
                setProgressUnit: setProgressUnit,
                errUnit: errUnit,
                setErrUnit: setErrUnit
            }}>
                {/* <div>
                    {isFetching ? <PageLoading /> : null}
                    <ToolContainer key={fileSelected?.id} project={data} fileId={fileSelected?.id} isOpen={fileSelected?.projectIndex === 0} />
                </div> */}
            </ToolContext.Provider>
        </>
    );
};

export default ToolPage;

ToolPage.Layout = UserLayout;

export const getStaticProps: GetStaticProps = async ({ locale }) => {
    return {
        props: {
            ...(await serverSideTranslations(locale ?? "en", ["common", "config", "tool"]))
        }
    }
}

export const getStaticPaths: GetStaticPaths<{ id: string }> = async () => {

    return {
        paths: [], //indicates that no page needs be created at build time
        fallback: 'blocking' //indicates the type of fallback
    }
}

