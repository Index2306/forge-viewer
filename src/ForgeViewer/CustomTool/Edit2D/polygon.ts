import {PolygonType, ToolName} from "@/contants/tool";
import { Vector3 } from "three";
import { Vector2 } from "three";

export const onFinishPolygonDrawingRoom = (tools: any, callback?: (v: any) => void) => {
    if (!window.NOP_VIEWER) return;
    if (!window.edit2d) return;
    tools.polygonTool.finishPolygon = function () {
        const points = this.poly._loops[0];

        if (this.mouseTracker) {
            // @ts-ignore
            this.mouseTracker.stopTracking(this.getName(), Autodesk.Edit2D.Trackings.Click);
        }

        if (isAcceptDrawRoom(points)) {

            // remove all vertex gizmos
            this.clearGizmos();

            // Stop snapping to edges of this polygon
            this.snapper.stopAngleSnapping();

            // move polygon to main layer
            // @ts-ignore
            this.runAction(new Autodesk.Edit2D.Actions.AddShape(this.layer, this.poly));

            // @ts-ignore
            this.dispatchEvent({ type: Autodesk.Edit2D.PolygonTool.POLYGON_ADDED, polygon: this.poly });

            if (callback) {
                if (window.activeTool === ToolName.DRAWING_ROOM) {
                    window.dispatchEvent(new CustomEvent('endDrawRoom', {detail: {...this.poly}}))
                }
                // callback({...this.poly})
            }

            // Start another polygon on next click
            this.poly = null;
        }

    };
}

