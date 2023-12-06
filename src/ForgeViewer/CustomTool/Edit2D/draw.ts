import {DeviceDataModel, DeviceRoomModel, ManualCallPointDataModel, Point2D, Point3D, RoomDataModel} from "@/models";
import {PolygonType} from "@/contants/tool";
import {deleteShapeByName, removeSymbolPlaneMesh} from "@/ForgeViewer/CustomTool/Edit2D/index";
import {Box3, Vector2, Vector3} from "three";

import {
    arePointsClose,
    convertDistanceMetersToLayer,
    isPointInsidePolygon,
    getMinMaxOfCoordinates, arePointsCollinear, findNearestPoint,
} from "@/ForgeViewer/CustomTool/Point";
import {intersectionCirclePolygon,} from "@/ForgeViewer/CustomTool/Point/point-circle";


/// START - DRAW ROOM
export const drawRoomList = async (roomData: RoomDataModel[], isShow: boolean = true, isLabel: boolean = true) => {
    if (!window.NOP_VIEWER) return;
    roomData?.forEach((room: RoomDataModel) => {
        drawRoom(room.roomId, room.name, room.boundary_layer, isShow, isLabel)
    })
}

export const drawRoom = async (roomId: string | number | any, name: string | undefined, boundaryLayer: Point3D[] | Vector2[], isShow: boolean = true, isLabel: boolean = true): Promise<void> => {
    return new Promise(async (resolve, reject) => {
        if (!window.NOP_VIEWER) {
            // console.log('NO NOP VIEWER')
            reject("Error: Nop viewer do not exist!")
            return;
        }

        // Important! this code will prevent re-drawing room
        drawLabelRoom(roomId, undefined, undefined, [], false)
        deleteShapeByName([`${roomId}`])

        if (!isShow) {
            // delete if isShow === false
            drawLabelRoom(roomId, name, undefined, [], false)
            deleteShapeByName([`${roomId}`])

            resolve();
            return;
        }

        // handle draw room on layer
        const polygon = new Autodesk.Edit2D.Polygon(boundaryLayer.map(p => new Vector2().set(p.x, p.y)) || []);

        // @ts-ignore
        polygon.type = PolygonType.ROOM;
        // @ts-ignore
        polygon.name = `${roomId}`;
        window?.edit2dLayer?.addShape(polygon);
        window?.edit2dLayer?.update()

        // @ts-ignore
        window.roomList.push({id: polygon.name})

        if (isLabel) {
            drawLabelRoom(roomId, name, polygon, boundaryLayer, true)
            // label.updatePosition([...boundaryLayer]);
        }
        resolve();
    })
}

export const drawLabelRoom = (id: string, name: string | undefined, shape: any, boundaryLayer: Point3D[] | Vector2[], isShow: boolean = true) => {
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
            newLabel.roomId = id;
            newLabel.name = name;

            // Set new Label to the state
            window.roomLabelList.push(newLabel)
            window?.edit2dLayer?.update()
            return newLabel;
        } else {
            window.roomLabelList.filter(l => l.roomId === id).forEach(label => {
                label.setVisible(false);
                label.dtor();
            });
            window.roomLabelList = window.roomLabelList.filter(l => l.roomId !== id)
        }
    })
}
/// END - DRAW ROOM


/// START - DRAW SMOKE DETECTOR
export const drawSmokeDetectorList = (roomData: RoomDataModel[], deviceData: DeviceDataModel[], isShow: boolean = true) => {
    new Promise(() => {
        if (!window.NOP_VIEWER) return;
        roomData?.forEach((room: RoomDataModel) => {
            if (isShow) {
                const device = deviceData.find(d => d.roomId === room.roomId);
                if (device) {
                    room.devices.forEach(smokeDetector => drawSmokeDetector(room, device, smokeDetector, true))
                }
            } else {
                room.devices.forEach(smokeDetector => drawSmokeDetector(room, undefined, smokeDetector, false))
            }
        })
    })
}

