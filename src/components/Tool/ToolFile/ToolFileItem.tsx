import React, {useCallback, useContext, useRef} from 'react';
import styles from './ToolFile.module.scss'
import {ToolContext} from "@/context/ToolContext";
import {PlusOutlined, UploadOutlined} from "@ant-design/icons";
import {Button, message, Tooltip, Upload} from "antd";
import {RcFile, UploadProps} from "antd/es/upload";
import {useTranslation} from "next-i18next";
import TooltipApp from "@/components/TooltipApp";

const ToolFileItem: React.FC<FileItemProps> = ({id, name, roofIndex, onSelectCurrentFileId, onHandleUploadFile}) => {
    const {t} = useTranslation()
    const {fileSelected} = useContext(ToolContext)

    const inputFile = useRef(null)
    const buttonUpload = useRef(null)

    const props: UploadProps = {
        accept: ".dwg",
        maxCount: 10,
        multiple: true,
        name: 'file',
        action: undefined,
        beforeUpload: (file) => {
            const isDwg = file.type !== '.dwg';
            if (!isDwg) {
                message.error(t('is_not_dwg_file', {name: file.name}));
            } else if (onHandleUploadFile) {
                onHandleUploadFile(file)
            }
            return false;
        },
    };

    const onClickUploadFile = useCallback(() => {
        if (onHandleUploadFile) {
            // @ts-ignore
            buttonUpload?.current?.click()
        }
    }, [onHandleUploadFile, inputFile])

    if (id === undefined || name === undefined) {
        if (roofIndex === 2 ) return null;
        return <>
            <div style={{display: 'none'}}>
                <Upload {...props} ref={inputFile}>
                    <Button ref={buttonUpload} icon={<UploadOutlined/>}>Click to Upload</Button>
                </Upload>
            </div>

            <TooltipApp  placement='right'  title={t('upload_dwg_file')} >
                <div
                    className={`${styles.fileItemNone}`}
                    onClick={onClickUploadFile}>
                    <PlusOutlined/>
                </div>
            </TooltipApp>
        </>;
    }

    return (
        <TooltipApp placement='right' title={name}>
            <div
                data-class='label__page-tool__tool-left-sidebar__house-file-item'
                className={`${styles.fileItem} ${fileSelected?.id === id ? styles.fileItemActive : ''}`}
                onClick={onSelectCurrentFileId ? () => onSelectCurrentFileId() : () => {
                }}>
                {name}
            </div>
        </TooltipApp>
    );
};

export default React.memo(ToolFileItem);

export interface FileItemProps {
    id?: string,
    name?: string,
    onSelectCurrentFileId?: () => void
    onHandleUploadFile?: (file: RcFile) => void
    roofIndex?: number
}
