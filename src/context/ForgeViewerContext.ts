import {createContext} from "react";
import {ToolInterface} from "@/ForgeViewer/ForgeViewerCore";

export const ForgeViewerContext = createContext<ForgeViewerContextProps>(
    {
        setActiveTool: (tool) => {},
        setIsFetching: (value) => {},
        setStatusLoading: (value) => {},
    });

export interface ForgeViewerContextProps {
    fileId?: string,
    viewer?: Autodesk.Viewing.Viewer3D | undefined,
    cursorCustomer?: string | any,
    setCursorCustomer?: (cursor: string | any) => void
    activeTool?: ToolInterface | any,
    setActiveTool: (tool: string | any) => void
    setIsFetching: (value: any) => void
    setStatusLoading: (value: number) => void,
    modelType?: string,
    setModelType?: (value: string | any) => void,
}