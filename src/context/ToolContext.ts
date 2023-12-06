import {createContext, ReactNode} from "react";
import {UserFile} from "@/models";

export const ToolContext = createContext<ToolContextProps>({
    isOpenSideBar: true,
    toolFile: null,
    distanceWiring: 0,
    isToolReady: false,
    progressUnit: 0,
    errUnit: null
});

export interface ToolContextProps {
    toolFile?: ReactNode
    isOpenSideBar?: boolean
    setIsOpenSideBar?: (v: boolean) => void,
    fileSelected?: UserFile | undefined
    openFile?: (file: UserFile) => void
    distanceWiring?: number
    setDistanceWiring?: (distance: number) => void
    onHandleAddNewFile?: (newFile: UserFile) => void
    isToolReady: boolean
    setIsToolReady?: (val: boolean) => void
    progressUnit: number,
    setProgressUnit?: (p: number) => void
    errUnit: string | null
    setErrUnit?: (b: string | null) => void
}