import React, {useCallback, useContext, useEffect, useState} from 'react';
import ToolLeftSideBar from "@/components/Tool/ToolLeftSidebar";
import {Project} from "@/models";
import {ToolContext} from "@/context/ToolContext";
import {useTranslation} from "next-i18next";
import {useAppDispatch, useAppSelector} from "@/hooks";
import {getFileById} from "@/store/actions/file.action";
import {errorToast} from "@/helpers/Toast";
import {getTokenViewer} from "@/store/actions/tool.action";
import {addFile, clearTool, selectTool} from "@/store/slices/tool/tool.slice";
import {isNullOrEmpty} from "@/helpers/StringHelper";
import {ForgeViewerContext} from "@/context/ForgeViewerContext";
import {LoadingStatusEnum, ToolName} from "@/contants/tool";
import FileViewer from "@/components/Tool/ToolContainer/FileViewer";
import FileConnection from "@/components/Tool/ToolConnection/FileConnection";
import {changeActiveLayerTool} from "@/store/slices/tool/layer.slice";
import {changeTool} from "@/ForgeViewer/CustomTool";
import ToolRightSidebar from '../ToolRightSidebar';
import WarningChangeUnitBanner from './WarningChangeUnitBanner';
import LoadingByStatus from './LoadingByStatus';

import styles from "./ToolContainer.module.scss";
import classNames from 'classnames/bind';

const cx = classNames.bind(styles)

