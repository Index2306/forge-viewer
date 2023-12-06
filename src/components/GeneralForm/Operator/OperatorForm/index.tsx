import React, {ReactNode, useCallback, useEffect, useMemo, useState} from "react";
import {useTranslation} from "next-i18next";
import {NewFieldType} from "@/models";
import {Alert, Col, Form, Row} from "antd";
import styles from "@/components/GeneralForm/Operator/OperatorForm/OperatorForm.module.scss";
import InputCustom from "@/components/InputCustom";
import {RcFile} from "antd/es/upload";
import NewField from "@/components/NewField";
import LogoUpload from "@/components/GeneralForm/Upload/LogoUpload";
import { REGEX_HELPER } from "@/helpers/Regex";
import GoogleMap from "../../../AppGoogleMap";

const OperatorForm: React.FC<OperatorFormProps> = ({
                                                       errorMessage,
                                                       operatorData,
                                                       setOperatorData,
                                                       dynamicFields,
                                                       setDynamicFields
                                                   }) => {
    const {t} = useTranslation()
    const [errMsg, setErrMsg] = useState<string[] | undefined>([])
    const [operatorDataEdit, setOperatorDataEdit] = useState<any | undefined>(undefined)

    useEffect(() => {
        setErrMsg(errorMessage)
        return () => {
            setErrMsg([])
        }
    }, [errorMessage])

    useEffect(() => {
        if (!operatorData) {
            setOperatorDataEdit(operatorData)
        }
    }, [operatorData])

    // change all value form
    const onChangeAllValue = (name: string | undefined, data: any) => {
        if (name) {
            const newData = {...operatorDataEdit};
            newData[name] = data;
            setOperatorData(newData);
            setOperatorDataEdit(newData)
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

    const renderErrorMessage = useMemo(() => {
        return errMsg?.map((msg: string, index) => <Alert
            key={index}
            message={msg}
            type="error"
            showIcon
        />)
    }, [errMsg])

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
            <Col xs={24} key={index}>
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
        const newData = {...operatorDataEdit};
        newData.logoUpload = file;
        newData.logo = thumbnail;
        setOperatorData(newData);
        setOperatorDataEdit(newData)
    }

    const onChangeDataMap = (data: any) => {
        const newData = {...operatorDataEdit};
        newData.map = data;
        setOperatorData(newData);
        setOperatorDataEdit(newData)
    }

    return (
        <div className={styles.form}>
            <Row>
                <Col xs={{span: 24, order: 2}} lg={{span: 24, order: 2}} xl={{span: 8, order: 1}} xxl={{span: 10, order: 1}}>
                    <Form className={styles.formInput}>
                        <div style={{marginBottom: '12px'}}>{renderErrorMessage}</div>
                        <Row>
                            <Col xs={24}>
                                <Form.Item className={styles.formItem}>
                                    <InputCustom
                                        name='company'
                                        label={`${t('company')}`}
                                        required={true}
                                        changeValue={onChangeAllValue}
                                        initValue={operatorDataEdit?.company}
                                        style={{
                                            width: '100%',
                                        }}/>
                                </Form.Item>
                            </Col>
                            <Col xs={24}>
                                <Form.Item className={styles.formItem}>
                                    <InputCustom
                                        name='street'
                                        label={`${t('street')}`}
                                        required={false}
                                        changeValue={onChangeAllValue}
                                        initValue={operatorDataEdit?.street}
                                        style={{
                                            width: '100%',
                                        }}/>
                                </Form.Item>
                            </Col>
                            <Col xs={24}>
                                <Form.Item className={styles.formItem}>
                                    <InputCustom
                                        name='postcode'
                                        label={`${t('postcode')}`}
                                        required={false}
                                        changeValue={onChangeAllValue}
                                        initValue={operatorDataEdit?.postcode}
                                        validateBy={REGEX_HELPER.onlyNumber}
                                        style={{
                                            width: '100%',
                                        }}/>
                                </Form.Item>
                            </Col>
                            <Col xs={24}>
                                <Form.Item className={styles.formItem}>
                                    <InputCustom
                                        name='location'
                                        label={`${t('location')}`}
                                        required={false}
                                        changeValue={onChangeAllValue}
                                        initValue={operatorDataEdit?.location}
                                        style={{
                                            width: '100%',
                                        }}/>
                                </Form.Item>
                            </Col>
                            <Col xs={24}>
                                <Form.Item className={styles.formItem}>
                                    <InputCustom
                                        name='telephone'
                                        label={`${t('telephone')}`}
                                        required={false}
                                        changeValue={onChangeAllValue}
                                        initValue={operatorDataEdit?.telephone}
                                        style={{
                                            width: '100%',
                                        }}/>
                                </Form.Item>
                            </Col>
                            <Col xs={24}>
                                <Form.Item className={styles.formItem}>
                                    <InputCustom
                                        type='email'
                                        name='email'
                                        label={`${t('email')}`}
                                        required={false}
                                        changeValue={onChangeAllValue}
                                        initValue={operatorDataEdit?.email}
                                        style={{
                                            width: '100%',
                                        }}/>
                                </Form.Item>
                            </Col>
                            {dynamicFields?.length > 0 ? renderDynamicFields() : null}
                            <Col xs={24} style={{paddingRight: '10px'}}>
                                <NewField onAddNewField={onHandleAddNewField}/>
                            </Col>
                        </Row>

                    </Form>
                </Col>
                <Col xs={{span: 24, order: 1}} lg={{span: 12, order: 1}} xl={{span: 9, order: 1}} xxl={{span: 8, order: 2}}
                     className={styles.uploadCard}>
                    <div className={styles.mapUpload}>
                        <GoogleMap initialData={operatorDataEdit?.map} changeData={onChangeDataMap}/>
                    </div>
                </Col>
                <Col xs={{span: 24, order: 1}} lg={{span: 12, order: 1}} xl={{span: 7, order: 1}} xxl={{span: 6, order: 3}}
                className={styles.uploadCard}>
                    <LogoUpload className={styles.logoUpload}
                                description={t('operator_logo')}
                                onChangeFile={onChangeLogo}
                                recommend={t('recommended_size')}
                                initFile={operatorDataEdit && (operatorDataEdit.logoUpload || operatorDataEdit.logo) ? [
                                    {
                                        uid: '-1',
                                        name: 'Logo',
                                        status: 'done',
                                        url: operatorDataEdit.logo ? operatorDataEdit.logo : operatorDataEdit.logoUpload
                                    }
                                ] : []}/>
                </Col>
            </Row>
        </div>
    );
};

export default OperatorForm;

export interface OperatorFormProps {
    errorMessage?: string[]
    isCreate?: boolean | undefined,
    thumbnail?: RcFile | undefined,
    dynamicFields: NewFieldType[]
    setDynamicFields: (data: NewFieldType[]) => void,
    checkExistName?: (data: string) => number,
    operatorData: any,
    setOperatorData: (data: any) => void,
}