export const drawSmokeDetector = (room: RoomDataModel | undefined, deviceData: DeviceDataModel | undefined, smokeDetector: DeviceRoomModel | undefined, isShow: boolean = true) => {
    new Promise(() => {
        if (!window.NOP_VIEWER || smokeDetector === undefined) return;
        if (isShow && smokeDetector) {
            _insertSymbolPlaneMesh(room, smokeDetector, deviceData?.radius)
        } else {
            const smokeDetectorIndex = window.smokeDetectorList.findIndex((sm: any) => sm.detectorId === smokeDetector.id);
            if (smokeDetectorIndex > -1) {
                deleteShapeByName([`${smokeDetector.id}`])
                removeSymbolPlaneMesh(window.smokeDetectorList[smokeDetectorIndex].planeMesh, window.smokeDetectorList[smokeDetectorIndex].id)
                window.smokeDetectorList.splice(smokeDetectorIndex, 1);
            }
        }
    })
}

const _insertSymbolPlaneMesh = async (room: RoomDataModel | undefined, smokeDetector: DeviceRoomModel, radiusInfo: number | undefined) => {
    if (!smokeDetector) return;
    const loader = new THREE.TextureLoader();
    await loader.load(
        // resource URL
        '/assets/symbols/B12-0172.png',

        // Function when resource is loaded
        (texture) => {
            // do something with the texture
            const material = new THREE.MeshBasicMaterial({
                map: texture,
                transparent: true,
            });
            const geometry2 = new THREE.PlaneBufferGeometry(0.15, 0.15, 0);
            const planeMesh = new THREE.Mesh(geometry2, material);

            planeMesh.position.set(smokeDetector?.position_layer?.x, smokeDetector?.position_layer?.y, 3);

            window.smokeDetectorList.push({
                planeMesh: planeMesh,
                detectorId: smokeDetector.id
            })

            const radiusDetector = smokeDetector.radius ?  smokeDetector.radius : (radiusInfo ?? 1);
            drawCircleShape(planeMesh, room, smokeDetector, radiusDetector ?? 1)
            window.NOP_VIEWER.overlays.addScene(`${planeMesh.uuid}`);
            window.NOP_VIEWER.overlays.addMesh(planeMesh, `${planeMesh.uuid}`);
        }
    );
}

export const insertSymbolToViewer = (id: string, point: Point3D | Vector2 | undefined, type?: string, image?: string, callback?: (val?: any) => void, size: number = 0.3, ratio: number = 1) => {
    if (!image) return;
    new Promise(async () => {
        if (!point) return;
        const loader = new THREE.TextureLoader();
        await loader.load(
            // resource URL
            image,

            // Function when resource is loaded
            (texture) => {
                // do something with the texture
                const material = new THREE.MeshBasicMaterial({
                    map: texture,
                    transparent: true,
                });

                const width = size;
                const height = size * ratio;

                const geometry2 = new THREE.PlaneBufferGeometry(width, height, 0);
                const planeMesh = new THREE.Mesh(geometry2, material);

                planeMesh.position.set(point?.x, point?.y, 3);

                const ratioRadius = 0.13 * size / 0.3;

                drawOnlyCircleForSymbol(planeMesh, point, id, ratioRadius, type)
                if (callback) {
                    callback(planeMesh)
                }
            }
        );
    })
}

export const insertSymbolManualCallPoint = (id: string, point: Point3D | Vector2 | undefined, size: number = 0.3) => {
    const callback = (planeMesh: any) => {
        window.manualCallPointList.push({planeMesh: planeMesh, id: id})
        window.NOP_VIEWER.overlays.addScene(`${planeMesh.uuid}`);
        window.NOP_VIEWER.overlays.addMesh(planeMesh, `${planeMesh.uuid}`);
    }
    insertSymbolToViewer(id, point, PolygonType.MANUAL_CALL_POINT, '/assets/symbols/B02-0041.svg', callback, size)
}

