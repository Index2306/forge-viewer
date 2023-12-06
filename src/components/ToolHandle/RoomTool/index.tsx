import React, {useCallback} from 'react';
import {useTranslation} from "next-i18next";
import {ToolName} from "@/contants/tool";

import {changeTool} from "@/ForgeViewer/CustomTool";
import ToolItemLeftSidebar from "@/components/Tool/ToolLeftSidebar/ToolItemLeftSidebar";

import {LuWarehouse} from "react-icons/lu";
import { useActiveGroupToolsOnViewer } from '@/hooks/useActiveGroupToolsOnViewer';

const toolName = ToolName.ROOM_TOOL;

const groupToolNames = [
    toolName,
    ToolName.DRAWING_ROOM,
    ToolName.EDIT_ROOM,
    ToolName.ROOM_LIST,
]

const RoomTool : React.FC<RoomToolProps> = ({isFirst}) => {
    const {t} = useTranslation(['common', 'config', 'tool']);

    const {activeTool, setActiveTool, isActiveCurrentTool} = useActiveGroupToolsOnViewer({groupToolNames})

    const data = {
        keyName: toolName,
        icon: <LuWarehouse />,
        name: t('room_tool', {ns: 'tool'}),
    }

    const onHandleOnClick = useCallback((event?: any) => {
        if (activeTool === toolName) {
            changeTool(undefined)
            setActiveTool(undefined)
        } else {
            changeTool(toolName, undefined)
            setActiveTool(toolName)
        }
    }, [activeTool, setActiveTool])

    // ------------------------------------------------------------------

    if (isFirst) {
        return null;
    }

    return <ToolItemLeftSidebar selected={isActiveCurrentTool} data={data} onClick={onHandleOnClick} />
};

export default RoomTool;

interface RoomToolProps {
    isFirst: boolean
}