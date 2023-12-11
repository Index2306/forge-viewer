import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useTranslation } from "next-i18next";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { errorToast } from "@/helpers/Toast";
import { getTokenViewer } from "@/store/actions/tool.action";
import { selectTool } from "@/store/slices/tool/tool.slice";
import { isNullOrEmpty } from "@/helpers/StringHelper";
import { ForgeViewerContext } from "@/context/ForgeViewerContext";
import { LoadingStatusEnum, ToolName } from "@/contants/tool";
import FileViewer from "@/components/Tool/ToolContainer/FileViewer";
import FileConnection from "@/components/Tool/ToolConnection/FileConnection";
import { changeActiveLayerTool } from "@/store/slices/tool/layer.slice";
import { changeTool } from "@/ForgeViewer/CustomTool";
import WarningChangeUnitBanner from './WarningChangeUnitBanner';
import LoadingByStatus from './LoadingByStatus';

import styles from "./ToolContainer.module.scss";
import classNames from 'classnames/bind';
import ToolLeftSidebar from '../ToolLeftSidebar';

const cx = classNames.bind(styles)

const ToolContainer: React.FC<ToolContainerProps> = () => {
    const { t } = useTranslation(['common', 'config', 'tool'])

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
    const { currentFile } = useAppSelector(selectTool)
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
    }, [currentFile])


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
        errorToast(t('tool_not_available', { ns: 'tool' }))
    }

    return (
        <ForgeViewerContext.Provider
            value={{ viewer, activeTool, setActiveTool: onHandleSetActiveTool, setIsFetching, setStatusLoading, cursorCustomer, setCursorCustomer }}>

            {/* --- Connect to Hub SignalR to get file info --- */}

            <FileConnection />

            {/* --- Render Tool left sidebar, Viewer, Tool right sidebar --- */}

            <div
                className={
                    cx('tool-container-wrapper', { 'tool-container-wrapper--is-active': true })
                }
            >
                <div className={cx('tool-container-wrapper__content')}>
                    <div className={cx('tool-container-wrapper--d-flex')}>

                        {/* --- Left sidebar --- */}

                        <div className={cx('tool-container-wrapper__left-sidebar')} >
                            <ToolLeftSidebar isShowTool={currentFile?.id !== undefined} />
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

                            {currentFile &&
                                <>
                                    {/* When the file is first uploaded and have empty fileData properties in store */}

                                    {/* Show main viewer */}

                                    <FileViewer
                                        viewer={viewer}
                                        urn={modelDerivativeUrn}
                                        token={token}
                                        onHandleSetViewer={onHandleSetViewer}
                                        setIsFetching={setIsFetching}
                                        isFetching={isFetching}
                                        setStatusLoading={setStatusLoading}
                                    />
                                </>
                            }
                        </div>
                    </div>
                </div>
            </div>
        </ForgeViewerContext.Provider>
    );
};

export default ToolContainer;

export interface ToolContainerProps {
}