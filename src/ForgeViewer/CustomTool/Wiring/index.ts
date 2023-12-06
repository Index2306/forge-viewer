import { convertPointModelToLayer, getDistancePoint } from "../Point";
import {PolygonType} from "@/contants/tool";

export const startToolWiring = (data: any) => {
    if (!window.NOP_VIEWER) return {};
    const pointLayer = data.map((point: any) => convertPointModelToLayer(point))
    const poly2 = new Autodesk.Edit2D.Polyline([...pointLayer, pointLayer[0]]);
    poly2.style.lineColor = "orange"

    // @ts-ignore
    poly2.type = PolygonType.WIRING

    window.edit2dLayer.addShape(poly2);
    window.edit2dLayer.update()

    try {
        let distance = 0;
        data.reduce((accumulator: any, currentValue: number) => {
                distance += getDistancePoint(accumulator, currentValue);
                return currentValue;
            }
            , pointLayer[0]
        );
        return {distance, id: poly2.id};
    } catch (err: any) {
        console.error(err)
        return {};
    }
}