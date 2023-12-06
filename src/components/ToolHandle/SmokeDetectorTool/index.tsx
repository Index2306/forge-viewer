import {LayerKey, LayerStatus, ToolName} from "@/contants/tool";
import React, {useCallback} from "react";
import {useTranslation} from "next-i18next";

import {changeTool} from "@/ForgeViewer/CustomTool";
import ToolItemLeftSidebar from "@/components/Tool/ToolLeftSidebar/ToolItemLeftSidebar";

import {BsDeviceSsd} from "react-icons/bs";
import {useActiveGroupToolsOnViewer} from "@/hooks/useActiveGroupToolsOnViewer";
import {changeStatusKey} from "@/store/slices/tool/layer.slice";
import {useAppDispatch} from "@/hooks";

const toolName = ToolName.DETECTOR_TOOL;

const groupToolNames = [
    toolName,
    ToolName.SET_DETECTOR,
    ToolName.EDIT_DETECTOR,
    ToolName.DETECTOR_LIST,
    ToolName.WIRING_TOOL,
    ToolName.SET_BMZ,
]

const SmokeDetectorTool : React.FC<SmokeDetectorToolProps> = ({isFirst}) => {
    const dispatch = useAppDispatch()
    const {t} = useTranslation(['common', 'config', 'tool']);

    const {activeTool, setActiveTool, isActiveCurrentTool} = useActiveGroupToolsOnViewer({groupToolNames})

    const data = {
        keyName: toolName,
        icon: <BsDeviceSsd />,
        name: t('smoke_detector_tool', {ns: 'tool'}),
    }

    const onHandleOnClick = useCallback((event?: any) => {
        let open: boolean = false
        if (activeTool === toolName) {
            changeTool(undefined)
            setActiveTool(undefined)
            open = false
        } else {
            changeTool(toolName, undefined)
            setActiveTool(toolName)
            open = true
        }

        dispatch(changeStatusKey({
            key: LayerKey.SMOKE_DETECTOR,
            status: open ? LayerStatus.OPEN : LayerStatus.CLOSE
        }))
    }, [activeTool, setActiveTool])

    if (isFirst) {
        return null;
    }
    return <ToolItemLeftSidebar selected={isActiveCurrentTool} data={data} onClick={onHandleOnClick} />
};

export default SmokeDetectorTool;

interface SmokeDetectorToolProps {
    isFirst: boolean
}