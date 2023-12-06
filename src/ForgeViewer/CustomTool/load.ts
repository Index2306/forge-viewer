/// <reference types="forge-viewer" />

import {overrideEdit2D} from "@/ForgeViewer/CustomTool/Edit2D";

export const loadCustomTool = (viewer: any, tools: any) => {
    overrideEdit2D(tools)
}
