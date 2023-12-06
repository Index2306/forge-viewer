import React from 'react';
import DataLoading from "@/components/AppLoading/DataLoading";
import styles from "./ProjectEdit.module.scss";
import ProjectForm from "@/components/Project/ProjectCard/ProjectForm";
import {Divider} from "antd";
import DragAndDrop from "@/components/Project/ProjectCard/DragAndDrop";
import {useTranslation} from "next-i18next";
import { NewFieldType} from "@/models";

const ProjectEdit : React.FC<ProjectEditProps> = (
    {
        isUpdating,
        isFirstGetData,
        errorMessage,
        project,
        setProject,
        dynamicFields,
        onHandleSetDynamicFields,
        files,
        onHandleAddFileCreate,
        onHandleRemoveUpdateFileList,
        changeIndexFile,
        changeFileName}) => {

    const {t} = useTranslation();

    return (
        <div style={{width: 'auto', height: 'auto', position: 'relative'}}>
            {isUpdating ? <DataLoading title={t('updating')}/> : null}
            {isFirstGetData ? <DataLoading title={t('loading')}/> : null}
            <div className={styles.formProject}>
                <ProjectForm
                    errorMessage={errorMessage}
                    projectData={project}
                    setProjectData={setProject}
                    dynamicFields={dynamicFields}
                    setDynamicFields={onHandleSetDynamicFields}
                />
            </div>
            <Divider/>
            <div className={styles.projectFile}>
                <DragAndDrop
                    project={project}
                    createFiles={files}
                    addFileCreate={onHandleAddFileCreate}
                    removeFileCreate={onHandleRemoveUpdateFileList}
                    changeIndexFile={changeIndexFile}
                    isCreate={false}
                    changeFileName={changeFileName}/>
            </div>
        </div>
    );
};

export default ProjectEdit;

export interface ProjectEditProps {
    isUpdating: boolean,
    isFirstGetData: boolean
    errorMessage: string[],
    project: any,
    setProject: (pro: any) => void,
    dynamicFields: NewFieldType[],
    onHandleSetDynamicFields: (fields: NewFieldType[]) => void,
    files: any[],
    onHandleAddFileCreate: (files: any[]) => void,
    onHandleRemoveUpdateFileList: (file: any) => void
    changeIndexFile: (activeIndex: number, overIndex: number) => void
    changeFileName: (file: any, newName: string) => void
}
