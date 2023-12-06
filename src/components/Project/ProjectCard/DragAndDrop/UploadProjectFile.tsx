import React, {useCallback, useEffect, useState} from 'react';
import styles from "@/components/Project/ProjectCard/DragAndDrop/DragAndDrop.module.scss";
import {Icon} from "@chakra-ui/react";
import {FaUpload} from "react-icons/fa";
import {Upload} from "antd";
import {useTranslation} from "next-i18next";
import {UploadFileToProjectModel} from "@/models";
import {uploadFileToProject} from "@/store/actions/file.action";
import {useAppDispatch} from "@/hooks";
import {errorToast, successToast} from "@/helpers/Toast";

const {Dragger} = Upload;

const UploadProjectFile: React.FC<UploadProjectFileProps> = ({projectId, isCreate, addFileCreate}) => {
    const {t} = useTranslation()
    const [fileList, setFileList] = useState<any[]>([]);
    const [progress, setProgress] = useState(0);

    const dispatch = useAppDispatch()

    useEffect(() => {
        setFileList([])

        return () => {
            setProgress(0)
            setFileList([])
        }
    }, [isCreate]);


    const onUploadProjectFile = useCallback(
        async (componentsData: any) => {
            const {onSuccess, onError, file, onProgress} = componentsData;

            if (!isCreate && projectId) {
                const formData = new FormData()
                formData.append('file', componentsData.file as Blob);
                formData.append('key', "-1");
                formData.append('projectIndex', "-1");
                const dataUpload: UploadFileToProjectModel = {
                    projectId: projectId,
                    data: formData
                }
                const config: any = {
                    onUploadProgress: (event: any) => {
                        const percent = Math.floor((event.loaded / event.total) * 100);
                        setProgress(percent);
                        if (percent === 100) {
                            setTimeout(() => setProgress(0), 1000);
                        }
                        onProgress({percent: (event.loaded / event.total) * 100});
                    }
                }

                dispatch(uploadFileToProject({data: dataUpload, config: config}))
                    .unwrap()
                    .then(response => {
                        successToast(t('file_upload_success', {
                            name: componentsData.file.name,
                            project: componentsData.file.name
                        }));
                        onSuccess("Ok");

                        setFileList(oldFileList => [...oldFileList].filter(f => f.uid !== componentsData.file.uid));

                        if (addFileCreate) {
                            addFileCreate([response.result])
                        }
                    }).catch(err => {
                        errorToast(t('file_upload_error', {
                            name: componentsData.file.name,
                            project: componentsData.file.name
                        }))
                        onError({err});
                });
            }
        },
        [dispatch, isCreate, projectId, t, addFileCreate, fileList],
    );

    const onHandleDrop = (event: React.DragEvent) => {
        // if (!isCreate) {
        //     const newFileList: UploadFile[] = [...fileList, event.dataTransfer.files[0]];
        //     setFileList(newFileList)
        // } else if (addFileCreate) {
        //     console.log('event', event)
        //     // addFileCreate(event.dataTransfer.files[0])
        // }
    }

    const onHandleChange = (event: any) => {
        if (!isCreate) {
            setFileList(event.fileList)
        } else if (addFileCreate) {
            addFileCreate(event.fileList)
        }
    }

    return (
        <Dragger onChange={onHandleChange} fileList={fileList}
                 className={`${styles.custom} ${isCreate ? styles.customCreate : ''}`} onDrop={onHandleDrop}
                 maxCount={10} multiple={true} name='file' accept=".dwg" customRequest={onUploadProjectFile}>
            <p className="ant-upload-drag-icon">
                <Icon as={FaUpload} w={50} h={50} color={styles.primaryColor}/>
            </p>
            <p className={styles.info}>
                {t('drag_and_drop')}
            </p>
        </Dragger>
    );
};

export default UploadProjectFile;

export interface UploadProjectFileProps {
    projectId: string | undefined,
    isCreate?: boolean,
    addFileCreate?: (fileList: any[]) => void
}
