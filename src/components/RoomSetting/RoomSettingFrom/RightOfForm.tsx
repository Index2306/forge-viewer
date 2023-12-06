import InputCustom from '@/components/InputCustom'
import RoomChooseOption from '../RoomChooseOption'
import styles from '../RoomSetting.module.scss'
import NextImage from 'next/image'
import Divider from '../Divider'
import { useTranslation } from 'next-i18next'
import { RoomDataModel } from '@/models'
import { AnyDisturbancesState, CeilingVaultedState, disableHelper } from '.'

interface RightOfFormProps {
    data: RoomDataModel
    onChangeValue: (name: string | undefined, value: any) => void
    anyDisturbances: AnyDisturbancesState
    setAnyDisturbances: React.Dispatch<React.SetStateAction<AnyDisturbancesState>>
    anyDisturbancesOptions: {
        value: string
        label: string
    }[]
    handleChangeYesNoHelper: (name: string, value: any) => void
    setCeilingVaulted: React.Dispatch<React.SetStateAction<CeilingVaultedState>>
    ceilingVaulted: CeilingVaultedState
}

export default function RightOfForm({
    data,
    onChangeValue,
    anyDisturbances,
    setAnyDisturbances,
    anyDisturbancesOptions,
    handleChangeYesNoHelper,
    setCeilingVaulted,
    ceilingVaulted,
}: RightOfFormProps) {
    const { t } = useTranslation(['common', 'tool'])

    return (
        <div className={styles.chooseForm}>
            <RoomChooseOption
                key={5}
                keyName='ceiling_vaulted'
                question={t('ceiling_vaulted', { ns: 'tool' })}
                defaultChecked={data?.info?.ceiling_vaulted ?? false}
                onChange={(name, value) => {
                    onChangeValue(name, value)
                    handleChangeYesNoHelper(name, value)
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'flex-start',
                        marginTop: '10px',
                        marginBottom: '10px',
                    }}
                >
                    <div
                        style={{
                            marginRight: '16px',
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
                            name='ceiling_vaulted_height'
                            label={<p>{`${t('height')}`}<span style={{ fontSize: '0.7rem', marginLeft: '4px', }}>(m)</span></p>}
                            changeValue={(name, value) => {
                                onChangeValue(name, value)
                                setCeilingVaulted(function (prev) {
                                    return { ...prev, ceiling_vaulted_height: value }
                                })
                            }}
                            initValue={ceilingVaulted.ceiling_vaulted_height}
                            disabled={disableHelper(ceilingVaulted.has_ceiling_vaulted)}
                            numberSuffix={' '.concat(`m`)}
                            style={{ maxHeight: '27px', width: '100px' }}
                        />
                        <NextImage
                            src='/assets/img/room-setting/ceiling_vaulted_01.png'
                            width={75}
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
                            name='ceiling_vaulted_width'
                            label={<p>{`${t('width')}`} <span style={{ fontSize: '0.7rem', marginLeft: '4px', }} > (m)</span></p>}
                            changeValue={(name, value) => {
                                onChangeValue(name, value)
                                setCeilingVaulted(function (prev) {
                                    return { ...prev, ceiling_vaulted_width: value }
                                })
                            }}
                            initValue={ceilingVaulted.ceiling_vaulted_width}
                            disabled={disableHelper(ceilingVaulted.has_ceiling_vaulted)}
                            numberSuffix={' '.concat(`m`)}
                            style={{ maxHeight: '27px', width: '100px' }}
                        />
                        <NextImage
                            src='/assets/img/room-setting/ceiling_vaulted_02.png'
                            width={76}
                            height={60}
                            alt='ceiling_sloping_02'
                        />
                    </div>
                </div>
            </RoomChooseOption>

            <Divider />

            <RoomChooseOption
                key={7}
                keyName='has_any_disturbances'
                question={t('has_any_disturbances', { ns: 'tool' })}
                defaultChecked={data?.info?.has_any_disturbances ?? false}
                vertical
                onChange={(name, value) => {
                    onChangeValue(name, value)
                    handleChangeYesNoHelper(name, value)
                }}
            >
                <InputCustom
                    isSelector
                    style={{ width: '100%' }}
                    name='any_disturbances'
                    label={t('any_disturbances', { ns: 'tool' })}
                    changeValue={(name, value) => {
                        onChangeValue(name, value)
                        setAnyDisturbances(function (prev) {
                            return { ...prev, any_disturbances: value }
                        })
                    }}
                    initValue={anyDisturbances.any_disturbances}
                    options={anyDisturbancesOptions}
                    disabled={disableHelper(anyDisturbances.has_any_disturbances)}
                />
            </RoomChooseOption>

            <Divider />

            <RoomChooseOption
                key={8}
                keyName='obstacles_to_installation'
                question={t('obstacles_to_installation', { ns: 'tool' })}
                defaultChecked={data?.info?.obstacles_to_installation ?? false}
                onChange={onChangeValue}
            />

            <Divider />

            <RoomChooseOption
                key={9}
                keyName='server_room'
                question={t('server_room', { ns: 'tool' })}
                defaultChecked={data?.info?.server_room ?? false}
                onChange={onChangeValue}
            />

            <Divider />

            <RoomChooseOption
                key={10}
                keyName='explosive_atmosphere'
                question={t('explosive_atmosphere', { ns: 'tool' })}
                description={t('atex_document', { ns: 'tool' })}
                defaultChecked={data?.info?.explosive_atmosphere ?? false}
                onChange={onChangeValue}
            />
        </div>
    )
}
