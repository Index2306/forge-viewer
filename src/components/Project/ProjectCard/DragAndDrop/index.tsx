import React from 'react';
import {Col, Row} from "antd";
import {useTranslation} from "next-i18next";
import FileList from "@/components/Project/ProjectCard/DragAndDrop/FileList";
import UploadProjectFile from "@/components/Project/ProjectCard/DragAndDrop/UploadProjectFile";
import {Project} from "@/models";

const DragAndDrop: React.FC<DragAndDropProps> = ({
                                                     project,
                                                     createFiles,
                                                     isCreate,
                                                     addFileCreate,
                                                     removeFileCreate,
                                                     changeIndexFile,
                                                     changeFileName}) => {
    const {t} = useTranslation()
    return (
        <div>
            <Row>
                <Col xs={24} sm={12}>
                    <UploadProjectFile projectId={project?.id} isCreate={isCreate} addFileCreate={addFileCreate}/>
                </Col>
                <Col xs={24} sm={12} style={{paddingRight: '1px'}}>
                    <FileList createFiles={createFiles} removeFile={removeFileCreate} changeIndexFile={changeIndexFile} changeFileName={changeFileName}/>
                </Col>
            </Row>
        </div>
    );
};

export default DragAndDrop;

export interface DragAndDropProps {
    isCreate?: boolean,
    project?: Project | undefined,
    createFiles?: any[],
    addFileCreate?: (fileList: any[]) => void,
    removeFileCreate?: (file: any) => void,
    changeIndexFile?: (activeIndex: number, overIndex: number) => void,
    changeFileName: (file: any, newName: string) => void,
}