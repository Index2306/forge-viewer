import {PolygonType, ToolName} from "@/contants/tool";

export const onFinishPolylineChangeUnit = (tools: any, callback?: (v: any) => void) => {
    if (!window.NOP_VIEWER) return
    if (!window.edit2d) return
    if (!tools?.polylineTool) return
    tools.polylineTool.finishPolylineChangeUnit = function () {
        const points = this.poly.points;
        if (checkActiveTool(points)) {
            if (this.mouseTracker) {
                // @ts-ignore
                this.mouseTracker.stopTracking(this.getName(), Autodesk.Edit2D.Trackings.Click);
            }

            // remove all vertex gizmos
            this.clearGizmos();

            // Stop snapping to edges of this polygon
            this.snapper.stopAngleSnapping();

            // moe polygon to main layer
            this.runAction(
                // @ts-ignore
                new Autodesk.Edit2D.Actions.AddShape(tools.polylineTool.layer, tools.polylineTool.poly),
            );

            this.dispatchEvent({
                // @ts-ignore
                type: Autodesk.Edit2D.PolygonTool.POLYGON_ADDED,
                polygon: tools.polylineTool.poly,
            });

            if (callback) {
                if (window.activeTool === ToolName.MARK_EMERGENCY_EXIT) {
                    if (this.poly?.type == PolygonType.DOOR_EXIT) {
                        window.dispatchEvent(new CustomEvent('endMarkDoor', {detail: {...this.poly}}))
                    }
                } else {
                    callback(this.layer.shapes)
                }
            }

            // Start another polygon on next click
            this.poly = null;
        }
    };
}

export const overrideHandleButtonUp = (tools: any, callback?: (v: any) => void) => {
    if (!window.NOP_VIEWER) return;
    if (!window.edit2d) return;
    tools.polylineTool.lineRectTool.updateLine = function () {
        if (!this.isDragging()) {
            return;
        }

        this.line.updatePoint(1, this.endPoint.x, this.endPoint.y);
        this.gizmoLayer.update();

        this.lengthLabel.setShape(this.line);
        if (window.activeTool === ToolName.MARK_EMERGENCY_EXIT) {
            this.line.type = PolygonType.DOOR_EXIT;
        }
        if (window.activeTool === ToolName.CHANGE_UNIT) {
            this.line.type = PolygonType.UNIT;
        }
    };

    tools.polylineTool.handleButtonUp = function (event: any, button: number | any) {
        let poly = null;
        if (window.activeTool === ToolName.MARK_EMERGENCY_EXIT || window.activeTool === ToolName.CHANGE_UNIT) {
            poly = {...this.lineRectTool.line}
        }
        const result = this.lineRectTool.handleButtonUp(event, button);
        if (callback) {
            if (window.activeTool === ToolName.MARK_EMERGENCY_EXIT) {
                if (poly?.type === PolygonType.DOOR_EXIT) {
                    window.dispatchEvent(new CustomEvent('endMarkDoor', {detail: poly}))
                }
            }
            else if (window.activeTool === ToolName.CHANGE_UNIT) {
                if (poly?.type === PolygonType.UNIT) {
                    callback([poly])
                }
            }
        }

        return result;
    };
}

export const overrideHandleSingleClick = (tools: any, callback?: (v: any) => void) => {
    if (!window.NOP_VIEWER) return;
    tools.polylineTool.handleSingleClick = function (event: any, button: any) {
        this.trackMousePos(event, button);

        // Only respond to left mouse button.
        if (!(button === 0)) {
            return false;
        }

        // Avoid duplicate vertices on double-clicks
        if (this.vertexGizmos.length > 0 && event.canvasX === this.lastClickX && event.canvasY === this.lastClickY) {
            return true;
        }

        this.lastClickX = event.canvasX;
        this.lastClickY = event.canvasY;

        this.mousePos.copy(this.getSnapPosition(event.canvasX, event.canvasY));

        if (this.mouseTracker) {
            // @ts-ignore
            this.mouseTracker.startTracking(this.getName(), Autodesk.Edit2D.Trackings.Click);
        }

        // Init polygon on first click
        if (!this.poly) {
            this.startPoly(this.mousePos.x, this.mousePos.y);
        }

        this.addVertex(this.mousePos.x, this.mousePos.y);

        if ((window.activeTool === ToolName.CHANGE_UNIT || window.activeTool === ToolName.MARK_EMERGENCY_EXIT)
            && this.poly?._loops?.length > 0
            && this.poly?._loops[0].length === 2) {
            this.poly.type = PolygonType.DOOR_EXIT;
            this.finishPolylineChangeUnit()
            return true;
        }

        return true;
    };
}

const checkActiveTool = (points: any[]): boolean => {
    switch (window.activeTool) {
        case ToolName.CHANGE_UNIT: {
            return points?.length === 2;
        }
        default: return true;
    }
}