export const onHandleUpdateEditRoom = (tools: any, callback?: (...parameters: any[]) => void) => {
    if (!window.NOP_VIEWER) return;
    if (!window.edit2d) return;

    tools.polygonEditTool.moveTool.endDrag = function (point: any) {
        if (this.mouseTracker) {
            // @ts-ignore
            this.mouseTracker.stopTracking(this.getName(), Autodesk.Edit2D.Trackings.Drag);
        }

        // No drag active
        if (!this.shapes) {
            return;
        }

        // Revert any temporary modifications done during mouse move
        this.shapes.forEach((shape: any, i: number) => {
            shape.copy(this.backupShapes[i])
        });

        // Apply move operation
        const dx = point.x - this.dragStartPoint.x;
        const dy = point.y - this.dragStartPoint.y;

        if(callback && this.shapes?.length > 0) {
            const shapeCopy = this.shapes[0].clone()
            // debugger
            shapeCopy.name = this.shapes[0].name;
            shapeCopy.type = this.shapes[0].type;

            if (window.activeTool === ToolName.EDIT_DETECTOR) {
                shapeCopy.centerPoint = this.shapes[0].centerPoint;
                shapeCopy.planeMesh = this.shapes[0].planeMesh;
                shapeCopy.smokeDetector = this.shapes[0].smokeDetector;
                shapeCopy.radiusModel = this.shapes[0].radiusModel;
                shapeCopy.radiusLayer = this.shapes[0].radiusLayer;
                shapeCopy.tessSegments = this.shapes[0].tessSegments;
                callback('edit', shapeCopy.move(dx,dy), this.shapes[0].planeMesh)
            } else if (window.activeTool === ToolName.EMERGENCY_EXIT_LIST) {
                window.dispatchEvent(new CustomEvent('endMoveDoor', {detail: {...shapeCopy.move(dx,dy)}}))
            } else {
                callback(shapeCopy.move(dx,dy))
            }

        }

        if (this.loopIndex === -1) {
            // @ts-ignore
            this.undoStack.run(new Autodesk.Edit2D.Actions.MoveShapes(this.layer, this.shapes, dx, dy));
        } else {
            // @ts-ignore
            this.undoStack.run(new Autodesk.Edit2D.Actions.MoveLoop(this.layer, this.shapes[0], this.loopIndex, dx, dy));
        }

        this.shapes = null;
        this.loopIndex = -1;
        return;
    };

    tools.polygonEditTool.vertexMoveTool.moveDragVertex = function (canvasX: any, canvasY: any) {
        const { loop, vertex } = this.draggedVertex;

        // Note that the vertex we are dragging does not always match exactly with the mouse position. E.g., we may have picked the bottom-left boundary of a vertex gizmo at drag-start.
        const x = canvasX + this.dragOffset.x;
        const y = canvasY + this.dragOffset.y;

        // get delta between last and current position
        const p = this.getSnapPosition(x, y);
        const dx = p.x - this.lastDragPoint.x;
        const dy = p.y - this.lastDragPoint.y;

        // apply this offset to polygon point
        let point = this.poly.getPoint(vertex, loop);
        const pointClone = point.clone();
        this.poly.updatePoint(vertex, point.x + dx, point.y + dy, loop);

        const isInLine = isAllPointsInLine(this.poly.points);
        if (isInLine && window.activeTool !== ToolName.EMERGENCY_EXIT_LIST) {
            this.poly.updatePoint(vertex, pointClone.x, pointClone.y, loop);

            // re-center gizmo at new point position
            const vertexGizmo = this.vertexGizmos[loop][vertex];
            vertexGizmo.setPosition(pointClone.x, pointClone.y);

            this.gizmoLayer.update(); // we moved the vertex gizmo
            this.layer.update(); // we changed the main polygon

            this.lastDragPoint.copy(pointClone);
        } else {
            const vertexGizmo = this.vertexGizmos[loop][vertex];
            vertexGizmo.setPosition(point.x, point.y);

            this.gizmoLayer.update(); // we moved the vertex gizmo
            this.layer.update(); // we changed the main polygon

            this.lastDragPoint.copy(p);
        }
    };

    tools.polygonEditTool.vertexMoveTool.endDragVertex = function () {
        if (this.mouseTracker) {
            // @ts-ignored
            this.mouseTracker.stopTracking(this.getName(), Autodesk.Edit2D.Trackings.Drag);
        }

        // First, restore "before move" position of the vertex
        this.restoreDragVertex();

        const pBefore = this.dragVertexStartPos;
        const pAfter = this.lastDragPoint;

        // don't add extra undo-operation if the vertex was hardly moved at all
        const minDist = this.layer.getUnitsPerPixel() * 0.5;
        const moved = pBefore.distanceTo(pAfter) > minDist;

        if (moved) {
            // Finalize vertex-move
            // @ts-ignored
            this.runAction(new Autodesk.Edit2D.Actions.MoveVertex(this.layer, this.poly, this.draggedVertex, pAfter));
            if (window.activeTool === ToolName.EMERGENCY_EXIT_LIST) {
                window.dispatchEvent(new CustomEvent('endMoveDoor', {detail: {...this.poly}}))
            }
        }

        this.draggedVertex = null;
        this.snapper.clearSnappingGizmos();
    };
}

