import React, {useCallback, useEffect} from 'react';
import {PolygonType, ToolName} from "@/contants/tool";
import {useActiveGroupToolsOnViewer} from "@/hooks/useActiveGroupToolsOnViewer";
import {useTranslation} from "next-i18next";
import {VscSymbolMisc} from "react-icons/vsc";
import {changeTool} from "@/ForgeViewer/CustomTool";
import SubToolRightSidebar from "@/components/Tool/ToolRightSidebar/SubToolSidebar";
import ToolItemRightSidebar from "@/components/Tool/ToolRightSidebar/ToolItemRightSidebar";
import UserSymbolListView from "@/components/ToolHandle/SymbolTool/UserSymbolList/UserSymbolList";
import {Vector2} from "three";
import {convertPointLayerToModel, isPointInsidePolygon} from "@/ForgeViewer/CustomTool/Point";
import {addNewRoom, selectTool, updateDataRoom, updateSymbol} from "@/store/slices/tool/tool.slice";
import {deleteShapeById} from "@/ForgeViewer/CustomTool/Edit2D";
import {drawCircleShape} from "@/ForgeViewer/CustomTool/Edit2D/draw";
import {useAppDispatch, useAppSelector} from "@/hooks";
import {SymbolDataModel} from "@/models";

const toolName = ToolName.SYMBOL_USER_LIST;

const groupToolNames = [
    toolName,
    ToolName.SYMBOL_TOOL,
    ToolName.SYMBOL_LIST,
]

const UserSymbolListTool : React.FC<UserSymbolToolProps> = ({isFirst}) => {
    const {t} = useTranslation(['common', 'config', 'tool']);

    const dispatch = useAppDispatch();
    const {activeTool, setActiveTool, isActiveCurrentTool} = useActiveGroupToolsOnViewer({groupToolNames})
    const {currentFile} = useAppSelector(selectTool);

    const data = {
        keyName: toolName,
        icon: <VscSymbolMisc />,
        name: t('symbol_user_list', {ns: 'tool'})
    }

    const onHandleOnClick = useCallback((event?: any) => {
        if (activeTool === toolName) {
            changeTool(ToolName.SYMBOL_TOOL)
            setActiveTool(ToolName.SYMBOL_TOOL)
        } else {
            changeTool(toolName, () => {})
            setActiveTool(toolName)
        }
    }, [activeTool, setActiveTool])


    useEffect(() => {
        window.addEventListener(
            "endDragMoveSymbol",
            onHandleEndDragEditPolygon,
            false,
        );

        window.addEventListener(
            "moveSymbol",
            onHandleMoveEditPolygon,
            false,
        );

        return () => {
            window.removeEventListener("endDragMoveSymbol", onHandleEndDragEditPolygon)
            window.removeEventListener("moveSymbol", onHandleMoveEditPolygon)
        }
    }, [currentFile?.fileData?.symbols])

    const onHandleMoveEditPolygon = (event: any) => {
        const poly = event.detail;
        new Promise(() => {
            if (poly) {
                poly.planeMesh.position.set(poly.centerX, poly.centerY, 5);
                window.NOP_VIEWER.impl.invalidate(true, true, true);
            }
        })
    }

    const onHandleEndDragEditPolygon = (event: any) => {
        const list = event.detail;

        const poly = list?.find((p: any) => p.type === PolygonType.SYMBOL);
        if (!poly) return;

        new Promise(() => {
            const newPositionLayer = {x: poly.centerX, y: poly.centerY, z: 0};
            const newPosition = convertPointLayerToModel(newPositionLayer);

            const newSymbol = (currentFile?.fileData?.symbols ?? []).find((symbol: SymbolDataModel) => symbol.id === poly.name);
            if (newSymbol) {
                dispatch(updateSymbol({
                    ...newSymbol,
                    position_layer: newPositionLayer,
                    position: newPosition
                }))
            }
            window.edit2dSelection.clear()
        })
    }

    if (isFirst) {
        return null;
    }
    return <ToolItemRightSidebar
        selected={isActiveCurrentTool}
        data={data}
        onClick={onHandleOnClick}
    >
        <SubToolRightSidebar selected={activeTool === toolName} title={data.name}>
            <UserSymbolListView />
        </SubToolRightSidebar>
    </ToolItemRightSidebar>
};

export default React.memo(UserSymbolListTool);

interface UserSymbolToolProps {
    isFirst: boolean
}