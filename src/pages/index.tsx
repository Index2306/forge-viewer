import Head from 'next/head'
import UserLayout from "@/components/Layouts/user";
import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";
import React, { useMemo, useCallback, useContext, useEffect, useState } from "react";
import { useTranslation } from "next-i18next";
import { Space, Spin, Table, Tooltip, Upload, UploadProps, message } from "antd";
import { useAppDispatch, useAppSelector } from "@/hooks";
import AppEmpty from "@/components/Empty";
import DataLoading from "@/components/AppLoading/DataLoading";
import { HomeContext } from "@/context/HomeContext";
import { EyeOutlined, SyncOutlined, UploadOutlined } from "@ant-design/icons";

import styles from '@/styles/Home.module.scss';
import classNames from 'classnames/bind';
import Image from 'next/image';
import IconAction from '@/components/IconAction';
import PageLoading from "@/components/AppLoading/PageLoading";
import Button from '@/components/Button';
import { toast } from 'react-toastify';
import { RcFile } from 'antd/es/upload';
import { getAllfile, uploadFileToProject } from '@/store/actions/file.action';
const cx = classNames.bind(styles)

function Home() {
    const { locale, push } = useRouter()

    const { t } = useTranslation();
    const titlePage = process.env.NEXT_PUBLIC_APP_NAME;
    const props: UploadProps = {
        accept: ".dwg",
        maxCount: 10,
        multiple: true,
        name: 'file',
        action: undefined,
        beforeUpload: (file) => {
            const isDwg = file.type !== '.dwg';
            if (!isDwg) {
                message.error(t('is_not_dwg_file', { name: file.name }));
            } else {

            }
            return false;
        },
    };

    const { setHeadElement } = useContext(HomeContext)
    const [isLoadData, setIsLoadData] = useState<boolean>(false);
    const [listFile, setListFile] = useState<any>([])

    const dispatch = useAppDispatch()

    // ------------------------------------------------------ Render Element Header

    useEffect(() => {

        return () => {
            setIsLoadData(false)
        }
    }, [setHeadElement])

    useEffect(() => {
        setIsLoadData(false)
        dispatch(getAllfile()).unwrap().then((res: any) => {
            setListFile(res.result.files)
        })
    }, [])

    const onHandleUploadFile = (file: RcFile) => {
        const formData = new FormData()
        formData.append('file', file as Blob);
        formData.append('key', "-1");
        formData.append('projectIndex', "-1");
        const dataUpload: any = {
            projectId: '831e056d-370b-4511-98fb-be8d3dbc26ff',
            data: formData
        }

        const promiseApi = dispatch(uploadFileToProject({ data: dataUpload })).unwrap().then((res: any) => {
            console.log(res.result)
        })
        toast.promise(
            promiseApi,
            {
                pending: t('file_is_uploading'),
                success: t('upload_success'),
                error: t('upload_failed')
            }
        )
    }

    const handleEditFile = (text: any) => {
        push(`/tool/${text}`, `/tool/${text}`, { locale })  
    }
    const columns = useMemo(() => {
        return [
            {
                title: 'Id',
                dataIndex: 'id',
                key: 'id',
            },
            {
                title: 'Name',
                dataIndex: 'name',
                key: 'name',
            },
            {
                title: 'Action',
                dataIndex: 'id',
                key: 'id',
                render: (text: any) => (<EyeOutlined onClick={() => handleEditFile(text)}/>)
            }
        ]
    }, [t])

    return (
        <>
            <Head>
                <title>{titlePage}</title>
            </Head>
            <div className={styles.container}>
                <Upload {...props}>
                    <Button icon={<UploadOutlined />}>Click to Upload</Button>
                </Upload>
                <Table
                    style={{ width: '100%' }}
                    columns={columns}
                    dataSource={listFile}
                />
            </div>
        </>
    )
}

Home.Layout = UserLayout;

export default Home;

export const getStaticProps: GetStaticProps = async ({ locale }) => {
    return {
        props: {
            ...(await serverSideTranslations(locale ?? "en"))
        }
    }
}
