import React, {useCallback, useEffect, useState} from 'react';
import {useTranslation} from "next-i18next";
import {NewFieldType, RoomDataModel} from "@/models";
import {useAppDispatch, useAppSelector} from "@/hooks";
import {selectTool, setEditedRoom, updateDataRoom} from "@/store/slices/tool/tool.slice";
import styles from "./RoomSetting.module.scss";
import ModalDraggable from "@/components/ModalDraggable";
import {Checkbox, Col, Divider, Row} from "antd";
import AppButton from "@/components/Button";
import RoomSettingForm from "@/components/RoomSetting/RoomSettingFrom";
import NewField from "@/components/NewField";

import InputCustom from '../InputCustom';
import { useDebounce } from 'ahooks';

const TitleRoomName: React.FC<
    {roomName: string, showFeature: boolean, onChangeRoomName: (name?: string, value?: any) => void}
    > = ({roomName, showFeature, onChangeRoomName}) => {
    const {t} = useTranslation(['tool'])
    return (
        <Row
            justify='start'
            align='middle'
            gutter={[4, 4]}
            wrap={false}
            style={{ width: showFeature ? '230px' : '195px', marginLeft: '4px' }}
        >
            <Col
                style={{
                    width: showFeature ? '230px' : '195px'
                }}
            >
                <InputCustom
                    name='roomName'
                    label={`${t('room_name')}`}
                    initValue={roomName}
                    changeValue={(name, value) => {
                        onChangeRoomName(name, value)
                    }}
                />
            </Col>
        </Row>
    )
}


