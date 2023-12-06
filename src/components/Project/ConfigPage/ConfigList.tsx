import React, {useCallback} from 'react';
import {useTranslation} from "next-i18next";
import TooltipApp from "@/components/TooltipApp";

import styles from './ConfigPage.module.scss';
import classNames from "classnames/bind";
const cx = classNames.bind(styles);

const ConfigList : React.FC<ConfigListProps> = ({config, checkedList, onCheck}) => {
    const {t} = useTranslation(['config', 'common']);

    const getClassNameChecked = (record: ConfigItem): string => {
        if (record.status < 1) {
            return `${styles.item} ${styles.progressing}`
        }

        const index = checkedList?.includes(record.key);
        if (index) {
            return `${styles.item} ${styles.active}`
        }

        return styles.item
    }

    const getClassName = (item: ConfigItem): string => {
        const key = item.key;
        const status = item.status;
        const index = checkedList?.includes(key);
        if (index) {
            return styles.active
        }

        if (status === 0) {
            return styles.sttProgressing
        }

        if (status === 1) {
            const existsDuplicate = checkedList.findIndex(i => item.unique?.includes(i));
            if (existsDuplicate > -1) {
                return `${styles.sttActive} ${styles.sttActiveUnique}`
            }

            return styles.sttActive
        }

        return '';
    }

    const getStatusName = (status: number, key: string): string => {
        if (status === -1) {
            return t('coming_soon', { ns: 'common' })
        }
        if (status === 0) {
            return t('in_progress', { ns: 'common' })
        }
        return t(key)
    }

    const onHandleClick = useCallback(
        (record: ConfigItem) => {
            if (record.status === 1) {
                onCheck(record)
            }
        },
        [onCheck],
    );

    return (
        <div className={cx('list')}>
            <div data-class='label__project-configuration-list__title' className={cx('title')}>{t(config.key)}</div>
            <div className={cx('images')}>
                {config.items.map((item: ConfigItem, i: number) => {
                    return (
                        <TooltipApp key={i} placement="top" title={getStatusName(item.status, item.key)}>
                            <div key={i} className={getClassNameChecked(item)}>
                                <div onClick={() => onHandleClick(item)} className={`${styles.img} ${getClassName(item)}`} style={{
                                    WebkitMaskImage: `url(/assets/img/config/${config.key}/${item.image})`,
                                    maskImage: `url(/assets/img/config/${config.key}/${item.image})`,
                                }}></div>
                            </div>
                        </TooltipApp>
                    )
                })}
            </div>
        </div>
    );
};

export default ConfigList;

export interface ConfigListProps {
    config: ConfigData,
    checkedList: string[],
    onCheck: (record: ConfigItem) => void,
}

export interface ConfigData {
    id: number,
    key: string,
    items: ConfigItem[]
}

export interface ConfigItem {
    id: number
    key: string
    image: string
    status: number
    unique: string[] | undefined | null
}