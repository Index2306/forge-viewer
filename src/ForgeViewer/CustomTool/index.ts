import { startToolEdit2D } from "@/ForgeViewer/CustomTool/Edit2D";
import {
    onFinishPolygonDrawingRoom, onHandleUpdateEditDetector,
    onHandleUpdateEditRoom,
} from "@/ForgeViewer/CustomTool/Edit2D/polygon";
import { onFinishPolylineChangeUnit, overrideHandleButtonUp } from "@/ForgeViewer/CustomTool/Edit2D/polyline";
import { ToolName } from "@/contants/tool";
import { StartToolDistance } from "./Distance";

export const changeTool = (key: string | undefined, callback?: (...parameters: any[]) => void): boolean => {
    // clear tool before choose new tool
    clearAllTool()

    switch (key) {
        case ToolName.CHANGE_UNIT:
        case ToolName.MARK_EMERGENCY_EXIT: {
            onFinishPolylineChangeUnit(window.edit2dTools, callback)
            overrideHandleButtonUp(window.edit2dTools, callback)
            return startToolEdit2D(window.edit2dTools.polylineTool, callback)
        }
        case ToolName.DISTANCE_TOOL: {
            return StartToolDistance(true, callback)
        }
        case ToolName.DRAWING_ROOM: {
            onFinishPolygonDrawingRoom(window.edit2dTools, callback)
            return startToolEdit2D(window.edit2dTools.polygonTool, callback)
        }
        case ToolName.EDIT_ROOM: {
            onHandleUpdateEditRoom(window.edit2dTools, callback)
            return startToolEdit2D(window.edit2dTools.polygonEditTool, callback)
        }
        case ToolName.EDIT_DETECTOR: {
            onHandleUpdateEditDetector(window.edit2dTools, callback)
            return startToolEdit2D(window.edit2dTools.moveTool, callback)
        }
        case ToolName.EMERGENCY_EXIT_LIST: {
            onHandleUpdateEditRoom(window.edit2dTools, callback)
            return startToolEdit2D(window.edit2dTools.polygonEditTool, callback)
        }
        case ToolName.CALL_POINT_LIST: {
            onHandleUpdateEditDetector(window.edit2dTools, callback)
            return startToolEdit2D(window.edit2dTools.moveTool, callback)
        }
        case ToolName.SYMBOL_TOOL:
        case ToolName.SYMBOL_USER_LIST: {
            onHandleUpdateEditDetector(window.edit2dTools, callback)
            return startToolEdit2D(window.edit2dTools.moveTool, callback)
        }
        default: {
            clearAllTool()
            return true;
        }
    }
}

const clearAllTool = () => {
    // change unit
    onFinishPolylineChangeUnit(window.edit2dTools, undefined)
    overrideHandleButtonUp(window.edit2dTools, undefined)

    // room
    onFinishPolygonDrawingRoom(window.edit2dTools, undefined)
    onHandleUpdateEditRoom(window.edit2dTools, undefined)

    // detector
    onHandleUpdateEditDetector(window.edit2dTools, undefined)

    // end clear tool
    startToolEdit2D(undefined)

    // deactive DISTANCE
    StartToolDistance(undefined)
}