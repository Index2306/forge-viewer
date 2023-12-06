import React, {ReactNode, useCallback} from 'react';
import {BsFillArrowLeftCircleFill} from "react-icons/bs";
import Router from "next/router";
import {Tabs} from "antd";
import {PlusOutlined} from "@ant-design/icons";

import {FaMapMarkerAlt} from 'react-icons/fa';
import {AiOutlinePlus} from 'react-icons/ai';
import AppButton from "@/components/Button";
import {useTranslation} from 'react-i18next';

import styles from './AppTab.module.scss';
import classNames from "classnames/bind";

const cx = classNames.bind(styles);

const AppTab: React.FC<AppTabProps> = ({
                                           isShowBtnLocation,
                                           tabs,
                                           activeKey,
                                           setActiveKey,
                                           setPageName,
                                           btnBack,
                                           btnBackDisabled,
                                           onHandleAdd,
                                           setIsOpenModalLocation,
                                           onHandleBack
                                       }) => {
    const {t} = useTranslation(['common', 'config']);

    const onChangeTab = useCallback(
        (key: any) => {
            setActiveKey(key)
            if (setPageName) {
                setPageName(key)
            }
        },
        [setActiveKey, setPageName],
    );

    const onHandleClickBack = () => {
        if (!btnBackDisabled) {
            if (onHandleBack) {
                onHandleBack()
            } else {
                Router.back()
            }
        }
    }

    const onHandleAddBtn = () => {
        if (onHandleAdd) {
            onHandleAdd()
        }
    }

    return (
        <div className={cx('app-tab')}>

            {/* ----------------------------------------------------- BUTTON BACK */}

            {btnBack && (
                <div className={cx('app-tab__btn-back')} onClick={() => onHandleClickBack()}>
                    <BsFillArrowLeftCircleFill/>
                </div>
            )}

            <div className={cx('content')}>
                    {/* ----------------------------------------------------- BUTTON ADD LOCATION */}

                    {isShowBtnLocation && activeKey == '2' &&
                        <div className={cx('app-tab__btn-location')}>
                            <AppButton
                                size='small'
                                flat
                                fullWidth
                                onClick={() => setIsOpenModalLocation(true)}
                                icon={
                                    <div style={{display: 'flex'}}>
                                        <div style={{fontSize: '16px', alignSelf: 'center'}}>
                                            <FaMapMarkerAlt/>
                                        </div>
                                        <div
                                            style={{
                                                fontSize: '14px',
                                                alignSelf: 'flex-start',
                                                marginLeft: '-1px',
                                            }}
                                        >
                                            <AiOutlinePlus/>
                                        </div>
                                    </div>
                                }
                            >
                                {t('new_location')}
                            </AppButton>
                        </div>
                    }

                    {/* ----------------------------------------------------- TAB ITEM */}

                    <Tabs
                        hideAdd={!onHandleAdd}
                        className={cx('app-tab__card')}
                        defaultActiveKey="1"
                        activeKey={activeKey}
                        type={onHandleAdd ? 'editable-card' : 'card'}
                        onChange={onChangeTab}
                        items={tabs.map((v, i) => {
                            return {
                                label: <div data-class='label__app-tab__item'>{v.label}</div>,
                                key: v.id,
                                children: v.children,
                                closeIcon: v.closeIcon
                            };
                        })}
                        addIcon={
                            <div
                                style={{padding: '0 6px 0 12px', color: 'var(--primary-color)'}}
                                onClick={() => onHandleAddBtn()}
                            >
                                <PlusOutlined/>
                            </div>
                        }
                    />
            </div>
        </div>
    );
};

export default AppTab;

export interface AppTabProps {
    tabs: TabItem[],
    activeKey: string,
    setActiveKey: (key: string) => void,
    setPageName?: (key: string) => void,
    btnBack?: boolean,
    btnBackDisabled?: boolean,
    onHandleAdd?: () => void,
    onHandleBack?: () => void,
    setIsOpenModalLocation?: any
    isShowBtnLocation?: boolean
}

export interface TabItem {
    id: string
    label: string | React.ReactNode,
    children: ReactNode,
    closeIcon?: ReactNode,
    nameHead?: string,
}
