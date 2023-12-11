import React, {useCallback} from 'react';
import {useTranslation} from "next-i18next";
import {ToolName} from "@/contants/tool";
import ToolItemLeftSidebar from "@/components/Tool/ToolLeftSidebar/ToolItemLeftSidebar";
import {changeTool} from "@/ForgeViewer/CustomTool";

import {VscSymbolMisc} from 'react-icons/vsc'
import { useActiveGroupToolsOnViewer } from '@/hooks/useActiveGroupToolsOnViewer';
import {deleteAllSymbol} from "@/ForgeViewer/CustomTool/Edit2D";

const toolName = ToolName.SYMBOL_TOOL;

const groupToolNames = [
  toolName,
  ToolName.SYMBOL_LIST,
  ToolName.SYMBOL_USER_LIST,
]

const SymbolTool : React.FC<SymbolToolProps> = ({isFirst}) => {
    const {t} = useTranslation(['common', 'config', 'tool']);

    const {activeTool, setActiveTool, isActiveCurrentTool} = useActiveGroupToolsOnViewer({groupToolNames})

    const data = {
        keyName: toolName,
        icon: <VscSymbolMisc />,
        name: t('symbol_user_list', {ns: 'tool'})
    }

    const onHandleClick = useCallback((event?: any) => {
        if (activeTool === toolName) {
            changeTool(undefined)
            setActiveTool(undefined)
            deleteAllSymbol()
        } else {
            changeTool(toolName, () => {})
            setActiveTool(toolName)
        }
    }, [activeTool, setActiveTool])

    if (isFirst) {
        return null;
    }
    return <ToolItemLeftSidebar selected={isActiveCurrentTool} data={data} onClick={onHandleClick}/>
};

export default React.memo(SymbolTool);

export interface SymbolToolProps {
    isFirst: boolean
}