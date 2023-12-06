import React, { useEffect } from 'react'
import { Form, Input, Select, Space } from 'antd'
import { useTranslation } from 'next-i18next'
import AppButton from '@/components/Button'
import ModalApp from '@/components/ModalApp'

import styles from './ChangeUnitTool.module.scss'
import classNames from 'classnames/bind'
const cx = classNames.bind(styles)

const { Option } = Select

const FormChangeUnit: React.FC<FormChangeUnitProps> = ({
    keyName,
    isOpen,
    onOk,
    onCancel,
    info,
}) => {
    const [form] = Form.useForm()
    const { t } = useTranslation(['common', 'config', 'tool'])

    // useEffect(() => {
        // if (info?.length && info?.unit) {
        //     // form.setFieldsValue({ length: info.length, unit: info.unit })
        // } else {
        //     // form.setFieldsValue({ length: 900, unit: 'Millimeters' })
        // }
    // }, [form, info])

    const onFinishFailed = (values: any) => {
        console.log('Received values of form: ', values);
    }

    return (
        <ModalApp
            title={keyName}
            width={520}
            open={isOpen}
            onCancel={onCancel}
            renderFooter={
                <Space>
                    <AppButton onClick={onCancel} type='ghost'>
                        {t('cancel')}
                    </AppButton>
                    <AppButton
                        onClick={() => {
                            form.validateFields()
                                .then((values) => {
                                    // form.resetFields();
                                    onOk(values)
                                })
                                .catch((info) => {
                                    onFinishFailed(info)
                                })
                        }}
                    >
                        {t('complete')}
                    </AppButton>
                </Space>
            }
        >
            <div className={styles.formChange}>
                <div>
                <Form
                    form={form}
                    name='basic'
                    initialValues={{ /*length: 900, */ unit: 'Millimeters' }}
                    onFinish={onOk}
                    onFinishFailed={onFinishFailed}
                    autoComplete='off'
                    className={cx('form-custom')}
                >
                    <Form.Item
                        label={`${t('length', { ns: 'tool' })} / ${t('unit', { ns: 'tool' })}`}
                    >
                        <Space.Compact style={{ width: '100%' }}>
                            <Form.Item
                                name={'length'}
                                noStyle
                                rules={[
                                    {
                                        required: true,
                                        message: `${t('field_is_required', {
                                            field: t('length', { ns: 'tool' }),
                                        })}`,
                                    },
                                ]}
                            >
                                <Input
                                    style={{ width: '100%' }}
                                    type='number'
                                    placeholder={`${t('length', { ns: 'tool' })}`}
                                />
                            </Form.Item>
                            <Form.Item
                                name={'unit'}
                                noStyle
                                rules={[
                                    {
                                        required: true,
                                        message: `${t('field_is_required', {
                                            field: t('unit', { ns: 'tool' }),
                                        })}`,
                                    },
                                ]}
                            >
                                <Select placeholder={t('unit', { ns: 'tool' })}>
                                    <Option value='Inches'>Inches</Option>
                                    <Option value='Millimeters'>Millimeters</Option>
                                    <Option value='Centimeters'>Centimeters</Option>
                                    {/*<Option value="Feet">Feet</Option>*/}
                                    {/*<Option value="Miles">Miles</Option>*/}
                                    {/*<Option value="Decimeters">Decimeters</Option>*/}
                                    {/*<Option value="Meters">Meters</Option>*/}
                                    {/*<Option value="Kilometers">Kilometers</Option>*/}
                                </Select>
                            </Form.Item>
                        </Space.Compact>
                    </Form.Item>
                </Form>
                </div>

                {/* --------------------------------------------- RECOMMENDATION */}

                <p className={cx('formChange', 'recommendation')}>
                    {t('recommend_900_millimeters_for_single_door', { ns: 'tool' })}
                </p>
            </div>
        </ModalApp>
    )
}

export default React.memo(FormChangeUnit)

export interface FormChangeUnitProps {
    info?: any
    keyName: string
    isOpen: boolean
    onOk: (v: any) => void
    onCancel: (v?: any) => void
}
