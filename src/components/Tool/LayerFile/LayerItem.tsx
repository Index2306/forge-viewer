import React, {useCallback, useEffect} from 'react';
import {EyeInvisibleOutlined, EyeOutlined} from "@ant-design/icons";
import {useTranslation} from "next-i18next";
import {useAppDispatch, useAppSelector} from "@/hooks";
import {selectTool} from "@/store/slices/tool/tool.slice";

import styles from './LayerFile.module.scss'
import classNames from 'classnames/bind';
import { LayerStatus } from '@/contants/tool';
const cx = classNames.bind(styles)

const LayerItem : React.FC<LayerItemProps>= ({keyName, status,active, changeShow}) => {
    const {t} = useTranslation(['common', 'tool'])
    const dispatch = useAppDispatch()

    const {currentFile} = useAppSelector(selectTool)

    const onChangeItem = useCallback(() => {
        changeShow(keyName, status === LayerStatus.CLOSE ? LayerStatus.OPEN : LayerStatus.CLOSE)
    }, [keyName, status, changeShow])

    useEffect(() => {
        if (currentFile) {
            if (!active) return;

            if (currentFile.fileData) {
                // dispatch(changeStatusKey({key: keyName, status: status}))
            }
        }
    }, [keyName, status, active])

    return (
        <div className={cx('layer-file__item-feature', {'layerActive': status === 1})} onClick={() => onChangeItem()}>
            <span className={cx('layer-file__item-feature__icon')} >
                {status === LayerStatus.OPEN ? <EyeOutlined /> : <EyeInvisibleOutlined />}
            </span>
            <span className={cx('layer-file__item-feature__feature-name')}>
                {t(keyName, {ns: 'tool'})}
            </span>
        </div>
    );
};

export default React.memo(LayerItem);

export interface LayerItemProps {
    keyName: string,
    status: number,
    active: boolean,
    changeShow: (key: string, status: number) => void,
}