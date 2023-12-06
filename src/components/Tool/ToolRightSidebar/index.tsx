import { ReactElement, ReactNode, useContext, useEffect, useMemo, useState } from 'react'
import { ForgeViewerContext } from '@/context/ForgeViewerContext'
import { LayerKey, LayerStatus, ToolName } from '@/contants/tool'

import DrawingTool from '@/components/ToolHandle/RoomTool/DrawingTool'
import EditRoomTool from '@/components/ToolHandle/RoomTool/EditRoomTool'
import RoomListTool from '@/components/ToolHandle/RoomTool/RoomListTool'

import EditDetectorTool from '@/components/ToolHandle/SmokeDetectorTool/EditDetector'
import WiringTool from '@/components/ToolHandle/SmokeDetectorTool/WiringTool'
import SmokeDetectorListTool from '@/components/ToolHandle/SmokeDetectorTool/SmokeDetectorList'

import MarkDoorExitTool from '@/components/ToolHandle/ManualCallPointTool/MarkDoorExitTool'
import DoorExitListTool from '@/components/ToolHandle/ManualCallPointTool/DoorExitListTool'
import CallPointSetTool from '@/components/ToolHandle/ManualCallPointTool/CallPointSetTool'
import CallPointListTool from '@/components/ToolHandle/ManualCallPointTool/CallPointListTool'
import BmzSetTool from '@/components/ToolHandle/SmokeDetectorTool/BmzSetTool'
import LayerFile from '../LayerFile'

import styles from './ToolRightSidebar.module.scss'
import classNames from 'classnames/bind'
import SymbolListTool from '@/components/ToolHandle/SymbolTool/SymbolListTool'
import UserSymbolTool from '@/components/ToolHandle/SymbolTool/UserSymbolList'
import FloorTool from '@/components/ToolHandle/FloorTool'
import RoomListView from '@/components/ToolHandle/RoomTool/RoomListTool/RoomListView'
import { LayerItemModel, RoomDataModel } from '@/models'
import { useAppSelector } from '@/hooks'
import { selectLayer } from '@/store/slices/tool/layer.slice'
import { drawRoom } from '@/ForgeViewer/CustomTool/Edit2D/draw'
const cx = classNames.bind(styles)

export default function ToolRightSidebar({}: ToolRightSidebarType) {
    const { activeTool } = useContext(ForgeViewerContext)
    const [toolMenu, setToolMenu] = useState<ReactElement[]>([])

    const initTools = [<span key={1}></span>]

    // -----------------------------------------------------------------

    //
    // Share Data between tool here
    //
    // const [roomsFromParent, setRoomsToParent] = useState<RoomDataModel[]>([])

    // console.log("roomsFromParent", roomsFromParent)

    // -----------------------------------------------------------------

    useEffect(() => {
        setToolMenu(initTools)
    }, [])

    useEffect(() => {
        if (activeTool) {
            switch (activeTool) {
                case ToolName.CHOOSE: {
                    setToolMenu([])
                    break
                }
                case ToolName.ROOM_TOOL:
                case ToolName.DRAWING_ROOM:
                case ToolName.EDIT_ROOM:
                case ToolName.ROOM_LIST: {
                    setToolMenu([
                        <RoomListTool key={1} isFirst={false} />,
                        <EditRoomTool key={3} isFirst={false} />,
                        <DrawingTool key={2} isFirst={false} />,
                    ])
                    break
                }
                case ToolName.DETECTOR_TOOL:
                case ToolName.SET_DETECTOR:
                case ToolName.EDIT_DETECTOR:
                case ToolName.DETECTOR_LIST:
                case ToolName.SET_BMZ:
                case ToolName.WIRING_TOOL: {
                    setToolMenu([
                        <SmokeDetectorListTool key={1} isFirst={false} />,
                        <EditDetectorTool key={4} isFirst={false} />,
                        <BmzSetTool key={2} isFirst={false} />,
                        // <SmokeDetectorSetTool key={3} isFirst={false} />,
                        <WiringTool key={5} isFirst={false} />,
                    ])
                    break
                }
                case ToolName.MANUAL_CALL_POINT_TOOL:
                // case ToolName.CALL_POINT_SET:
                case ToolName.CALL_POINT_LIST:
                case ToolName.EMERGENCY_EXIT_LIST:
                case ToolName.MARK_EMERGENCY_EXIT: {
                    setToolMenu([
                        <MarkDoorExitTool key={1} isFirst={false} />,
                        <DoorExitListTool key={2} isFirst={false} />,
                        // <CallPointSetTool key={3} isFirst={false} />,
                        <CallPointListTool key={4} isFirst={false} />,
                    ])
                    break
                }
                case ToolName.SYMBOL_TOOL:
                case ToolName.SYMBOL_LIST:
                case ToolName.SYMBOL_USER_LIST: {
                    setToolMenu([
                        <SymbolListTool key={1} isFirst={false} />,
                        <UserSymbolTool key={2} isFirst={false} />,
                    ])
                    break
                }
                default: {
                    setToolMenu(initTools)
                    break
                }
            }
        } else {
            setToolMenu(initTools)
        }
    }, [activeTool])

    return (
        <div className={cx('tool-right-sidebar')}>
            <div className={cx('tool-right-sidebar__part1')}>
                <LayerFile />
                <div className={cx('tool-right-sidebar__divider')}></div>
            </div>
            <div className={cx('tool-right-sidebar__part2')}>
                {toolMenu.map((element: ReactNode) => element)}
            </div>
            <div className={cx('tool-right-sidebar__part3')}>
                <div className={cx('tool-right-sidebar__divider')}></div>
                <FloorTool />
            </div>
        </div>
    )
}

interface ToolRightSidebarType {}
