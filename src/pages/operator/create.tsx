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
import {OperatorModel, NewFieldType} from "@/models";
import {successToast} from "@/helpers/Toast";
import {useAppDispatch, useAppSelector} from "@/hooks";
import AppTab, {TabItem} from "@/components/AppTab";
import DataLoading from "@/components/AppLoading/DataLoading";
import OperatorForm from "../../components/GeneralForm/Operator/OperatorForm";
import {clearOperator, selectOperator} from "@/store/slices/operator/operator.slice";
import {createOperator} from "@/store/actions/operator.action";
import { REGEX_HELPER, validateDataByRegex } from '@/helpers/Regex';
import {useRouter} from "next/router";

const OperatorCreatePage = () => {
    const { t } = useTranslation(['common'])
    const { push, locale } = useRouter()
    const titlePage =`${t('create_operator')} | ${process.env.NEXT_PUBLIC_APP_NAME}`;
    const {setHeadElement} = useContext(HomeContext)
    const {isLoading} = useContext(AppContext);
    const dispatch = useAppDispatch();

    const [dynamicFields, setDynamicFields] = useState<NewFieldType[]>([])
    const [operatorData, setOperatorData] = useState<OperatorModel | undefined>(undefined)
    const [errorMessage, setErrorMessage] = useState<string[]>([])

    const [activeKey, setActiveKey] = useState<string>('1');

    const {data, isError, isSuccess, errorMessage: errors, isFetching} = useAppSelector(selectOperator)

    const successfullyForm = useCallback(
        () => {
            successToast(t('create_successfully', {name: data?.company}))
            setOperatorData(undefined)
            setDynamicFields([])
            setErrorMessage([])
            dispatch(clearOperator())
            onHandleBackToListPage()
        }, [dispatch, data?.company, t],
    );

    const onHandleCreateOperator = () => {
        dispatch(clearOperator())
        let formData = new FormData();
        formData.append('dynamicFields', JSON.stringify(dynamicFields));

        const errMessage: string[] = [];

        if (operatorData?.company) {
            formData.append('company', operatorData.company);
        } else {
            errMessage.push(t('field_is_required', {field:  t('company')}))
        }

        if (operatorData?.street) {
            formData.append('street', operatorData.street);
        } else {
            // errMessage.push(t('field_is_required', {field:  t('customer_number')}))
        }

        if (operatorData?.location) {
            formData.append('location', operatorData.location);
        } else {
            // errMessage.push(t('field_is_required', {field:  t('customer_number')}))
        }

        if (operatorData?.postcode) {
            formData.append('postcode', operatorData.postcode);
        } else {
            // errMessage.push(t('field_is_required', {field:  t('customer_number')}))
        }

        if (operatorData?.email) {
            const isValidEmail = validateDataByRegex(operatorData?.email, REGEX_HELPER.email);

            if (isValidEmail) {
                formData.append('email', operatorData.email);
            } else {
                errMessage.push(t('email_invalid'))
            }
        }

        if (operatorData?.logo) {
            formData.append('logo', operatorData.logoUpload as Blob);
        }

        if (operatorData?.map) {
            formData.append('map', JSON.stringify(operatorData.map));
        }

        if (operatorData?.note) {
            formData.append('note', operatorData.note);
        }

        if (operatorData?.contactPerson) {
            formData.append('contactPerson', operatorData.contactPerson);
        }

        if (operatorData?.telephone) {
            const isValidTelephone = validateDataByRegex(operatorData?.telephone, REGEX_HELPER.phone);
            if (isValidTelephone) {
                formData.append('telephone', operatorData.telephone);
            } else {
                errMessage.push(t('phone_invalid'))
            }
        }

        if (errMessage.length > 0) {
            setErrorMessage(errMessage)
            return;
        }
        dispatch(createOperator(formData))
    }

    const elementHeader = (): ReactNode => {
        return <TitlePage
            pageName='general_data'
            name='create_operator'
            createButton={
                <div style={{marginRight: '18px'}}>
                    <AppButton style={{minWidth: '100px', fontSize: '1.1rem'}} size='small' className={styles.saveBtn} disabled={isLoading} onClick={() => onHandleCreateOperator()}>
                        <span>{t('save')}</span>
                    </AppButton>
                </div>
            }/>
    }

    useEffect(() => {
        setErrorMessage([])
        setOperatorData(undefined)
        setDynamicFields([])
        dispatch(clearOperator())

        return () => {
            setErrorMessage([])
            setOperatorData(undefined)
            setDynamicFields([])
            dispatch(clearOperator())
        }
    }, [])

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
    }, [dynamicFields, operatorData, setHeadElement, isLoading])

    const tabs: TabItem[] = useMemo(() => {
        return [
            {
                id: "1",
                label: t('basic_data'),
                children: <div className={styles.contentTab}>
                    <OperatorForm errorMessage={errorMessage} isCreate={true} operatorData={operatorData} setOperatorData={setOperatorData} dynamicFields={dynamicFields} setDynamicFields={setDynamicFields}/>
                </div>
            }
        ]
    }, [t, errorMessage, operatorData, dynamicFields])

    const onHandleBackToListPage = useCallback(() => {
        push('/operator', '/operator', {locale})
    }, [locale, push])

    return (
        <>
            {isFetching ? <DataLoading /> : null}
            <Head>
                <title>{titlePage}</title>
            </Head>
            <div className={styles.container}>
                <AppTab tabs={tabs} activeKey={activeKey} setActiveKey={setActiveKey} btnBack={true} onHandleBack={onHandleBackToListPage} btnBackDisabled={isFetching}/>
            </div>
        </>
    );
};

export default OperatorCreatePage;

OperatorCreatePage.Layout = UserLayout;

export const getStaticProps: GetStaticProps = async ({locale}) => {
    return {
        props: {
            ...(await serverSideTranslations(locale ?? "en"))
        }
    }
}

