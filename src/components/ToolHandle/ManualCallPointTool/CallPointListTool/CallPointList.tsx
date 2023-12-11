import React, {useCallback, useEffect, useState} from 'react';
import {ExitPointDataModel, ManualCallPointDataModel} from "@/models";
import {useAppSelector} from "@/hooks";
import {selectTool} from "@/store/slices/tool/tool.slice";
import {Vector2} from "three";
import {useTranslation} from "next-i18next";
import CallPointItem from "@/components/ToolHandle/ManualCallPointTool/CallPointListTool/CallPointItem";
import {deleteAllManualCallPoint} from "@/ForgeViewer/CustomTool/Edit2D";
import ToolListTitle from '@/components/Tool/ToolListTitle';

import styles from './CallPoint.module.scss'
import classNames from 'classnames/bind';
const cx = classNames.bind(styles)

const CallPointList: React.FC<CallPointListProps> = ({activeCurrentTool}) => {
    const {t} = useTranslation(['common', 'tool'])
    const [callPointList, setCallPointList] = useState<ManualCallPointDataModel[]>([]);
    const [indeterminate, setIndeterminate] = useState(false);
    const [checkAll, setCheckAll] = useState(false);

    const {currentFile} = useAppSelector(selectTool)

    useEffect(() => {
        if (currentFile?.fileData?.exitPoints) {
            const arrPoint = currentFile?.fileData?.exitPoints?.map((exitPoint: ExitPointDataModel, index) => {
                let name = exitPoint.name;
                if (!name) {
                    name = `Sign ${index + 1}`
                }
                const centerPoint = new Vector2().set(exitPoint.position_layer.x, exitPoint.position_layer.y);
                const size = exitPoint.size ?? 0.3;
                let isShow = exitPoint.isShow

                if (callPointList.length > 0) {
                    const oldData = callPointList.find((data: ManualCallPointDataModel) => data.id === exitPoint.id);
                    if (oldData?.isShow) {
                        isShow = true;
                    } else if (oldData) {
                        isShow = oldData.isShow;
                    }
                }

                const dataCallPoint: ManualCallPointDataModel = {
                    id: exitPoint.id,
                    name,
                    size,
                    point: centerPoint,
                    isShow: isShow
                }
                return dataCallPoint;
            })

            setCallPointList(arrPoint ?? [])
        } else {
            setCallPointList([])
        }
    }, [currentFile?.fileData?.exitPoints])

    useEffect(() => {
        if (!activeCurrentTool) {
            setCallPointList(prev => prev.map((callPoint: ManualCallPointDataModel) => ({...callPoint, isShow: false})))
            setCheckAll(false)
            setIndeterminate(false)
            deleteAllManualCallPoint()
        }

        return () => {
            deleteAllManualCallPoint()
        }
    }, [activeCurrentTool])

    useEffect(() => {
        const countShowOnViewer = callPointList.filter((callPoint: ManualCallPointDataModel) => callPoint.isShow);
        if (callPointList.length === 0) {
            setCheckAll(false)
            setIndeterminate(false)
            return;
        }

        if (countShowOnViewer.length === callPointList.length) {
            setCheckAll(true)
            setIndeterminate(false)
        } else if (countShowOnViewer.length > 0) {
            setCheckAll(false)
            setIndeterminate(true)
        } else {
            setCheckAll(false)
            setIndeterminate(false)
        }
    }, [callPointList])

    const onHandleChangeShowItem = useCallback((status: boolean, id: string | number) => {
        if (id === 'all') {
            setCallPointList(prev => [...prev].map(point => ({...point, isShow: status})));
            setIndeterminate(false);
            setCheckAll(status);
        } else {
            setCallPointList(prev => [...prev].map((point: ManualCallPointDataModel) => {
                if (id === point.id) {
                    return {...point, isShow: status};
                }
                return point;
            }))
        }
    }, [])

    if (!activeCurrentTool) return null;
    return (
        <div>
            <CallPointItem key='all' id='all' name={`${t('show_all', {ns: 'tool'})}`}
                            size={0}
                            onChangeView={onHandleChangeShowItem} indeterminate={indeterminate} isShow={checkAll}/>
            {callPointList
                .map((point: ManualCallPointDataModel, index: number) =>
                    <CallPointItem key={index}
                                    id={point.id}
                                    name={point.name}
                                    size={point.size}
                                    onChangeView={onHandleChangeShowItem}
                                    isShow={point.isShow}
                                    point={point.point}
                    />)
            }
        </div>
    );
};

export default React.memo(CallPointList);

interface CallPointListProps {
    activeCurrentTool: boolean
}