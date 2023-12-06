import InputCustom from '@/components/InputCustom'
import Divider from '../Divider'
import RoomChooseOption from '../RoomChooseOption'
import styles from '../RoomSetting.module.scss'

import NextImage from 'next/image'
import { RoomDataModel } from '@/models'
import React from 'react'
import { CeilingSlopingState, PartitionsOnCeilingState, disableHelper } from '.'
import { useTranslation } from 'next-i18next'

interface MiddleOfFormProps {
    data: RoomDataModel
    onChangeValue: (name: string | undefined, value: any) => void
    set_detector_type: React.Dispatch<React.SetStateAction<string | undefined>>
    detectorType?: string
    detectorTypeOptions: {
        value: string
        label: string
    }[]
    isShowFeature?: boolean
    handleChangeYesNoHelper: (name: string, value: any) => void
    setPartitionsOnCeiling: React.Dispatch<React.SetStateAction<PartitionsOnCeilingState>>
    partitionsOnCeiling: PartitionsOnCeilingState
    setCeilingSloping: React.Dispatch<React.SetStateAction<CeilingSlopingState>>
    ceilingSloping: CeilingSlopingState
}

export default function MiddleOfForm({
    data,
    onChangeValue,
    set_detector_type,
    detectorType,
    detectorTypeOptions,
    isShowFeature,
    handleChangeYesNoHelper,
    setPartitionsOnCeiling,
    partitionsOnCeiling,
    setCeilingSloping,
    ceilingSloping,
}: MiddleOfFormProps) {
    const { t } = useTranslation(['common', 'tool'])

    return (
        <div className={styles.chooseForm}>
            <RoomChooseOption
                key={1}
                keyName='false_ceiling'
                question={t('false_ceiling', { ns: 'tool' })}
                defaultChecked={data?.info?.false_ceiling ?? false}
                onChange={onChangeValue}
            />

            <Divider />

            <RoomChooseOption
                key={2}
                keyName='raised_floor'
                question={t('raised_floor', { ns: 'tool' })}
                defaultChecked={data?.info?.raised_floor ?? false}
                onChange={onChangeValue}
            />

            <Divider />

            <div className={styles.roomChooseSelect}>
                <InputCustom
                    isSelector
                    style={{ width: '100%' }}
                    name='detector_type'
                    label={t('detector_type', { ns: 'tool' })}
                    changeValue={(name, value) => {
                        onChangeValue(name, value)
                        set_detector_type(value)
                    }}
                    initValue={detectorType}
                    options={detectorTypeOptions}
                />
            </div>

            <Divider />

            {isShowFeature ? (
                <>
                    <RoomChooseOption
                        key={3}
                        keyName='partitions_on_ceiling'
                        question={t('partitions_on_ceiling', { ns: 'tool' })}
                        description={t('partitions_on_ceiling_description', {
                            ns: 'tool',
                        })}
                        defaultChecked={data?.info?.partitions_on_ceiling ?? false}
                        onChange={(name, value) => {
                            onChangeValue(name, value)
                            handleChangeYesNoHelper(name, value)
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                alignContent: 'center',
                                flexFlow: 'row nowrap',
                                gap: '8px',
                                marginTop: '8px',
                            }}
                        >
                            <InputCustom
                                isNumber
                                inputSmall
                                name='partitions_number'
                                label={<p>{`${t('number')}`}</p>}
                                changeValue={(name, value) => {
                                    onChangeValue(name, value)
                                    setPartitionsOnCeiling(function (prev) {
                                        return { ...prev, partitions_number: value }
                                    })
                                }}
                                initValue={partitionsOnCeiling.partitions_number}
                                disabled={disableHelper(
                                    partitionsOnCeiling.has_partitions_on_ceiling,
                                )}
                                style={{ maxHeight: '27px', width: '100%' }}
                            />
                            <InputCustom
                                isNumber
                                inputSmall
                                name='partitions_height'
                                label={<p>{`${t('height')}`}<span style={{ fontSize: '0.7rem', marginLeft: '4px', }}>(m)</span></p>}
                                changeValue={(name, value) => {
                                    onChangeValue(name, value)
                                    setPartitionsOnCeiling(function (prev) {
                                        return { ...prev, partitions_height: value }
                                    })
                                }}
                                initValue={partitionsOnCeiling.partitions_height}
                                disabled={disableHelper(
                                    partitionsOnCeiling.has_partitions_on_ceiling,
                                )}
                                numberSuffix={' '.concat(`m`)}
                                style={{ maxHeight: '27px', width: '100%' }}
                            />
                            <InputCustom
                                isNumber
                                inputSmall
                                name='partitions_width'
                                label={
                                    <p>
                                        {`${t('width')}`}
                                        <span
                                            style={{
                                                fontSize: '0.7rem',
                                                marginLeft: '4px',
                                            }}
                                        >
                                            (m)
                                        </span>
                                    </p>
                                }
                                changeValue={(name, value) => {
                                    onChangeValue(name, value)
                                    setPartitionsOnCeiling(function (prev) {
                                        return { ...prev, partitions_width: value }
                                    })
                                }}
                                initValue={partitionsOnCeiling.partitions_width}
                                disabled={disableHelper(
                                    partitionsOnCeiling.has_partitions_on_ceiling,
                                )}
                                numberSuffix={' '.concat(`m`)}
                                style={{ maxHeight: '27px', width: '100%' }}
                            />
                        </div>
                    </RoomChooseOption>

                    <Divider />

                    <RoomChooseOption
                        key={4}
                        keyName='ceiling_sloping'
                        question={t('ceiling_sloping', { ns: 'tool' })}
                        defaultChecked={data?.info?.partitions_on_ceiling ?? false}
                        onChange={(name, value) => {
                            onChangeValue(name, value)
                            handleChangeYesNoHelper(name, value)
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                marginTop: '10px',
                                marginBottom: '10px',
                            }}
                        >
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    alignContent: 'center',
                                    flexDirection: 'column',
                                    gap: '8px',
                                }}
                            >
                                <InputCustom
                                    isNumber
                                    inputSmall
                                    name='ceiling_sloping_length'
                                    label={<p>{`${t('length')}`}<span style={{ fontSize: '0.7rem', marginLeft: '4px', }}>{`${t('bis_first')}`} (m)</span></p>}
                                    changeValue={(name, value) => {
                                        onChangeValue(name, value)
                                        setCeilingSloping(function (prev) {
                                            return {
                                                ...prev,
                                                ceiling_sloping_length: value,
                                            }
                                        })
                                    }}
                                    initValue={ceilingSloping.ceiling_sloping_length}
                                    disabled={disableHelper(ceilingSloping.has_ceiling_sloping)}
                                    numberSuffix={' '.concat(`m`)}
                                    style={{ maxHeight: '27px', width: '138px' }}
                                />
                                <NextImage
                                    src='/assets/img/room-setting/ceiling_sloping_01.png'
                                    width={90}
                                    height={60}
                                    alt='ceiling_sloping_01'
                                />
                            </div>
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    alignContent: 'center',
                                    flexDirection: 'column',
                                    gap: '8px',
                                }}
                            >
                                <InputCustom
                                    isNumber
                                    inputSmall
                                    name='ceiling_sloping_height'
                                    label={<p>{`${t('height')}`}<span style={{ fontSize: '0.7rem', marginLeft: '4px', }} >{`${t('bis_first')}`} (m)</span></p>}
                                    changeValue={(name, value) => {
                                        onChangeValue(name, value)
                                        setCeilingSloping(function (prev) {
                                            return {
                                                ...prev,
                                                ceiling_sloping_height: value,
                                            }
                                        })
                                    }}
                                    initValue={ceilingSloping.ceiling_sloping_height}
                                    disabled={disableHelper(ceilingSloping.has_ceiling_sloping)}
                                    numberSuffix={' '.concat(`m`)}
                                    style={{ maxHeight: '27px', width: '138px' }}
                                />
                                <NextImage
                                    src='/assets/img/room-setting/ceiling_sloping_02.png'
                                    width={92}
                                    height={60}
                                    alt='ceiling_sloping_02'
                                />
                            </div>
                        </div>
                    </RoomChooseOption>
                </>
            ) : null}
        </div>
    )
}
