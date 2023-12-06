import {Vector2} from "three";
import {Point3D} from "@/models";

export const MARGIN_FOR_MISTAKE = 0.01;

export const getPointBetween = (point_1: Vector2, point_2: Vector2): Vector2 => {
    // Calculate the average of x-coordinates and y-coordinates
    const xAvg = (point_1.x + point_2.x) / 2;
    const yAvg = (point_1.y + point_2.y) / 2;

    // Return the coordinates as an object
    return new Vector2(xAvg, yAvg)
}
export const getPointBetweenAny = (point_1: any, point_2: any): any => {
    // Calculate the average of x-coordinates and y-coordinates
    const xAvg = (point_1.x + point_2.x) / 2;
    const yAvg = (point_1.y + point_2.y) / 2;

    // Return the coordinates as an object
    return {x: xAvg, y: yAvg}
}

export const getLineEquation = (point_1: Vector2, point_2: Vector2) => {
    // Calculate the slope
    const slope = (point_2.y - point_1.y) / (point_2.x - point_1.x);

    // Calculate the y-intercept
    const yIntercept = point_1.y - slope * point_1.x;

    // Return the equation as a string
    return {slope, yIntercept};
}

export const isPointOnLine = (point: Vector2, slope: number, yIntercept: number) => {
    // Check if the equation is satisfied
    const y = slope * point.x + yIntercept;
    // return y === point.y;
    return Math.abs(y - point.y) < MARGIN_FOR_MISTAKE;
}

export const isPointInLineSegment = (point: Vector2, startPoint: Vector2, endPoint: Vector2, epsilon: number = MARGIN_FOR_MISTAKE) => {
    const pointX = point.x;
    const pointY = point.y;
    const startX = startPoint.x;
    const startY = startPoint.y;
    const endX = endPoint.x;
    const endY = endPoint.y;

    // Check if the point is collinear with the line segment
    // const collinear = (pointX - startX) * (endY - startY) === (endX - startX) * (pointY - startY);
    const collinear = Math.abs(((pointX - startX) * (endY - startY)) - ((endX - startX) * (pointY - startY))) <= epsilon;

    // Check if the point lies within the range of x-coordinates and y-coordinates of the line segment
    const withinRangeX = (pointX >= startX - epsilon && pointX <= endX + epsilon) || (pointX <= startX + epsilon && pointX >= endX - epsilon);
    const withinRangeY = (pointY >= startY - epsilon && pointY <= endY + epsilon) || (pointY <= startY + epsilon && pointY >= endY - epsilon);

    // Return true if the point is collinear and lies within the range of the line segment
    return collinear && withinRangeX && withinRangeY;
}

export const isPointOnStraightLine = (point: Vector2, startPoint: Vector2, endPoint: Vector2, epsilon: number = MARGIN_FOR_MISTAKE) => {
    const x = point.x;
    const y = point.y;
    const x1 = startPoint.x;
    const y1 = startPoint.y;
    const x2 = endPoint.x;
    const y2 = endPoint.y;

    // Calculate vectorization of line segment AB and point P
    const APx = x - x1;
    const APy = y - y1;
    const ABx = x2 - x1;
    const ABy = y2 - y1;

    // Calculate the coefficient u
    const u = (APx * ABx + APy * ABy) / (ABx * ABx + ABy * ABy);

    // Check if u lies in the interval [0, 1], point P lies on line segment AB
    return u >= (0 - epsilon) && u <= (1 + epsilon);
}

export const isPointOnVector = (point: Vector2, vector: Vector2, vectorMagnitude: number = 0) => {
    const pointX = point.x;
    const pointY = point.y;
    const vectorX = vector.x;
    const vectorY = vector.y;

    // Calculate the vector between the point and the vector's initial point
    const vectorToPointX = pointX - vectorX;
    const vectorToPointY = pointY - vectorY;

    // Calculate the magnitude of the vector between the point and the vector's initial point
    const vectorToPointMagnitude = Math.sqrt(Math.pow(vectorToPointX, 2) + Math.pow(vectorToPointY, 2));

    // Check if the vector between the point and the vector's initial point is collinear with the vector
    return Math.abs(vectorToPointMagnitude - vectorMagnitude) < Number.EPSILON;
}