const RoomSettingModal : React.FC<RoomSettingModalProps> = ({isOpen, id, onCancel}) => {
    const [data, setData] = useState<RoomDataModel | undefined>(undefined)
    const [showFeature, setShowFeature] = useState<boolean>(false)
    const [inputFields, setInputFields] = useState<NewFieldType[]>([])

    const {t} = useTranslation(['common', 'tool'])

    const {currentFile} = useAppSelector(selectTool)
    const dispatch = useAppDispatch()

    // --- Room name ---
    const [roomName, setRoomName] = useState<string>("")
    const roomNameDebounce = useDebounce(roomName, {maxWait: 300})


    useEffect(() => {
        if (currentFile?.fileData?.rooms) {
            const currentData = currentFile?.fileData?.rooms?.find((r: any) => r.roomId === id);
            if (currentData) {
                setData(currentData)
                setInputFields(currentData?.info?.dynamicFields ?? [])
                setRoomName(currentData?.name ?? "")
            }
        }
        return () => {
            setData(undefined)
        }
    }, [id])

    // ---------------------------------------------
    // --- Functions that control Modal, Form ---
    // ---------------------------------------------

    const handleCancelModal = useCallback(() => {
        if (currentFile?.fileData?.rooms) {
            const currentData = currentFile?.fileData?.rooms?.find((r: any) => r.roomId === id);
            // If user input to room name, but not complete form
            // so, reset room name value
            setRoomName(currentData?.name ?? "")
        }
        onCancel()
    }, [onCancel, currentFile, id])

    const handleShowFeatures = useCallback((e: any) => {
        setShowFeature(e.target.checked)
    }, [])

    const handleCompleteForm = useCallback(() => {
        if (data) {
            let changedRoomName: string = roomName
            if (changedRoomName.length === 0) {
                // If user input to room name to empty
                // so, reset room name value
                const currentData = currentFile?.fileData?.rooms?.find((r: any) => r.roomId === id);
                changedRoomName = currentData?.name ?? ""
            }
            const payload = {
                id: data?.id,
                data: {
                    name: changedRoomName,
                    height: data.height,
                    width: data.width,
                    length: data.length,
                    info: {...data.info},
                }
            }
            dispatch(updateDataRoom({...payload}))

            const currentRoom = {
                ...data,
                name: changedRoomName,
            }

            dispatch(setEditedRoom(JSON.parse(JSON.stringify(currentRoom))))
            setRoomName(changedRoomName)
        }
        onCancel()
    }, [roomName, data, currentFile, id])

    const handleChangeValueForm = (name: string | undefined, value: any) => {
        setData(prev => {
            if (!prev) { return }
            switch (name) {
                case 'room_length': {
                    return { ...prev, length: parseFloat(value)}
                }
                case 'space_width': {
                    return { ...prev, width: parseFloat(value)}
                }
                case 'room_height': {
                    return { ...prev, height: parseFloat(value)}
                }
            }
            const info = {...prev?.info, [name as string]: function(v: any) {
                if (v === undefined || (typeof v === 'string' && v.length === 0)) {
                    return ""
                }
                return v
            }(value)}
            return {...prev, info}
        });
    }

    // ---------------------------------------------
    // --- Functions that control Dynamic fields ---
    // ---------------------------------------------

    const handleAddNewDynamicField = (value: NewFieldType): boolean => {
        if (!data) return false;

        const currentList = [...inputFields];
        const existIndex = currentList.findIndex((v: NewFieldType) => v.name === value.name);
        if (existIndex >= 0) {
            return false;
        }

        currentList.push(value);
        setInputFields(currentList)

        setData((prev) => {
            if (!prev) { return }
            const info = {...prev?.info, dynamicFields: currentList}
            return {...prev, info}
        })

        return true
    }

    const handleChangeDynamicField = (name: string | undefined, value: any) => {
        const mapCallback = (list: NewFieldType[]) => {
            return [...list].map(f => {
                return f.name === name ? { ...f, value: value } : f
            })
        }

        setInputFields(mapCallback)

        setData(function(prev) {
            if (!prev) return

            let info = {...prev?.info}
            let dynamicFields = info?.dynamicFields

            if (!dynamicFields) return { ...prev }

            dynamicFields = mapCallback(dynamicFields)

            info = {...prev?.info, dynamicFields}

            return {...prev, info}
        })
    }

    const handleRemoveDynamicField = (fieldObject: NewFieldType) => {
        const filterCallback = (list: NewFieldType[]) => {
            const remainFields = [...list].filter(f => f.name !== fieldObject.name)
            return [...remainFields]
        }

        setInputFields(filterCallback)

        setData(function(prev) {
            if (!prev) return

            let info = {...prev?.info}
            let dynamicFields = info?.dynamicFields

            if (!dynamicFields) return { ...prev }

            dynamicFields = filterCallback(dynamicFields)
            info = {...prev?.info, dynamicFields}

            return {...prev, info}
        })
    }

    const handleUpdateDynamicField = (oldValue?: NewFieldType, newValue?: NewFieldType) => {
        if (!oldValue) return false;

        const currentList = [...inputFields];
        const indexOldField = currentList.findIndex((v: NewFieldType) => v.name === oldValue.name);
        if (indexOldField < 0) return false;

        let oldField = currentList[indexOldField];

        if (newValue) {
            if (oldValue?.name != newValue?.name) {
                const existIndex = currentList.findIndex((v: NewFieldType) => v.name === newValue.name);
                if (existIndex >= 0) {
                    return false;
                } else {
                    oldField = {
                        ...oldField,
                        name: newValue?.name
                    };
                }
            }

            oldField = { ...oldField, hide: newValue.hide };
            currentList[indexOldField] = oldField;
            setInputFields(currentList);
        }

        setData(function(prev) {
            if (!prev) return

            let info = {...prev?.info}
            let dynamicFields = info?.dynamicFields

            if (!dynamicFields) return { ...prev }

            dynamicFields = [...currentList]
            info = {...prev?.info, dynamicFields}

            return {...prev, info}
        })

        return true;
    }

    // ------------------------------
    // --- Render base component ----
    // ------------------------------

    const renderButtonInsteadOfCloseIcon = (
        <AppButton className={styles.btnTitle} onClick={handleCompleteForm}>{t('complete', {ns: 'common'})}</AppButton>
    )

    return (
        <ModalDraggable
            renderTitle={<TitleRoomName roomName={roomName} showFeature={showFeature} onChangeRoomName={(_, value) => setRoomName(value ?? "")}/>}
            renderCloseIcon={renderButtonInsteadOfCloseIcon}
            open={isOpen}
            onCancel={handleCancelModal}
            width={showFeature ? 950 : 550}
            mask={false}
        >
            <div>
                <Divider style={{margin: 0}}/>
                {data ? <>
                    <RoomSettingForm
                        isShowFeature={showFeature}
                        inputFields={inputFields}
                        data={data}
                        changeValue={handleChangeValueForm}
                        onChangeValueDynamic={handleChangeDynamicField}
                        onRemoveDynamicField={handleRemoveDynamicField}
                        onHandleUpdateDynamicField={handleUpdateDynamicField}
                    />
                    <div className={styles.footerForm}>
                        <Checkbox checked={showFeature} onChange={handleShowFeatures}>{t('show_advanced_features', {ns: 'tool'})}</Checkbox>
                        <NewField onAddNewField={handleAddNewDynamicField} placement='bottom'/>
                    </div>
                </> : null}
            </div>

        </ModalDraggable>
    );
};

export default React.memo(RoomSettingModal);

interface RoomSettingModalProps {
    isOpen: boolean,
    id: string
    onCancel: () => void

}