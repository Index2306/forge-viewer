import React, {ReactNode, useCallback, useState} from 'react';
import styles from "@/components/Tool/ToolFile/ToolFile.module.scss";
import {useTranslation} from "next-i18next";

const ToolFileList: React.FC<ToolFileListProps> = ({children}) => {
    return (
        <div className={styles['tool-file']}>
            {children}
        </div>
    );
};

export default ToolFileList;

interface ToolFileListProps {
    children?: ReactNode
}