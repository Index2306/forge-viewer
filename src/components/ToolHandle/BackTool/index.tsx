import {ToolName} from "@/contants/tool";
import React, {useCallback, useContext} from "react";
import {useTranslation} from "next-i18next";
import {ForgeViewerContext} from "@/context/ForgeViewerContext";
import {changeTool} from "@/ForgeViewer/CustomTool";
import ToolItemLeftSidebar from "@/components/Tool/ToolLeftSidebar/ToolItemLeftSidebar";
import {IoChevronBackOutline} from "react-icons/io5";

const toolName = ToolName.CHOOSE;

const BackTool : React.FC<BackToolProps> = ({isFirst}) => {
    const {t} = useTranslation(['common']);

    const {activeTool, setActiveTool} = useContext(ForgeViewerContext)

    const data = {
        keyName: toolName,
        icon: <IoChevronBackOutline />,
        name: t('back'),
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
    return <ToolItemLeftSidebar selected={activeTool === toolName} data={data} onClick={onHandleOnClick} />
};

export default BackTool;

interface BackToolProps {
    isFirst: boolean
}