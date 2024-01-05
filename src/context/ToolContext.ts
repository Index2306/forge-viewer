import {createContext, ReactNode} from "react";

export const ToolContext = createContext<ToolContextProps>({
    isOpenSideBar: true,
    toolFile: null,
    distanceWiring: 0,
    isToolReady: false,
    progressUnit: 0,
    errUnit: null,
    urn: '',
});

export interface ToolContextProps {
    toolFile?: ReactNode
    isOpenSideBar?: boolean
    setIsOpenSideBar?: (v: boolean) => void,
    fileSelected?: any | undefined
    openFile?: (file: any) => void
    distanceWiring?: number
    setDistanceWiring?: (distance: number) => void
    onHandleAddNewFile?: (newFile: any) => void
    isToolReady: boolean
    setIsToolReady?: (val: boolean) => void
    progressUnit: number,
    setProgressUnit?: (p: number) => void
    errUnit: string | null
    setErrUnit?: (b: string | null) => void
    urn?: any
}