export const drawCircleShape = (planeMesh: any, room: RoomDataModel | undefined, smokeDetector: DeviceRoomModel, radius: number) => {
    new Promise(() => {
        const tessSegments = 42;
        const radiusLayer = convertDistanceMetersToLayer(smokeDetector.position_layer, radius)
        const centerPoint = new Vector2(smokeDetector.position_layer.x, smokeDetector.position_layer.y);

        if (room) {
            const initialArrayPoint = [...room.boundary_layer].map(p => new Vector2().set(p.x, p.y));

            const intersectionPointList = intersectionCirclePolygon(centerPoint, radiusLayer, initialArrayPoint)
            let resultIntersectionCircleLine: any[] = [];

            // Remove the points that almost overlap
            for (let i = 0; i < intersectionPointList.length; i++) {
                const {intersectionPoint, point1, point2} = intersectionPointList[i];

                // Check if point 1 is on the circle
                const point1InSideCircle = centerPoint.distanceTo(point1) <= radiusLayer + 0.005;

                /**
                 If `point1` is on the circle
                 and there are no `ORIGINAL ROOM POINTS` that match point 1 then add to the array
                 {
                isIntersection = false
                point = point1
            }
                 */
                if (point1InSideCircle && resultIntersectionCircleLine.find(p => arePointsClose(p, point1, 0)) === undefined) {
                    resultIntersectionCircleLine.push({
                        isIntersection: false,
                        point: point1
                    })
                }

                /**
                 If `intersectionPoint` from `intersectionCirclePolygon()` above exists
                 and there are no `ORIGINAL ROOM POINTS` that match point 1 then add to the array with
                 {
                isIntersection = false
                point = intersectionPoint
            }
                 */
                if (intersectionPoint && resultIntersectionCircleLine.find(p => arePointsClose(p, intersectionPoint, 0)) === undefined) {
                    resultIntersectionCircleLine.push({
                        isIntersection: true,
                        point: intersectionPoint,
                        vector: point2.clone().sub(point1)
                    });
                }
            }

            // Calculation to draw arc from 2 intersection points of circle and wall
            let resultListPoint: Vector2[] = []
            const isCollinear = arePointsCollinear(resultIntersectionCircleLine.map(r => r.point))
            const listIntersection = resultIntersectionCircleLine.filter(r => r.isIntersection);
            const isHaveIntersection = listIntersection.length >= 2
                && resultIntersectionCircleLine[0].isIntersection
                && resultIntersectionCircleLine[resultIntersectionCircleLine.length - 1].isIntersection;

            let indexIntersection1 = -1;
            let indexIntersection2 = -1;

            if (listIntersection.length === 2) {
                indexIntersection1 = resultIntersectionCircleLine.findIndex(r => r === listIntersection[0])
                indexIntersection2 = resultIntersectionCircleLine.findIndex(r => r === listIntersection[1])
            }

            let isSpecial = false;
            let midPointOutside = false;
            if (listIntersection.length === 2
                && ((indexIntersection1 === 0 && indexIntersection2 === resultIntersectionCircleLine.length - 1) || ((Math.abs(indexIntersection1 - indexIntersection2) === 1)))
            ) {
                const a =  listIntersection[0].vector;
                const b =  listIntersection[1].vector;
                isSpecial = a.dot(b) > 0;

                const midPoint = listIntersection[0].point.clone().add(listIntersection[1].point).multiplyScalar(0.5)
                midPointOutside = !isPointInsidePolygon(midPoint, initialArrayPoint);
            }

            // console.log('midPointOutside', midPointOutside)

            if ((isCollinear && isHaveIntersection) || isSpecial || midPointOutside) {
                const currentPoint = resultIntersectionCircleLine[0];
                const nextPoint = resultIntersectionCircleLine[resultIntersectionCircleLine.length - 1];

                let arrPointCircle = _getFullSegmentPointCircleShape(centerPoint, 42, radiusLayer);
                arrPointCircle = arrPointCircle.filter(p => isPointInsidePolygon(p.point, initialArrayPoint)).map((p: any, i: number) => ({index: i, point: p.point}))
                const find = findNearestPoint(arrPointCircle, currentPoint.point);

                let arr = []
                if (find.index === 0) {
                    arr = arrPointCircle.map(r => r.point);
                } else {
                    const slicedArrayFromFind = [...arrPointCircle.slice(find.index, arrPointCircle.length-1)];
                    const slicedArrayOther = [...arrPointCircle.slice(0, find.index - 1)];
                    arr = [...slicedArrayFromFind, ...slicedArrayOther].map(r => r.point);
                }

                // console.log('isCollinear- ---------------- currentPoint', currentPoint, nextPoint)
                // console.log('isCollinear- ---------------- startAngle', startAngle, toDegrees(startAngle))
                // console.log('isCollinear- ---------------- endAngle', endAngle, toDegrees(endAngle))

                if (isSpecial) {
                    const newArr = resultIntersectionCircleLine.filter(r => !r.isIntersection);

                    resultListPoint.push(currentPoint.point);
                    resultListPoint.push(...arr);
                    resultListPoint.push(nextPoint.point);
                    resultListPoint.push(...newArr.map(p => p.point).reverse());
                } else if (midPointOutside) {
                    const newArr = resultIntersectionCircleLine.filter(r => !r.isIntersection);

                    resultListPoint.push(currentPoint.point);
                    resultListPoint.push(...arr);

                    resultListPoint.push(nextPoint.point);
                    resultListPoint.push(...newArr.map(p => p.point));

                } else {
                    resultListPoint.push(currentPoint.point);
                    resultListPoint.push(...arr);
                    resultListPoint.push(nextPoint.point);
                }
            } else {
                for (let i = 0; i < resultIntersectionCircleLine.length; i++) {

                    if (resultIntersectionCircleLine.length < 3 && i === 1) {
                        break;
                    }

                    const currentIndex = i;
                    const nextIndex = i === resultIntersectionCircleLine.length - 1 ? 0 : i + 1;

                    const currentPoint = resultIntersectionCircleLine[currentIndex];
                    const nextPoint = resultIntersectionCircleLine[nextIndex];

                    if (!currentPoint.isIntersection && !nextPoint.isIntersection) {
                        resultListPoint.push(currentPoint.point);
                        continue;
                    }

                    let startAngle = Math.atan2(currentPoint.point.y - centerPoint.y, currentPoint.point.x - centerPoint.x);
                    let endAngle = Math.atan2(nextPoint.point.y - centerPoint.y, nextPoint.point.x - centerPoint.x);

                    const startQuadrant = _getQuadrant(currentPoint.point, centerPoint);
                    const endQuadrant = _getQuadrant(nextPoint.point, centerPoint);

                    let newStartAngle = startAngle;
                    let newEndAngle = endAngle;
                    const res = _getRadianQuadrant(startAngle, endAngle, startQuadrant, endQuadrant)
                    newStartAngle = res[0]
                    newEndAngle = res[1]

                    let arrPointCircle = _getSegmentPointCircleShape(centerPoint, 20, radiusLayer, newStartAngle, newEndAngle);


                    // Filter arc points that are not in the room
                    arrPointCircle = arrPointCircle.filter(p => isPointInsidePolygon(p, initialArrayPoint))

                    // If there is difference in angular magnitude of startPoint and endPoint draw arc
                    // will do check if array of arc points should be reversed
                    if (newStartAngle != startAngle || newEndAngle !== endAngle) {
                        // If endPoint is in 2nd quadrant and startPoint is in 3rd quadrant, or vice versa
                        // then need to reverse the array of arc points
                        if ((endQuadrant === 2 && startQuadrant === 3) ||
                            (endQuadrant === 3 && startQuadrant === 2)) {
                            arrPointCircle.reverse()
                        }
                    }
                    else {
                        arrPointCircle.reverse()
                    }
                    resultListPoint.push(currentPoint.point);
                    resultListPoint.push(...arrPointCircle);

                    // console.log('123123- ---------------- currentPoint', currentPoint, nextPoint)
                    // console.log('123123- ---------------- startAngle', startQuadrant, startAngle, toDegrees(startAngle))
                    // console.log('123123- ---------------- endAngle', endQuadrant, endAngle, toDegrees(endAngle))
                    // console.log('123123- ---------------- arrPointCircle', arrPointCircle)

                }
            }

            // console.log('resultListPoint- ---------------- resultIntersectionCircleLine', resultIntersectionCircleLine)
            // console.log('resultListPoint- ---------------- resultListPoint', resultListPoint)
            if (resultListPoint.length > 3) {
                // Draw the area of the detector clipped relative to the room
                const circle: Autodesk.Edit2D.Polygon | any= new Autodesk.Edit2D.Polygon(resultListPoint);
                circle['type'] = PolygonType.SMOKE_DETECTOR;
                circle['name'] = `${smokeDetector.id}`;
                circle.centerPoint = centerPoint;
                circle.planeMesh = planeMesh;
                circle.smokeDetector = smokeDetector;
                circle.radiusModel = radius;
                circle.radiusLayer = radiusLayer;
                circle.tessSegments = tessSegments;
                circle.style.lineWidth = 0.1;
                planeMesh.polygon = circle;
                window.edit2dLayer.addShape(circle);
                window.edit2dLayer.update();
                return;
            }

            // Draw the whole circle with the remaining cases
            drawOnlyCircleDetector(planeMesh, smokeDetector, radius, radiusLayer, tessSegments)
        }
    })
}

