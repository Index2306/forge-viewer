import React, {useCallback, useContext, useEffect} from 'react';
import {ToolName} from "@/contants/tool";
import {useTranslation} from "next-i18next";
import {ForgeViewerContext} from "@/context/ForgeViewerContext";
import {changeTool} from "@/ForgeViewer/CustomTool";
import {convertPointLayerToModel, isPointInsidePolygon} from "@/ForgeViewer/CustomTool/Point";
import {BmzDataModel, RoomDataModel} from "@/models";
import {v4 as uuid} from "uuid";
import {addBmz, selectTool} from "@/store/slices/tool/tool.slice";
import Viewer3D = Autodesk.Viewing.Viewer3D;
import {useAppDispatch, useAppSelector} from "@/hooks";

// import ToolItem from "@/components/Tool/ToolList/ToolItem";
import ToolItemRightSidebar from "@/components/Tool/ToolRightSidebar/ToolItemRightSidebar";

import {warningToast} from "@/helpers/Toast";
import Image from 'next/image';
import IconAction from '@/components/IconAction';
import {useActiveGroupToolsOnViewer} from "@/hooks/useActiveGroupToolsOnViewer";

const toolName = ToolName.SET_BMZ;

const groupToolNames = [
    toolName,
    ToolName.DETECTOR_TOOL,
]

export const toolSymbol = '/assets/symbols/BMZ.svg';

const iconPath = '/assets/icons/icon__bmz--bw.svg'

const BmzSetTool : React.FC<BmzSetToolProps> = ({isFirst}) => {
    const {t} = useTranslation(['common', 'config', 'tool']);

    const {activeTool, setActiveTool, setCursorCustomer} = useActiveGroupToolsOnViewer({groupToolNames})
    const dispatch = useAppDispatch()
    const {currentFile} = useAppSelector(selectTool)

    const data = {
        keyName: toolName,
        iconImg: <IconAction src={iconPath} title='bmz_symbol' customSize={24} isHover={false} />,
        name: t('set_bmz', {ns: 'tool'}),
    }

    useEffect(() => {
        if (activeTool !== toolName) {
            setCursorCustomer?.(undefined)
            onHandleStartToolEvent(false)
        } else {
            setCursorCustomer?.(toolSymbol)
            onHandleStartToolEvent(true)
        }
        return () => {
            setCursorCustomer?.(undefined)
            onHandleStartToolEvent(false)
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

            const checkInsideRoom = [...(currentFile?.fileData?.rooms ?? [])].find((room: RoomDataModel) => {
                return isPointInsidePolygon(newCoordinates, room.boundary_layer);
            });

            const newBmz: BmzDataModel = {
                id: uuid(),
                roomId: checkInsideRoom?.id,
                position: newCoordinatesModel,
                position_layer: newCoordinates,
                position_origin: {x: 0, y: 0, z: 0},

                size: 0.2,
                isShow: true,
            }
            dispatch(addBmz(newBmz))
        })
    }, [activeTool, currentFile?.fileData?.rooms, window.NOP_VIEWER.canvas, dispatch, t])

    const onHandleStartToolEvent = useCallback((isActive: boolean) => {
        if (isActive) {
            window.NOP_VIEWER.canvas.addEventListener('click', onHandlePutSymbolOnViewer)
        } else {
            window.NOP_VIEWER.canvas.removeEventListener('click', onHandlePutSymbolOnViewer)
        }
    }, [onHandlePutSymbolOnViewer, activeTool])

    const onHandleOnClick = useCallback((event?: any) => {
        if (activeTool === toolName) {
            setCursorCustomer?.(undefined)
            changeTool(ToolName.DETECTOR_TOOL)
            setActiveTool(ToolName.DETECTOR_TOOL)
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

export default BmzSetTool;

interface BmzSetToolProps {
    isFirst: boolean
}