import {
    onFinishPolygonDrawingRoom, onHandleDrawCircle, onHandleUpdateEditDetector,
    onHandleUpdateEditRoom
} from "@/ForgeViewer/CustomTool/Edit2D/polygon";
import {
    onFinishPolylineChangeUnit,
    overrideHandleButtonUp,
    overrideHandleSingleClick
} from "@/ForgeViewer/CustomTool/Edit2D/polyline";
import {PolygonType} from "@/contants/tool";

// override method default Forge Viewer
export const overrideEdit2D = (tools: any) => {
    // DRAWING_ROOM
    onFinishPolygonDrawingRoom(tools)
    onHandleUpdateEditRoom(tools)

    // DETECTOR
    onHandleUpdateEditDetector(tools)

    // CHANGE_UNIT
    overrideHandleButtonUp(tools)
    onFinishPolylineChangeUnit(tools)
    overrideHandleSingleClick(tools)

    // draw circle
    onHandleDrawCircle(tools)
}

export const startToolEdit2D = (tool: any, callback?: (v: any) => void): boolean => {
    if (!window.NOP_VIEWER) return false;
    try {
        const controller = window.NOP_VIEWER.toolController;

        // Check if currently active tool is from Edit2D
        let activeTool = controller.getActiveTool();
        const isEdit2D = activeTool && activeTool.getName().startsWith("Edit2");

        // deactivate any previous edit2d tool
        if (isEdit2D) {
            controller.deactivateTool(activeTool.getName());
            activeTool = null;
        }

        // stop editing tools
        if (!tool) {
            return true;
        }

        controller.activateTool(tool.getName());
        return true;
    } catch (err: any) {
        console.error(err)
        return false;
    }
}

export const deleteShape = (shapes: any[]) => {
    shapes?.forEach((s: any) => {
        window?.edit2dLayer.removeShape(s);
    })
    window?.edit2dLayer?.update();
}

export const deleteShapeById = (shapeIds: any[]) => {

    if (window.roomLabelList) {
        window.roomLabelList?.filter(l => shapeIds.includes(l.roomId)).forEach(label => label.dtor())
        window.roomLabelList = window.roomLabelList?.filter(l => !shapeIds.includes(l.roomId))
    }

    window?.edit2dLayer?.shapes?.filter((s: any) => shapeIds.includes(s.id)).forEach((s: any) => window.edit2dLayer?.removeShape(s))
    window?.edit2dLayer?.update();
}

export const deleteShapeByName = (names: any[]) => {
    names.forEach((name: any) => {
        const shapes = window?.edit2dLayer?.shapes.filter((s: any) => s.name === name)
        if(shapes) deleteShape(shapes)
    })
}

export const deleteShapeByType = (type: string) => {
    window?.edit2dLayer?.shapes?.filter((s: any) => s.type === type).forEach((s: any) => window.edit2dLayer?.removeShape(s))
    window?.edit2dLayer?.update();
}

// Remove Symbol Plane mesh on the Viewer by id
export const removeSymbolPlaneMesh = async (planeMesh: THREE.Mesh | undefined, idShape: string | undefined) => {
    if (!window.NOP_VIEWER || !planeMesh) return
    window.NOP_VIEWER?.overlays.removeScene(`${planeMesh.uuid}`);
    window.NOP_VIEWER?.overlays.removeMesh(planeMesh, `${planeMesh.uuid}`);
    if (idShape) {
        deleteShapeByName([idShape])
    }
}

// Remove all emergency exit (Line & Label) on the Viewer
export const deleteAllDoorExitShape = () => {
    deleteShape(window.edit2dLayer?.shapes?.filter((shape: any) => shape.type === PolygonType.DOOR_EXIT))
    window.doorLabelList.forEach(label => {
        label.setVisible(false);
        label.dtor();
    });
    window.doorLabelList = []
}

export const deleteAllSmokeDetector = () => {
    deleteShape(window.edit2dLayer?.shapes?.filter((shape: any) => shape.type === PolygonType.SMOKE_DETECTOR))

    window.smokeDetectorList.forEach((smokeDetector: any) => {
        removeSymbolPlaneMesh(smokeDetector.planeMesh, smokeDetector.id)
    })
    window.smokeDetectorList = [];
}

export const deleteAllBmz = () => {
    deleteShape(window.edit2dLayer?.shapes?.filter((shape: any) => shape.type === PolygonType.BMZ))

    window.bmzList.forEach((bmz: any) => {
        removeSymbolPlaneMesh(bmz.planeMesh, bmz.id)
    })
    window.bmzList = [];
}

export const deleteAllSymbol = () => {
    deleteShape(window.edit2dLayer?.shapes?.filter((shape: any) => shape.type === PolygonType.SYMBOL))

    window.symbolList.forEach((symbol: any) => {
        removeSymbolPlaneMesh(symbol.planeMesh, symbol.id)
    })
    window.symbolList = [];
}

export const deleteAllManualCallPoint = () => {
    deleteShape(window.edit2dLayer?.shapes?.filter((shape: any) => shape.type === PolygonType.MANUAL_CALL_POINT))

    window.manualCallPointList.forEach((symbol: any) => {
        removeSymbolPlaneMesh(symbol.planeMesh, symbol.id)
    })
    window.manualCallPointList = [];
}