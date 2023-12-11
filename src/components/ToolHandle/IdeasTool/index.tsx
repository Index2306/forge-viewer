import React, {useCallback, useContext} from 'react';
import {ToolName} from "@/contants/tool";
import {FiSettings} from "react-icons/fi";
import ToolItemLeftSidebar from "@/components/Tool/ToolLeftSidebar/ToolItemLeftSidebar"
import {useTranslation} from "next-i18next";
import {ForgeViewerContext} from "@/context/ForgeViewerContext";
import {changeTool} from "@/ForgeViewer/CustomTool";

const toolName = ToolName.IDEAS;

const IdeasTool : React.FC<IdeasToolProps> = ({isFirst}) => {

    const {t} = useTranslation(['common', 'config', 'tool']);

    const {activeTool, setActiveTool} = useContext(ForgeViewerContext)

    const data = {
        keyName: toolName,
        icon: <FiSettings />,
        name: t('ideas', {ns: 'tool'}),
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

export default React.memo(IdeasTool);

export interface IdeasToolProps {
    isFirst: boolean
}