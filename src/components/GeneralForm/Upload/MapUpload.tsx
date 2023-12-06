import React, {useEffect, useState} from 'react';
import {useTranslation} from "next-i18next";
import {UploadFile} from "antd/es/upload/interface";
import {getBase64} from "@/helpers/StringHelper";
import {RcFile, UploadProps} from "antd/es/upload";
import {toast} from "react-toastify";
import styles from "./Upload.module.scss";
import {Image, Upload} from "antd";
import {useAppSelector} from "@/hooks";
import {removeCache, selectCache} from "@/store/slices/cache.slice";
import Cookies from "js-cookie";
import AppImageAntd from "@/components/AppImage/AppImageAntd";

const MapUpload : React.FC<MapUploadProps> = ({onChangeFile, initFile, className, description, recommend, recommendClass}) => {
    const {t} = useTranslation();
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [fileList, setFileList] = useState<UploadFile[]>(initFile ?? []);
    const [isReload, setIsReload] = useState<boolean>(false);
    const {thumbnail: cache} = useAppSelector(selectCache)

    useEffect(() => {
        if (initFile) {
            const initData = initFile.map((data: any) => {
                const base64 = cache && cache[data.url];
                return {
                    ... data,
                    url: base64 ? base64 : data.url
                }
            });
            setFileList(initData);
            if (!initFile || initFile?.length < 1) setPreviewImage('');
            else {
                setPreviewImage(initData[0]?.url)
            }

            setIsReload(true)
        } else {
            setFileList([]);
            setPreviewImage('');
            setIsReload(false)
        }
    }, [initFile, cache])

    const handleCancel = () => setPreviewOpen(false);

    const handlePreview = async (file: UploadFile) => {
        if (file?.url?.includes('base64')) {
            setPreviewImage(file.url);
        }
        else {
            if (!file.url && !file.preview) {
                file.preview = await getBase64(file.originFileObj as RcFile);
            }
            setPreviewImage(file?.url || (file?.preview as string));
        }

        setPreviewOpen(true);
    };

    const handleChange: UploadProps['onChange'] = async ({ fileList: newFileList }) => {
        setFileList(newFileList);
        if (onChangeFile) {
            if (newFileList.length < 1) {
                onChangeFile(undefined, '')
            } else {
                onChangeFile(newFileList[0].originFileObj,  await getBase64(newFileList[0].originFileObj as RcFile));
            }
        }
    }

    const beforeUpload = (file: RcFile) => {
        const isPNG = file.type === 'image/png' || file.type === 'image/gif' || file.type === 'image/jpeg';
        if (!isPNG) {
            toast.error(t('not_png_file', {name: file.name}), {
                position: "top-right",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored",
                style: {backgroundColor: styles.error}
            });

        }
        return false;
    }

    const uploadButton = (
        <div className={styles.thumbnail}>
            <div>{description ? description : t('customer_map')}</div>
        </div>
    );

    return (
        <>
            <Upload
                accept="image/png, image/gif, image/jpeg"
                className={`${className ? className : styles.mapUpload}`}
                listType="picture-card"
                fileList={fileList}
                onPreview={handlePreview}
                onChange={handleChange}
                multiple={false}
                beforeUpload={beforeUpload}
            >
                {fileList.length >= 1 ? null : uploadButton}
            </Upload>
            {recommend ? <span className={`${styles.recommended} ${recommendClass ? recommendClass : ''}`}>{recommend}</span> : null}

            <AppImageAntd
                width={200}
                style={{ display: 'none' }}
                url={previewImage}
                alt={'Preview Thumbnail'}
                token={Cookies.get('access_token')}
                isReload={isReload}
                preview={{visible: previewOpen,
                    scaleStep: 0.5,
                    src: previewImage,
                    onVisibleChange: (value: boolean) => {
                        setPreviewOpen(value);
                    }}
                }
            />

            {/*<Image*/}
            {/*    width={200}*/}
            {/*    style={{ display: 'none' }}*/}
            {/*    src={previewImage}*/}
            {/*    alt='Preview Thumbnail'*/}
            {/*    preview={{*/}
            {/*        visible: previewOpen,*/}
            {/*        scaleStep: 0.5,*/}
            {/*        src: previewImage,*/}
            {/*        onVisibleChange: (value) => {*/}
            {/*            setPreviewOpen(value);*/}
            {/*        },*/}
            {/*    }}*/}
            {/*/>*/}
        </>
    );
};

export default MapUpload;

export interface MapUploadProps {
    onChangeFile?: (file: RcFile | undefined, thumbnail: string) => void,
    initFile?: UploadFile[],
    className?: string,
    description?: any,
    recommend?: any
    recommendClass?: string
}