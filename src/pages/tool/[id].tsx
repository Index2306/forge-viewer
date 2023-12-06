import React, {ReactNode, useCallback, useEffect, useState} from 'react';
import {GetStaticPaths, GetStaticProps} from "next";
import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import {useRouter} from "next/router";
import {useTranslation} from "next-i18next";
import Head from "next/head";
import ToolLayout from "@/components/Layouts/tool";
import {useAppDispatch, useAppSelector} from "@/hooks";
import {selectGetProject} from "@/store/slices/project/get-project.slice";
import {getProjectById} from "@/store/actions/project.action";
import {UserFile} from "@/models";
import {errorToast} from "@/helpers/Toast";
import ToolContainer from "@/components/Tool/ToolContainer";
import ToolFile from "@/components/Tool/ToolFile";
import {ToolContext} from "@/context/ToolContext";
import {addPdfInformation, clearTool, selectTool} from "@/store/slices/tool/tool.slice";

import PageLoading from "@/components/AppLoading/PageLoading";

const ToolPage = () => {
    const {query} = useRouter()
    const {id} = query;
    const {t} = useTranslation();
    const titlePage = `${t('tool')} | ${process.env.NEXT_PUBLIC_APP_NAME}`;
    const dispatch = useAppDispatch()
    const {data, isSuccess, isFetching, isError, errorMessage} = useAppSelector(selectGetProject)
    const [files, setFiles] = useState<UserFile[]>([])
    const [toolFile, setToolFile] = useState<ReactNode>(<></>)
    const [isOpenSidebar, setIsOpenSidebar] = useState<boolean>(false)
    const [fileSelected, setFileSelected] = useState<UserFile | undefined>(undefined)
    const [distanceWiring, setDistanceWiring] = useState<number | undefined>(NaN)
    const [isToolReady, setIsToolReady] = useState<boolean>(false)

    const [progressUnit, setProgressUnit] = useState<number>(0)
    const [errUnit, setErrUnit] = useState<string | null>(null)

    const {pdfInfo} = useAppSelector(selectTool)

    useEffect(() => {
        dispatch(getProjectById(id as string))
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
    useEffect(() => {
        if (data && isSuccess && !pdfInfo) {
            dispatch(addPdfInformation({ ...data.generalData[0] }))
        }
    }, [data, isSuccess, pdfInfo])

    useEffect(() => {
        if (data && isSuccess) {
            const reverseList = [...data.files].reverse();
            setFiles(reverseList)
            setToolFile(<ToolFile files={reverseList} projectId={`${id}`}/>)
        }
    }, [data, isSuccess])

    useEffect(() => {
        if (files?.length > 0 && fileSelected === undefined) {
            setFileSelected(files[files.length - 1])
        }
    }, [files])

    useEffect(() => {
        if (isError) {
            errorMessage.map((err: string) => errorToast(err))
        }
    }, [isError, errorMessage])

    const onHandleOpenFile = useCallback((file: UserFile) => {
        if (file.id !== fileSelected?.id) {
            dispatch(clearTool());
            setFileSelected(file)
        }
    }, [dispatch, fileSelected])

    const onHandleAddNewFile = useCallback((newFile: UserFile) => {
        const newArrFile =  [newFile, ...files]
        setFiles(newArrFile);
        if (files.length < 1) {
            onHandleOpenFile(newFile)
        }

        setToolFile(<ToolFile files={newArrFile} projectId={`${id}`}/>)
    }, [files, onHandleOpenFile])

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
                openFile: onHandleOpenFile,
                onHandleAddNewFile: onHandleAddNewFile,
                distanceWiring: distanceWiring,
                setDistanceWiring: setDistanceWiring,
                isToolReady: isToolReady,
                setIsToolReady: setIsToolReady,
                progressUnit: progressUnit,
                setProgressUnit: setProgressUnit,
                errUnit: errUnit,
                setErrUnit: setErrUnit
            }}>
                <div>
                    {isFetching ? <PageLoading /> : null}
                    <ToolContainer key={fileSelected?.id} project={data} fileId={fileSelected?.id} isOpen={fileSelected?.projectIndex === 0} />
                </div>
            </ToolContext.Provider>
        </>
    );
};

export default ToolPage;

ToolPage.Layout = ToolLayout;

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

