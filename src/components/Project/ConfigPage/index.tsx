import React from 'react';
import styles from './ConfigPage.module.scss'
import {Col, Row} from "antd";
import ConfigList, {ConfigData, ConfigItem} from "@/components/Project/ConfigPage/ConfigList";
import dataConfig from '@/assets/project-config.json';
import {BsFillArrowRightCircleFill} from "react-icons/bs";

const ConfigPage: React.FC<ConfigPageProps> = ({checkedList, onCheck, onNext}) => {

    return (
        <div>
            <Row>
                <Col span={onNext ? 21 : 24}>
                    <Row>
                        <Col xs={24} lg={12} className={styles.listItem}>
                            <ConfigList config={dataConfig[0] as ConfigData} checkedList={checkedList}
                                        onCheck={onCheck}/>
                        </Col>
                        <Col xs={24} lg={12} className={styles.listItem}>
                            <ConfigList config={dataConfig[1] as ConfigData} checkedList={checkedList}
                                        onCheck={onCheck}/>
                        </Col>
                        <Col xs={24} className={styles.listItem}>
                            <ConfigList config={dataConfig[2] as ConfigData} checkedList={checkedList}
                                        onCheck={onCheck}/>
                        </Col>
                    </Row>
                </Col>
                <Col span={onNext ? 3 : 0} style={{position: 'relative'}}>
                    {checkedList.length > 0 ? <div className={styles.next}>
                        <div className={`${styles.btn} ${styles.moveRight}`} onClick={onNext}>
                            <BsFillArrowRightCircleFill/>
                        </div>
                    </div> : null}
                </Col>
            </Row>
        </div>
    );
};

export default ConfigPage;

export interface ConfigPageProps {
    checkedList: string[],
    onCheck: (record: ConfigItem) => void,
    onNext?: () => void,
}