export const onHandleUpdateEditDetector = (tools: any, callback?: (...parameters: any[]) => void) => {
    if (!window.NOP_VIEWER) return;
    if (!window.edit2d) return;
    tools.moveTool.handleSingleClick = function (e: any) {
        const shapesToMove = this.selection.getSelectedShapes();
        if (callback) {
            if (shapesToMove && shapesToMove.length > 0 && window.activeTool === ToolName.EDIT_DETECTOR) {
                callback('click', shapesToMove[0])
            }
        }
        return shapesToMove && shapesToMove.length > 0;
    };

    tools.moveTool.startDrag = function (shapes: any, startPos: any) {
        if (shapes && shapes.length > 0 && shapes[0].type === PolygonType.WIRING) {
            return false;
        }

        let loopIndex = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : -1;
        const allShapesCanBeMoved = this.moveFilters.every((m: any) => m(shapes));
        if (!allShapesCanBeMoved) {
            // if any of the selected shapes cannot be moved, don't allow the group to be moved.
            return false;
        }

        if (this.mouseTracker) {
            // @ts-ignore
            this.mouseTracker.startTracking(this.getName(), Autodesk.Edit2D.Trackings.Drag);
        }

        if (callback) {
            if (shapes && shapes.length > 0 && window.activeTool === ToolName.EDIT_DETECTOR) {
                callback('click', shapes[0])
            }
        }

        this.shapes = shapes;
        this.loopIndex = loopIndex;
        this.dragStartPoint.copy(startPos);
        this.backupShapes = shapes.map((s: any) => s.clone());
    };

    tools.moveTool.moveDrag = function (p: any) {
        const dx = p.x - this.dragStartPoint.x;
        const dy = p.y - this.dragStartPoint.y;

        if (callback) {
            const shapesToMove = this.selection.getSelectedShapes();
            if (shapesToMove && shapesToMove.length > 0) {
                if (window.activeTool === ToolName.EDIT_DETECTOR) {
                    callback('move', shapesToMove.find((s: any) => s.type === PolygonType.SMOKE_DETECTOR))
                }
                else if (window.activeTool === ToolName.CALL_POINT_LIST) {
                    callback(shapesToMove.find((s: any) => s.type === PolygonType.MANUAL_CALL_POINT))
                }
                else if (window.activeTool === ToolName.SYMBOL_TOOL || window.activeTool === ToolName.SYMBOL_USER_LIST) {
                    window.dispatchEvent(new CustomEvent('moveSymbol', {detail: {...shapesToMove.find((s: any) => s.type === PolygonType.SYMBOL)}}))
                }
            }
        }

        // Apply this offset to shape. We always start with the original shape as a reference
        // to avoid accumulating delta inaccuracies.
        this.shapes.forEach((shape: any, i: number) => {
            shape.copy(this.backupShapes[i]);

            if (this.loopIndex === -1) {
                // Default: Move whole shape(s)
                shape.move(dx, dy);
            } else {
                // Only move single loop
                shape.moveLoop(dx, dy, this.loopIndex);
            }
        });
        this.layer.update();
        this.gizmoLayer.update();
    };

    tools.moveTool.endDrag = function (p: any) {
        if (this.mouseTracker) {
            // @ts-ignore
            this.mouseTracker.stopTracking(this.getName(), Autodesk.Edit2D.Trackings.Drag);
        }

        // No drag active
        if (!this.shapes) {
            return;
        }

        // Revert any temporary modifications done during mouse move
        this.shapes.forEach((shape: any, i: number) => shape.copy(this.backupShapes[i]));

        // Apply move operation
        const dx = p.x - this.dragStartPoint.x;
        const dy = p.y - this.dragStartPoint.y;

        if (this.loopIndex === -1) {
            // @ts-ignore
            this.undoStack.run(new Autodesk.Edit2D.Actions.MoveShapes(this.layer, this.shapes, dx, dy));
        } else {
            // @ts-ignore
            this.undoStack.run(new Autodesk.Edit2D.Actions.MoveLoop(this.layer, this.shapes[0], this.loopIndex, dx, dy));
        }

        if (callback) {
            if (this.shapes && this.shapes.length > 0) {
                if (window.activeTool === ToolName.EDIT_DETECTOR) {
                    window.dispatchEvent(new CustomEvent('endDragMoveDetector', {detail: this.shapes}))
                } else if (window.activeTool === ToolName.CALL_POINT_LIST) {
                    window.dispatchEvent(new CustomEvent('endDragMoveManualCallPoint', {detail: {...this.shapes}}))
                } else if (window.activeTool === ToolName.SYMBOL_TOOL || window.activeTool === ToolName.SYMBOL_USER_LIST) {
                    window.dispatchEvent(new CustomEvent('endDragMoveSymbol', {detail: [...this.shapes]}))
                }
            }
        }

        this.shapes = null;
        this.loopIndex = -1;

        return true;
    };
}

