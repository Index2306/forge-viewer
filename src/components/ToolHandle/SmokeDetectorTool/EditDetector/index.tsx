import React, {useCallback, useContext, useEffect, useState} from 'react';
import {useTranslation} from "next-i18next";
import {PolygonType, ToolName} from "@/contants/tool";
import {BiEdit} from "react-icons/bi";

// import ToolItem from "@/components/Tool/ToolList/ToolItem";
import ToolItemRightSidebar from "@/components/Tool/ToolRightSidebar/ToolItemRightSidebar";

import {ForgeViewerContext} from "@/context/ForgeViewerContext";
import {changeTool} from "@/ForgeViewer/CustomTool";
import {deleteShapeById} from "@/ForgeViewer/CustomTool/Edit2D";
import {drawCircleShape, drawOnlyCircleDetector} from "@/ForgeViewer/CustomTool/Edit2D/draw";
import {Vector2} from "three";
import {useAppDispatch, useAppSelector} from "@/hooks";
import {addNewRoom, selectTool, updateDataRoom} from "@/store/slices/tool/tool.slice";
import {convertPointLayerToModel, isPointInsidePolygon} from "@/ForgeViewer/CustomTool/Point";
import { useActiveGroupToolsOnViewer } from '@/hooks/useActiveGroupToolsOnViewer';

const toolName = ToolName.EDIT_DETECTOR;

const groupToolNames = [
    toolName,
    ToolName.DETECTOR_TOOL,
]

const EditDetectorTool : React.FC<EditDetectorToolProps> = ({isFirst}) => {
    const {t} = useTranslation(['common', 'config', 'tool']);
    const dispatch = useAppDispatch();
    const [selectPoly, setSelectPoly] = useState<any | undefined>(undefined);

    const {activeTool, setActiveTool, isActiveCurrentTool} = useActiveGroupToolsOnViewer({groupToolNames})

    const {currentFile} = useAppSelector(selectTool);

    const data = {
        keyName: toolName,
        icon: <BiEdit />,
        name: t('edit_detector', {ns: 'tool'}),
    }

    useEffect(() => {
        if (isActiveCurrentTool) {
            changeTool(toolName, onCallbackUpdatePolygon)
            setActiveTool(toolName)
        }
    }, [isActiveCurrentTool])

    useEffect(() => {
        return () => {
            setSelectPoly(undefined)
        }
    }, [selectPoly])

    const onHandleOnClick = useCallback((event?: any) => {
        if (activeTool === toolName) {
            changeTool(ToolName.DETECTOR_TOOL)
            setActiveTool(ToolName.DETECTOR_TOOL)
        } else {
            changeTool(toolName, onCallbackUpdatePolygon)
            setActiveTool(toolName)
        }
    }, [activeTool, setActiveTool])

    const onCallbackUpdatePolygon = (type: string, ...params: any[]) => {
        if (type === 'click') {
            onHandleClickEditPolygon(...params)
        } else {
            onHandleMoveEditPolygon(...params)
        }
    }

    const onHandleClickEditPolygon = (...params: any[]) => {
        const poly = params[0]
        new Promise(() => {
            setSelectPoly(poly)
            if (poly) {
                if (poly.type === PolygonType.SMOKE_DETECTOR) {
                    if (!poly.isCircle) {
                        drawOnlyCircleDetector(poly.planeMesh, poly.smokeDetector, poly.radiusModel, poly.radiusLayer, 42, true)
                        deleteShapeById([poly.id])
                    }
                }
            }

        })
    }

    const onHandleMoveEditPolygon = (...params: any[]) => {
        const poly = params[0];
        new Promise(() => {
            if (poly) {
                poly.planeMesh.position.set(poly.centerX, poly.centerY, 3);
                window.NOP_VIEWER.impl.invalidate(true, true, true);
            }
        })
    }

    useEffect(() => {
        window.addEventListener(
            "endDragMoveDetector",
            onHandleEndDragEditPolygon,
            false,
        );

        return () => {
            window.removeEventListener("endDragMoveDetector", onHandleEndDragEditPolygon)
        }
    }, [currentFile?.fileData?.rooms])

    const onHandleEndDragEditPolygon = (event: any) => {
        const list = event.detail;

        const poly = list?.find((p: any) => p.type === PolygonType.SMOKE_DETECTOR && p.isCircle);
        if (!poly) return;
        new Promise(() => {
            const position = new Vector2().set(poly.centerX, poly.centerY);
            const smokeDetector = {...poly.smokeDetector};
            if (!smokeDetector) return;

            const insideRoom = currentFile?.fileData?.rooms.find(r => isPointInsidePolygon(position, r.boundary_layer))

            const newPositionLayer = {x: poly.centerX, y: poly.centerY};
            const newPosition = convertPointLayerToModel(newPositionLayer);

            if (insideRoom) {
                smokeDetector.position = newPosition;
                smokeDetector.position_layer = newPositionLayer
                if (insideRoom.id !== smokeDetector.roomId)
                {
                    const oldRoom = currentFile?.fileData?.rooms.find(r => r.roomId === smokeDetector.roomId)
                    if (oldRoom) {
                        dispatch(updateDataRoom({id: oldRoom.id, data: {...oldRoom, devices: [...oldRoom.devices].filter(d => d.id !== smokeDetector.id)}}))
                    }
                }

                dispatch(updateDataRoom({id: insideRoom.id, data:
                        {...insideRoom,
                            devices:
                                [...insideRoom.devices.filter(d => d.id !== smokeDetector.id),
                                    {...smokeDetector,
                                        roomId: insideRoom.id,
                                        position: newPosition,
                                        position_layer: newPositionLayer,
                                        radius: poly.radiusModel,
                                        radius_layer: poly.radiusLayer}
                                ]
                        }
                }))

                deleteShapeById([poly.id]);
                drawCircleShape(poly.planeMesh, insideRoom, smokeDetector, poly.radiusModel)
            }
            else {
                const oldRoom = currentFile?.fileData?.rooms.find(r => r.roomId === smokeDetector.roomId)
                if (oldRoom) {
                    dispatch(updateDataRoom({id: oldRoom.id, data: {...oldRoom, devices: [...oldRoom.devices].filter(d => d.id !== smokeDetector.id)}}))
                }

                const newDevice = {...smokeDetector, roomId: 'outside', position: newPosition, position_layer: newPositionLayer, radius: poly.radiusModel, radius_layer: poly.radiusLayer};
                const roomData = {boundary_layer: [], boundary:[], centroid: {x:0, y:0}, centroid_layer: {x: 0, y: 0}, id: "outside", roomId: 'outside', name: "Outside"};
                const oldRoomOutSide = currentFile?.fileData?.rooms.find(r => r.roomId === 'outside');
                if (oldRoomOutSide) {
                    dispatch(updateDataRoom({
                        id: 'outside',
                        data: {
                            ...oldRoomOutSide,
                            ...roomData,
                            devices: [...oldRoomOutSide.devices.filter(d => d.id !== newDevice.id), newDevice]
                        }
                    }))
                } else {
                    dispatch(addNewRoom({...roomData, devices: [newDevice]}))
                }
            }

            window.edit2dSelection.clear()
        })
    }

    if (isFirst) {
        return null;
    }
    return (
        <>
            <ToolItemRightSidebar selected={activeTool === toolName} data={data} onClick={onHandleOnClick} />
        </>
    );
};

export default React.memo(EditDetectorTool);

export interface EditDetectorToolProps {
    isFirst: boolean
}