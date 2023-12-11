import React, {useCallback, useContext, useEffect, useState} from 'react';
import ToolItemLeftSidebar from "@/components/Tool/ToolLeftSidebar/ToolItemLeftSidebar";
import {LoadingStatusEnum, ToolName} from "@/contants/tool";
import {useTranslation} from "next-i18next";
import {changeTool} from "@/ForgeViewer/CustomTool";
import {ForgeViewerContext} from "@/context/ForgeViewerContext";
import {deleteShape} from "@/ForgeViewer/CustomTool/Edit2D";
import UnitInfo from "@/components/ToolHandle/ChangeUnitTool/UnitInfo";
import FormChangeUnit from "@/components/ToolHandle/ChangeUnitTool/FormChangeUnit";
import {useAppDispatch, useAppSelector} from "@/hooks";
import {changeFile, changeFileData, changeResetViewer, selectTool} from "@/store/slices/tool/tool.slice";
import {destroyToast, errorToast, infoToast} from "@/helpers/Toast";
import {changeUnit} from "@/store/actions/tool.action";
import {HubConnectionContext} from "@/context/HubConnectionContext";
import {convertPointLayerToModel, getDistancePoint} from "@/ForgeViewer/CustomTool/Point";
import {ToolContext} from "@/context/ToolContext";
import {isNullOrEmpty} from '@/helpers/StringHelper';
import IconAction from '@/components/IconAction';
import ModalTutorial from "@/components/ModalTutorial";
import Cookies from "js-cookie";

const toolName = ToolName.CHANGE_UNIT;

