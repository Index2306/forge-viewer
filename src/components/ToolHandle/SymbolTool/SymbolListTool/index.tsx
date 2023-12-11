import { useTranslation } from 'next-i18next'
import React, { useCallback } from 'react'
import { BiListUl } from 'react-icons/bi'
import { ToolName } from '@/contants/tool'
import ToolItemRightSidebar from '@/components/Tool/ToolRightSidebar/ToolItemRightSidebar'
import { changeTool } from '@/ForgeViewer/CustomTool'
import SubToolRightSidebar from '@/components/Tool/ToolRightSidebar/SubToolSidebar'
import { useActiveGroupToolsOnViewer } from '@/hooks/useActiveGroupToolsOnViewer'
import SymbolList from './SymbolList'

export const toolName = ToolName.SYMBOL_LIST

export const groupToolNames = [
    toolName,
    ToolName.SYMBOL_TOOL
]

const SymbolListTool: React.FC<SymbolListToolProps> = ({ isFirst }) => {
    const { t } = useTranslation(['common', 'config', 'tool'])

    const { activeTool, setActiveTool, isActiveCurrentTool } = useActiveGroupToolsOnViewer({
        groupToolNames,
    })

    const data = {
        keyName: toolName,
        icon: <BiListUl />,
        name: t('symbols', { ns: 'tool' }),
    }

    const onHandleOnClick = useCallback(
        (event?: any) => {
            if (activeTool === toolName) {
                changeTool(ToolName.SYMBOL_TOOL)
                setActiveTool(ToolName.SYMBOL_TOOL)
            } else {
                changeTool(toolName, undefined)
                setActiveTool(toolName)
            }
        },
        [activeTool, setActiveTool],
    )

    if (isFirst) {
        return null
    }
    return (
        <>
            <ToolItemRightSidebar
                selected={isActiveCurrentTool}
                data={data}
                onClick={onHandleOnClick}
            >
                <SubToolRightSidebar selected={activeTool ==  toolName || activeTool == ToolName.SYMBOL_USER_LIST} title={data.name}>
                    <SymbolList />
                </SubToolRightSidebar>
            </ToolItemRightSidebar>
        </>
    )
}

export interface SymbolListToolProps {
    isFirst: boolean
}

export default SymbolListTool
