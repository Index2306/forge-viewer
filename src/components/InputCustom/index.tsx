import React, {ReactNode, useCallback, useEffect, useRef, useState} from 'react';
import styles from "./InputCustom.module.scss";
import {Input, InputProps, Popover, Select} from "antd";
import {NewFieldType, SelectOptionCustomProps} from "@/models";
import {FaEdit} from "react-icons/fa";
import ConfirmDelete from "@/components/ConfirmDelete";
import FormAdd from "@/components/NewField/FormAdd";
import AppEmpty from "@/components/Empty";
import {useTranslation} from "next-i18next";
import { validateDataByRegex } from '@/helpers/Regex';
import { NumericFormat } from 'react-number-format';
import Image from 'next/image';

import classNames from 'classnames/bind';
import { EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';
const cx = classNames.bind(styles);

const InputCustom: React.FC<CustomInputProps>
    = ({name,
           isSelector,
           options,
           initOptions,
           selectCallback ,
           label,
           required,
           initValue,
           dynamicField,
           changeValue,
           onRemoveField,
           onFinishUpdate,
           validateBy,
           style,
           isNumber,
           inputSmall,
           numberSuffix,
           disabled,
           suffixCustom,
           ...props}) => {

    const [valueInput, setValueInput] = useState<string | number | readonly string[] | undefined>(undefined);
    const [hide, setHide] = useState<boolean>(dynamicField?.hide ?? false );
    const [isFocus, setFocus] = useState<boolean>(false );
    const [isOpenPopover, setIsOpenPopover] = useState<boolean>(false);
    const [isOpenUpdatePopover, setIsOpenUpdatePopover] = useState<boolean>(false);
    const [isLoadingSelect, setIsLoadingSelect] = useState<boolean>(false);

    const {t} = useTranslation();
    const [initDynamic, setInitDynamic] = useState<NewFieldType | undefined>(undefined);

    const preventWrongValueInputRef = useRef<any>(null);

    useEffect(() => {
        if (initValue) {
            setValueInput(initValue);
            if (changeValue) {
                changeValue(name, initValue)
            }
        }
        else if (typeof initValue  === 'string' && initValue.length === 0) {
            setValueInput('');
            if (changeValue) {
                changeValue(name, undefined)
            }
        } else {
            setValueInput(undefined);
        }
    }, [initValue])

    useEffect(() => {
        if (dynamicField) {
            if (dynamicField.value) {
                setValueInput(dynamicField.value)
            }
            setHide(dynamicField.hide)
        }

        setInitDynamic(dynamicField)
    }, [dynamicField])

    useEffect(() => {
        if (options) {
            setIsLoadingSelect(false)
        }
    }, [options])

    const onChangeValue = (event: React.FormEvent<HTMLInputElement>) => {
        event.preventDefault();

        const newValue = event.currentTarget.value;

        if (validateBy) {
            const isValid = validateDataByRegex(newValue, validateBy);

            if (isValid) {
                preventWrongValueInputRef.current = newValue;
                setValueInput(newValue);
                if (changeValue) {
                    changeValue(name, newValue);
                }

                return;
            }

            setValueInput(preventWrongValueInputRef.current);
            if (changeValue) {
                changeValue(name, preventWrongValueInputRef.current);
            }
        } else {
            setValueInput(newValue);
            if (changeValue) {
                changeValue(name, newValue);
            }
        }
    }

    const onChangeNumberValue = (value: string) => {
        setValueInput(value);
        if (changeValue) {
            changeValue(name, value);
        }
    }

    // handle delete for dynamic field
    const onHandleDelete = useCallback(() => {
        setIsOpenPopover(false)
        if (onRemoveField) {
            onRemoveField(dynamicField)
        }
    }, [dynamicField, onRemoveField])

    // close confirm popup dynamic field
    const onHandleCancel = useCallback(
        () => {
            setIsOpenPopover(false)
        },
        [],
    );


    // close cancel update popup dynamic field
    const onHandleUpdateCancel = useCallback(
        () => {
            setIsOpenUpdatePopover(false)
        },
        [],
    );


    // handle finish update
    const onHandleFinishUpdate = useCallback(
        (value: NewFieldType): boolean => {
            if (onFinishUpdate) {
                const result = onFinishUpdate(dynamicField, value);
                if (result) {
                    setHide(value.hide)
                }
                return result;
            }
            return false;
        },
        [dynamicField, onFinishUpdate],
    );

    const renderDynamic = useCallback(
        (): ReactNode => {

            if (initDynamic) {

                if (initDynamic.hide) {
                    return (
                        <div className={cx('action-icon-wrapper')}>
                            <button
                                className={cx('action-icon')}
                                onClick={() => setHide(prev => !prev)}>
                                    {hide ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                            </button>

                            <Popover
                                onOpenChange={setIsOpenUpdatePopover}
                                key={`${initDynamic.name}_edit_hide`}
                                open={isOpenUpdatePopover}
                                placement="top"
                                content={<FormAdd key={initDynamic.name} onFinish={onHandleFinishUpdate} setOpen={onHandleUpdateCancel} initValue={initDynamic}/>}
                                trigger="click">
                                <button
                                    className={cx('action-icon')}
                                    ><FaEdit />
                                </button>
                            </Popover>

                            <Popover
                                onOpenChange={setIsOpenPopover}
                                open={isOpenPopover}
                                key={`${initDynamic.name}_delete_hide`}
                                placement="top"
                                content={<ConfirmDelete name={initDynamic.name} onHandleDelete={onHandleDelete} onCancel={onHandleCancel} />}
                                trigger="click"
                            >
                                <div className={cx('action-icon')}>
                                    <Image
                                        src='/assets/icons/icon_delete.svg'
                                        alt='Trash Icon'
                                        width={24}
                                        height={24}
                                    />
                                </div>
                            </Popover>
                        </div>
                    )
                }

                return (
                <div className={cx('action-icon-wrapper')}>
                    <Popover
                        onOpenChange={setIsOpenUpdatePopover}
                        open={isOpenUpdatePopover}
                        key={`${initDynamic.name}_edit`}
                        placement="top"
                        content={<FormAdd key={initDynamic.name} onFinish={onHandleFinishUpdate} setOpen={onHandleUpdateCancel} initValue={initDynamic}/>}
                        trigger="click">
                         <button
                            className={cx('action-icon')}
                            ><FaEdit />
                        </button>
                    </Popover>

                    <Popover
                        onOpenChange={setIsOpenPopover}
                        open={isOpenPopover}
                        key={`${initDynamic.name}_delete`}
                        placement="top"
                        content={<ConfirmDelete name={initDynamic.name} onHandleDelete={onHandleDelete} onCancel={onHandleCancel} />}
                        trigger="click"
                        >
                        <div className={cx('action-icon')}>
                            <Image
                                src='/assets/icons/icon_delete.svg'
                                alt='Trash Icon'
                                width={24}
                                height={24}
                            />
                        </div>
                    </Popover>
                </div>
                );
            }
            return <></>
        },
        [hide, initDynamic, isOpenPopover, isOpenUpdatePopover, onHandleDelete, onHandleFinishUpdate]
    );

    const handleChangeSelect = (value: string) => {
        setValueInput(value)
        if (changeValue) {
            changeValue(name, value)
        }
    };

    const renderClassName = ():string => {
        return `
            ${styles.inputLabel}
            ${initDynamic ? styles.inputLabelCustom: ''}
            ${isSelector ? styles.Select : ''}
            ${disabled ? styles.inputLabelDisableGrayColor : ''}
            ${isFocus || valueInput ? styles.hasValue : ''}
            ${isFocus ? styles.focusValue : ''}`;
    }

    const renderClassNameNumber = (): string => {
        let showStyleIfFocusOrInputValue = ''
        if (isFocus || valueInput) {
            if (inputSmall) {
                showStyleIfFocusOrInputValue = `${styles.hasValue} ${styles.small}`
            } else {
                showStyleIfFocusOrInputValue = `${styles.hasValue}`
            }
        }

        if (disabled) {
            if (inputSmall) {
                showStyleIfFocusOrInputValue = `${styles.inputLabelDisablePrimaryColor}`
            } else {
                showStyleIfFocusOrInputValue = `${styles.hasValue} ${styles.inputLabelDisablePrimaryColor}`
            }
        }

        return `
            ${styles.inputLabel}
            ${inputSmall ? styles.inputLabelSmall: ''}
            ${showStyleIfFocusOrInputValue}
            ${isFocus ? styles.focusValue : ''}
        `;
    }

    const handleOnclickSelect = useCallback(
        () => {
            if ((options === undefined || options.length < 1) && selectCallback) {
                setFocus(false)
                setIsLoadingSelect(true)
                selectCallback(name)
            }
        },
        [name, options, selectCallback],
    );


    return (
        <label className={styles.input}>
            {isSelector ?  <Select
                style={style ? style : {marginTop: '6px'}}
                loading={isLoadingSelect}
                options={options ?? initOptions}
                defaultValue={initValue ? initValue : null}
                value={initValue}
                onChange={handleChangeSelect}
                onFocus={() => setFocus(true)}
                onBlur={() => setFocus(false)}
                onClick={() => handleOnclickSelect()}
                notFoundContent={<AppEmpty />}
                disabled={disabled}
            /> : !isNumber ? <Input
                name={name}
                type={hide ? 'password' : 'text'}
                style={{
                    width: '100%',
                }}
                className={
                    `${styles.inputCustom} ${styles.inputField} ${valueInput ? styles.inputHasValue : ''}`
                }
                {...props}
                value={valueInput}
                defaultValue={valueInput}
                onChange={onChangeValue}
                suffix={dynamicField ? renderDynamic() : suffixCustom}
                onFocus={() => setFocus(true)}
                onBlur={() => setFocus(false)}
                disabled={disabled}

            /> : <NumericFormat
                customInput={Input}
                name={name}
                suffix={numberSuffix || ''}
                // thousandSeparator={`${t(',')}`}
                // decimalSeparator={`${t('.')}`}
                onValueChange={(input) => {
                    const text = input.value
                    onChangeNumberValue(text)
                }}
                className={
                    `${!inputSmall ? styles.inputCustomNumber : styles.inputSmall} ${valueInput ? styles.inputHasValue : ''} ${disabled ? styles.inputDisabled : ''}`
                }
                value={valueInput as string | number | null | undefined}
                defaultValue={valueInput as string | number | null | undefined}

                onFocus={() => setFocus(true)}
                onBlur={() => setFocus(false)}
                autoComplete='off'
                style={style}
                disabled={disabled}
                />
            }
            <span className={!isNumber ? renderClassName() : renderClassNameNumber()}>{label} {required ? '*' : ''}</span>
        </label>
    );
};

export default React.memo(InputCustom);

interface CustomInputProps extends InputProps {
    name?: string | undefined,
    label?: string | ReactNode | undefined,
    required?: boolean,
    initValue?: string | null | undefined,
    changeValue?: (name: string | undefined, value: any) => void,
    dynamicField?: NewFieldType,
    onRemoveField?: any,
    isSelector?: boolean,
    options?: SelectOptionCustomProps[] | undefined,
    initOptions?: SelectOptionCustomProps[] | undefined,
    selectCallback?: (type: string | undefined) => void,
    onFinishUpdate?: (oldValue?: NewFieldType, newValue?: NewFieldType) => boolean,
    validateBy?: RegExp,
    style?: any,
    isNumber?: boolean,
    inputSmall?: boolean,
    numberSuffix?: string,
    disabled?: boolean,
    suffixCustom?: React.ReactNode,
}