const ChangeUnitTool: React.FC<ChangeUnitToolProps> = ({isFirst}) => {
    const {t} = useTranslation(['common', 'config', 'tool']);

    const keyName = t('set_length_measurement', {ns: 'tool'});

    const data = {
        keyName: toolName,
        iconImg: <IconAction src='/assets/icons/icon_set-unit.svg' size='small' title='icon-set-unit' isHover={false}/>,
        name: keyName,
    }

    const dispatch = useAppDispatch()

    const {fileId, activeTool, setActiveTool, setIsFetching, setStatusLoading, viewer} = useContext(ForgeViewerContext)
    const {setIsToolReady, setErrUnit} = useContext(ToolContext)

    const dataUser = JSON.parse(Cookies.get('user') || '')

    //Context
    const {progressUnit, setProgressUnit} = useContext(ToolContext)
    const {connectionId, connected, hubConnection} = useContext(HubConnectionContext)

    const [unitInfo, setUnitInfo] = useState<any>(undefined)
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [polyShapes, setPolyShapes] = useState<any[]>([])


    const {currentFile} = useAppSelector(selectTool)

    // ---------------------------------------------------
    const [isFirstTimeFileUploaded, setIsFirstTimeFileUploaded] = useState<boolean>(false)


    useEffect(() => {
        if (isNullOrEmpty(currentFile?.fileData?.units)) {
            setIsFirstTimeFileUploaded(true)
        } else {
            setIsFirstTimeFileUploaded(false)
        }
    }, [currentFile])
    // ---------------------------------------------------

    useEffect(() => {
        setUnitInfo(undefined)

        return () => {
            setUnitInfo(undefined)
        }
    }, [fileId])

    useEffect(() => {
        if (connected && hubConnection) {
            hubConnection.on('changeUnit', (response) => {
                dispatch(changeResetViewer(false))
                setIsFetching(false)
                if (setProgressUnit) setProgressUnit(0)
                if (setErrUnit) setErrUnit(null)

                if (response.isSuccess) {
                    const parseData = response.data;
                    dispatch(changeFile(parseData))
                } else {
                    errorToast(response?.data)
                    console.log('changeUnit-----------', response)
                }
            });


            hubConnection.on('defineRoom', (response) => {
                if (response.isSuccess) {
                    const parseData: any = {...response.data.fileData};
                    parseData.rooms = [...parseData.rooms].map((r: any, index) => ({...r, name: `ID: ${index + 1}`}))
                    dispatch(changeFileData({id: response?.data?.id, data: parseData}))

                    // dispatch(saveFileData({id: response?.data?.id, data: parseData})).
                    // unwrap()
                    //     .then(response => console.log('Auto save file data!'))
                    //     .catch(err => console.log('Error auto save file data!'))
                } else {
                    errorToast(response?.data)
                    console.log('define-----------', response)
                }
            });

            hubConnection.on('progressing', (response) => {
                if (currentFile && (currentFile.id === response.data.fileId)) {
                    if (response.isSuccess) {
                        destroyToast('unit-info')
                        if (response.data.key === 'error') {
                            errorToast(response?.data)
                            if (setErrUnit) setErrUnit(response?.data.key)
                            return
                        }

                        let status = progressUnit + 1
                        if (status > 14) status = 14

                        if (setProgressUnit) setProgressUnit(status)
                        if (setErrUnit) setErrUnit(null)
                    } else {
                        errorToast(response?.data)
                        if (setErrUnit) setErrUnit(response?.data)
                        if (setProgressUnit) setProgressUnit(0)
                    }
                }
            });
        }
    }, [connected, progressUnit])

    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleOk = useCallback((values: any) => {
        dispatch(changeResetViewer(true))
        const start = convertPointLayerToModel({...polyShapes[0]._loops[0][0]});
        const end = convertPointLayerToModel({...polyShapes[0]._loops[0][1]});

        const postData = {
            fileId: fileId,
            clientId: connectionId,
            data: JSON.stringify({
                ...values,
                wallTolerance: 15.0,
                detailLevel: 0,
                start,
                end,
                fileId,
                clientId: connectionId,
                email: dataUser.username
            })
        }

        if (setIsToolReady) {
            setIsToolReady(false);
        }
        
        setIsModalOpen(false);
        deleteShape([...polyShapes]);
        setIsFetching(true)
        
        setStatusLoading(LoadingStatusEnum.CHANGE_UNIT_PENDING)
        
        infoToast(t('change_unit_pending', {ns: 'tool'}));
        
        dispatch(changeUnit(postData))
            .unwrap()
            .then((response: any) =>  {
                if (!response.succeeded) {
                    errorToast(t('change_unit_failed', {ns: 'tool'}))
                    if (setIsToolReady) {
                        setIsToolReady(false)
                    }
                }
            })
            .catch((err) => {
                console.log('err========', err);
                
                errorToast(t('change_unit_failed', {ns: 'tool'}))
                if (setIsToolReady) {
                    setIsToolReady(false)
                }
        }).finally(() => {
        
        });

    }, [fileId, connectionId, polyShapes, setIsFetching, dispatch, t])

    const handleCancel = useCallback(() => {
        deleteShape([...polyShapes])
        setPolyShapes([])
        setIsModalOpen(false);
    }, [polyShapes])

    const onHandleResultTool = useCallback((shapes: any[]) => {
        if (shapes.length > 0 && shapes[0]._loops.length > 0 && shapes[0]._loops[0].length === 2) {
            const point1 = {...shapes[0]._loops[0][0]};
            const point2 = {...shapes[0]._loops[0][1]};

            if (point1.x === point2.x && point1.y === point2.y) return;

            setPolyShapes(shapes)
            const start = convertPointLayerToModel({...shapes[0]._loops[0][0]});
            const end = convertPointLayerToModel({...shapes[0]._loops[0][1]});
            const defaultLength = getDistancePoint(start, end);

            setUnitInfo({
                length: defaultLength * 1000,
                unit: "Millimeters"
            })
            setIsModalOpen(true)
        }
    }, [])

    const onHandleClick = useCallback((event?: any) => {
        if (activeTool === toolName) {
            changeTool(undefined)
            setActiveTool(undefined)
        } else {
            changeTool(toolName, onHandleResultTool)
            setActiveTool(toolName)
        }
    }, [activeTool, setActiveTool, onHandleResultTool])

    return (
        <>
            {isFirstTimeFileUploaded && viewer && (
                <ModalTutorial
                    onUnderstandTutorial={onHandleClick}
                    title={t('set_length_measurement', {ns: 'tool'})}
                    imgTutorial={'/assets/img/tutorial/speam_intro-proportion.gif'}
                    description={t('set_length_measurement_description', {ns: 'tool'})}
                    hint={t('set_length_measurement_image_info', {ns: 'tool'})}
                />
            )}
            <ToolItemLeftSidebar selected={activeTool === toolName} data={data} onClick={onHandleClick}>
                {!isFirst && <UnitInfo info={unitInfo} isShow={activeTool === toolName}/>}
            </ToolItemLeftSidebar>
            <FormChangeUnit info={unitInfo} keyName={keyName} isOpen={isModalOpen} onOk={handleOk} onCancel={handleCancel}/>
        </>
    );
};

export default React.memo(ChangeUnitTool);

export interface ChangeUnitToolProps {
    isFirst: boolean
}