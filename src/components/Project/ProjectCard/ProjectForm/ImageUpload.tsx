import React, {useEffect, useState} from 'react';
import {Upload, Image} from 'antd';
import type { RcFile, UploadProps } from 'antd/es/upload';
import type { UploadFile } from 'antd/es/upload/interface';
import styles from "./ProjectForm.module.scss";
import {useTranslation} from "next-i18next";
import {autoLineBreakText, getBase64} from "@/helpers/StringHelper";
import {toast} from "react-toastify";
import AppImageAntd from "@/components/AppImage/AppImageAntd";
import Cookies from "js-cookie";
import {useAppSelector} from "@/hooks";
import {selectCache} from "@/store/slices/cache.slice";
import TooltipApp from "@/components/TooltipApp";

const ImageUpload: React.FC<{onChangeFile?: (file: RcFile | undefined, thumbnail: string) => void, initFile?: UploadFile[]}> = ({onChangeFile, initFile}) => {
    const {t} = useTranslation();
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [fileList, setFileList] = useState<UploadFile[]>(initFile ?? []);
    const {thumbnail: cache} = useAppSelector(selectCache)

    useEffect(() => {
        if (initFile) {
            setFileList(initFile.map((data: any) => {
                const base64 = cache && cache[data.url];
                return {
                    ... data,
                    url: base64 ? base64 : data.url
                }
            }));
            if (initFile?.length < 1) setPreviewImage('');
        } else {
            setFileList([]);
            setPreviewImage('');
        }
    }, [initFile])

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
        <TooltipApp placement="top" title={<div dangerouslySetInnerHTML={{__html: autoLineBreakText(t('insert_picture_here'))}}></div>} align={{ offset: [0, 50]  }} color={styles.primaryColor}>
            <div className={styles.thumbnail}>
                {/*<Image src='/assets/img/fallback-img.png' alt='fallback' width={200} height={220}/>*/}
                {/*<Icon className={styles.iconUpload} as={AiOutlinePlus} boxSize={20} />*/}
                {/*<div>Upload Thumbnail</div>*/}
            </div>
        </TooltipApp>
    );

    return (
        <>
            <Upload
                accept="image/png, image/gif, image/jpeg"
                className={styles.imageUpload}
                listType="picture-card"
                fileList={fileList}
                onPreview={handlePreview}
                onChange={handleChange}
                multiple={false}
                beforeUpload={beforeUpload}
            >
                {fileList.length >= 1 ? null : uploadButton}
            </Upload>
            <span className={styles.recommended}>{t('recommended_size')}</span>

            <AppImageAntd
                width={200}
                style={{ display: 'none' }}
                url={previewImage}
                alt={'Preview Thumbnail'}
                token={Cookies.get('access_token')}
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

export default ImageUpload;
