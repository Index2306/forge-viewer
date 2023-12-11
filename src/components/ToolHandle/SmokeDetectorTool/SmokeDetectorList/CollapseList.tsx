import React, {useEffect, useState} from 'react';
import {DeviceRoomModel, RoomDataModel} from "@/models";
import SmokeDetectorViewItem from "@/components/ToolHandle/SmokeDetectorTool/SmokeDetectorList/SmokeDetectorViewItem";
import {useTranslation} from "next-i18next";

const CollapseList : React.FC<CollapseListProps> = ({data, onCheckChange}) => {
    const {t} = useTranslation(['common', 'tool'])

    const [devices, setDevices] = useState<DeviceRoomModel[]>([])

    useEffect(() => {
        setDevices(data?.devices ?? [])
    }, [data?.devices])

    if (data === undefined) {
        return <></>
    }
    return (
        <>
            {devices.map((device: DeviceRoomModel, index) =>
                <SmokeDetectorViewItem id={device.id} key={device.id} device={device} isShow={device.isShow} name={`${t('detector', {ns: 'tool'})} ${index+1}`} onCheckChange={onCheckChange}/>)}
        </>
    );
};

export default React.memo(CollapseList);

interface CollapseListProps {
    data?: RoomDataModel
    onCheckChange?: (roomId: any, id: any, value: boolean) => void
}