import React, {ReactNode, useCallback, useEffect, useState} from 'react';
import styles from './CustomerForm.module.scss';
import {Alert, Col, Form, Row} from "antd";
import LogoUpload from "@/components/GeneralForm/Upload/LogoUpload";
import InputCustom from "@/components/InputCustom";
import NewField from "@/components/NewField";
import {useTranslation} from "next-i18next";
import {NewFieldType} from "@/models";
import {RcFile} from "antd/es/upload";
import { REGEX_HELPER } from '@/helpers/Regex';
import GoogleMap from "@/components/AppGoogleMap";

const CustomerForm: React.FC<CustomerFormProps> = ({
                                                       errorMessage,
                                                       customer,
                                                       setCustomer,
                                                       dynamicFields,
                                                       setDynamicFields
                                                   }) => {
    const {t} = useTranslation()
    const [customerDataEdit, setCustomerDataEdit] = useState<any>(undefined);

    useEffect(() => {
        if (!customerDataEdit) {
            setCustomerDataEdit(customer)
        }
    }, [customer])

    // change all value form
    const onChangeAllValue = (name: string | undefined, data: any) => {
        if (name) {
            const newData = {...customerDataEdit};
            newData[name] = data;
            setCustomer(newData);
            setCustomerDataEdit(newData)
        }
    }

    // handle check before add new dynamic field to form
    const onHandleAddNewField = (newValue: NewFieldType): boolean => {
        const oldList = [...dynamicFields];
        const existIndex = oldList.findIndex((v: NewFieldType) => v.name === newValue.name);
        if (existIndex >= 0) {
            return false;
        }

        oldList.push(newValue);
        setDynamicFields(oldList);
        return true;
    }

    const renderErrorMessage = (): ReactNode => {
        return errorMessage?.map((msg: string, index) => <Alert
            key={index}
            message={msg}
            type="error"
            showIcon
        />)
    }

    // handle change value of dynamic field
    const onChangeValueDynamicField = useCallback((name: string | undefined, value: any) => {
        const newList = [...dynamicFields];
        const itemChange = newList.findIndex(v => v.name === name);
        if (itemChange > -1) {
            newList[itemChange].value = value;
            setDynamicFields(newList);
        }
    }, [dynamicFields, setDynamicFields]);

    // handle remove dynamic field to form
    const onHandleRemoveField = useCallback((removeValue: NewFieldType) => {
        const newList = [...dynamicFields].filter(v => v !== removeValue);
        setDynamicFields(newList);
    }, [dynamicFields, setDynamicFields])

    // handle update dynamic field
    const onHandleUpdateDynamicField = useCallback((oldValue?: NewFieldType, newValue?: NewFieldType): boolean => {
        if (!oldValue) return false;

        const oldList = [...dynamicFields];
        const indexOldField = oldList.findIndex((v: NewFieldType) => v.name === oldValue.name);
        if (indexOldField < 0) return false;

        const oldField = oldList[indexOldField];

        if (newValue) {
            if (oldValue.name != newValue.name) {
                const existIndex = oldList.findIndex((v: NewFieldType) => v.name === newValue.name);
                if (existIndex >= 0) {
                    return false;
                } else {
                    oldField.name = newValue.name;
                }
            }

            oldField.hide = newValue.hide;
            oldList[indexOldField] = oldField;
            setDynamicFields(oldList);
        }

        return true;
    }, [dynamicFields, setDynamicFields])

    // render dynamic field list with condition
    const renderDynamicFields = () => {
        return dynamicFields.map((value: NewFieldType, index) =>
            <Col xs={24} md={12} key={index}>
                <Form.Item className={`${styles.formItem} ${styles.formItemDynamic}`}>
                    <InputCustom
                        name={value.name}
                        label={value.name}
                        required={false}
                        dynamicField={value}
                        initValue={value?.value ?? undefined}
                        changeValue={onChangeValueDynamicField}
                        onRemoveField={onHandleRemoveField}
                        onFinishUpdate={onHandleUpdateDynamicField}
                        style={{
                            width: '100%',
                        }}/>
                </Form.Item>
            </Col>
        )
    };

    const onChangeLogo = (file: RcFile | undefined, thumbnail: string) => {
        const newData = {...customerDataEdit};
        newData.logoUpload = file;
        newData.logo = thumbnail;
        setCustomer(newData);
        setCustomerDataEdit(newData)
    }

    const onChangeDataMap = (data: any) => {
        const newData = {...customerDataEdit};
        newData.map = data;
        setCustomer(newData);
        setCustomerDataEdit(newData)
    }

    return (
        <div className={styles.form}>
            <Row>
                <Col xs={{span: 24, order: 2}} xl={{span: 20, order: 1}}>
                    <Form className={styles.form}>
                        <div style={{marginBottom: '12px'}}>{renderErrorMessage()}</div>
                        <Row>
                            <Col xs={24} md={12}>
                                <Form.Item className={styles.formItem}>
                                    <InputCustom
                                        name='customerNumber'
                                        label={`${t('customer_number')}`}
                                        changeValue={onChangeAllValue}
                                        initValue={customerDataEdit?.customerNumber}
                                        style={{
                                            width: '100%',
                                        }}/>
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item className={styles.formItem}>
                                    <InputCustom
                                        name='company'
                                        label={`${t('company')}`}
                                        required={true}
                                        changeValue={onChangeAllValue}
                                        initValue={customerDataEdit?.company}
                                        style={{
                                            width: '100%',
                                        }}/>
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item className={styles.formItem}>
                                    <InputCustom
                                        name='street'
                                        label={`${t('street')}`}
                                        required={true}
                                        changeValue={onChangeAllValue}
                                        initValue={customerDataEdit?.street}
                                        style={{
                                            width: '100%',
                                        }}/>
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item className={styles.formItem}>
                                    <InputCustom
                                        name='location'
                                        label={`${t('location')}`}
                                        required={true}
                                        changeValue={onChangeAllValue}
                                        initValue={customerDataEdit?.location}
                                        style={{
                                            width: '100%',
                                        }}/>
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item className={styles.formItem}>
                                    <InputCustom
                                        name='postcode'
                                        label={`${t('postcode')}`}
                                        required={true}
                                        changeValue={onChangeAllValue}
                                        initValue={customerDataEdit?.postcode}
                                        validateBy={REGEX_HELPER.onlyNumber}
                                        style={{
                                            width: '100%',
                                        }}/>
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item className={styles.formItem}>
                                    <InputCustom
                                        name='telephone'
                                        label={`${t('telephone')}`}
                                        required={false}
                                        changeValue={onChangeAllValue}
                                        initValue={customerDataEdit?.telephone}
                                        style={{
                                            width: '100%',
                                        }}/>
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item className={styles.formItem}
                                           rules={[
                                               {type: "email", message: `${t('email_invalid')}`,}
                                           ]}
                                >
                                    <InputCustom
                                        type='email'
                                        name='email'
                                        label={`${t('email')}`}
                                        required={false}
                                        changeValue={onChangeAllValue}
                                        initValue={customerDataEdit?.email}
                                        style={{
                                            width: '100%',
                                        }}/>
                                </Form.Item>
                            </Col>
                            {dynamicFields?.length > 0 ? renderDynamicFields() : null}
                            <Col xs={24} md={12} style={{paddingRight: '10px'}}>
                                <NewField onAddNewField={onHandleAddNewField}/>
                            </Col>
                        </Row>

                    </Form>
                </Col>
                <Col xs={{span: 24, order: 1}} xl={{span: 4, order: 2}}>
                    <Row>
                        <Col xs={24} sm={24} lg={12} xl={24}>
                            <LogoUpload onChangeFile={onChangeLogo}
                                        recommend={t('recommended_size')}
                                        initFile={customerDataEdit && (customerDataEdit.logoUpload || customerDataEdit.logo) ? [
                                            {
                                                uid: '-1',
                                                name: 'Logo',
                                                status: 'done',
                                                url: customerDataEdit.logo ? customerDataEdit.logo : customerDataEdit.logoUpload
                                            }
                                        ] : []}/>
                        </Col>
                        <Col xs={24} sm={24} lg={12} xl={24}>
                            <div className={styles.mapUpload}>
                                <GoogleMap initialData={customerDataEdit?.map} changeData={onChangeDataMap}/>
                            </div>
                        </Col>
                    </Row>

                </Col>
            </Row>
        </div>
    );
};

export default React.memo(CustomerForm);

export interface CustomerFormProps {
    errorMessage?: string[]
    isCreate?: boolean | undefined,
    thumbnail?: RcFile | undefined,
    dynamicFields: NewFieldType[]
    setDynamicFields: (data: NewFieldType[]) => void,
    checkExistName?: (data: string) => number,
    customer: any,
    setCustomer: (data: any) => void,
}
