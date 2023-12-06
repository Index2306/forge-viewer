import {Point3D} from "@/models";
import {Box2, Vector2, Vector3} from "three";
import {convertPointLayerToModel} from "@/ForgeViewer/CustomTool/Point/convert-point";
import { ShapeUtils } from "three";

export const getPolyCentroid = (points: any[] | Point3D[]): Point3D  => {
    const centroid: Point3D = {x: 0, y: 0, z:0};
    for (const point of points) {
        centroid.x += point.x;
        centroid.y += point.y;
    }
    centroid.x /= points.length;
    centroid.y /= points.length;
    return centroid;
}

export const getDistancePoint = (point1: any | Point3D, point2: any | Point3D) => {
    let unit = "mm";
    try {
        if (window.NOP_VIEWER?.model) {
            unit = window.NOP_VIEWER.model.getDisplayUnit();
        }
    } catch (err) {
        console.error(err)
    }

    try {
        const vec1 = new Vector3().set(point1.x, point1.y, 0);
        const vec2 = new Vector3().set(point2.x, point2.y, 0);

        let result = vec1.distanceTo(vec2);
        switch (unit) {
            case 'in': {
                result *= 0.0254;
                break
            }
            case 'mm': {
                result /= 1000;
                break
            }
            case 'cm': {
                result /= 100;
                break
            }
            case 'dm': {
                result /= 10;
                break
            }
        }
        return parseFloat(result.toFixed(3))
    } catch (err) {
        console.error(err)
        return 0;
    }
}

export const getPolygonInformationFromBoundary = (points: any[] | Point3D[] | Vector2[]) => {
    const boundary_layer = points.map(p => new Vector2().set(p.x, p.y))

    const isClockwise = ShapeUtils.isClockWise(boundary_layer)
    if (!isClockwise) {
        boundary_layer.reverse()
    }

    const boundary = boundary_layer.map((point: any) => convertPointLayerToModel(point))

    const centroid_layer = getPolyCentroid(boundary_layer);
    const centroid = convertPointLayerToModel(centroid_layer);

    const box2 = new Box2().setFromPoints(boundary_layer);
    const max = box2.max;
    const min = box2.min;

    const lengthPoint = [{x: min.x, y: min.y, z: 0}, {x: min.x, y: max.y, z: 0}]
    const widthPoint = [{...min, z: 0}, {x: max.x, y: min.y, z: 0}]

    const lengthModel = getDistancePoint(convertPointLayerToModel(lengthPoint[0]), convertPointLayerToModel(lengthPoint[1]))
    const widthModel = getDistancePoint(convertPointLayerToModel(widthPoint[0]), convertPointLayerToModel(widthPoint[1]));

    return {boundary_layer: boundary_layer.map(p => ({x: p.x, y: p.y, z: 0})), boundary, centroid_layer, centroid, lengthModel, widthModel}
}