const ToolContainer: React.FC<ToolContainerProps> = ({isOpen, project, fileId}) => {
    const {t} = useTranslation(['common', 'config', 'tool'])

    const {fileSelected} = useContext(ToolContext)

    const [viewer, setViewer] = useState<Autodesk.Viewing.Viewer3D | undefined>(undefined)
    const [activeTool, setActiveTool] = useState<string | undefined>(undefined)

    const [token, setToken] = useState<string | undefined>(undefined)
    const [modelDerivativeUrn, setModelDerivativeUrn] = useState<string | undefined>(undefined)
    const [isFirstTimeFileUploaded, setIsFirstTimeFileUploaded] = useState<boolean>(false)
    const [isGetDataFile, setIsGetDataFile] = useState<boolean>(false)
    const [isFetching, setIsFetching] = useState<boolean>(true)
    const [statusLoading, setStatusLoading] = useState<number>(LoadingStatusEnum.INITIALIZING_TOOL)
    const [cursorCustomer, setCursorCustomer] = useState<string | undefined>(undefined)

    const dispatch = useAppDispatch()
    const {currentFile} = useAppSelector(selectTool)
    const [fileIdOpen, setFileIdOpen] = useState<string | undefined>(undefined)

    useEffect(() => {
        if (currentFile && currentFile.modelDerivativeUrn !== modelDerivativeUrn) {
            setModelDerivativeUrn(currentFile.modelDerivativeUrn)
        }

        if (fileIdOpen !== currentFile?.id) {
            setFileIdOpen(currentFile?.id)
        }

        if (fileIdOpen === undefined) {
            setIsFirstTimeFileUploaded(false)
        } else {
            if (isNullOrEmpty(currentFile?.fileData?.units)) {
                setIsFirstTimeFileUploaded(true)
            } else {
                setIsFirstTimeFileUploaded(false)
            }
        }
    }, [currentFile])

    const onFirstGetFileById = useCallback((fileId: string) => {
        if (project?.id && fileId && fileId !== fileIdOpen) {
            setIsFetching(true)
            setIsGetDataFile(true)
            setStatusLoading(LoadingStatusEnum.INITIALIZING_TOOL)

            dispatch(getFileById({projectId: project?.id, fileId: fileId}))
                .unwrap()
                .then(response => {
                    if (response.succeeded) {
                        const fileData = response.result;
                        dispatch(addFile(fileData))
                        dispatch(getTokenViewer())
                            .unwrap()
                            .then(res => {
                                setIsFetching(false)
                                setToken(res.result)
                            }).catch(errors => {
                            setIsFetching(false)
                            if (errors?.length > 0) {
                                errors.map((v: string) => errorToast(v))
                            }
                        })
                        return;
                    }

                    errorToast(t('error_loading_data'))
                }).catch((errors: string[]) => {
                setIsFetching(false)
                errors.map((v: string) => errorToast(v))
            }).finally(() => setIsGetDataFile(false))
        }
    }, [t, dispatch, project?.id, fileIdOpen])

    useEffect(() => {
        if (fileId && fileId !== fileIdOpen) {
            onFirstGetFileById(fileId)

            changeTool(ToolName.CHOOSE)
            setActiveTool(ToolName.CHOOSE)
        }

        return () => {
            setViewer(undefined);
            dispatch(clearTool());
        }
    }, [fileId])

    const onHandleSetViewer = useCallback((viewer: Autodesk.Viewing.Viewer3D) => {
        setViewer(viewer)
        dispatch(changeActiveLayerTool(true))
    }, [])

    const onHandleSetActiveTool = (toolActive: string | undefined) => {
        if (viewer) {
            if (toolActive === undefined) {
                window.activeTool = ToolName.CHOOSE;
                setActiveTool(ToolName.CHOOSE)
            } else {
                window.activeTool = toolActive;
                setActiveTool(toolActive)
            }
            return;
        }

        window.activeTool = undefined;
        setActiveTool(undefined)
        errorToast(t('tool_not_available', {ns: 'tool'}))
    }

    return (
        <ForgeViewerContext.Provider
            value={{fileId, viewer, activeTool, setActiveTool: onHandleSetActiveTool, setIsFetching, setStatusLoading, cursorCustomer, setCursorCustomer}}>

            {/* --- Connect to Hub SignalR to get file info --- */}

            <FileConnection/>

            {/* --- Render Tool left sidebar, Viewer, Tool right sidebar --- */}

            <div
                className={
                    cx('tool-container-wrapper', {'tool-container-wrapper--is-active': fileSelected?.id === fileId})
                }
            >
                <div className={cx('tool-container-wrapper__content')}>
                    <div className={cx('tool-container-wrapper--d-flex')}>

                        {/* --- Left sidebar --- */}

                        <div className={cx('tool-container-wrapper__left-sidebar')} >
                            <ToolLeftSideBar isShowTool={fileId !== undefined}/>
                        </div>


                        {/* --- Center render viewer --- */}

                        <div className={cx('tool-container-wrapper__viewer')}>

                            {/* Render loading based on status of Viewer and Change Unit tool */}

                            <LoadingByStatus
                                statusLoading={LoadingStatusEnum.CHANGE_UNIT_PENDING}
                                isGetDataFile={isGetDataFile}
                                isFetching={isFetching}
                                currentFileStatus={currentFile?.status}
                             />

                            {fileId &&
                                <>
                                    {/* When the file is first uploaded and have empty fileData properties in store */}

                                    {isFirstTimeFileUploaded && viewer && (
                                        <>
                                            {/* Should show warning */}

                                            <WarningChangeUnitBanner />
                                        </>
                                    )}

                                    {/* Show main viewer */}

                                    <FileViewer
                                        viewer={viewer}
                                        urn={modelDerivativeUrn}
                                        token={token}
                                        fileId={fileId}
                                        onHandleSetViewer={onHandleSetViewer}
                                        setIsFetching={setIsFetching}
                                        isFetching={isFetching}
                                        setStatusLoading={setStatusLoading}
                                    />
                                </>
                            }
                        </div>

                        {/* --- Right sidebar --- */}

                        <div className={cx('tool-container-wrapper__right-sidebar')} >
                            <ToolRightSidebar />
                        </div>

                    </div>
                </div>
            </div>
        </ForgeViewerContext.Provider>
    );
};

export default ToolContainer;

export interface ToolContainerProps {
    isOpen?: boolean
    fileId?: string
    project: Project | undefined
}