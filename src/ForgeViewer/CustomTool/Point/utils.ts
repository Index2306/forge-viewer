import { Point2D } from '@/models';
import { Vector3 } from 'three';

/**
 * Calculates distance between two points based on scale
 * @param point1 - Point2D
 * @param point2 - Point2D
 * @param scale - default = 1
 * @returns
 */
export const getLengthTool = (point1: Point2D, point2: Point2D, scale?: number): string => {
    let localScale = 1;

    if (scale) {
        localScale = scale;
    }

    const vec1 = new Vector3().set(point1.x, point1.y, 0);
    const vec2 = new Vector3().set(point2.x, point2.y, 0);
    const length = vec1.distanceTo(vec2);

    return (length / localScale).toFixed(2);
};

/**
 * Find the min and max coordinates from array of Point2D points
 * @param boxPoints - Point2D
 * @returns
 */
export const getMinMaxOfCoordinates = (boxPoints: Point2D[]) => {
  const minX = Math.min.apply(
      Math,
      boxPoints?.map((o) => o.x),
  );

  const minY = Math.min.apply(
      Math,
      boxPoints?.map((o) => o.y),
  );
  const maxX = Math.max.apply(
      Math,
      boxPoints?.map((o) => o.x),
  );
  const maxY = Math.max.apply(
      Math,
      boxPoints?.map((o) => o.y),
  );

  return { minX, minY, maxX, maxY };
};
