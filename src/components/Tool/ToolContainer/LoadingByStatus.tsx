import {LoadingStatusEnum} from '@/contants/tool'
import {HubConnectionContext} from '@/context/HubConnectionContext'
import {useContext} from 'react'
import {useTranslation} from 'react-i18next'

import styles from './ToolContainer.module.scss'
import classNames from "classnames/bind";
import PageLoading from "@/components/AppLoading/PageLoading";
import ProgressChangeUnit from "@/components/ToolHandle/ChangeUnitTool/ProgressChangeUnit";

const cx = classNames.bind(styles);

export default function LoadingByStatus({
                                            statusLoading,
                                            isGetDataFile,
                                            isFetching,
                                            currentFileStatus,
                                        }: LoadingByStatusProps) {
    const {t} = useTranslation(['common', 'config', 'tool'])

    const {connected} = useContext(HubConnectionContext)


    let title = undefined
    switch (statusLoading) {
        case LoadingStatusEnum.INITIALIZING_TOOL:
            title = t('initializing_tool', {ns: 'tool'})
            break
        case LoadingStatusEnum.LOADING_MODEL_DATA:
            title = t('loading_model_data', {ns: 'tool'})
            break
        case LoadingStatusEnum.CHANGE_UNIT_PENDING:
            title = <ProgressChangeUnit/>
            break
        default:
            title = undefined
            break
    }

    if (isGetDataFile) {
        return <PageLoading title={t('loading')} />
    } else if (currentFileStatus === 0 && (isFetching || !connected)) {
        return <PageLoading title={title}/>
    }

    return null
}

interface LoadingByStatusProps {
    statusLoading: number
    isGetDataFile: boolean
    isFetching: boolean
    currentFileStatus?: number
}
