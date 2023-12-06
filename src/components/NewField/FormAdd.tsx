import React, { useCallback, useEffect, useState } from 'react';
import styles from './NewField.module.scss';
import { Form, Switch } from "antd";
import { useTranslation } from "next-i18next";
import InputCustom from "@/components/InputCustom";
import { Button, Icon } from "@chakra-ui/react";
import { isNullOrEmpty } from "@/helpers/StringHelper";
import { NewFieldType } from "@/models";
import AppButton from "@/components/Button";
import { BiSolidError } from 'react-icons/bi';

// From add new dynamic field
const FormAdd: React.FC<{ onFinish: (value: NewFieldType) => boolean, setOpen(isOpen: boolean): void, initValue?: NewFieldType | undefined }> = ({ onFinish, setOpen, initValue }) => {
    const { t } = useTranslation();

    const [data, setData] = useState<NewFieldType | undefined>({ name: '', hide: false, value: undefined });
    const [error, setError] = useState<boolean>(false);
    const [required, setRequired] = useState<string | undefined>(undefined);

    useEffect(() => {
        if (initValue) {
            setData(initValue)
        }

        return () => {
            setData({ name: '', hide: false, value: undefined })
            setError(false)
            setRequired(undefined)
        }
    }, [initValue]);


    const onChangeHideValue = useCallback(
        (checked: boolean) => {
            if (data) {
                const oldData: NewFieldType = { ...data };
                oldData.hide = checked;
                setData(oldData)
            }
        },
        [data],
    );

    // check name required
    const onHandleFinish = useCallback(
        () => {
            setError(false)
            setRequired(undefined)
            if (isNullOrEmpty(data?.name)) {
                setRequired(`${t('field_is_required', { field: 'Name' })}`)
                setError(true)
            } else {
                // check dynamic name exists
                const success = onFinish({
                    name: `${data?.name}`.trim(),
                    hide: data?.hide ?? false,
                })
                if (!success) {
                    setRequired(undefined);
                    setError(true);
                    return;
                }

                if (!initValue) {
                    setData({ name: '', hide: false, value: undefined })
                    setOpen(false);
                }
            }
        },
        [initValue, data, onFinish, setOpen, t]);


    // handle change name (label) of new dynamic field
    const onHandleChangeName = useCallback(
        (name: string | undefined, value: any) => {
            if (data) {
                const oldData: NewFieldType = { ...data };
                oldData.name = value;
                setData(oldData)
            }

            setError(false)
            setRequired(undefined)
        },
        [data],
    );

    return (
        <Form className={styles.formAdd} autoComplete="off" key='form-add'>
            <Form.Item
                validateStatus={error ? "error" : ''}
                help={required ? <div className={styles.formAddError}>
                    <Icon as={BiSolidError} />
                    {required}
                </div> : error ?
                    <div className={styles.formAddError}>
                        <Icon as={BiSolidError} />
                        {t('field_exists', { field: t('field_name') })}
                    </div> : ''}
                className={styles.formItem}
                name="name">
                <InputCustom
                    style={{
                        width: '100%',
                    }}
                    label={`${t('field_name')}`}
                    required={true}
                    initValue={data?.name ?? ''}
                    changeValue={onHandleChangeName}
                />
            </Form.Item>
            <Form.Item className={styles.marginReset}>
                <Switch className={styles.switchBtn} onChange={onChangeHideValue} checked={data?.hide ?? false} />
                <label>{' '}{t('hide_content')}</label>
            </Form.Item>
            <AppButton fullWidth={true} onClick={() => onHandleFinish()} size='small'>
                {initValue ? `${t('update')} ${t('field')}` : `${t('add_new_field')}`}
            </AppButton>
        </Form>
    );
};

export default React.memo(FormAdd);
