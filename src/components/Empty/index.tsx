import React from 'react';
import {Empty} from 'antd';
import {useTranslation} from "next-i18next";
import styles from './Empty.module.scss';

const AppEmpty: React.FC<AppEmptyProps> = ({message}) => {
    const {t} = useTranslation();

    return (
        <div className={styles.empty}>
            <Empty
                imageStyle={{height: 60}}
                description={
                    <span>
                {message ? message : t('no_data')}
              </span>
                }
            />
        </div>
    );
}


export default AppEmpty;

interface AppEmptyProps {
    message?: any
}
