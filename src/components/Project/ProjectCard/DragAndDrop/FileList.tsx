import React, {useEffect, useMemo, useState} from 'react';
import styles from './DragAndDrop.module.scss';
import {
    Active,
    closestCenter,
    DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors,
} from "@dnd-kit/core";
import {arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy} from "@dnd-kit/sortable";
import {SortableOverlay} from "@/components/Project/ProjectCard/DragAndDrop/SortableOverlay";
import FileListItem from "@/components/Project/ProjectCard/DragAndDrop/FileItem";
import {UserFile} from "@/models/file";

const FileList: React.FC<FileListProps> = ({createFiles, removeFile, changeIndexFile, changeFileName}) => {
    const [items, setItems] = useState<UserFile[] | any[]>([]);
    const [active, setActive] = useState<Active | null>(null);

    useEffect(() => {
        if (createFiles) {
            setItems(createFiles)
        }
    }, [createFiles]);


    const activeItem = useMemo(
        () => items.find((item) => item.id === active?.id),
        [active, items]
    );

    const sensors = useSensors(
        useSensor(PointerSensor, {activationConstraint: {
                distance: 0,
            }}),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
            keyboardCodes: {
                start: ['Space'],
                cancel: ['Escape'],
                end: ['Space'],
            }
        })
    );

    function handleDragEnd(event: any) {
        const {active, over} = event;

        if (over && active.id !== over.id) {
            const activeIndex = items.findIndex((userFile) => userFile.id === active.id);
            const overIndex = items.findIndex((userFile) => userFile.id === over.id);

            // const oldList = [...items]
            setItems(prev => arrayMove(prev, activeIndex, overIndex));
            if (changeIndexFile) {
                changeIndexFile(activeIndex, overIndex)
            }
        }

        setActive(null);
    }

    const renderItem = (activeItem: UserFile) => {
        if (activeItem) {
            return <FileListItem key={activeItem.id} file={activeItem} changeFileName={changeFileName}/>
        }
        return null;
    }

    return (
        <div className={styles.fileList}>
            <DndContext
                sensors={sensors}
                onDragStart={({ active }) => {
                    setActive(active);
                }}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
                onDragCancel={() => {
                    setActive(null);
                }}
            >
                <SortableContext
                    items={items}
                    strategy={verticalListSortingStrategy}
                >
                    {items.map((userFile, index) => <FileListItem key={userFile.id} file={userFile} removeFile={removeFile} changeFileName={changeFileName}/>)}
                </SortableContext>
                <SortableOverlay>
                    {activeItem ? renderItem(activeItem) : null}
                </SortableOverlay>
            </DndContext>
        </div>
    );
};

export default FileList;

export interface FileListProps {
    createFiles?: any,
    removeFile?: (file: any) => void,
    changeIndexFile?: (activeIndex: number, overIndex: number) => void,
    changeFileName: (file: any, newName: string) => void,
}
