import {Vector2} from "three";
import {deleteShapeByName} from "@/ForgeViewer/CustomTool/Edit2D/index";
import {Point3D} from "@/models";
import {PolygonType} from "@/contants/tool";

export const DrawDoorExit = (id: string, name: string, startPoint: Vector2 | undefined, endPoint: Vector2 | undefined, isShow: boolean = true) => {
    new Promise(() => {
       if (isShow && startPoint && endPoint) {
           drawDoorExitOnViewer(id, name, startPoint, endPoint)
       } else {
           removeDoorExitOnViewer(id)
       }
    });
}

const drawDoorExitOnViewer = (id: string, name: string, startPoint: Vector2, endPoint: Vector2) => {
    const poly = new Autodesk.Edit2D.Polyline([startPoint, endPoint]);

    // @ts-ignore
    poly.name = id;
    poly.style.lineWidth = 6;
    poly.style.lineColor = 'red';

    // @ts-ignore
    poly.type = PolygonType.DOOR_EXIT;

    window?.edit2dLayer?.addShape(poly);
    window?.edit2dLayer?.update();

    drawLabelDoor(id, name, poly, true);
}

const removeDoorExitOnViewer = (id: string) => {
    deleteShapeByName([id])
    drawLabelDoor(id, undefined, undefined, false)
}

export const drawLabelDoor = (id: string, name: string | undefined, shape: any, isShow: boolean = true) => {
    new Promise(() => {
        if (!window.NOP_VIEWER) return;
        if (isShow) {
            // Create a label for this current room (shape)
            // @ts-ignore
            const newLabel = new Autodesk.Edit2D.ShapeLabel(shape, window?.edit2dLayer);
            // Set label name
            newLabel.setText(name);
            newLabel.setVisible(true);

            // Add room information to newLabel
            newLabel.doorId = id;
            newLabel.name = name;

            // Set new Label to the state
            window.doorLabelList.push(newLabel)
            window?.edit2dLayer?.update()
            return newLabel;
        } else {
            window.doorLabelList.filter(l => l.doorId === id).forEach(label => {
                label.setVisible(false);
                label.dtor();
            });
            window.doorLabelList = window.doorLabelList.filter(l => l.doorId !== id)
        }
    })
}