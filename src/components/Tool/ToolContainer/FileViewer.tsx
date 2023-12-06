import {convertPointModelToLayer} from "@/ForgeViewer/CustomTool/Point";
import {ForgeViewer} from "@/ForgeViewer/ForgeViewerCore";
import FileStatus from "@/components/Tool/ToolContainer/FileStatus";
import {ToolContext} from '@/context/ToolContext';
import {useAppDispatch, useAppSelector} from "@/hooks";
import {DeviceRoomModel, ExitPointDataModel, RoomDataModel, UserFile} from "@/models";
import {clearLayer} from "@/store/slices/tool/layer.slice";
import {changeFileData, selectTool} from "@/store/slices/tool/tool.slice";
import {i18n} from 'next-i18next';
import React, {useContext, useEffect, useState} from 'react';
import {clearTimeout} from "timers";
import CursorCustomer from "@/components/Tool/CursorCustomer";
import {LoadingStatusEnum} from "@/contants/tool";

const FileViewer: React.FC<FileViewerProps> = ({
                                                   setStatusLoading,
                                                   urn,
                                                   token,
                                                   fileId,
                                                   onHandleSetViewer,
                                                   setIsFetching,
                                                   isFetching
                                               }) => {
    const dispatch = useAppDispatch()
    const {currentFile, resetViewer} = useAppSelector(selectTool)
    const [urnModel, setUrnModel] = useState<string | undefined>(undefined)
    const [isReset, setIsReset] = useState<boolean>(false)

    const { setIsToolReady} = useContext(ToolContext)
    const [loadingModelDocument, setLoadingModelDocument] = useState<boolean>(true)
    const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | undefined>(undefined)

    const [status, setStatus] = useState<number>(-1);
    const [currentFileOpen, setCurrentFileOpen] = useState<UserFile | null>(null);

    useEffect(() => {
        if (currentFile) {
            if (currentFileOpen === null || currentFile.id !== fileId) {
                setCurrentFileOpen(currentFile)
            }

            setStatus(currentFile?.status ?? -1)
        } else {
            setStatus(-1)
        }

        return () => {
            // setStatus(-1)
        }
    }, [currentFile, fileId])

    useEffect(() => {
        setUrnModel(urn)
        dispatch(clearLayer())

        return () => {
            window.roomList = [];
            window.roomLabelList = [];
            window.doorLabelList = [];
            window.smokeDetectorList = [];
            window.manualCallPointList = [];
            window.bmzList = [];
            window.symbolList = [];
            setLoadingModelDocument(true)
            if (setIsToolReady) {
                setIsToolReady(false)
            }

            if (timeoutId) {
                clearTimeout(timeoutId)
                setTimeoutId(undefined)
            }
        }
    }, [urn])

    useEffect(() => {
        if (resetViewer) {
            setLoadingModelDocument(false)
            if (setIsToolReady) {
                setIsToolReady(false)
            }

            window.NOP_VIEWER?.tearDown()
            window.NOP_VIEWER?.finish()
            window.NOP_VIEWER = undefined;
            window.edit2d = undefined;
            window.edit2dTools = undefined;
            window.edit2dLayer = undefined;
            window.activeTool = undefined;
            window.roomList = [];
            window.roomLabelList = [];
            window.doorLabelList = [];
            window.smokeDetectorList = [];
            window.manualCallPointList = [];
            window.bmzList = [];
            window.symbolList = [];
        }

        return () => {
            setUrnModel(undefined)
            setIsReset(false);
        }
    }, [resetViewer])

    useEffect(() => {
        window.NOP_VIEWER?.addEventListener(Autodesk.Viewing.GEOMETRY_LOADED_EVENT, function () {
            // Model geometry is loaded and ready for interaction
            console.log("Model geometry loaded and ready!");
            if (setIsToolReady) setIsToolReady(true)
        });
    })

    useEffect(() => {
        if (!loadingModelDocument && !isFetching) {
            const parseData = { ...currentFile?.fileData }

            // New data normalization
            // Coordinates on CAD model => coordinates on Forge Viewer
            if (parseData) {
                try {
                    parseData.boundary_layer = parseData?.boundary?.map((point: any) => {
                        return convertPointModelToLayer(point);
                    })

                    let countExitDoor = 1;
                    parseData.doors = parseData?.doors?.map((door: any, index: number) => {
                        const newDoor = {
                            ...door,
                            mid_layer: convertPointModelToLayer(door.mid),
                            end_layer: convertPointModelToLayer(door.end),
                            start_layer: convertPointModelToLayer(door.start),
                            isShow: false
                        };
                        if (!newDoor?.name && newDoor.isExist) {
                            newDoor.name = `No. ${countExitDoor++}`;
                        }
                        return newDoor;
                    })

                    parseData.exitPoints = parseData?.exitPoints?.map((exitPoint: ExitPointDataModel) => ({...exitPoint, isShow: true}))

                    parseData.rooms = parseData?.rooms?.map((room: RoomDataModel, index: number) => {
                        const newRoom: RoomDataModel = {
                            ...room,
                            id: room.roomId,
                            centroid_layer: convertPointModelToLayer(room.centroid),
                            boundary_layer: room.boundary.map((point: any) => convertPointModelToLayer(point)),
                            devices: room.devices.map((dev: any) => {
                                const newDeviceRoom: DeviceRoomModel = {
                                    ...dev,
                                    isShow: false,
                                    position: dev.position,
                                    position_layer: convertPointModelToLayer(dev.position)
                                }
                                return newDeviceRoom;
                            })
                        }
                        if (newRoom.isShow) {
                            newRoom.isShow = false;
                        }
                        if (newRoom.name === undefined || newRoom.name === null) {
                            newRoom.name = `ID: ${index + 1}`;
                        }
                        return newRoom;
                    })

                    if (parseData.rooms?.find(r => r.id === 'outside') === undefined) {
                        parseData.rooms?.push(
                            {
                                id: "outside",
                                roomId: 'outside',
                                name: "Outside",
                                boundary_layer: [],
                                boundary: [],
                                centroid: {x: 0, y: 0, z: 0},
                                centroid_layer: {x: 0, y: 0, z: 0},
                                devices: [],
                                width: 0,
                                length: 0
                            })
                    }

                    if (setIsToolReady) setIsToolReady(true)

                } catch (err) {
                    console.error('change file data error', err)
                }
                dispatch(changeFileData({ id: currentFile?.id, data: parseData }))
            }

            setLoadingModelDocument(true)
            if (setIsToolReady) {
                setIsToolReady(true)
            }
            setStatusLoading(LoadingStatusEnum.NONE)
        }
    }, [loadingModelDocument, isFetching])

    const handleSetLoadModel = (value: boolean) => {
        setLoadingModelDocument(value)
        setIsFetching(value)
        if (value) {
            setStatusLoading(LoadingStatusEnum.LOADING_MODEL_DATA)
        } else {
            setStatusLoading(LoadingStatusEnum.INITIALIZING_TOOL)
        }
    }

    const onDocumentLoadError = (errorCode?: Autodesk.Viewing.ErrorCodes,
                                 errorMsg?: string,
                                 messages?: any[]) => {
        const timeoutId = setTimeout(() => {
            setIsReset(true)
        }, 1000)
        console.log(errorCode, errorMsg, messages)
        setTimeoutId(timeoutId)
    }

    return (
        <>
            <CursorCustomer />
            <FileStatus status={status} />
            {resetViewer ? null : urnModel && token && status === 0 ? <ForgeViewer
                setViewer={onHandleSetViewer}
                isMinFile={process.env.NEXT_PUBLIC_PRODUCT === 'true'}
                isLMV={false}
                local={false}
                urn={urnModel}
                // testing={true}
                token={token}
                extensions={[]}
                activeTool={undefined}
                isReload={isReset}
                setIsReload={setIsReset}
                setIsFetching={handleSetLoadModel}
                initializerOptions={{language: i18n?.language ? i18n.language : 'en'}}
                onDocumentLoadError={onDocumentLoadError}
            /> : null}
        </>
    );
};

export default React.memo(FileViewer);

export interface FileViewerProps {
    viewer: Autodesk.Viewing.Viewer3D | undefined
    urn?: string;
    token?: string;
    fileId: string;
    onHandleSetViewer?: (viewer: Autodesk.Viewing.Viewer3D) => void;
    isFetching: boolean
    setIsFetching: (v: any) => void
    setStatusLoading: (v: number) => void
}
