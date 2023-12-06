import { changeTool } from '@/ForgeViewer/CustomTool';
import IconAction from '@/components/IconAction';
import ToolItemLeftSidebar from "@/components/Tool/ToolLeftSidebar/ToolItemLeftSidebar";
import { ToolName } from "@/contants/tool";
import { ForgeViewerContext } from "@/context/ForgeViewerContext";
import { useTranslation } from "next-i18next";
import React, { useCallback, useContext } from 'react';

const toolName = ToolName.DISTANCE_TOOL;

const DistanceTool: React.FC<DistanceToolProps> = ({ isFirst }) => {
    const { t } = useTranslation(['common', 'config', 'tool']);

    const { activeTool, setActiveTool } = useContext(ForgeViewerContext)

    const data = {
        keyName: toolName,
        iconImg: <IconAction src='/assets/icons/icon_ruler.svg' title='icon_ruler' isHover={false} customSize={28}/>,
        name: t('distance', { ns: 'tool' }),
    }

    const onHandleOnClick = useCallback((event?: any) => {
        if (activeTool === toolName) {
            changeTool(undefined)
            setActiveTool(undefined)
        } else {
            changeTool(toolName)
            setActiveTool(toolName)
        }
    }, [activeTool, setActiveTool])

    if (isFirst) {
        return null;
    }
    return (
        <>
            <ToolItemLeftSidebar selected={activeTool === toolName} data={data} onClick={onHandleOnClick} />
        </>
    );
};

export default React.memo(DistanceTool);

export interface DistanceToolProps {
    isFirst: boolean
}