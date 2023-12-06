import Head from 'next/head'
import {useRouter} from "next/router";
import {useTranslation} from "next-i18next";
import LoginContainer from "@/components/LoginContainer";
import {GetStaticProps} from "next";
import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import styles from "@/styles/Login.module.scss";
import {Form, Input, Alert} from "antd";
import Link from "next/link";
import AppButton from "@/components/Button";
import React, {useCallback, useEffect, useState} from "react";
import {useAppDispatch} from "@/hooks";
import {register} from "@/store/actions/auth.action";
import NotFoundPage from "@/pages/404";
import { errorToast, successToast } from '@/helpers/Toast';

export default function Register() {
    const {locale, query} = useRouter()
    const {t} = useTranslation();
    const dispatch = useAppDispatch();
    const titlePage = `${t('register')} | ${process.env.NEXT_PUBLIC_APP_NAME}`;

    const [isSuccess, setIsSuccess] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [errors, setErrors] = useState<string[]>([]);

    useEffect(() => {
        return () => {
            setIsSuccess(false)
            setLoading(false)
            setErrors([])
        };
    }, []);

    const onFinish = useCallback((values: any) => {
        setLoading(true)
        setErrors([])
        setIsSuccess(false)

        dispatch(register(values))
            .then((response: any) => {
                setLoading(false)
                if ('error' in response) {
                    setIsSuccess(false);
                    setErrors(response?.payload ?? []);
                    return;
                }
                setIsSuccess(true);
            }).catch(({payload}) => {
            setErrors(payload)
            setLoading(false)
            setIsSuccess(false)
        })
    }, [dispatch]);

    const onFinishFailed = (errorInfo: any) => {
        setLoading(false)
    };

    const renderErrorMessage = () => {
        errorToast(errors[0])
        return errors.map((msg, index) => <Alert key={index} message={msg} type="error" showIcon />)
    }

    const renderSuccess = () => {
        successToast(`${t('register')}${' '}${t('success')}`);

        return <Alert message={<><span>{t('register')}{' '}{t('success')}.</span> <Link className={styles.goToLink} href='/auth/login' locale={locale}>{t('login')}</Link></>} type='success' showIcon />
    }

    // disable register page
    if (query.development === 'true') {
        return (
            <>
                <Head>
                    <title>{titlePage}</title>
                </Head>
                <LoginContainer>
                    <div className={styles.formPage}>
                        <div>
                            <svg
                                className={styles.svg}
                                height="512"
                                viewBox="0 0 192 192"
                                width="512"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path d="m155.109 74.028a4 4 0 0 0 -3.48-2.028h-52.4l8.785-67.123a4.023 4.023 0 0 0 -7.373-2.614l-63.724 111.642a4 4 0 0 0 3.407 6.095h51.617l-6.962 67.224a4.024 4.024 0 0 0 7.411 2.461l62.671-111.63a4 4 0 0 0 .048-4.027z" />
                            </svg>
                        </div>
                        <h1 className={styles.titlePage}>{t('register')}</h1>
                        <div className={styles.form}>
                            {errors?.length > 0 ? renderErrorMessage() : null}
                            {isSuccess ? renderSuccess() : null}
                            <Form
                                layout="vertical"
                                name="loginForm"
                                onFinish={onFinish}
                                onFinishFailed={onFinishFailed}
                                autoComplete="off"
                                style={{marginTop: '10px'}}
                            >
                                <Form.Item
                                    label={t('first_name')}
                                    name="firstName"
                                    hasFeedback
                                    rules={[{ required: true, message: `${t('required_first_name')}`, whitespace: true }]}
                                >
                                    <Input className={styles.inputCustom}/>
                                </Form.Item>
                                <Form.Item
                                    label={t('last_name')}
                                    name="lastName"
                                    hasFeedback
                                    rules={[{ required: true, message: `${t('required_last_name')}`, whitespace: true }]}
                                >
                                    <Input className={styles.inputCustom}/>
                                </Form.Item>
                                <Form.Item
                                    label={t('company_name')}
                                    name="companyName"
                                    hasFeedback
                                    rules={[{ required: true, message: `${t('required_company_name')}`, whitespace: true }]}
                                >
                                    <Input className={styles.inputCustom}/>
                                </Form.Item>
                                <Form.Item
                                    label={t('country')}
                                    name="country"
                                    hasFeedback
                                    rules={[{ required: true, message: `${t('required_country')}`, whitespace: true }]}
                                >
                                    <Input className={styles.inputCustom}/>
                                </Form.Item>

                                <Form.Item
                                    label={t('email')}
                                    name="email"
                                    hasFeedback
                                    rules={[
                                        { required: true, message: `${t('required_email')}`},
                                        { type: "email", message: `${t('email_invalid')}`,}
                                    ]}
                                >
                                    <Input className={styles.inputCustom}/>
                                </Form.Item>

                                <Form.Item
                                    label={t('password')}
                                    name="password"
                                    hasFeedback
                                    rules={[
                                        { required: true, message: `${t('required_password')}` },
                                        { min: 8, message: `${t('password_length')}` },
                                        { max: 32, message: `${t('password_length')}` },
                                    ]}
                                >
                                    <Input.Password className={styles.inputCustom}/>
                                </Form.Item>

                                <Form.Item
                                    label={`${t('confirm')} ${t('password')}`}
                                    name="confirmPassword"
                                    dependencies={['password']}
                                    hasFeedback
                                    rules={[{ required: true, message: `${t('required_password')}` },
                                        ({ getFieldValue }) => ({
                                            validator(_, value) {
                                                if (!value || getFieldValue('password') === value) {
                                                    return Promise.resolve();
                                                }
                                                return Promise.reject(new Error(`${t('confirm_password_invalid')}`));
                                            },
                                        }),]}
                                >
                                    <Input.Password className={styles.inputCustom}/>
                                </Form.Item>

                                <Form.Item>
                                    <AppButton type="primary" htmlType="submit" size="middle" fullWidth={true} loading={loading}>
                                        {t('register')}
                                    </AppButton>
                                </Form.Item>
                            </Form>
                        </div>
                        <div className={styles.register}>
                            <p>{t('already_have_an_account')} <Link className={styles.goToLink} href='/auth/login' locale={locale}>{t('login')}</Link></p>
                        </div>
                    </div>
                </LoginContainer>
            </>
        )
    }
    return <NotFoundPage />

}

export const getStaticProps: GetStaticProps = async ({locale}) => {
    return {
        props: {
            ...(await serverSideTranslations(locale ?? "en"))
        }
    }
}
