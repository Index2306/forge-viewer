import Head from 'next/head'
import LoginContainer from "@/components/LoginContainer";
import {useTranslation} from "next-i18next";
import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import {useRouter} from "next/router";
import {GetStaticProps} from "next";
import { Form, Input, Alert } from 'antd';
import styles from '@/styles/Login.module.scss';
import {debug} from '@/helpers/Logger';
import AppButton from "@/components/Button";
import {clearAuth, logoutAuthAction, selectAuth} from "@/store/slices/auth.slice";
import {useAppDispatch, useAppSelector} from "@/hooks";
import {login} from "@/store/actions/auth.action";
import React, {useEffect, useState} from "react";

const Login: React.FC = () => {
    const {t} = useTranslation();
    const titlePage = `${t('login')} | ${process.env.NEXT_PUBLIC_APP_NAME}`;

    const {locale, push} = useRouter()
    const router = useRouter()

    const dispatch = useAppDispatch();
    const {isSuccess, isError, isFetching, errorMessage } = useAppSelector(selectAuth)

    const [errors, setErrors] = useState<string[]>([]);

    useEffect(() => {
        dispatch(logoutAuthAction())
        return () => {
            setErrors([])
            dispatch(clearAuth())
        };
    }, []);
    
    
    useEffect(() => {
        if (isError) {
            setErrors(errorMessage)
            return;
        } else {
            setErrors([])
        }

        if (isSuccess) {
            push('/', '/', {locale})
            return;
        }
    }, [isSuccess, isError, isFetching, router]);

    const onFinish = (values: any) => {
        dispatch(login(values))
    };

    const onFinishFailed = (errorInfo: any) => {
        debug('Failed:', errorInfo);
    };

    const renderErrorMessage = () => {
        return errors.map((msg, index) => <Alert key={index} message={msg} type="error" showIcon />)
    }

    const renderSuccess = () => {
        return <Alert message={`${t('login')} ${t('success')}`} type='success' showIcon />
    }

    return (
        <>
            <Head>
                <title>{titlePage}</title>
            </Head>
            <LoginContainer>
                <div className={styles.formPage}>
                    <div>
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
                        <h1 className={styles.titlePage}>{t('login')}</h1>
                    </div>
                    <div className={styles.formContainer}>
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
                                    label={t('email')}
                                    name="userName"
                                    rules={[{ required: true, message: `${t('required_email')}` }]}
                                >
                                    <Input className={styles.inputCustom}/>
                                </Form.Item>

                                <Form.Item
                                    label={t('password')}
                                    name="password"
                                    rules={[{ required: true, message: `${t('required_password')}` }]}
                                >
                                    <Input.Password className={styles.inputCustom}/>
                                </Form.Item>

                                <Form.Item>
                                    <AppButton type="primary" htmlType="submit" size="middle" fullWidth={true} loading={isFetching}>
                                        {t('login')}
                                    </AppButton>
                                </Form.Item>
                            </Form>
                        </div>
                        {/*<div className={styles.register}>*/}
                        {/*    {t('not_registered_yet')} <Link className={styles.goToLink} href='/auth/register' locale={locale}>{t('create_an_account')}</Link>*/}
                        {/*</div>*/}
                    </div>
                </div>
            </LoginContainer>
        </>
    )
}

export default Login;

export const getStaticProps: GetStaticProps = async ({locale}) => {
    return {
        props: {
            ...(await serverSideTranslations(locale ?? "en"))
        }
    }
}