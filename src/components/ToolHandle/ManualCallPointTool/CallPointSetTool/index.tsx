import {ToolName} from "@/contants/tool";
import React, {useCallback, useContext, useEffect} from "react";
import {useTranslation} from "next-i18next";
import {ForgeViewerContext} from "@/context/ForgeViewerContext";

// import ToolItem from "@/components/Tool/ToolList/ToolItem";
import ToolItemRightSidebar from "@/components/Tool/ToolRightSidebar/ToolItemRightSidebar";

import {changeTool} from "@/ForgeViewer/CustomTool";
import {TbHomeHand} from "react-icons/tb";
import Viewer3D = Autodesk.Viewing.Viewer3D;
import {ExitPointDataModel} from "@/models";
import {v4 as uuid} from 'uuid'
import {convertPointLayerToModel} from "@/ForgeViewer/CustomTool/Point";
import {useAppDispatch} from "@/hooks";
import {addManualCallPoint} from "@/store/slices/tool/tool.slice";
import {useActiveGroupToolsOnViewer} from "@/hooks/useActiveGroupToolsOnViewer";

const toolName = ToolName.CALL_POINT_SET;
const toolSymbol = '/assets/symbols/B02-0041.svg';

const groupToolNames = [
    toolName,
    ToolName.CALL_POINT_LIST,
]

const CallPointSetTool : React.FC<CallPointSetToolProps> = ({isFirst}) => {
    const {t} = useTranslation(['common', 'config', 'tool']);

    const {activeTool, setActiveTool, setCursorCustomer} = useActiveGroupToolsOnViewer({groupToolNames})

    const dispatch = useAppDispatch()

    const data = {
        keyName: toolName,
        icon: <TbHomeHand />,
        name: t('call_point_set', {ns: 'tool'}),
    }

    useEffect(() => {
        if (activeTool !== toolName) {
            setCursorCustomer?.(undefined)
            onHandleStartToolEvent(false)
        } else {
            setCursorCustomer?.(toolSymbol)
            onHandleStartToolEvent(true)
        }
    }, [activeTool])

    const onHandlePutSymbolOnViewer = useCallback((event: MouseEvent) => {
        if (activeTool !== toolName) return;
        // Get x, y coordinates of mouse click in canvas
        new Promise(() => {
            const canvas =  window.NOP_VIEWER.canvas;
            if (!canvas) return;
            const xCanvas = event.clientX - canvas.getBoundingClientRect().left;
            const yCanvas = event.clientY - canvas.getBoundingClientRect().top;

            const modelPt = (window.NOP_VIEWER.impl as Viewer3D).clientToWorld(xCanvas, yCanvas, false);
            const newCoordinates = {...modelPt.point};
            const newCoordinatesModel = convertPointLayerToModel(newCoordinates);

            const newManualCallPoint: ExitPointDataModel = {
                id: uuid(),
                isManual: true,
                position: newCoordinatesModel,
                position_layer: newCoordinates,
                position_origin: {x: 0, y: 0, z: 0},

                size: 0.3,
                isShow: true
            }

            dispatch(addManualCallPoint(newManualCallPoint))
        })
    }, [])

    const onHandleStartToolEvent = useCallback((isActive: boolean) => {
        if (isActive) {
            window.NOP_VIEWER.canvas.addEventListener('click', onHandlePutSymbolOnViewer)
        } else {
            window.NOP_VIEWER.canvas.removeEventListener('click', onHandlePutSymbolOnViewer)
        }
    }, [onHandlePutSymbolOnViewer])

    const onHandleOnClick = useCallback((event?: any) => {
        if (activeTool === toolName) {
            setCursorCustomer?.(undefined)
            changeTool(ToolName.MANUAL_CALL_POINT_TOOL)
            setActiveTool(ToolName.MANUAL_CALL_POINT_TOOL)
            onHandleStartToolEvent(false)
        } else {
            setCursorCustomer?.(toolSymbol)
            changeTool(toolName, undefined)
            setActiveTool(toolName)
            onHandleStartToolEvent(true)
        }
    }, [activeTool, setActiveTool, onHandleStartToolEvent])

    if (isFirst) {
        return null;
    }
    return <ToolItemRightSidebar selected={activeTool === toolName} data={data} onClick={onHandleOnClick} />
};

export default CallPointSetTool;

interface CallPointSetToolProps {
    isFirst: boolean
}