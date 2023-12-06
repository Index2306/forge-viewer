import { BrowserType } from "@/models/browser";
import {createContext} from "react";

export const AppContext = createContext<AppContextProps>({isLoading: false});

export interface AppContextProps {
    isLoading: boolean,
    setLoading?: (value: boolean) => void
    browser?: BrowserType
}
