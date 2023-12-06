import React, {useCallback, useEffect} from 'react';
import {ToolName} from "@/contants/tool";
import {useTranslation} from "next-i18next";
import {TbHomeHand} from "react-icons/tb";
import {changeTool} from "@/ForgeViewer/CustomTool";
import ToolItemLeftSidebar from "@/components/Tool/ToolLeftSidebar/ToolItemLeftSidebar";
import { useActiveGroupToolsOnViewer } from '@/hooks/useActiveGroupToolsOnViewer';

const toolName = ToolName.MANUAL_CALL_POINT_TOOL;

const groupToolNames = [
    toolName,
    ToolName.CALL_POINT_SET,
    ToolName.CALL_POINT_LIST,
    ToolName.EMERGENCY_EXIT_LIST,
    ToolName.MARK_EMERGENCY_EXIT,
]

const ManualCallPointTool : React.FC<ManualCallPointToolProps> = ({isFirst}) => {
    const {t} = useTranslation(['common', 'config', 'tool']);

    const {activeTool, setActiveTool, isActiveCurrentTool} = useActiveGroupToolsOnViewer({groupToolNames})

    const data = {
        keyName: toolName,
        icon: <TbHomeHand />,
        name: t('manual_call_point', {ns: 'tool'}),
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

    if (isFirst) {
        return null;
    }
    return <ToolItemLeftSidebar selected={isActiveCurrentTool} data={data} onClick={onHandleOnClick} />
};

export default ManualCallPointTool;

interface ManualCallPointToolProps {
    isFirst: boolean
}