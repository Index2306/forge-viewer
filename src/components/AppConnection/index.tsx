import React, {ReactNode, useCallback, useEffect, useState} from 'react';
import {HubConnectionContext} from "@/context/HubConnectionContext";
import Cookies from 'js-cookie';
import {HubConnection, HubConnectionBuilder} from "@microsoft/signalr";
import {errorToast} from "@/helpers/Toast";
import {useTranslation} from "next-i18next";

const AppConnection : React.FC<HubConnectionProps> = ({children}) => {
    const {t} = useTranslation()

    const [hubConnection, setHubConnection] = useState<HubConnection | undefined>(undefined)
    const [connectionId, setConnectionId] = useState<string | undefined | null>(null)
    const [connected, setConnected] = useState<boolean>(false)

    const initConnectToHub = useCallback(() => {
        const token = Cookies.get('access_token');

        if (!hubConnection && token && !connected) {
            const newConn = new HubConnectionBuilder()
                // .withUrl(`${process.env.NEXT_PUBLIC_HUB_URL}/?access_token=${token}`)
                .withUrl(`${process.env.NEXT_PUBLIC_HUB_URL}`, {
                    accessTokenFactory: () => token
                })
                .withAutomaticReconnect()
                .build();

            newConn
                .start()
                .then(() => {
                    setHubConnection(newConn);
                    setConnected(true)
                    console.info('Connected to socket!')
                })
                .catch((error) => {
                    console.error(error)
                    errorToast(t('error_connect_hubs'), false)
                    setConnected(false)
                });
        }
    }, [hubConnection, connected, t]);

    useEffect(() => {
        initConnectToHub()

        return () => {
            if (hubConnection) {
                hubConnection.stop();
                setHubConnection(undefined);
                setConnected(false)
                setConnectionId(null)
            }
        }
    }, [])

    useEffect(() => {
        if (hubConnection) {
            setConnectionId(hubConnection.connectionId)
        }

        hubConnection?.onreconnecting((err) => {
            // TODO set loading if necessary
        })

        hubConnection?.onreconnected((connectionId) => {
            setConnectionId(connectionId)
        })

    }, [hubConnection])

    useEffect(() => {
        if (hubConnection) {
            setConnected(hubConnection.state === 'Connected')
        }
    }, [hubConnection?.state])

    return <HubConnectionContext.Provider value={{hubConnection, connectionId, connected}}>
        {children}
    </HubConnectionContext.Provider>;
};

export default React.memo(AppConnection);

export interface HubConnectionProps {
    children?: ReactNode | undefined
}