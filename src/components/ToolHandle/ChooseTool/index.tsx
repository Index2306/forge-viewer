import React, {useCallback, useContext} from 'react';
import {useTranslation} from "next-i18next";
import {LayerKey, LayerStatus, ToolName} from "@/contants/tool";
import ToolItemLeftSidebar from "@/components/Tool/ToolLeftSidebar/ToolItemLeftSidebar";
import {ForgeViewerContext} from "@/context/ForgeViewerContext";
import {changeTool} from "@/ForgeViewer/CustomTool";
import IconAction from '@/components/IconAction';
import {changeStatusKey} from "@/store/slices/tool/layer.slice";
import {useAppDispatch} from "@/hooks";

const toolName = ToolName.CHOOSE;

const ChooseTool: React.FC<ChooseToolProps> = ({isFirst}) => {
    const dispatch = useAppDispatch()
    const {t} = useTranslation(['common', 'config', 'tool']);

    const {activeTool, setActiveTool} = useContext(ForgeViewerContext)

    const data = {
        keyName: toolName,
        iconImg: <IconAction src='/assets/icons/icon_cursor.svg' title='icon_cursor' isHover={false} customSize={20}/>,
        name: t('choose', {ns: 'tool'})
    }

    const onHandleClick = useCallback((event?: any) => {
        if (activeTool === toolName) {
            changeTool(undefined)
            setActiveTool(undefined)

        } else {
            dispatch(changeStatusKey({
                key: LayerKey.SMOKE_DETECTOR,
                status: LayerStatus.CLOSE
            }))
            changeTool(toolName, undefined)
            setActiveTool(toolName)
        }
    }, [activeTool, setActiveTool])

    if (isFirst) {
        return null;
    }
    return (
        <ToolItemLeftSidebar selected={activeTool === toolName} data={data} onClick={onHandleClick} />
    )
};

export default React.memo(ChooseTool);

export interface ChooseToolProps {
    isFirst: boolean
}