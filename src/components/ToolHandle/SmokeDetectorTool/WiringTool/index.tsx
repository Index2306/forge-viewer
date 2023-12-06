import ToolItemRightSidebar from "@/components/Tool/ToolRightSidebar/ToolItemRightSidebar";
// import ToolItem from "@/components/Tool/ToolList/ToolItem";
import {changeTool} from '@/ForgeViewer/CustomTool';
import {PolygonType, ToolName} from "@/contants/tool";
import {ForgeViewerContext} from "@/context/ForgeViewerContext";
import {useTranslation} from "next-i18next";
import React, {useCallback, useContext, useEffect, useState} from 'react';
import {BsGraphUpArrow} from 'react-icons/bs';
import {useAppDispatch, useAppSelector} from "@/hooks";
import {selectTool} from "@/store/slices/tool/tool.slice";
import {deleteShapeByType} from '@/ForgeViewer/CustomTool/Edit2D';
import {startToolWiring} from '@/ForgeViewer/CustomTool/Wiring';
import {ToolContext} from '@/context/ToolContext';
import {HubConnectionContext} from "@/context/HubConnectionContext";
import {Point2D} from "@/models";
import {selectLayer} from "@/store/slices/tool/layer.slice";
import PopupWiringDistance from "@/components/ToolHandle/SmokeDetectorTool/WiringTool/PopupWiringDistance";
import {algorithmSupport} from "@/store/actions/tool.action";
import {errorToast} from "@/helpers/Toast";

const toolName = ToolName.WIRING_TOOL;

const WiringTool: React.FC<WiringToolProps> = ({isFirst}) => {
    const {t} = useTranslation(['common', 'config', 'tool']);
    const dispatch = useAppDispatch()

    const {currentFile} = useAppSelector(selectTool);
    const {isLayerToolActive, layerList} = useAppSelector(selectLayer)

    const {activeTool, setActiveTool} = useContext(ForgeViewerContext)
    const {setDistanceWiring} = useContext(ToolContext)
    const {hubConnection} = useContext(HubConnectionContext)

    const [idPoly, setIdPoly] = useState<number | undefined>(undefined);
    const [isShow, setIsShow] = useState<boolean>(false)
    const [pointList, setPointList] = useState<Point2D[]>([])

    const data = {
        keyName: toolName,
        icon: <BsGraphUpArrow/>,
        name: t('wiring', {ns: 'tool'}),
    }

    useEffect(() => {
        return () => {
            deleteShapeByType(PolygonType.WIRING)
            setIdPoly(undefined)
            if (setDistanceWiring) {
                setDistanceWiring(NaN)
            }
        }
    }, [])

    useEffect(() => {
        onHandleWiringOnViewer(false);
    }, [currentFile?.fileData?.bmz, currentFile?.fileData?.rooms])

    useEffect(() => {
        deleteShapeByType(PolygonType.WIRING)
        setIdPoly(undefined)
        if (setDistanceWiring) {
            setDistanceWiring(NaN)
        }
        if (isLayerToolActive && isShow) {
            onHandleWiringOnViewer()
        }


    }, [isShow])

    useEffect(() => {
        deleteShapeByType(PolygonType.WIRING)
        setIdPoly(undefined)
        if (setDistanceWiring) {
            setDistanceWiring(NaN)
        }

        if (isLayerToolActive && isShow) {
            drawWireOnViewerByPointList(pointList);
        }

    }, [layerList, isLayerToolActive, pointList])

    const onHandleOnClick = useCallback((event?: any) => {
        if (activeTool === toolName) {
            setIsShow(false)
            changeTool(ToolName.DETECTOR_TOOL)
            setActiveTool(ToolName.DETECTOR_TOOL)
        } else {
            setIsShow(true)
            changeTool(toolName, undefined)
            setActiveTool(toolName)
        }

    }, [activeTool, setActiveTool])

    const onHandleWiringOnViewer = useCallback((isDrawing: boolean = true) => {

        new Promise(async () => {
            const bmz = currentFile?.fileData?.bmz;
            let dataRoom = [...(currentFile?.fileData?.rooms ?? [])];

            /// Check conditions before drawing wires
            /// Need to confirm the rules and conditions again
            // if (!bmz || bmz.length < 1) {
            //     warningToast(t('please_set_bmz', {ns: 'tool'}), 3000, "top-center")
            //     return
            // }
            //

            const request = {
                dataRoom: JSON.stringify(dataRoom),
                dataBmz: JSON.stringify(bmz?.map(b => b.position) ?? [])
            }

            dispatch(algorithmSupport(request))
                .unwrap()
                .then((response: any) => {
                    setPointList(response?.result)
                    if (isDrawing) {
                        drawWireOnViewerByPointList(response?.result)
                    }
                })
                .catch((err) => {
                    errorToast(t('wiring_error', {ns: 'tool'}))
                })
        });
    }, [dispatch, currentFile?.fileData?.rooms, currentFile?.fileData?.bmz, hubConnection]);

    const drawWireOnViewerByPointList = (points: Point2D[]) => {
        deleteShapeByType(PolygonType.WIRING)
        const {distance, id} = startToolWiring(points)
        setIdPoly(id)
        if (setDistanceWiring) setDistanceWiring(distance ?? NaN)

    }

    if (isFirst) {
        return null;
    }
    return (
        <>
            <ToolItemRightSidebar
                selected={activeTool === toolName || idPoly !== undefined}
                data={data}
                onClick={onHandleOnClick}
            >
                <PopupWiringDistance/>
            </ToolItemRightSidebar>
        </>
    );
};

export default React.memo(WiringTool);

export interface WiringToolProps {
    isFirst: boolean
}