import React, { ReactNode, useCallback, useContext, useEffect, useRef, useState } from 'react';
import styles from "./ToolFile.module.scss";
import Image from "next/image";
import { UploadFileToProjectModel, UserFile } from "@/models";
import { ToolContext } from "@/context/ToolContext";
import ToolFileItem from "@/components/Tool/ToolFile/ToolFileItem";
import { useAppDispatch, useAppSelector } from '@/hooks';
import { selectTool } from '@/store/slices/tool/tool.slice';
import { Col, Row } from "antd";
import { RcFile } from "antd/es/upload";
import { uploadFileToProject } from "@/store/actions/file.action";
import { toast } from "react-toastify";
import { useTranslation } from "next-i18next";

const ToolFile: React.FC<ToolFileProps> = ({ projectId, files }) => {
    const { isOpenSideBar, openFile, setDistanceWiring, onHandleAddNewFile } = useContext(ToolContext)

    const { t } = useTranslation()
    const currentFileIdRef = useRef<any>(null)

    const { currentFile } = useAppSelector(selectTool)
    const dispatch = useAppDispatch()
    const [fileList, setFileList] = useState<UserFile[] | undefined>([])

    useEffect(() => {
        setFileList(files)
    }, [files])

    // -----------------------------------------------------------------
    // Helper to prevent open current file (in the house) more than once
    // -----------------------------------------------------------------
    useEffect(() => {
        if (currentFile) {
            currentFileIdRef.current = currentFile?.id
        }
    }, [currentFile])

    const handleSelectCurrentFileId = useCallback((file?: UserFile) => {
        if (file === undefined) return;
        if (setDistanceWiring) {
            setDistanceWiring(NaN)
        }

        if (currentFileIdRef.current === file.id) {
            return;
        }
        currentFileIdRef.current = file.id
        openFile!(file)
    }, [currentFileIdRef.current])
    // -----------------------------------------------------------------

    const onHandleUploadFile = (file: RcFile) => {
        const formData = new FormData()
        formData.append('file', file as Blob);
        formData.append('key', "-1");
        formData.append('projectIndex', "-1");
        const dataUpload: UploadFileToProjectModel = {
            projectId: projectId,
            data: formData
        }

        const promiseApi = dispatch(uploadFileToProject({ data: dataUpload })).unwrap().then((res: any) => {
            if (onHandleAddNewFile) {
                onHandleAddNewFile(res.result);
            }
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

    const renderFileItem = useCallback(() => {
        if (!fileList || fileList.length < 1) {
            const arrFile = [
                <ToolFileItem key={102} id={undefined} name={undefined} onHandleUploadFile={onHandleUploadFile} />,
                <ToolFileItem key={103} id={undefined} name={undefined} onHandleUploadFile={onHandleUploadFile} />,
                <ToolFileItem key={104} id={undefined} name={undefined} onHandleUploadFile={onHandleUploadFile} />,
                <ToolFileItem key={105} id={undefined} name={undefined} onHandleUploadFile={onHandleUploadFile} />,
            ]
            return arrFile;
        }

        const arrFile: ReactNode[] = [];
        if (fileList.length < 4) {
            const numRender = 4 - fileList.length;
            for (let i = 0; i < numRender; i++) {
                arrFile.push(<ToolFileItem key={101 + i} id={undefined} name={undefined} onHandleUploadFile={onHandleUploadFile} />)
            }
        }

        arrFile.push(...fileList.map((file: UserFile, index: number) => {
            return <ToolFileItem key={index} id={file.id} name={file.name} onSelectCurrentFileId={() => handleSelectCurrentFileId(file)} />
        }));

        return arrFile;

    }, [fileList])

    return (
        <div className={styles.house}>
            <div className={styles.houseContent}>
                <div className={styles.roof} >
                    <Image src='/assets/img/house/roof.png' alt='roof' width={100} height={100} />
                    <div className={`${styles.roofFile} ${isOpenSideBar ? styles.roofFileOpen : ''}`}>
                        <Row className={styles.roofRow}>
                            <Col className={`${styles.roofCol} ${isOpenSideBar ? styles.roofCol3 : styles.roofColNone}`}>
                                <ToolFileItem key={100} id={undefined} roofIndex={1} name={undefined} onHandleUploadFile={onHandleUploadFile} />
                            </Col>
                            <Col className={`${styles.roofCol} ${isOpenSideBar ? styles.roofCol1 : styles.roofCol2}`}>
                                <ToolFileItem key={101} id={undefined} roofIndex={1} name={undefined} onHandleUploadFile={onHandleUploadFile} />
                            </Col>
                        </Row>
                    </div>
                </div>
                <div className={`${styles.wall} ${isOpenSideBar ? styles.wallBig : ''}`} style={{ background: `url(/assets/img/house/wall.png) repeat-y`, minHeight: isOpenSideBar ? '120px' : '80px' }}>
                    <div className={styles.wallItemCt}>
                        {renderFileItem()}
                    </div>
                </div>
                <div className={styles.floor}>
                    <Image src='/assets/img/house/floor.png' alt='floor' width={100} height={100} />
                </div>
            </div>
        </div>
    );
};

export default React.memo(ToolFile);

export interface ToolFileProps {
    projectId: string
    files?: UserFile[] | []
}