export const drawOnlyCircleDetector = (planeMesh: any, smokeDetector: DeviceRoomModel, radius: number, radiusLayer: number, tessSegments: number = 42, isSelection?: boolean) => {
    const tool = window.edit2dTools.insertSymbolTool;
    const style = new Autodesk.Edit2D.Style();
    style.lineWidth = 0.1;

    // @ts-ignore
    const circle = new Autodesk.Edit2D.Circle(0, 0, radiusLayer, style.clone(), tessSegments); // x, y, radius, style, tessSegments

    circle.type = PolygonType.SMOKE_DETECTOR;
    circle.name = `${smokeDetector.id}`;
    planeMesh.isCircle = true;
    circle.isCircle = true;
    circle.style.lineWidth = 1;
    circle.planeMesh = planeMesh;

    tool.symbol = circle;
    tool.handleAutoDraw(smokeDetector.position_layer, planeMesh, smokeDetector, radius, radiusLayer, tessSegments);
    planeMesh.polygon = circle;
    window.edit2dLayer.update();
    if (isSelection) {
        const shape = window.edit2dLayer.shapes.find((s: any) => s.name === circle.name);
        window.edit2dSelection?.setSelection([shape])
    }
}

export const drawOnlyCircleForSymbol = (planeMesh: any, position: Point3D | Vector2, id: string, radiusLayer: number, type?: string, tessSegments: number = 42) => {
    const tool = window.edit2dTools.insertSymbolTool;
    const style = new Autodesk.Edit2D.Style();
    style.lineWidth = 0.1;
    style.fillAlpha = 0;
    style.fillColor = '#ffffff';
    style.lineColor = '#ffffff';
    style.lineAlpha = 0;

    // @ts-ignore
    const circle = new Autodesk.Edit2D.Circle(0, 0, radiusLayer, style.clone(), tessSegments); // x, y, radius, style, tessSegments

    circle.type = type;
    circle.name = id;
    planeMesh.isCircle = true;
    planeMesh.type = type;
    circle.isCircle = true;
    circle.style.lineWidth = 1;
    circle.planeMesh = planeMesh;

    tool.symbol = circle;
    tool.handleAutoDrawSymbol(position, planeMesh);
    planeMesh.polygon = circle;
    window.edit2dLayer.update();
}

