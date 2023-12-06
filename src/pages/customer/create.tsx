import React, {ReactNode, useCallback, useContext, useEffect, useMemo, useState} from 'react';
import UserLayout from "@/components/Layouts/user";
import {GetStaticProps} from "next";
import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import styles from "@/styles/CreateGeneralData.module.scss"
import {useTranslation} from "next-i18next";
import {HomeContext} from "@/context/HomeContext";
import {AppContext} from "@/context/AppContext";
import TitlePage from "@/components/TitlePage";
import AppButton from "@/components/Button";
import Head from "next/head";
import CustomerForm from "../../components/GeneralForm/Customer/CustomerForm";
import {CustomerModel, NewFieldType} from "@/models";
import {successToast} from "@/helpers/Toast";
import {useAppDispatch, useAppSelector} from "@/hooks";
import {createCustomer} from "@/store/actions/customer.action";
import {clearCustomer, selectCustomer} from "@/store/slices/customer/customer.slice";
import AppTab, {TabItem} from "@/components/AppTab";
import DataLoading from "@/components/AppLoading/DataLoading";
import { REGEX_HELPER, validateDataByRegex } from '@/helpers/Regex';
import {useRouter} from "next/router";

const CustomerCreatePage = () => {
    const { t } = useTranslation(['common'])
    const {push, locale} = useRouter()
    const titlePage =`${t('customer')} | ${process.env.NEXT_PUBLIC_APP_NAME}`;
    const {setHeadElement} = useContext(HomeContext)
    const {isLoading} = useContext(AppContext);
    const dispatch = useAppDispatch();

    const [dynamicFields, setDynamicFields] = useState<NewFieldType[]>([])
    const [customerData, setCustomerData] = useState<CustomerModel | undefined>(undefined)
    const [errorMessage, setErrorMessage] = useState<string[]>([])

    const [activeKey, setActiveKey] = useState<string>('1');

    const {data, isError, isSuccess, errorMessage: errors, isFetching} = useAppSelector(selectCustomer)

    const successfullyForm = useCallback(
        () => {
            successToast(t('create_successfully', {name: data?.company}))

            setCustomerData(undefined)
            setDynamicFields([])
            setErrorMessage([])
            dispatch(clearCustomer())
            onHandleBackToListPage()
        }, [dispatch, data?.customerNumber, t],
    );

    const onHandleCreateCustomer = () => {
        dispatch(clearCustomer())
        let data = new FormData();
        data.append('dynamicFields', JSON.stringify(dynamicFields));

        const errMessage: string[] = [];

        if (customerData?.customerNumber) {
            data.append('customerNumber', customerData.customerNumber);
        }
        else {
            data.append('customerNumber', " ");
        }

        if (customerData?.street) {
            data.append('street', customerData.street);
        } else {
            errMessage.push(t('field_is_required', {field:  t('street')}))
        }

        if (customerData?.location) {
            data.append('location', customerData.location);
        } else {
            errMessage.push(t('field_is_required', {field:  t('location')}))
        }

        if (customerData?.postcode) {
            data.append('postcode', customerData.postcode);
        } else {
            errMessage.push(t('field_is_required', {field:  t('postcode')}))
        }

        if (customerData?.company) {
            data.append('company', customerData.company);
        } else {
            errMessage.push(t('field_is_required', {field:  t('company')}))
        }

        if (customerData?.email) {
            const isValidEmail = validateDataByRegex(customerData?.email, REGEX_HELPER.email);

            if (isValidEmail) {
                data.append('email', customerData.email);
            } else {
                errMessage.push(t('email_invalid'))
            }
        }

        if (customerData?.logoUpload) {
            data.append('logo', customerData.logoUpload as Blob);
        }

        if (customerData?.map) {
            data.append('map', JSON.stringify(customerData.map));
        }

        if (customerData?.telephone) {

            const isValidTelephone = validateDataByRegex(customerData?.telephone, REGEX_HELPER.phone);
            if (isValidTelephone) {
                data.append('telephone', customerData.telephone);
            } else {
                errMessage.push(t('phone_invalid'))
            }
        }
        if (errMessage.length > 0) {
            setErrorMessage(errMessage)
            return;
        }
        dispatch(createCustomer(data))
    }

    const elementHeader = (): ReactNode => {
        return <TitlePage
            pageName='general_data'
            name='create_customer'
            createButton={
                <div style={{marginRight: '18px'}}>
                    <AppButton style={{minWidth: '100px', fontSize: '1.1rem'}} size='small' className={styles.saveBtn} disabled={isLoading} onClick={onHandleCreateCustomer}> <span>{t('save')}</span>
                    </AppButton>
                </div>
            }/>
    }

    useEffect(() => {
        setCustomerData(undefined)
        setDynamicFields([])
        setErrorMessage([])
        dispatch(clearCustomer())

        return () => {
            setCustomerData(undefined)
            setDynamicFields([])
            setErrorMessage([])
            dispatch(clearCustomer())
        }
    },[])

    useEffect(() => {
       if (isSuccess) {
           successfullyForm();
       }
    }, [isSuccess]);

    useEffect(() => {
        if (isError) {
            setErrorMessage(errors)
        } else {
            setErrorMessage([])
        }

    }, [isError]);

    useEffect(() => {
        setHeadElement(elementHeader())
    }, [dynamicFields, customerData, setHeadElement, isLoading])

    const onHandleBackToListPage = useCallback(() => {
        push('/customer', '/customer', {locale})
    }, [locale, push])

    const tabs: TabItem[] = useMemo(() => {
        return [
            {
                id: "1",
                label: t('basic_data'),
                children: <div className={styles.contentTab}>
                    <CustomerForm errorMessage={errorMessage} isCreate={true} customer={customerData} setCustomer={setCustomerData} dynamicFields={dynamicFields} setDynamicFields={setDynamicFields}/>
                </div>
            }
        ]
    }, [t, errorMessage, customerData, dynamicFields])

    return (
        <>
            {isFetching ? <DataLoading /> : null}
            <Head>
                <title>{titlePage}</title>
            </Head>
            <div className={styles.container}>
                <AppTab tabs={tabs} activeKey={activeKey} setActiveKey={setActiveKey} btnBack={true} onHandleBack={onHandleBackToListPage} btnBackDisabled={isFetching} />
            </div>
        </>
    );
};

export default CustomerCreatePage;

CustomerCreatePage.Layout = UserLayout;

export const getStaticProps: GetStaticProps = async ({locale}) => {
    return {
        props: {
            ...(await serverSideTranslations(locale ?? "en"))
        }
    }
}

