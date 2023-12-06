import React, {useCallback, useEffect, useState} from "react";
import {useTranslation} from "next-i18next";
import {DoorDataModel} from "@/models";
import {useAppSelector} from "@/hooks";
import {selectTool} from "@/store/slices/tool/tool.slice";
import DoorExitItem from "@/components/ToolHandle/ManualCallPointTool/DoorExitListTool/DoorExitItem";
import ToolListTitle from "@/components/Tool/ToolListTitle";

import styles from './DoorExitListTool.module.scss'
import classNames from "classnames/bind";
const cx = classNames.bind(styles)

const DoorExitList : React.FC<DoorExitListProps> = ({activeCurrentTool}) => {
    const {t} = useTranslation(['common', 'tool'])
    const [doorExitList, setDoorExitList] = useState<DoorDataModel[]>([]);
    const [indeterminate, setIndeterminate] = useState(false);
    const [checkAll, setCheckAll] = useState(false);

    const {currentFile} = useAppSelector(selectTool)

    useEffect(() => {
        if (currentFile?.fileData?.doors) {
            const arrDoor = currentFile?.fileData?.doors;
            const maxNameArr = (arrDoor ?? []).filter((d: DoorDataModel) => d.isExist && d.name).map((d: DoorDataModel) => +(d.name?.replace('No. ', '') ?? '0'));
            const maxNameNumber = Math.max(...maxNameArr);

            setDoorExitList(arrDoor?.filter(d => d.isExist).map((d: DoorDataModel, index: number) => {
                const doorExist = doorExitList.find(cr => cr.doorId === d.doorId);
                let nameDoor = d?.name;

                if (nameDoor === undefined) {
                    if (maxNameNumber > index) {
                        nameDoor = `No. ${index + 1}`
                    }
                }

                let isShow = d.isShow;
                if (doorExist) {
                    if (doorExist.isShow) {
                        isShow = doorExist.isShow
                    }
                }

                return {
                    ...d,
                    name: nameDoor,
                    isShow
                }
            }))
        }
    }, [currentFile?.fileData?.doors])

    useEffect(() => {
        if (!activeCurrentTool) {
            setIndeterminate(false)
            setCheckAll(false)
            setDoorExitList(prev => [...prev].map(point => ({...point, isShow: false})))
        }

        return () => {
            setIndeterminate(false)
            setCheckAll(false)
        }
    }, [activeCurrentTool])

    useEffect(() => {
        const countShowOnViewer = doorExitList.filter((door: DoorDataModel) => door.isShow);
        if (doorExitList.length === 0) {
            setCheckAll(false)
            setIndeterminate(false)
            return;
        }

        if (countShowOnViewer.length === doorExitList.length) {
            setCheckAll(true)
            setIndeterminate(false)
        } else if (countShowOnViewer.length > 0) {
            setCheckAll(false)
            setIndeterminate(true)
        } else {
            setCheckAll(false)
            setIndeterminate(false)
        }
    }, [doorExitList])

    const onHandleChangeShowItem = useCallback((status: boolean, id: string | number) => {
        if (id === 'all') {
            setDoorExitList(prev => [...prev].map(point => ({...point, isShow: status})));
            setIndeterminate(false);
            setCheckAll(status);
        } else {
            setDoorExitList(prev => [...prev].map(door => {
                if (id === door.doorId) {
                    return {...door, isShow: status};
                }
                return door;
            }))
        }
    }, [])

    if (!activeCurrentTool) return null;
    return (
        <div>
            <DoorExitItem key='all' id='all' name={`${t('show_all', {ns: 'tool'})}`} onChangeView={onHandleChangeShowItem} indeterminate={indeterminate} isShow={checkAll}/>
            {doorExitList
                .map((door: DoorDataModel, index: number) =>
                    <DoorExitItem key={index}
                                    id={door.doorId}
                                    name={door.name}
                                    onChangeView={onHandleChangeShowItem}
                                    isShow={door.isShow}
                                    data={door}
                    />)
            }
        </div>
    );
};

export default React.memo(DoorExitList);

interface DoorExitListProps {
    activeCurrentTool: boolean
}