const _getRadianQuadrant = (startAngle: number, endAngle: number, conner1: number, conner2: number) => {
    if (conner1 === 1 && conner2 === 4) {
        // startAngle = Math.PI/2 + startAngle;
        // endAngle = 2.5 * Math.PI - endAngle;
        return [startAngle, endAngle]
    }

    if (conner1 === 2 && conner2 === 3) {
        endAngle = 2 *  Math.PI + endAngle;
        return [startAngle, endAngle]
    }

    if (conner1 === 3 && conner2 === 1) {
        startAngle = Math.PI + startAngle;
        endAngle = Math.PI + endAngle;
        return [startAngle, endAngle]
    }

    if (conner1 === 3 && conner2 === 2) {
        startAngle = 2 *  Math.PI + startAngle;
        return [startAngle, endAngle]
    }

    if (conner1 === 4 && conner2 === 2) {
        startAngle = Math.PI/2 - startAngle;
        endAngle = 2.5 * Math.PI - endAngle;
        return [startAngle, endAngle]
    }

    // if (conner1 === 4 && conner2 === 3) {
    //     startAngle = Math.PI - startAngle;
    //     endAngle = 2.5 * Math.PI - endAngle;
    //     return [startAngle, endAngle]
    // }

    return [startAngle, endAngle]
}

// Check which quadrant the point is in
const _getQuadrant = (point: Vector2, center: Vector2) => {
    const x = point.x;
    const y = point.y;
    const x0 = center.x;
    const y0 = center.y;
    if (x >= x0 && y >= y0) {
        return 1;
    } else if (x <= x0 && y >= y0) {
        return 2;
    } else if (x <= x0 && y <= y0) {
        return 3;
    } else if (x >= x0 && y <= y0) {
        return 4;
    } else {
        return 0;
    }
}

// Get a list of points to draw arcs according to given data
/**
 * @param {Vector2} centerPoint - Center point of the circle to draw
 * @param {number} segmentCount - Number of points to draw
 * @param {number} radius - Radius of circle to draw
 * @param {number} startAngle = 0 - Start angle to draw arc, default is 0 rad
 * @param {number} endAngle = 2*Math.PI - End angle to draw arc, default is 2π
 * @returns {Vector2[]} Returns an array of reversed points
 */
