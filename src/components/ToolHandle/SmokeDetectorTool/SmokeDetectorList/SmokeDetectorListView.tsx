import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import SmokeDetectorViewItem from "./SmokeDetectorViewItem";
import { Collapse, ConfigProvider, theme } from 'antd';
import { useTranslation } from "next-i18next";
import { RoomDataModel } from "@/models";
import { ForgeViewerContext } from "@/context/ForgeViewerContext";
import { useAppSelector } from "@/hooks";
import { selectTool } from "@/store/slices/tool/tool.slice";
import CollapseList from "@/components/ToolHandle/SmokeDetectorTool/SmokeDetectorList/CollapseList";
import { CaretRightOutlined } from "@ant-design/icons";

import styles from './SmokeDetectorList.module.scss'
import classNames from 'classnames/bind';
const cx = classNames.bind(styles)

const SmokeDetectorListView: React.FC<SmokeDetectorListViewProps> = ({isClose}) => {
    const { t } = useTranslation(['common', 'tool'])
    const [roomList, setRoomList] = useState<RoomDataModel[]>([])
    const [indeterminate, setIndeterminate] = useState(false);
    const [checkAll, setCheckAll] = useState(false);
    const [isFirst, setIsFirst] = useState(false);
    const [activeKey, setActiveKey] = useState<string[]>([]);

    const { currentFile } = useAppSelector(selectTool);

    useEffect(() => {
        if (currentFile?.fileData?.rooms) {
            const dataRoomList = currentFile?.fileData?.rooms;
            if (roomList.length === 0) {
                setRoomList(dataRoomList?.map(r => ({ ...r, devices: r.devices.map(d => ({ ...d, isShow: true })) })) ?? [])
                setActiveKey([...dataRoomList]?.map(r => r.roomId))
            }
            else if (dataRoomList?.length != roomList.length) {
                const newRoomList = dataRoomList?.map(room => {
                    const oldRoom = roomList.find(r => r.roomId === room.roomId);
                    if (oldRoom?.devices.length === room.devices.length) {
                        return {
                            ...room,
                            devices: room.devices.map(d => {
                                const oldD = oldRoom.devices.find(od => od.id === d.id);
                                if (oldD) {
                                    return {
                                        ...d,
                                        isShow: oldD.isShow
                                    }
                                }
                                return d;
                            })
                        }
                    }
                    return room;
                })

                setRoomList(newRoomList)
            }
            else {
                const newRoomList = dataRoomList?.map(room => {
                    const oldRoom = roomList.find(r => r.roomId === room.roomId);
                    if (oldRoom) {
                        return {
                            ...room,
                            devices: room.devices.map(d => {
                                const oldD = oldRoom.devices.find(od => od.id === d.id);
                                if (oldD) {
                                    return {
                                        ...d,
                                        position: d.position,
                                        position_layer: d.position_layer,
                                        radius: d.radius,
                                        radius_layer: d.radius_layer,
                                        isShow: oldD.isShow
                                    }
                                }
                                return d
                            })
                        }
                    }
                    return room;
                })
                setRoomList(newRoomList)
            }

            setIsFirst(false)
        } else {
            setRoomList([])
            setIsFirst(true)
        }

        return () => {
            setRoomList([])
            setIsFirst(true)
        }
    }, [currentFile?.fileData?.rooms])

    useEffect(() => {
        const checkAllName = roomList.filter(r => r.devices.filter(d => d.isShow).length === r.devices.length);
        if (checkAllName.length === roomList.length) {
            setCheckAll(true)
            setIndeterminate(false)
        } else {
            const countIndeterminate = roomList.filter(r => r.devices.filter(d => d.isShow).length > 0).length > 0;
            setCheckAll(false)
            if (countIndeterminate) {
                setIndeterminate(true)
            } else {
                setIndeterminate(false)
            }
        }
    }, [roomList])

    const onCheckAllChange = useCallback((e: any) => {
        const isCheckAll = e.target.checked;
        setCheckAll(isCheckAll)
        if (isCheckAll) {
            setActiveKey([...roomList]?.map(r => r.roomId))
        } else {
            setActiveKey([])
        }
        const oldList = [...roomList].map(room => {
            return {
                ...room, devices: room.devices.map((device) => {
                    return { ...device, isShow: isCheckAll }
                })
            }
        });
        setRoomList(oldList)
    }, [roomList]);

    const onCheckChange = useCallback((roomId: any, id: any, value: boolean) => {
        const oldList = [...roomList].map(room => {
            if (room.roomId === roomId || room.id === roomId) {
                return {
                    ...room, devices: room.devices.map((device) => {
                        if (device.id === id) {
                            return { ...device, isShow: value }
                        }
                        return device;
                    })
                }
            }
            return room;
        });
        setRoomList(oldList)
    }, [roomList]);

    const onHandleChangeCollapse = useCallback((e: any) => {
        setActiveKey(e)
    }, [])

    const renderListRoom = useMemo(() => {
        {
            const outsideRoom = roomList.find(r => r.id === 'outside');
            const result = roomList?.filter(r => r.id !== 'outside')?.map((room, index) => ({
                key: room.roomId,
                label: room.name,
                children: <CollapseList data={room} onCheckChange={onCheckChange} />,
            }));

            if (outsideRoom) {
                return [{
                    key: 'outside',
                    label: 'Outside',
                    children: <CollapseList data={outsideRoom} onCheckChange={onCheckChange} />,
                }, ...result]
            } else {
                return result;
            }
        }
    }, [roomList])

    return (
        <div>
            <SmokeDetectorViewItem id={'all'} key='all' name={`${t('show_all', { ns: 'tool' })}`}
                onCheckAllChange={onCheckAllChange}
                indeterminate={indeterminate}
                checkAll={checkAll} />
            <div>
                <Collapse
                    className={cx('collapse-smoke-detector')}
                    bordered={false}
                    activeKey={isFirst ? roomList.map(r => r.id) : activeKey}
                    defaultActiveKey={roomList.map(r => r.id)}
                    onChange={onHandleChangeCollapse}
                    expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
                    style={{ backgroundColor: 'transparent'}}
                    items={renderListRoom}
                />
            </div>
        </div>
    );
};

export default React.memo(SmokeDetectorListView);

interface SmokeDetectorListViewProps {
    isClose?: boolean
}