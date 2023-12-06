import React from 'react';
import styles from './CustomerContainer.module.scss';
import {Icon} from "@chakra-ui/react";
import {BsFillArrowLeftCircleFill} from "react-icons/bs";
import Router , {useRouter} from "next/router";
import {ConfigProvider, Tabs} from "antd";
import { ANT_THEME } from '@/contants/common';

const CustomerContainer : React.FC<CustomerContainerProps> = () => {
    const {locale, route} = useRouter();

    return (
        <div className={styles.container}>
            <div className={styles.btnBack} onClick={() => Router.back()}>
                <Icon as={BsFillArrowLeftCircleFill} boxSize={30} color={styles.primaryColor}/>
            </div>
            <div className={styles.content}>
                <ConfigProvider theme={ANT_THEME}>
                    <Tabs
                        className={styles.tabCard}
                        defaultActiveKey="1"
                        type="card"
                        items={new Array(10).fill(null).map((_, i) => {
                            const id = String(i + 1);
                            return {
                                label: `Card Tab ${id}`,
                                key: id,
                                children: <div className={styles.contentTab}>Content of card tab {id}</div>,
                            };
                        })}
                    />
                </ConfigProvider>
            </div>
        </div>
    );
};

export default CustomerContainer;

export interface CustomerContainerProps {

}
