import React, {useContext, useEffect, useState} from 'react';
import styles from './ChangeUnitTool.module.scss'
import { useTranslation } from 'next-i18next';
import { ToolContext } from '@/context/ToolContext';
import {useAppSelector} from "@/hooks";
import {selectTool} from "@/store/slices/tool/tool.slice";

const UnitInfo : React.FC<UnitInfoProps> = ({info, isShow}) => {
    const [length, setLength] = useState<string | number | undefined>(undefined);
    const [units, setUnits] = useState<string | undefined>(undefined);
    const { t } = useTranslation()

    const {isOpenSideBar} = useContext(ToolContext)
    const {currentFile} = useAppSelector(selectTool)

    useEffect(() => {
        setLength(currentFile?.fileData?.length)
        setUnits(currentFile?.fileData?.units)
    }, [currentFile])

    if (!isShow) return null;
    return (
        <div className={styles.unitInfo} style={{
                left: isOpenSideBar ? '232px' : '130px',
                display: info?.length ? 'block' : 'none'
            }}>
            <p>{t('length', {ns: 'tool'})}: <b>{length}</b></p>
            <p>{t('unit', {ns: 'tool'})}: <b>{units}</b></p>
        </div>
    );
};

export default UnitInfo;

export interface UnitInfoProps {
    isShow?: boolean
    info?: any
}