import React, { useCallback, useContext, useEffect, useState } from 'react'
import { BiListUl } from 'react-icons/bi'
import { ToolName } from '@/contants/tool'
import { useTranslation } from 'next-i18next'
import ToolItemRightSidebar from '@/components/Tool/ToolRightSidebar/ToolItemRightSidebar'
import { changeTool } from '@/ForgeViewer/CustomTool'
import RoomListView from './RoomListView'
import SubToolRightSidebar from '@/components/Tool/ToolRightSidebar/SubToolSidebar'
import { useActiveGroupToolsOnViewer } from '@/hooks/useActiveGroupToolsOnViewer'
import { RoomDataModel } from '@/models'

const toolName = ToolName.ROOM_LIST

const groupToolNames = [toolName, ToolName.DRAWING_ROOM, ToolName.EDIT_ROOM, ToolName.ROOM_TOOL]

const RoomListTool: React.FC<RoomListToolProps> = ({ isFirst }) => {
    const { t } = useTranslation(['common', 'config', 'tool'])

    const { activeTool, setActiveTool, isActiveCurrentTool } = useActiveGroupToolsOnViewer({
        groupToolNames,
    })

    const data = {
        keyName: toolName,
        icon: <BiListUl />,
        name: t('room_list', { ns: 'tool' }),
    }

    const onHandleOnClick = useCallback(() => {
        if (activeTool === toolName) {
            changeTool(ToolName.ROOM_TOOL)
            setActiveTool(ToolName.ROOM_TOOL)
        } else {
            changeTool(toolName, undefined)
            setActiveTool(toolName)
        }
    }, [activeTool, setActiveTool])

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
                <SubToolRightSidebar selected={activeTool === toolName} title={data.name}>
                    <RoomListView />
                </SubToolRightSidebar>
            </ToolItemRightSidebar>
        </>
    )
}

export default React.memo(RoomListTool)

export interface RoomListToolProps {
    isFirst: boolean,
    // onRoomListChange: (roomList: RoomDataModel[]) => void
    // roomsFromParent?: RoomDataModel[]
}
