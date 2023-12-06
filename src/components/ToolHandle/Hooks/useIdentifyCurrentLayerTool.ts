import {LayerKey, LayerStatus, ToolName} from '@/contants/tool'
import {ForgeViewerContext} from '@/context/ForgeViewerContext'
import {LayerItemModel} from '@/models'
import {useContext, useMemo} from 'react'

/**
 * Collection of Group tools
 */
const groupTools = {
    room_tool: [ToolName.ROOM_TOOL, ToolName.DRAWING_ROOM, ToolName.EDIT_ROOM, ToolName.ROOM_LIST],
    choose: [ToolName.CHOOSE],
    smoke_detector_tool: [
        ToolName.DETECTOR_TOOL,
        ToolName.DETECTOR_LIST,
        ToolName.EDIT_DETECTOR,
        ToolName.SET_DETECTOR,
        ToolName.WIRING_TOOL,
        ToolName.SET_BMZ,
    ],
    manual_call_point: [
        ToolName.MANUAL_CALL_POINT_TOOL,
        ToolName.CALL_POINT_LIST,
        ToolName.CALL_POINT_SET,
        ToolName.EMERGENCY_EXIT_LIST,
        ToolName.MARK_EMERGENCY_EXIT,
    ],
    symbol_tool: [ToolName.SYMBOL_TOOL, ToolName.SYMBOL_USER_LIST, ToolName.SYMBOL_LIST],
    floor_tool: [ToolName.FLOOR_TOOL],
    change_unit: [ToolName.CHANGE_UNIT],
    distance: [ToolName.DISTANCE_TOOL],
}

/**
 * Specified Group tool
 */

const chooseToolGroup = groupTools.choose
const roomToolGroup = groupTools.room_tool
const smokeDetectorToolGroup = groupTools.smoke_detector_tool
const manualCallPointGroup = groupTools.manual_call_point
const symbolToolGroup = groupTools.symbol_tool
const floorToolGroup = groupTools.floor_tool
const changeUnitToolGroup = groupTools.change_unit
const distanceToolGroup = groupTools.distance

/**
 * Should show default tools
 * @returns
 */
const getDefaultTools = () => {
    const groupStatusOpen = [
        `${LayerKey.ROOMS}`,
        `${LayerKey.SMOKE_DETECTOR}`,
        `${LayerKey.WIRING}`,
        `${LayerKey.MANUAL_CALL_POINT}`,
    ]

    return groupStatusOpen
}

// =========================================================================================
// =========================================================================================

export const useIdentifyCurrentLayerTool = ({
    setLayerList,
}: {
    setLayerList: React.Dispatch<React.SetStateAction<LayerItemModel[]>>
}) => {
    const {viewer, activeTool} = useContext(ForgeViewerContext)
    /**
     * Change selected key's status, others will have status: close
     * @param payload
     */
    const changeSelectedStatusKeyExceptOthers = (payload: LayerItemModel) => {
        setLayerList((prev) =>
            [...prev].map((l) => {
                if (l.key === payload.key) {
                    // if(payload.key === 'smoke_detector') {
                    //
                    // }

                    return {...l, status: payload.status}
                }
                return {...l, status: LayerStatus.CLOSE}
            }),
        )
    }

    /**
     * Change selected group keys's status, others will have status: close
     * @param payload
     */
    const changeGroupSelectedStatusKeysExceptOthers = (payload: string[]) => {
        setLayerList((prev) =>
            [...prev].map((l) => {
                if (payload.includes(l.key)) {
                    return {...l, status: LayerStatus.OPEN}
                }
                return {...l, status: LayerStatus.CLOSE}
            }),
        )
    }

    /**
     * Change selected keys's status
     * @param payload
     */
    const changeStatusKeyLayer = (payload: { key: string; status: number }) => {
        setLayerList((prev) =>
            [...prev].map((l) => {
                if (l.key === payload.key) {
                    return {...l, status: payload.status}
                }
                return l
            }),
        )
    }

    /**
     * Change status of each element
     * @param payload
     */
    const changeStatusAll = (payload: { status: number }) => {
        setLayerList((prev) =>
            [...prev].map((l) => {
                return { ...l, status: payload.status }
            }),
        )
    }

    /**
     * Determine current group based on "activeTool"
     */
    const currentGroupTool = useMemo(() => {
        let currentGroup: string[] = chooseToolGroup

        if (chooseToolGroup.includes(activeTool)) {
            //
            currentGroup = chooseToolGroup
            changeGroupSelectedStatusKeysExceptOthers(getDefaultTools())
            //
        } else if (roomToolGroup.includes(activeTool)) {
            //
            currentGroup = roomToolGroup
            changeSelectedStatusKeyExceptOthers({
                key: LayerKey.ROOMS,
                status: LayerStatus.OPEN,
            })
            //
        } else if (smokeDetectorToolGroup.includes(activeTool)) {
            //
            currentGroup = smokeDetectorToolGroup
            changeSelectedStatusKeyExceptOthers({
                key: LayerKey.SMOKE_DETECTOR,
                status: LayerStatus.OPEN,
            })
            //
        } else if (manualCallPointGroup.includes(activeTool)) {
            //
            currentGroup = manualCallPointGroup
            changeSelectedStatusKeyExceptOthers({
                key: LayerKey.MANUAL_CALL_POINT,
                status: LayerStatus.OPEN,
            })
            //
        } else if (symbolToolGroup.includes(activeTool)) {
            //
            currentGroup = symbolToolGroup
            changeStatusAll({status: LayerStatus.CLOSE})
            //
        } else if (changeUnitToolGroup.includes(activeTool)) {
            //
            currentGroup = changeUnitToolGroup
            changeStatusAll({status: LayerStatus.CLOSE})
            //
        } else if (floorToolGroup.includes(activeTool)) {
            //
            currentGroup = floorToolGroup
            //
        } else if (distanceToolGroup.includes(activeTool)) {
            //
            currentGroup = distanceToolGroup
            changeStatusAll({status: LayerStatus.CLOSE})
            //
        }

        return currentGroup
    }, [activeTool, viewer])

    return {
        currentGroupTool,
        groupTools,
        changeStatusKeyLayer,
    }
}