export const onHandleDrawCircle = (tools: any, callback?: (v: any) => void) => {
    if (!window.NOP_VIEWER) return;
    if (!window.edit2d) return;
    tools.insertSymbolTool.handleAutoDraw = function (position: any, planeMesh: any, smokeDetector?: any, radiusModel?: any, radiusLayer?: any, tessSegments?: any) {
        const oldSymbol = {...tools.insertSymbolTool.symbol};
        const symbol = tools.insertSymbolTool.symbol.clone();
        symbol.move(position.x, position.y);
        symbol.centerPoint = position;
        symbol.planeMesh = planeMesh;
        symbol.type = oldSymbol.type;
        symbol.name = oldSymbol.name;
        if (oldSymbol.type === PolygonType.SYMBOL) {
            symbol.symbolId = oldSymbol.name;
        } else if (oldSymbol.type === PolygonType.SMOKE_DETECTOR) {
            symbol.isCircle = oldSymbol.isCircle; // flag for Alarm device
            symbol.isAlarmDevice = true; // flag for Alarm device
            symbol.deviceId = oldSymbol.name;

            symbol.smokeDetector = smokeDetector;
            symbol.radiusModel = radiusModel;
            symbol.radiusLayer = radiusLayer;
            symbol.tessSegments = tessSegments;
        }

        // @ts-ignore
        tools.insertSymbolTool.undoStack.run(new Autodesk.Edit2D.Actions.AddShape(this.layer, symbol));

        tools.insertSymbolTool.dispatchEvent({
            // @ts-ignore
            type: Autodesk.Edit2D.InsertSymbolTool.SYMBOL_INSERTED,
            symbol,
        });

        return true;
    };

    tools.insertSymbolTool.handleAutoDrawSymbol = function (position: any, planeMesh: any) {
        const oldSymbol = {...tools.insertSymbolTool.symbol};
        const symbol = tools.insertSymbolTool.symbol.clone();
        symbol.move(position.x, position.y);
        symbol.centerPoint = position;
        symbol.planeMesh = planeMesh;
        symbol.type = oldSymbol.type;
        symbol.name = oldSymbol.name;
        if (oldSymbol.type === PolygonType.MANUAL_CALL_POINT) {
            symbol.symbolId = oldSymbol.name;
            symbol.isCircle = oldSymbol.isCircle; // flag for Alarm device
            symbol.isAlarmDevice = false; // flag for Alarm device

        }
        // @ts-ignore
        tools.insertSymbolTool.undoStack.run(new Autodesk.Edit2D.Actions.AddShape(this.layer, symbol));

        tools.insertSymbolTool.dispatchEvent({
            // @ts-ignore
            type: Autodesk.Edit2D.InsertSymbolTool.SYMBOL_INSERTED,
            symbol,
        });

        return true;
    };
}

/**
 * Helper for checking if all points in line, apply with
 * coordinate of X or coordinate of Y or by diagonal
 * @param {*} points
 * @returns
 */
export const isAllPointsInLine = (points: any): boolean => {
    const ESP = 0.01;
    const boolArr = [];

    for (let i = 0; i < points.length; i++) {
        if (i > 1) {
            const p0 = points[i];
            const p1 = points[i - 1];
            const p2 = points[i - 2];

            const vector1 = new Vector2();
            vector1.subVectors(p0, p1).normalize();

            const vector2 = new Vector2();
            vector2.subVectors(p2, p1).normalize();

            const angle = Math.abs(findAngle(vector1, vector2));

            if (angle <= ESP || Math.abs(angle - Math.PI) <= ESP) {
                boolArr.push(true);
            } else {
                boolArr.push(false);
            }
        }
    }
    const result = boolArr.every((e) => e === true);

    return result;
};

// Calculate the angle between two vectors. Return rad
const findAngle = (vec1: any, vec2: any) => {
    const vector3_1 = new Vector3(vec1.x, vec1.y, 0);
    const vector3_2 = new Vector3(vec2.x, vec2.y, 0);
    return vector3_1.angleTo(vector3_2);
};


/**
 * Helper for checking should accept for drawing room
 * @param {*} points
 * @returns
 */
export const isAcceptDrawRoom = (points: any) => {
    /**
     * Do not create room if have only 2 points
     */
    if (points.length <= 2) {
        return false;
    }

    /**
     * Do not create room if all points in line
     */
    if (isAllPointsInLine(points)) {
        return false;
    }

    return true;
};
