import React, { useState } from 'react'
import styles from '../RoomSetting.module.scss'
import { Col, Row } from 'antd'
import { useTranslation } from 'next-i18next'
import { NewFieldType, RoomDataModel } from '@/models'
import { renderNumberToString } from '@/helpers/StringHelper'
import LeftOfForm from './LeftOfForm'
import MiddleOfForm from './MiddleOfForm'
import RightOfForm from './RightOfForm'

export interface RoomMeasurementState {
    width: string
    length: string
    height: string
}

export interface PartitionsOnCeilingState {
    has_partitions_on_ceiling: boolean
    partitions_number: string
    partitions_height: string
    partitions_width: string
}

export interface CeilingSlopingState {
    has_ceiling_sloping: boolean
    ceiling_sloping_length: string
    ceiling_sloping_height: string
}

export interface CeilingVaultedState {
    has_ceiling_vaulted: boolean
    ceiling_vaulted_height: string
    ceiling_vaulted_width: string
}

export interface AnyDisturbancesState {
    has_any_disturbances: boolean
    any_disturbances?: string
}

export function disableHelper(value: boolean) {
    return value ? false : true
}

const RoomSettingForm: React.FC<RoomSettingFormProps> = ({
    isShowFeature,
    inputFields,
    data,
    changeValue: onChangeValue,
    onChangeValueDynamic,
    onRemoveDynamicField,
    onHandleUpdateDynamicField,
}) => {
    const { t } = useTranslation(['common', 'tool'])

    // --- detector_type ---
    const [detectorType, setDetectorType] = useState<string | undefined>(
        data?.info?.detector_type ?? undefined,
    )
    const detectorTypeOptions = [
        { value: 'detector1', label: 'detector1' },
        { value: 'detector2', label: 'detector2' },
        { value: 'detector3', label: 'detector3' },
    ]

    const [roomMeasurement, setRoomMeasurement] = useState<RoomMeasurementState>({
        width: renderNumberToString(Number(data?.width)) || '0',
        length: renderNumberToString(Number(data?.length)) || '0',
        height: renderNumberToString(Number(data?.height)) || '',
    })

    // --- has_partitions_on_ceiling ---
    const [partitionsOnCeiling, setPartitionsOnCeiling] = useState<PartitionsOnCeilingState>({
        has_partitions_on_ceiling: (data?.info?.partitions_on_ceiling as boolean) || false,
        partitions_number: (data?.info?.partitions_number as string) || '',
        partitions_height: (data?.info?.partitions_height as string) || '',
        partitions_width: (data?.info?.partitions_width as string) || '',
    })

    // --- has_ceiling_sloping ---
    const [ceilingSloping, setCeilingSloping] = useState<CeilingSlopingState>({
        has_ceiling_sloping: data?.info?.ceiling_sloping || false,
        ceiling_sloping_length: (data?.info?.ceiling_sloping_length as string) || '',
        ceiling_sloping_height: (data?.info?.ceiling_sloping_height as string) || '',
    })

    // --- has_ceiling_vaulted ---
    const [ceilingVaulted, setCeilingVaulted] = useState<CeilingVaultedState>({
        has_ceiling_vaulted: data?.info?.ceiling_vaulted || false,
        ceiling_vaulted_height: (data?.info?.ceiling_vaulted_height as string) || '',
        ceiling_vaulted_width: (data?.info?.ceiling_vaulted_width as string) || '',
    })

    // --- has_any_disturbances ---
    // TODO: should check selector state
    const [anyDisturbances, setAnyDisturbances] = useState<AnyDisturbancesState>({
        has_any_disturbances: data?.info?.has_any_disturbances || false,
        any_disturbances: data?.info?.any_disturbances || undefined,
    })
    const anyDisturbancesOptions = [
      { value: 'any1', label: 'any1' },
      { value: 'any2', label: 'any2' },
      { value: 'any3', label: 'any3' },
  ]

    const handleChangeYesNoHelper = (name: string, value: any) => {
        switch (name) {
            case 'partitions_on_ceiling':
                setPartitionsOnCeiling(function (prev) {
                    return { ...prev, has_partitions_on_ceiling: value }
                })
                if (!value) {
                    onChangeValue('partitions_number', '')
                    onChangeValue('partitions_height', '')
                    onChangeValue('partitions_width', '')

                    setPartitionsOnCeiling(function (prev) {
                        return {
                            ...prev,
                            partitions_number: '',
                            partitions_height: '',
                            partitions_width: '',
                        }
                    })
                }
                break
            case 'ceiling_sloping':
                setCeilingSloping(function (prev) {
                    return { ...prev, has_ceiling_sloping: value }
                })
                if (!value) {
                    onChangeValue('ceiling_sloping_length', '')
                    onChangeValue('ceiling_sloping_height', '')

                    setCeilingSloping(function (prev) {
                        return {
                            ...prev,
                            ceiling_sloping_length: '',
                            ceiling_sloping_height: '',
                        }
                    })
                }
                break
            case 'ceiling_vaulted':
                setCeilingVaulted(function (prev) {
                    return { ...prev, has_ceiling_vaulted: value }
                })
                if (!value) {
                    onChangeValue('ceiling_vaulted_height', '')
                    onChangeValue('ceiling_vaulted_width', '')

                    setCeilingVaulted(function (prev) {
                        return {
                            ...prev,
                            ceiling_vaulted_height: '',
                            ceiling_vaulted_width: '',
                        }
                    })
                }
                break
            case 'has_any_disturbances':
                setAnyDisturbances(function (prev) {
                  return { ...prev, has_any_disturbances: value }
                })
                if (!value) {
                    onChangeValue('any_disturbances', undefined)

                    setAnyDisturbances(function (prev) {
                        return {
                            ...prev,
                            any_disturbances: undefined
                        }
                    })
                }
                break
            default:
                break
        }
    }

    return (
        <div className={styles.roomInfoForm}>
            <Row>
                <Col span={isShowFeature ? 6 : 9}>
                    <LeftOfForm
                        roomMeasurement={roomMeasurement}
                        onChangeValue={onChangeValue}
                        setRoomMeasurement={setRoomMeasurement}
                        isShowFeature={isShowFeature}
                        inputFields={inputFields}
                        onChangeValueDynamic={onChangeValueDynamic}
                        onRemoveDynamicField={onRemoveDynamicField}
                        onHandleUpdateDynamicField={onHandleUpdateDynamicField}
                    />
                </Col>
                <Col span={isShowFeature ? 9 : 15}>
                    <MiddleOfForm
                        data={data}
                        onChangeValue={onChangeValue}
                        set_detector_type={setDetectorType}
                        detectorType={detectorType}
                        detectorTypeOptions={detectorTypeOptions}
                        isShowFeature={isShowFeature}
                        handleChangeYesNoHelper={handleChangeYesNoHelper}
                        setPartitionsOnCeiling={setPartitionsOnCeiling}
                        partitionsOnCeiling={partitionsOnCeiling}
                        setCeilingSloping={setCeilingSloping}
                        ceilingSloping={ceilingSloping}
                    />
                </Col>
                <Col span={isShowFeature ? 9 : 0}>
                    <RightOfForm
                        data={data}
                        onChangeValue={onChangeValue}
                        anyDisturbances={anyDisturbances}
                        setAnyDisturbances={setAnyDisturbances}
                        anyDisturbancesOptions={anyDisturbancesOptions}
                        handleChangeYesNoHelper={handleChangeYesNoHelper}
                        setCeilingVaulted={setCeilingVaulted}
                        ceilingVaulted={ceilingVaulted}
                    />
                </Col>
            </Row>
        </div>
    )
}

export default React.memo(RoomSettingForm)

interface RoomSettingFormProps {
    data: RoomDataModel
    isShowFeature?: boolean
    inputFields?: NewFieldType[]
    changeValue: (name: string | undefined, value: any) => void
    onChangeValueDynamic: (name: string | undefined, value: any) => void
    onRemoveDynamicField?: (removeValue: NewFieldType) => void
    onHandleUpdateDynamicField?: (oldVal?: NewFieldType, newVal?: NewFieldType) => boolean
}
