import {Matrix4, Vector2, Vector3} from "three";
import {Point3D} from "@/models";

/**
 * Convert points those are got from Api (AutoCad,..) to using in Forge Viewer
 * @param point - Point3D
 * @param viewer - Autodesk.Viewing.GuiViewer3D
 * @returns
 */
export const convertPointModelToLayer = (point: Point3D | Vector2 | any, viewer: Autodesk.Viewing.Viewer3D | undefined = undefined ) => {
    const vpXform = viewer ? viewer.model?.getPageToModelTransform(1) : window.NOP_VIEWER?.model?.getPageToModelTransform(1);

    if (vpXform && point) {
        const newMatrix = new Matrix4().copy(vpXform);
        newMatrix.invert();
        const modelPt = new Vector3()?.set(Math.round(point.x), Math.round(point.y), Math.round(point?.z ?? 0));
        const pt = modelPt?.applyMatrix4(newMatrix);
        return {x: pt.x, y: pt.y, z: 0};
    }
    return {x: 0, y: 0, z: 0};
}

/**
 * Convert points from Forge viewer to using in (AutoCad,..)
 * @param point - Point3D
 * @param viewer - Autodesk.Viewing.GuiViewer3D
 * @returns
 */
export const convertPointLayerToModel = (point: any, viewer: Autodesk.Viewing.GuiViewer3D | undefined = undefined ) => {
    const vpXform = viewer ? viewer.model?.getPageToModelTransform(1) : window.NOP_VIEWER?.model?.getPageToModelTransform(1);

    if (vpXform && point) {
        const modelPt1 = new Vector3()?.set(point.x, point.y, point?.z ?? 0).applyMatrix4(vpXform);
        return {x: modelPt1.x, y: modelPt1.y, z: 0};
    }
    return {x: 0, y: 0, z: 0};
}

/**
 * Convert Distance Meters to Distance of Layer
 * @param pointLayer - any
 * @param distance - number
 * @returns
 */
export const convertDistanceMetersToLayer: (pointLayer: any, distance: number) => number = (pointLayer: any, distance: number) => {
    let unit = "mm";
    try {
        if (window.NOP_VIEWER?.model) {
            unit = window.NOP_VIEWER.model.getDisplayUnit();
        }
    } catch (err) {
        console.error(err)
    }

    let currentDistance = distance;
    switch (unit) {
        case 'mm': {
            currentDistance *= 1000;
            break
        }
        case 'cm': {
            currentDistance *= 100;
            break
        }
        case 'dm': {
            currentDistance *= 10;
            break
        }
        case 'in': {
            currentDistance /= 0.0254;
            break
        }
    }

    const pointModel = convertPointLayerToModel(pointLayer);
    const vecTemp = new Vector2().set(pointModel.x + currentDistance, pointModel.y);
    const pointTempLayer = convertPointModelToLayer(vecTemp);

    const vecLayerCurrent = new Vector2().set(pointLayer.x, pointLayer.y);
    const vecLayerTemp = new Vector2().set(pointTempLayer.x, pointTempLayer.y);
    return vecLayerCurrent.distanceTo(vecLayerTemp);
}
