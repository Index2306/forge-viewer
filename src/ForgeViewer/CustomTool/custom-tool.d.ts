export {};
declare global {
    interface Window {
        NOP_VIEWER: any;  // this will be your variable name
        edit2d: any;
        edit2dTools: any;
        edit2dLayer: any;
        edit2dSelection: any;
        edit2dUndoStack: any;
        activeTool: any;
        roomList: any[];
        roomLabelList: any[];
        doorLabelList: any[];
        smokeDetectorList: any[];
        bmzList: any[];
        symbolList: any[];
        manualCallPointList: any[];
        roomTest: any[];
    }
}