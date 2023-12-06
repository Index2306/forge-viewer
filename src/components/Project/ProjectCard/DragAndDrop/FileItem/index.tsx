import React, { PropsWithChildren, useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import styles from '../DragAndDrop.module.scss';
import { FaTrashAlt } from "react-icons/fa";
import { Icon } from "@chakra-ui/react";
import { Input, Popover } from "antd";
import { UserFile } from "@/models/file";
import ConfirmDelete from "@/components/ConfirmDelete";


const FileListItem: React.FC<PropsWithChildren<Props>> = ({ file, removeFile, changeFileName, ...props }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: file.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const [isOpenPopover, setIsOpenPopover] = useState<boolean>(false);
    const [fileName, setFileName] = useState<string>(file?.name ?? '');
    const [isInput, setIsInput] = useState<boolean>(false);

    const handleDelete = () => {
        // TODO: remove user file
        if (removeFile) {
            removeFile(file)
        }
        setIsOpenPopover(false)
    }

    const handleCancel = () => {
        setIsOpenPopover(false)
    }

    const handleOpenChange = (newOpen: boolean) => {
        setIsOpenPopover(newOpen);
    };

    const setEditableStr = (newName: string) => {
        setFileName(newName)
        changeFileName(file, fileName)
    }

    const onHandleClickName = () => {
        setIsInput(true)
    }

    const onHandleBlur = () => {
        setIsInput(false)
    }

    const onChangeChange = (event: any) => {
        setFileName(event.currentTarget.value)
        changeFileName(file, event.currentTarget.value)
    }

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <div className={styles.listItem}>
                {isInput ? <Input value={fileName}
                    onChange={onChangeChange}
                    onBlur={onHandleBlur}
                    autoFocus={true} />
                    : <span title={fileName} className={styles.itemFileName}
                        onClick={() => onHandleClickName()}>{fileName}</span>}

                <Popover onOpenChange={handleOpenChange} open={isOpenPopover} placement="top" content={<ConfirmDelete name={file.name} onHandleDelete={handleDelete} onCancel={handleCancel} />} trigger="click">
                    <button><Icon className={styles.listItemIcon} width={4} height={4} as={FaTrashAlt} /></button>
                </Popover>
            </div>
        </div>
    );
};

export default FileListItem;

interface Props {
    file: UserFile | any,
    removeFile?: (file: any) => void,
    changeFileName: (file: any, newName: string) => void,
}
