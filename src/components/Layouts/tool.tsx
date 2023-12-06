import {LayoutProps} from "@/models";
import Cookies from "js-cookie";
import {useRouter} from "next/router";
import React, {useEffect, useState} from "react";
import AppConnection from "../AppConnection";
import Navigation from "../Navigation";

import styles from "./Layout.module.scss";
import classNames from "classnames/bind";
const cx = classNames.bind(styles)

const ToolLayout = ({children}: LayoutProps) => {
    const token = Cookies.get('access_token');
    const user = Cookies.get('user');
    const {locale, push} = useRouter();

    const [isLogout, setIsLogout] = useState<boolean>(true);

    useEffect(() => {
        if (!token || !user) {
            push('/auth/login', '/auth/login', {locale})
        } else {
            setIsLogout(false)
        }
    }, [locale, push, token, user]);

    const renderUi = ()  =>{
        if (isLogout) return <></>
        return <AppConnection>
            <div className={cx('layout-container')}>

                {/* --------------------------------------- Navigation */}

                <Navigation />

                {/* --------------------------------------- Page Content */}

                <div className={cx('layout-content-wrapper')}>
                    {children}
                </div>
            </div>
        </AppConnection>
    }

    return renderUi();
};

export default ToolLayout;