import React, {ReactNode} from 'react';
import styles from './LoginContainer.module.scss';
import Image from "next/image";
import classNames from 'classnames/bind'
import {Col, Row, Switch} from "antd";

const cx = classNames.bind(styles)

const LoginContainer: React.FC<{ children: ReactNode }> = ({children}) => {
    return (
        <div className={cx('login-page')}>
            <div>
                <Row>
                    <Col xs={24} lg={12} className={cx('login-page__column')}>
                        <div className={cx('login-page__content')}>
                            <div className={cx('login-page__content-locale')}>
                                <Switch />
                            </div>
                            <div className={cx('login-page__content-form')}>
                                {children}
                            </div>
                        </div>
                    </Col>
                    <Col xs={24} lg={12} className={cx('login-page__column')}>
                        <div className={cx('login-page__content-logo')}>
                            <div className={cx('login-page__content-logo__content')}>
                                <Image src="/assets/img/logo_speamplan--black.svg" alt="Speam Logo" width={350} height={1}/>
                                <p className={cx('login-page__content-logo__content-title')}>Speam GmbH</p>
                                <p>Easy And Powerful Project Planning</p>
                            </div>
                        </div>
                    </Col>
                </Row>
            </div>
        </div>
    );
};

export default LoginContainer;