const _getSegmentPointCircleShape = (centerPoint: Vector2, segmentCount: number, radius: number, startAngle: number = 0, endAngle: number = 2*Math.PI) => {
    const result: Vector2[] = [];
    const angleStep = (endAngle - startAngle) / segmentCount;

    for (let i = 0; i <= segmentCount; i++) {
        const theta = startAngle + i * angleStep;
        const x = centerPoint.x + radius * Math.cos(theta);
        const y = centerPoint.y + radius * Math.sin(theta);
        result.push(new Vector2(x, y))
    }
    return result.reverse();
}

const _getFullSegmentPointCircleShape = (centerPoint: Vector2, segmentCount: number, radius: number) => {
    const result: any[] = [];
    const startAngle = 0;
    const endAngle = 2*Math.PI;
    const angleStep = (endAngle - startAngle) / segmentCount;

    for (let i = 0; i <= segmentCount; i++) {
        const theta = startAngle + i * angleStep;
        const x = centerPoint.x + radius * Math.cos(theta);
        const y = centerPoint.y + radius * Math.sin(theta);
        result.push({
            index: i,
            point: new Vector2(x, y)
        })
    }
    return result;
}

// --- Set viewer zoom to specified object base on boundary layer
export const setZoomToBoundaryLayer = (boundary_layer: Point2D[] | any[]) => {
    const { minX, minY, maxX, maxY } = getMinMaxOfCoordinates(boundary_layer)

    const minP = {
        x: minX,
        y: minY,
    }
    const maxP = {
        x: maxX,
        y: maxY,
    }

    const min3 = new Vector3(minP.x, minP.y, 0)
    const max3 = new Vector3(maxP.x, maxP.y, 0)
    const bbox = new Box3(min3, max3)

    window.NOP_VIEWER?.navigation?.fitBounds(false, bbox)
}

// --- Helper: floor setting colors room ----

export const toggleRoomWithColor = (isShow: boolean, roomId: string, roomName: string, layerCurrentPoints: any[], rgbColor: {r: number, g: number, b: number}) => {
    if (!window.NOP_VIEWER) return;
    if (!window.edit2d) return;

    turnOffSelectionInViewer();
    const label = window?.roomLabelList.find((l) => l.roomId === roomId);

    if (isShow) {
        deleteRoom(roomId);

        if (label) {
            detachLabelFromRoom(label);
        }

        const polygon = new Autodesk.Edit2D.Polygon(layerCurrentPoints.map(p => new Vector2().set(p.x, p.y)) || []);

        // @ts-ignore
        polygon.type = PolygonType.ROOM;

        // @ts-ignore
        polygon.name = {base:`${roomId}`, second: `${roomName}`};

        // Set style
        const style = polygon.style;
        style.fillColor = `rgb(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b})`;

        window?.edit2dLayer?.addShape(polygon);

        attachLabelToRoom(polygon, roomId, roomName);
    } else {
        deleteRoom(roomId);

        if (label) {
            detachLabelFromRoom(label);
        }
    }
};

export const turnOffSelectionInViewer = () => {
    if (!window.NOP_VIEWER) return;
    // turn off all highlight selection in viewer
    window?.edit2dSelection?.onLayerCleared();
};

export const detachLabelFromRoom = (label: any) => {
    if (!window.NOP_VIEWER) return;

    window?.roomLabelList?.splice(window?.roomLabelList?.indexOf(label), 1);
    label.dtor();
};

export const deleteRoom = (roomId: string) => {
    if (!window.NOP_VIEWER) return;

    const shape = window?.edit2dLayer?.shapes?.find((s: any) => s.name.base === roomId);
    window?.edit2dLayer?.removeShape(shape);
};

export const attachLabelToRoom = (shape: any, roomId: string, roomName: string) => {
    if (!window.NOP_VIEWER) return;

    // Create a label for this current room (shape)
    // @ts-ignore
    const newLabel = new Autodesk.Edit2D.ShapeLabel(shape, window?.edit2dLayer);

    // Set label name
    newLabel.setText(roomName);
    newLabel.setVisible(true);

    // Add room information to newLabel
    newLabel.roomId = roomId;
    newLabel.name = roomName;

    // Set new Label to the state
    window.roomLabelList = [...window.roomLabelList, newLabel];
};
