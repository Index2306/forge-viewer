import React, {useContext, useEffect} from 'react';
import {HubConnectionContext} from "@/context/HubConnectionContext";
import {useAppDispatch, useAppSelector} from "@/hooks";
import {camelCaseKeys} from "@/helpers/Object";
import {changeStatusFile, selectTool} from "@/store/slices/tool/tool.slice";

const FileConnection : React.FC<FileConnectionProps> = () => {

    const {hubConnection, connected} = useContext(HubConnectionContext)
    const {currentFile} = useAppSelector(selectTool)

    const dispatch = useAppDispatch();

    useEffect(() => {
        if (connected && hubConnection) {
            hubConnection.on('uploadFile', (response) => {
                if (response.isSuccess) {
                    const parseData = response.data;
                    dispatch(changeStatusFile({id: parseData.id, status: parseData.status, modelDerivativeUrn: parseData.modelDerivativeUrn}))
                } else {
                    console.error(response?.data)
                }
            });
        }

        return () => {

        }
    }, [connected, currentFile])

    return (
        <></>
    );
};

export default React.memo(FileConnection);

export interface FileConnectionProps {

}