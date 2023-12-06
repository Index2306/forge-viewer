import React from 'react'
import InputCustom from '@/components/InputCustom'
import { renderNumberToString } from '@/helpers/StringHelper'
import { NewFieldType } from '@/models'
import { Space } from 'antd'
import { useTranslation } from 'next-i18next'
import { RoomMeasurementState } from '.'

function calArea(width: string, length: string) {
    const result = Number(width) * Number(length)
    return renderNumberToString(result)
}

function calVolume(width: string, length: string, height: string) {
    const result = Number(width) * Number(length) * Number(height)
    return renderNumberToString(result)
}

interface LeftOfFormProps {
    roomMeasurement: RoomMeasurementState
    onChangeValue: (name: string | undefined, value: any) => void
    setRoomMeasurement: React.Dispatch<React.SetStateAction<RoomMeasurementState>>
    isShowFeature?: boolean
    inputFields?: NewFieldType[]
    onChangeValueDynamic: (name: string | undefined, value: any) => void
    onRemoveDynamicField?: (removeValue: NewFieldType) => void
    onHandleUpdateDynamicField?: (oldVal?: NewFieldType, newVal?: NewFieldType) => boolean
}

export default function LeftOfForm({
    roomMeasurement,
    onChangeValue,
    setRoomMeasurement,
    isShowFeature,
    inputFields,
    onChangeValueDynamic,
    onRemoveDynamicField,
    onHandleUpdateDynamicField,
}: LeftOfFormProps) {
    const { t } = useTranslation(['common', 'tool'])

    return (
        <Space direction='vertical' size='middle' style={{ display: 'flex', marginTop: '16px' }}>
            <InputCustom
                isNumber
                numberSuffix={' '.concat(`m`)}
                name='room_length'
                label={t('room_length', { ns: 'tool' })}
                initValue={roomMeasurement.length}
                // changeValue={(name, value) => {
                //     onChangeValue(name, value)
                //     setRoomMeasurement(function (prev) {
                //         return {
                //             ...prev,
                //             length: value,
                //         }
                //     })
                // }}
                disabled
            />
            <InputCustom
                isNumber
                numberSuffix={' '.concat(`m`)}
                name='space_width'
                label={t('space_width', { ns: 'tool' })}
                initValue={roomMeasurement.width}
                // changeValue={(name, value) => {
                //     onChangeValue(name, value)
                //     setRoomMeasurement(function (prev) {
                //         return {
                //             ...prev,
                //             width: value,
                //         }
                //     })
                // }}
                disabled
            />
            <InputCustom
                isNumber
                numberSuffix={' '.concat(`m`)}
                name='room_height'
                label={t('room_height', { ns: 'tool' })}
                initValue={roomMeasurement.height}
                changeValue={(name, value) => {
                    onChangeValue(name, value)
                    setRoomMeasurement(function (prev) {
                        return {
                            ...prev,
                            height: value,
                        }
                    })
                }}
            />
            {isShowFeature ? (
                <>
                    <InputCustom
                        isNumber
                        numberSuffix={' '.concat(`m\u00B2`)}
                        name='room_area'
                        label={t('room_area', { ns: 'tool' })}
                        disabled={true}
                        initValue={calArea(roomMeasurement.width, roomMeasurement.length)}
                    />
                    <InputCustom
                        isNumber
                        numberSuffix={' '.concat(`m\u00B3`)}
                        name='room_volume'
                        label={t('room_volume', { ns: 'tool' })}
                        disabled={true}
                        initValue={calVolume(
                            roomMeasurement.width,
                            roomMeasurement.length,
                            roomMeasurement.height,
                        )}
                    />
                    {inputFields?.map((f: NewFieldType, index: number) => (
                        <InputCustom
                            key={index}
                            name={f.name}
                            label={f.name}
                            changeValue={(name, value) => {
                                onChangeValueDynamic(name, value)
                            }}
                            initValue={f.value}
                            dynamicField={f}
                            onRemoveField={onRemoveDynamicField}
                            onFinishUpdate={onHandleUpdateDynamicField}
                        />
                    ))}
                </>
            ) : null}
        </Space>
    )
}
