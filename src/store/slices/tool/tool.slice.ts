import {createSlice} from '@reduxjs/toolkit';
import {RootState} from "@/store/store";
import {FileData, GeneralData, RoomDataModel, SymbolDataModel, UserFile} from "@/models";

// const initialState: ToolState[] = []
const initialState: ToolSliceState = {
    currentFile: null,
    resetViewer: false,
    pdfInfo: null,
}

export const toolSlice = createSlice({
    name: 'tool',
    initialState,
    reducers: {
        addFile: (state, {payload}) => {
            state.currentFile = payload;
        },
        changeFileData: (state, {payload}) => {
            if (state.currentFile && state.currentFile.id === payload.id) {
                state.currentFile = {
                    ...state.currentFile,
                    fileData: {...payload.data}
                };
            }
        },
        updateDataRoom: (state, {payload}) => {
            if (state.currentFile) {

                state.currentFile = {
                    ...state.currentFile,
                    fileData: {
                        ...state.currentFile.fileData as FileData,
                        rooms: [...(state.currentFile.fileData?.rooms ?? [])].map((room: RoomDataModel) => {
                            if (payload.id === room.roomId) {
                                return {
                                    ...room,
                                    ...payload.data
                                }
                            }
                            return room;
                        }),
                    }
                };


            }
        },
        setHasAtLeastOneRoomIsShown: (state, {payload}) => {
            if (state.currentFile) {

                state.currentFile = {
                    ...state.currentFile,
                    fileData: {
                        ...state.currentFile.fileData as FileData,
                        hasAtLeastOneRoomIsShown: payload
                    }
                };
            }
        },
        setEditedRoom: (state, {payload}) => {
             if (state.currentFile) {
                state.currentFile = {
                    ...state.currentFile,
                    fileData: {
                        ...state.currentFile.fileData as FileData,
                        editedRoom: payload
                    }
                };
            }
        },
        removeRoom: (state, {payload}) => {
            if (state.currentFile) {
                const remainedRooms = [...(state.currentFile.fileData?.rooms ?? [])]
                    .filter((room: RoomDataModel) => room.roomId !== payload)

                state.currentFile = {
                    ...state.currentFile,
                    fileData: {
                        ...state.currentFile.fileData as FileData,
                        rooms: [...remainedRooms]
                    }
                };
            }
        },
        addNewRoom: (state, {payload}) => {
            if (state.currentFile) {
                state.currentFile = {
                    ...state.currentFile,
                    fileData: {
                        ...state.currentFile.fileData as FileData,
                        rooms: [...(state.currentFile.fileData?.rooms ?? []), payload],
                    }
                };
            }
        },
        addNewDeviceInfo: (state, {payload}) => {
            if (state.currentFile) {
                if (payload.unique) {
                    state.currentFile = {
                        ...state.currentFile,
                        fileData: {
                            ...state.currentFile.fileData as FileData,
                            devices: [...(state.currentFile.fileData?.devices ?? []).filter(d => d.roomId !== payload.data.roomId), payload.data],
                        }
                    };
                } else {
                    state.currentFile = {
                        ...state.currentFile,
                        fileData: {
                            ...state.currentFile.fileData as FileData,
                            devices: [...(state.currentFile.fileData?.devices ?? []), payload],
                        }
                    };
                }
            }
        },
        addPdfInformation: (state, {payload}) => {
                state.pdfInfo = {...payload};
        },
        changeStatusFile: (state, {payload}) => {
            if (state.currentFile && state.currentFile.id === payload.id) {
                state.currentFile = {
                    ...state.currentFile,
                    status: payload.status,
                    modelDerivativeUrn: payload.modelDerivativeUrn
                }
            }
        },
        changeFile: (state, {payload}) => {
            if (state.currentFile && state.currentFile.id === payload.id) {
                state.currentFile = {
                    ...state.currentFile,
                    urn: payload.urn,
                    modelDerivativeUrn: payload.modelDerivativeUrn,
                };
            }
        },
        changeResetViewer: (state, {payload}) => {
            state.resetViewer = payload;
        },
        getFile(state, {payload}) {
            // return state.tools[payload].file;
        },
        clearTool(state) {
            // Not clear pdfInfo state because this will be shared in all files in the current project
            state.currentFile = null;
            state.resetViewer = false;
        },
        clearPdfInfo(state) {
            state.pdfInfo = null;
        },
        addNewDoorExit(state, {payload}) {
            if (state.currentFile) {
                state.currentFile = {
                    ...state.currentFile,
                    fileData: {
                        ...state.currentFile.fileData as FileData,
                        doors: [...(state.currentFile.fileData?.doors ?? []), payload]
                    }
                };
            }
        },
        removeDoor(state, {payload}) {
            if (state.currentFile) {
                state.currentFile = {
                    ...state.currentFile,
                    fileData: {
                        ...state.currentFile.fileData as FileData,
                        doors: [...(state.currentFile.fileData?.doors ?? [])].filter(d => d.doorId !== payload)
                    }
                };
            }
        },
        updateDoor(state, {payload}) {
            if (state.currentFile) {
                state.currentFile = {
                    ...state.currentFile,
                    fileData: {
                        ...state.currentFile.fileData as FileData,
                        doors: [...(state.currentFile.fileData?.doors ?? [])].map(d => {
                            if (d.doorId === payload.doorId) {
                                return payload;
                            }
                            return d;
                        })
                    }
                };
            }
        },
        updateRoomDoorData(state, {payload}) {
            if (state.currentFile) {
                state.currentFile = {
                    ...state.currentFile,
                    fileData: {
                        ...state.currentFile.fileData as FileData,
                        doors: payload.doors,
                        rooms: payload.rooms,
                        exitPoints: payload?.exitPoints ?? [],
                    }
                };
            }
        },
        updateDataExitPoint(state, {payload}) {
            if (state.currentFile) {
                state.currentFile = {
                    ...state.currentFile,
                    fileData: {
                        ...state.currentFile.fileData as FileData,
                        exitPoints: payload ?? [],
                    }
                };
            }
        },
        removeManualCallPoint(state, {payload}) {
            if (state.currentFile) {
                state.currentFile = {
                    ...state.currentFile,
                    fileData: {
                        ...state.currentFile.fileData as FileData,
                        exitPoints: [...(state.currentFile.fileData?.exitPoints ?? [])].filter(d => d.id !== payload)
                    }
                };
            }
        },
        addManualCallPoint(state, {payload}) {
            if (state.currentFile) {
                state.currentFile = {
                    ...state.currentFile,
                    fileData: {
                        ...state.currentFile.fileData as FileData,
                        exitPoints: [...(state.currentFile.fileData?.exitPoints ?? []), payload],
                    }
                };
            }
        },
        addBmz(state, {payload}) {
            if (state.currentFile) {
                state.currentFile = {
                    ...state.currentFile,
                    fileData: {
                        ...state.currentFile.fileData as FileData,
                        bmz: [payload],
                    }
                };
            }
        },
        addSymbol(state, {payload}) {
            if (state.currentFile) {
                state.currentFile = {
                    ...state.currentFile,
                    fileData: {
                        ...state.currentFile.fileData as FileData,
                        symbols: [...(state.currentFile.fileData?.symbols ?? []), payload],
                    }
                };
            }
        },
        removeSymbol(state, {payload}) {
            if (state.currentFile) {
                state.currentFile = {
                    ...state.currentFile,
                    fileData: {
                        ...state.currentFile.fileData as FileData,
                        symbols: [...(state.currentFile?.fileData?.symbols ?? [])].filter(s => s.id !== payload.id),
                    }
                };
            }
        },
        updateSymbol(state, {payload}) {
            if (state.currentFile) {
                state.currentFile = {
                    ...state.currentFile,
                    fileData: {
                        ...state.currentFile.fileData as FileData,
                        symbols: [...(state.currentFile?.fileData?.symbols ?? [])].map((symbol: SymbolDataModel) => {
                            if (symbol.id === payload.id) {
                                return payload
                            }
                            return symbol;
                        }),
                    }
                };
            }
        },
    },
});

export const selectTool = (state: RootState) => state.tool;

export const {
    clearTool,
    addFile,
    changeStatusFile,
    changeFile,
    changeFileData,
    changeResetViewer,
    addNewRoom,
    addNewDeviceInfo,
    addPdfInformation,
    updateDataRoom,
    getFile,
    clearPdfInfo,
    removeRoom,
    setEditedRoom,
    addNewDoorExit,
    removeDoor,
    updateDoor,
    updateRoomDoorData,
    updateDataExitPoint,
    removeManualCallPoint,
    addManualCallPoint,
    addBmz,
    setHasAtLeastOneRoomIsShown,
    addSymbol,
    removeSymbol,
    updateSymbol,
} = toolSlice.actions

export default toolSlice.reducer;

interface ToolSliceState {
    currentFile: UserFile | null
    resetViewer: boolean
    pdfInfo: GeneralData | null
}