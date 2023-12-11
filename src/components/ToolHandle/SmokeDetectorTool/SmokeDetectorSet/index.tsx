import React, {useCallback, useContext} from 'react';
import {ToolName} from "@/contants/tool";
import {useTranslation} from "next-i18next";
import {ForgeViewerContext} from "@/context/ForgeViewerContext";

// import ToolItem from "@/components/Tool/ToolList/ToolItem";
import ToolItemRightSidebar from "@/components/Tool/ToolRightSidebar/ToolItemRightSidebar";

import {changeTool} from "@/ForgeViewer/CustomTool";
import {FaRegHandPointer} from "react-icons/fa";

const toolName = ToolName.SET_DETECTOR;

const SmokeDetectorSetTool: React.FC<SmokeDetectorSetToolProps> = ({isFirst}) => {
    const {t} = useTranslation(['common', 'config', 'tool']);

    const {activeTool, setActiveTool} = useContext(ForgeViewerContext)

    const data = {
        keyName: toolName,
        icon: <FaRegHandPointer/>,
        name: t('smoke_detector_manual', {ns: 'tool'}),
    }

    const onHandleOnClick = useCallback((event?: any) => {
        if (activeTool === toolName) {
            changeTool(ToolName.DETECTOR_TOOL)
            setActiveTool(ToolName.DETECTOR_TOOL)
        } else {
            changeTool(toolName, undefined)
            setActiveTool(toolName)
        }
    }, [activeTool, setActiveTool])

    if (isFirst) {
        return null;
    }
    return <ToolItemRightSidebar selected={activeTool === toolName} data={data} onClick={onHandleOnClick}/>
};

export default SmokeDetectorSetTool;

interface SmokeDetectorSetToolProps {
    isFirst: boolean
}