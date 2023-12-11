import React, {useCallback, useEffect, useState} from 'react';
import {ToolName} from "@/contants/tool";
import {useTranslation} from "next-i18next";

// import ToolItem from "@/components/Tool/ToolList/ToolItem";
import ToolItemRightSidebar from "@/components/Tool/ToolRightSidebar/ToolItemRightSidebar";

import {changeTool} from "@/ForgeViewer/CustomTool";
import SmokeDetectorListView from "@/components/ToolHandle/SmokeDetectorTool/SmokeDetectorList/SmokeDetectorListView";
import SubToolRightSidebar from '@/components/Tool/ToolRightSidebar/SubToolSidebar';
import {useActiveGroupToolsOnViewer} from '@/hooks/useActiveGroupToolsOnViewer';
import {BiListUl} from 'react-icons/bi';
import {deleteAllBmz, deleteAllSmokeDetector} from "@/ForgeViewer/CustomTool/Edit2D";
import BmzList from "@/components/ToolHandle/SmokeDetectorTool/SmokeDetectorList/BmzList";

const toolName = ToolName.DETECTOR_LIST;

const groupToolNames = [
    toolName,
    ToolName.DETECTOR_TOOL,
    ToolName.EDIT_DETECTOR,
    ToolName.SET_DETECTOR,
    ToolName.WIRING_TOOL,
    ToolName.SET_BMZ
]

const SmokeDetectorListTool: React.FC<SmokeDetectorListToolProps> = ({isFirst}) => {
    const {t} = useTranslation(['common', 'config', 'tool']);

    const {activeTool, setActiveTool, isActiveCurrentTool} = useActiveGroupToolsOnViewer({groupToolNames})

    const [isClose, setIsClose] = useState<boolean>(false)

    useEffect(() => {
        const isDifferentGroupTool = !groupToolNames.includes(activeTool)
        if (isDifferentGroupTool) {
            onHandleRemoveAllDetectorOnViewer()
        }

        return () => {
            setIsClose(true)
        }
    }, [activeTool, window.activeTool])

    const data = {
        keyName: toolName,
        icon: <BiListUl/>,
        name: t('smoke_detector_list', {ns: 'tool'}),
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

    const onHandleRemoveAllDetectorOnViewer = useCallback(() => {
        deleteAllSmokeDetector()
        deleteAllBmz()
    }, [])

    if (isFirst) {
        return null;
    }
    return (
        <>
            <ToolItemRightSidebar  selected={isActiveCurrentTool} data={data} onClick={onHandleOnClick}>
                <BmzList isActiveCurrentTool={isActiveCurrentTool} />
                <SubToolRightSidebar selected={activeTool === toolName} title={data.name}>
                    <SmokeDetectorListView isClose={isClose} />
                </SubToolRightSidebar>
            </ToolItemRightSidebar>
        </>
    )
};

export default React.memo(SmokeDetectorListTool);

interface SmokeDetectorListToolProps {
    isFirst: boolean
}