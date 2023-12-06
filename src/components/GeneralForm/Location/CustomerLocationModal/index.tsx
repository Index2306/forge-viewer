import React, { useCallback, useEffect, useState } from 'react';
import { Space } from "antd";
import LocationFrom from "../LocationFrom";
import { useTranslation } from "next-i18next";
import { LocationModel, NewFieldType } from "@/models";
import { errorToast, successToast } from "@/helpers/Toast";
import { useAppDispatch } from "@/hooks";
import { createLocation, getLocationById, updateLocation } from "@/store/actions/location.action";
import AppButton from "@/components/Button";
import { REGEX_HELPER, validateDataByRegex } from '@/helpers/Regex';
import {removeCache} from "@/store/slices/cache.slice";
import LocationConfirmDelete from "@/components/GeneralForm/Location/LocationConfirmDelete";
import ModalApp from '@/components/ModalApp';

const CustomerLocationModal: React.FC<CustomerLocationModalProps> = ({ onHandleAddNewData, onHandleUpdateData, onHandleRemoveNewData, customerId, locationId, isOpen, onHandleCancel, isCreate }) => {
    const { t } = useTranslation()
    const dispatch = useAppDispatch()

    const [dynamicFields, setDynamicFields] = useState<NewFieldType[]>([])
    const [locationData, setLocationData] = useState<LocationModel | undefined>(undefined)
    const [errorMessage, setErrorMessage] = useState<string[]>([])
    const [isFetching, setIsFetching] = useState<boolean>(false)

    useEffect(() => {
        if (locationId) {
            setIsFetching(true);
            dispatch(getLocationById({ customerId: customerId, locationId: locationId }))
                .unwrap()
                .then(response => {
                    setIsFetching(false)
                    if (response.succeeded) {
                        setLocationData({
                            ...response.result,
                            map: JSON.parse(response.result?.map)
                        })
                        setDynamicFields(JSON.parse(response.result.dynamicFields))
                        return;
                    }
                    response.errors.map((err: string) => errorToast(err))
                }).catch(() => {
                    errorToast(t('error_loading_data'))
                    setIsFetching(false)
                })
        } else {
            setLocationData(undefined)
            setDynamicFields([])
        }

        return () => {
            setDynamicFields([])
            setLocationData(undefined)
            setErrorMessage([])
            setIsFetching(false)
        }
    }, [locationId])

    const successfullyForm = useCallback(
        () => {
            successToast(locationId ? t('update_successfully', { name: locationData?.company }) : t('create_successfully', { name: locationData?.company }))
            if (!locationId) {
                setLocationData(undefined)
                setDynamicFields([])
            } else {
                dispatch(removeCache(locationData?.logo))
                dispatch(removeCache(locationData?.map))
            }
            setErrorMessage([])
        }, [t, locationId, locationData?.company],
    );

    const onHandleCreateOrUpdateLocation = () => {
        setErrorMessage([])
        setIsFetching(true)

        let formData = new FormData();
        formData.append('dynamicFields', JSON.stringify(dynamicFields));

        if (!locationId) {
            formData.append('customerId', customerId);
        }

        const errMessage: string[] = [];

        if (locationData?.company) {
            formData.append('company', locationData.company);
        } else {
            errMessage.push(t('field_is_required', { field: t('company') }))
        }

        if (locationData?.street) {
            formData.append('street', locationData.street);
        } else {
            // errMessage.push(t('field_is_required', {field:  t('customer_number')}))
        }

        if (locationData?.location) {
            formData.append('location', locationData.location);
        } else {
            // errMessage.push(t('field_is_required', {field:  t('customer_number')}))
        }

        if (locationData?.postcode) {
            formData.append('postcode', locationData.postcode);
        } else {
            // errMessage.push(t('field_is_required', {field:  t('customer_number')}))
        }
        if (locationData?.email) {
            const isValidEmail = validateDataByRegex(locationData?.email, REGEX_HELPER.email);

            if (isValidEmail) {
                formData.append('email', locationData.email);
            } else {
                errMessage.push(t('email_invalid'))
            }
        }

        if (locationData?.telephone) {

            const isValidTelephone = validateDataByRegex(locationData?.telephone, REGEX_HELPER.phone);
            if (isValidTelephone) {
                formData.append('telephone', locationData.telephone);
            } else {
                errMessage.push(t('phone_invalid'))
            }
        }
        if (errMessage.length > 0) {
            setIsFetching(false)
            setErrorMessage(errMessage)
            return;
        }

        if (locationData?.map) {
            formData.append('map', JSON.stringify(locationData.map));
        }

        if (locationId) {
            formData.append('logo', locationData?.logo ?? '');

            if (locationData?.logoUpload) {
                formData.append('newLogo', locationData.logoUpload as Blob);
            }
        } else {
            if (locationData?.logo) {
                formData.append('logo', locationData.logoUpload as Blob);
            }
        }

        dispatch(locationId ? updateLocation({ id: locationId, data: formData }) : createLocation(formData))
            .unwrap()
            .then(response => {
                setIsFetching(false)
                setErrorMessage([])
                successfullyForm()

                if (!locationId) {
                    if (onHandleCancel) {
                        onHandleCancel()
                    }
                    if (onHandleAddNewData) {
                        onHandleAddNewData(response.result)
                    }
                } else {
                    if (onHandleCancel) {
                        onHandleCancel()
                    }
                    if (onHandleUpdateData) {
                        onHandleUpdateData(response.result)
                    }
                }
            }).catch((errors) => {
                setErrorMessage(errors)
                setIsFetching(false)
            })
    }

    return (
        <ModalApp
            width={1300}
            title={isCreate ? t('new_location') : t('edit_location')}
            open={isOpen!}
            onCancel={onHandleCancel!}
            footer={
                <Space>
                    {!isCreate && !isFetching ? <LocationConfirmDelete id={locationId} onHandleCancel={onHandleCancel} onHandleRemoveNewData={onHandleRemoveNewData}/> : null}
                    <AppButton loading={isFetching} onClick={() => onHandleCreateOrUpdateLocation()}>{t('save')}</AppButton>
                </Space>}
        >
            <LocationFrom isCreate={isCreate} isFetching={isFetching} errorMessage={errorMessage} locationData={locationData} setLocationData={setLocationData} dynamicFields={dynamicFields} setDynamicFields={setDynamicFields} />
        </ModalApp>
    );
};

export default CustomerLocationModal;

interface CustomerLocationModalProps {
    isOpen?: boolean
    onHandleCancel?: () => void,
    isCreate?: boolean,
    customerId: string,
    locationId?: string | undefined
    onHandleAddNewData?: (data: LocationModel) => void,
    onHandleRemoveNewData?: (id: string | undefined) => void,
    onHandleUpdateData?: (data: LocationModel) => void,
}