import React, {ReactNode, useCallback, useEffect, useState} from 'react';
import {Alert, Col, Form, Row} from "antd";
import styles from "./ProjectForm.module.scss";
import InputCustom from "@/components/InputCustom";
import NewField from "@/components/NewField";
import {useTranslation} from "next-i18next";
import {CustomerModel, NewFieldType, ProjectFormData, SelectOptionCustomProps} from "@/models";
import ImageUpload from "@/components/Project/ProjectCard/ProjectForm/ImageUpload";
import {RcFile} from "antd/es/upload";
import {useAppDispatch, useAppSelector} from "@/hooks";
import {getGeneralByType} from "@/store/actions/general-data.action";
import {selectProject} from "@/store/slices/project/project.slice";
import {errorToast} from "@/helpers/Toast";

const ProjectFrom: React.FC<ProjectFormData> =
    ({
         errorMessage,
         projectData,
         setProjectData,
         dynamicFields,
         setDynamicFields
     }) => {
        const {t} = useTranslation();
        const dispatch = useAppDispatch()

        const [optionCustomers, setOptionCustomers] = useState<SelectOptionCustomProps[] | undefined>([]);
        const [optionOperators, setOptionOperators] = useState<SelectOptionCustomProps[] | undefined>(undefined);
        const [dynamicFieldList, setDynamicFieldList] = useState<NewFieldType[]>([]);

        const {isCreating} = useAppSelector(selectProject);

        const callApiGetGeneralType = useCallback(
            (type: number) => {
                dispatch(getGeneralByType(type)).then(({payload}) => {
                    if (payload) {
                        const result = payload?.result;
                        if (result) {
                            const data = result.map((val: CustomerModel) => {
                                if (val.customerNumber) {
                                    return {label: `${val.customerNumber} | ${val.company}`, value: val.id}
                                } else {
                                    return {label: `${val.company}`, value: val.id}
                                }
                            })
                            if (type === 0) {
                                setOptionCustomers(data)
                            } else {
                                setOptionOperators(data)
                            }
                            return;
                        }
                    }
                    if (type === 0) {
                        errorToast(t('error_get_customer'))
                        setOptionCustomers([])
                    } else {
                        errorToast(t('error_get_operator'))
                        setOptionOperators([])
                    }
                })
                    .catch(err => {
                        if (type === 0) {
                            errorToast(t('error_get_customer'))
                            setOptionCustomers([])
                        } else {
                            errorToast(t('error_get_operator'))
                            setOptionOperators([])
                        }
                    })
            },
            [dispatch, t],
        );


        const firstGetDataGeneral = useCallback(
            () => {
                callApiGetGeneralType(0)
                callApiGetGeneralType(2)
            }
            , [callApiGetGeneralType]);


        useEffect(() => {
            firstGetDataGeneral();
            return () => {
                setOptionCustomers(undefined)
                setOptionOperators(undefined)
            };
        }, [isCreating, firstGetDataGeneral]);

        useEffect(() => {
            setDynamicFieldList(dynamicFields)
        }, [dynamicFields]);


        // handle check before add new dynamic field to form
        const onHandleAddNewField = useCallback((newValue: NewFieldType): boolean => {
            const oldList = [...dynamicFieldList];
            const existIndex = oldList.findIndex((v: NewFieldType) => v.name === newValue.name);
            if (existIndex >= 0) {
                return false;
            }

            oldList.push(newValue);
            setDynamicFields(oldList);
            setDynamicFieldList(oldList)
            return true;
        }, [dynamicFieldList, setDynamicFields])

        // handle remove dynamic field to form
        const onHandleRemoveField = useCallback((removeValue: NewFieldType) => {
            const newList = [...dynamicFieldList].filter(v => v !== removeValue);
            setDynamicFields(newList);
            setDynamicFieldList(newList)
        }, [dynamicFieldList, setDynamicFields])

        // handle change value of dynamic field
        const onChangeValueDynamicField = useCallback((name: string | undefined, value: any) => {
            const newList = [...dynamicFieldList];
            const itemChange = newList.findIndex(v => v.name === name);
            if (itemChange > -1) {
                newList[itemChange].value = value;
                setDynamicFields(newList);
                setDynamicFieldList(newList)
            }
        }, [dynamicFieldList, setDynamicFields]);

        // handle update dynamic field
        const onHandleUpdateDynamicField = useCallback((oldValue?: NewFieldType, newValue?: NewFieldType): boolean => {
            if (!oldValue) return false;

            const oldList = [...dynamicFieldList];
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
                setDynamicFieldList(oldList)
            }

            return true;
        }, [dynamicFieldList, setDynamicFields])

        // render dynamic field list with condition
        const renderDynamicFields = () => {
            return dynamicFieldList.map((value: NewFieldType, index) =>
                <Form.Item className={`${styles.formItem} ${styles.formItemDynamic}`} key={index}>
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
            )
        };

        // change image upload for form
        const onChangeThumbnailUpload = useCallback((file: RcFile | undefined, thumbnail: string) => {
            const newData = {...projectData};
            newData.thumbnail = file;
            newData.thumbUrl = thumbnail;
            setProjectData(newData);
        }, [projectData, setProjectData])

        // change all value form
        const onChangeAllValue = useCallback((name: string | undefined, data: any) => {
            if (name) {
                const newData = {...projectData};
                newData[name] = data;
                setProjectData(newData);
            }
        }, [projectData, setProjectData])

        // call api for select General type (Customer, Operator)
        const onHandleGetDataSelect = useCallback(
            (selectType: string | undefined) => {
                const type: number = selectType === 'customer' ? 0 : 2;
                callApiGetGeneralType(type)
            },
            [callApiGetGeneralType],
        );

        const renderErrorMessage = (): ReactNode => {
            return errorMessage?.map((msg: string, index) => <Alert
                key={index}
                message={msg}
                type="error"
                showIcon
            />)
        }

        return (
            <Row>
                <Col xs={{order: 2, span: 24}}  md={{order: 1, span: 16}} className={styles.formInfo}>
                    <Form>
                        <div style={{marginBottom: '12px'}}>{renderErrorMessage()}</div>
                        <Form.Item className={styles.formItem}>
                            <InputCustom
                                name='name'
                                label={`${t('project_name')}`}
                                required={true}
                                changeValue={onChangeAllValue}
                                initValue={projectData?.name}
                                style={{
                                    width: '100%',
                                }}/>
                        </Form.Item>
                        <Form.Item className={styles.formItem}>
                            <InputCustom
                                isSelector={true}
                                name='customer'
                                label={`${t('customer')}`}
                                required={false}
                                changeValue={onChangeAllValue}
                                options={optionCustomers}
                                initValue={projectData?.customer}
                                selectCallback={onHandleGetDataSelect}
                                style={{
                                    width: '100%',
                                }}/>
                        </Form.Item>
                        <Form.Item className={styles.formItem}>
                            <InputCustom
                                isSelector={true}
                                name='operator'
                                label={`${t('operator')}`}
                                required={false}
                                changeValue={onChangeAllValue}
                                options={optionOperators}
                                initValue={projectData?.operator}
                                selectCallback={onHandleGetDataSelect}
                                style={{
                                    width: '100%',
                                }}/>
                        </Form.Item>
                        {dynamicFieldList?.length > 0 ? renderDynamicFields() : null}
                        <NewField onAddNewField={onHandleAddNewField}/>
                    </Form>
                </Col>
                <Col xs={{order: 1, span: 24}}  md={{order: 2, span: 8}}>
                    <ImageUpload onChangeFile={onChangeThumbnailUpload}
                                 initFile={projectData && (projectData.thumbnail || projectData.thumbUrl) ? [
                                     {
                                         uid: '-1',
                                         name: 'image.png',
                                         status: 'done',
                                         url: projectData.thumbUrl ? projectData.thumbUrl : projectData.thumbnail
                                     }
                                 ] : []}/>
                </Col>
            </Row>
        );
    };

export default ProjectFrom;