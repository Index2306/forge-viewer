import {createContext} from "react";
import {HubConnection} from "@microsoft/signalr";

export const HubConnectionContext = createContext<HubConnectionContextProps>({connected: false});

export interface HubConnectionContextProps {
    hubConnection?: HubConnection;
    connectionId?: string | null
    connected: boolean
}