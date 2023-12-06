import React from 'react';
import {useTranslation} from "next-i18next";
import {Button} from "@chakra-ui/react";
import styles from './ConfirmDelete.module.scss';

const ConfirmDelete: React.FC<{onHandleDelete: Function, onCancel: Function, name?: string | undefined}>= ({onHandleDelete, onCancel, name}) => {
    const {t} = useTranslation();
    return (
        <div>
            <p className={styles.title}>{t('question_delete')}</p>
            <div className={styles.btnGroup}>
                <Button className={styles.btn} style={{color: 'white', borderRadius: '4px'}} colorScheme='teal' variant='solid' size='sm' onClick={() => onHandleDelete()}>
                    {t('yes')}
                </Button>
                <Button className={styles.btnNo} style={{color: 'white', borderRadius: '4px'}} colorScheme='teal' variant='solid' size='sm' onClick={() => onCancel()}>
                    {t('no')}
                </Button>
            </div>
        </div>
    );
};

export default ConfirmDelete;