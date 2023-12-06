import React, {useCallback, useContext, useEffect, useState} from 'react';
import {useAppDispatch, useAppSelector} from "@/hooks";
import {selectTool} from "@/store/slices/tool/tool.slice";
import {saveFileData} from "@/store/actions/tool.action";
import {successToast} from "@/helpers/Toast";
import {useTranslation} from "next-i18next";
import {HubConnectionContext} from "@/context/HubConnectionContext";
import {ToolContext} from "@/context/ToolContext";
import { LoadingOutlined } from '@ant-design/icons';

const AutoSaveData = ({className}: {className: string}) => {
    const [fetching, setFetching] = useState<boolean>(false)

    const {currentFile} = useAppSelector(selectTool)
    const {t} = useTranslation(['common'])
    const {connected, hubConnection} = useContext(HubConnectionContext)
    const {isToolReady} = useContext(ToolContext)

    const dispatch = useAppDispatch();

    useEffect(() => {
        if (currentFile?.fileData && isToolReady) {
            if (connected && hubConnection && hubConnection.state === "Connected") {
                hubConnection.send('saveDataFile', currentFile?.id, JSON.stringify(currentFile?.fileData))
            }
        }
    }, [currentFile?.fileData])

    const onHandleSaveFileData = useCallback(() => {
        if (currentFile?.fileData && isToolReady) {
            setFetching(true)
            dispatch(saveFileData({id: currentFile?.id, data: currentFile?.fileData}))
                .unwrap()
                .then(() => successToast(t('save_successfully', {ns: 'common'})))
                .catch(() => successToast(t('save_failed', {ns: 'common'}))).finally(() => setFetching(false));
        }
    }, [t, dispatch, currentFile?.fileData])

    // ---------------------------------------------------------

    return (
        <>
            {/* <AppButton fullWidth size='small' loading={fetching} onClick={onHandleSaveFileData}>{t('save')}</AppButton> */}
            <button
                data-class='label__page-tool__tool-left-sidebar__main-btn'
                className={className} onClick={onHandleSaveFileData}
            >
                {fetching && (
                    <span style={{ fontSize: '12px', color: 'white', marginRight: '8px'}}>
                        <LoadingOutlined />
                    </span>
                )}
                <span>
                    {t('save', { ns: 'common' })}
                </span>
            </button>
        </>
    );
};

export default AutoSaveData;