export const arePointsClose = (point_1: Vector2, point_2: Vector2, threshold: number = MARGIN_FOR_MISTAKE) => {
    // Calculate the distance between the points using the Euclidean distance formula
    const distance = Math.sqrt(Math.pow(point_2.x - point_1.x, 2) + Math.pow(point_2.y - point_1.y, 2));

    // Check if the distance is less than or equal to the threshold
    return distance <= threshold;
}

export const  isPointInsidePolygon = (point: Vector2, polygon: Vector2[] | Point3D[]) => {
    const x = point.x;
    const y = point.y;
    let numIntersections = 0;

    const numVertices = polygon.length;
    for (let i = 0; i < numVertices; i++) {
        const currentVertex = polygon[i];
        const nextVertex = polygon[(i + 1) % numVertices];

        if (
            (currentVertex.y > y && nextVertex.y <= y) ||
            (nextVertex.y > y && currentVertex.y <= y)
        ) {
            const intersectX =
                (y - currentVertex.y) /
                (nextVertex.y - currentVertex.y) *
                (nextVertex.x - currentVertex.x) +
                currentVertex.x;

            if (intersectX > x) {
                numIntersections++;
            }
        }
    }

    return numIntersections % 2 === 1;
}

export const toRadians = (degrees: number) => {
    return degrees * (Math.PI / 180);
}

export const toDegrees = (radians: number) => {
    return radians * (180 / Math.PI);
}

export const calculateAngle = (centerPoint: Vector2, point: Vector2, isRadian: boolean = true) => {
    const pointX = point.x;
    const pointY = point.y;
    const centerX = centerPoint.x;
    const centerY = centerPoint.y;
    const deltaX = pointX - centerX;
    const deltaY = pointY - centerY;
    const angleRadians = Math.atan2(deltaY, deltaX);
    let angleDegrees = angleRadians * (180 / Math.PI);
    // Convert angle from [-180, 180] to [0, 360]
    if (angleDegrees < 0) {
        angleDegrees += 360;
    }
    return isRadian ? toRadians(angleDegrees) : angleDegrees;
}

const isClockwise = (points: Vector2[]) => {
    const n = points.length;
    let sum = 0;

    for (let i = 0; i < n; i++) {
        const currentPoint = points[i];
        const nextPoint = points[(i + 1) % n];
        sum += (nextPoint.x - currentPoint.x) * (nextPoint.y + currentPoint.y);
    }

    // If the sum is negative, the points rotate clockwise
    return sum < 0;
}

// The function to calculate the slope between two points
export const calculateSlope = (point1: Vector2, point2: Vector2) => {
    return (point2.y - point1.y) / (point2.x - point1.x);
}

// Function to check if points are collinear
export const arePointsCollinear = (points: Vector2[]) => {
    if (points.length <= 2) {
        // If the number of points is less than or equal to 2, they cannot form a line segment
        return true;
    }

    const referenceSlope = calculateSlope(points[0], points[1]);
    for (let i = 2; i < points.length; i++) {
        const currentSlope = calculateSlope(points[i - 1], points[i]);
        if (points[i - 1] === points[i]) continue;
        // if (currentSlope !== referenceSlope) {
        //     // If slopes between segments are different, not collinear
        //     return false;
        // }

        if (Math.abs(currentSlope - referenceSlope) > 0.005) {
            // If slopes between segments are different, not collinear
            return false;
        }
    }

    // If all the line segments are checked and the slopes between them are equal, they are collinear
    return true;
}

export const findNearestPoint = (pointsArray: any[], referencePoint: Vector2) => {
    let nearestPoint = null;
    let nearestDistance = Infinity;

    for (const pointData of pointsArray) {
        const distance = pointData.point.distanceTo(referencePoint);
        if (distance < nearestDistance) {

            nearestDistance = distance;
            nearestPoint = pointData;
        }
    }

    return nearestPoint;
}