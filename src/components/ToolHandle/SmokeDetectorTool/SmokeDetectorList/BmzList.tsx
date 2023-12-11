import React, {useEffect} from 'react';
import {insertSymbolToViewer} from "@/ForgeViewer/CustomTool/Edit2D/draw";
import {LayerKey, PolygonType} from "@/contants/tool";
import {toolSymbol} from "@/components/ToolHandle/SmokeDetectorTool/BmzSetTool";
import {useAppSelector} from "@/hooks";
import {selectTool} from "@/store/slices/tool/tool.slice";
import {deleteAllBmz} from "@/ForgeViewer/CustomTool/Edit2D";
import {selectLayer} from "@/store/slices/tool/layer.slice";

const BmzList : React.FC<BmzListProps> = ({isActiveCurrentTool}) => {
    const {currentFile} = useAppSelector(selectTool)
    const {isLayerToolActive, layerList} = useAppSelector(selectLayer)

    useEffect(() => {
        deleteAllBmz();
        const bmz = currentFile?.fileData?.bmz;

        if (isLayerToolActive) {
            const activeRoomTool = layerList.find(layer => layer.key === LayerKey.SMOKE_DETECTOR && layer.status === 1);
            if (bmz && bmz.length > 0 && isActiveCurrentTool && activeRoomTool) {
                const callback = (planeMesh: any) => {
                    window.bmzList.push({planeMesh: planeMesh, id: bmz[0].id})
                    window.NOP_VIEWER.overlays.addScene(`${planeMesh.uuid}`);
                    window.NOP_VIEWER.overlays.addMesh(planeMesh, `${planeMesh.uuid}`);
                    window.NOP_VIEWER.impl.invalidate(true, true, true);
                }
                insertSymbolToViewer(bmz[0].id, bmz[0].position_layer, PolygonType.BMZ, toolSymbol, callback, bmz[0].size)
                return ;
            }
        }

        // if (bmz && bmz.length > 0 && isActiveCurrentTool) {
        //     const callback = (planeMesh: any) => {
        //         window.bmzList.push({planeMesh: planeMesh, id: bmz[0].id})
        //         window.NOP_VIEWER.overlays.addScene(`${planeMesh.uuid}`);
        //         window.NOP_VIEWER.overlays.addMesh(planeMesh, `${planeMesh.uuid}`);
        //         window.NOP_VIEWER.impl.invalidate(true, true, true);
        //     }
        //     insertSymbolToViewer(bmz[0].id, bmz[0].position_layer, PolygonType.BMZ, toolSymbol, callback, bmz[0].size)
        // }

        return () => {
            deleteAllBmz();
        }
    }, [currentFile?.fileData?.bmz, isActiveCurrentTool, isLayerToolActive, layerList])
    return (
        <></>
    );
};

export default BmzList;

interface BmzListProps {
    isActiveCurrentTool: boolean
}