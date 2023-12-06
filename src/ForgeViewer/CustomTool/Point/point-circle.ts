import {Vector2} from "three";
import {arePointsClose, isPointOnStraightLine, MARGIN_FOR_MISTAKE} from "@/ForgeViewer/CustomTool/Point/common";

export const intersectionCirclePolygon = (center: Vector2, radius: number, polygon: Vector2[]): any[] => {
    let intersectionPoints: any = [];

    // Iterate over each edge of the polygon
    for (let i = 0; i < polygon.length; i++) {
        const p1 = polygon[i];
        const p2 = polygon[(i + 1) % polygon.length];

        const pointIntersection = findIntersectionPointsWithCircle(p1, p2, center, radius);
        for (let intersectionPoint of pointIntersection) {
            if (intersectionPoint && isPointOnStraightLine(intersectionPoint, p1, p2)) {

                if (arePointsClose(intersectionPoint, p1, 0.005) || arePointsClose(intersectionPoint, p2, 0.005)) {
                    intersectionPoints.push({
                        intersectionPoint: undefined,
                        point1: p1,
                        point2: p2
                    })
                } else {
                    intersectionPoints.push({
                        intersectionPoint,
                        point1: p1,
                        point2: p2
                    })
                }
            } else {
                intersectionPoints.push({
                    intersectionPoint: undefined,
                    point1: p1,
                    point2: p2
                })
            }
        }
    }
    return intersectionPoints;
}

const findIntersectionPointsWithCircle = (point_1: Vector2, point_2: Vector2, centerPoint: Vector2, r: number) => {
    const x1 = point_1.x;
    const y1 = point_1.y;
    const x2 = point_2.x;
    const y2 = point_2.y;
    const x0 = centerPoint.x;
    const y0 = centerPoint.y;

    // Calculate the normal vector of line AB
    const dx = x2 - x1;
    const dy = y2 - y1;

    // Calculate the coefficients in the equation of line AB
    const A = dx * dx + dy * dy;
    const B = 2 * (dx * (x1 - x0) + dy * (y1 - y0));
    const C = (x1 - x0) * (x1 - x0) + (y1 - y0) * (y1 - y0) - r * r;

    // Calculate discriminant
    const discriminant = B * B - 4 * A * C;

    if (discriminant < 0) {
        // Lines and circles do not intersect
        return [];
    } else if (discriminant === 0) {
        // The line tangent to the circle at a point
        const t = -B / (2 * A);
        const intersectionX = x1 + t * dx;
        const intersectionY = y1 + t * dy;
        return [new Vector2(intersectionX, intersectionY)];
    } else {
        // The line intersects the circle at two points
        const t1 = (-B + Math.sqrt(discriminant)) / (2 * A);
        const t2 = (-B - Math.sqrt(discriminant)) / (2 * A);
        const intersectionX1 = x1 + t1 * dx;
        const intersectionY1 = y1 + t1 * dy;
        const intersectionX2 = x1 + t2 * dx;
        const intersectionY2 = y1 + t2 * dy;
        return [
            new Vector2(intersectionX2, intersectionY2),
            new Vector2(intersectionX1, intersectionY1),
        ];
    }
}