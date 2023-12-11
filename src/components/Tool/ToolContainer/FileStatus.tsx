import React, {useCallback} from 'react';
import styles from './ToolContainer.module.scss'
import DataLoading from "@/components/AppLoading/DataLoading";
import {useTranslation} from "next-i18next";

const FileStatus : React.FC<FileStatusProps> = ({status}) => {
    const {t} = useTranslation(['common', 'tool'])

    const renderStatus = useCallback(() => {
        switch (status) {
            // case -1: return <div className={styles.fileStatus}><DataLoading title={t('loading')} /> </div>;
            case -1: return <></>;
            case 0: return null;
            case 2:
            case 3: {
                return <div className={styles.fileStatus}><DataLoading title={status === 2 ? t('pending') : t('processing')}/> </div>;
            }
            default: return <div className={styles.fileStatus}> <h2 className={styles.titleAlert}>{t('file_data_error', {ns: 'tool'})}</h2> </div>;
        }
    }, [status, t])

    return renderStatus();
};

export default React.memo(FileStatus);

export interface FileStatusProps {
    status: number
}