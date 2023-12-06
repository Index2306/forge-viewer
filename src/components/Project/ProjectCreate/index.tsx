import React, {useCallback, useEffect, useState} from 'react';
import DataLoading from "@/components/AppLoading/DataLoading";
import styles from "./ProjectCreate.module.scss";
import ProjectForm from "@/components/Project/ProjectCard/ProjectForm";
import {Divider} from "antd";
import DragAndDrop from "@/components/Project/ProjectCard/DragAndDrop";
import {useTranslation} from "next-i18next";
import {CreateProjectType, NewFieldType, UploadFileToProjectModel} from "@/models";
import {useAppDispatch, useAppSelector} from "@/hooks";
import {clearCreateProject, selectProject} from "@/store/slices/project/project.slice";
import {createProject, getProjectName} from "@/store/actions/project.action";
import {uploadFileToProject} from "@/store/actions/file.action";
import {errorToast, successToast} from "@/helpers/Toast";
import {v4 as uuidv4} from "uuid";
import {arrayMove} from "@dnd-kit/sortable";
import AppButton from "@/components/Button";
import {useRouter} from "next/router";

const ProjectCreate : React.FC<ProjectCreateProps> = ({onClose, checkedList}) => {
    const {locale, push} = useRouter();
    const {t} = useTranslation();
    const dispatch = useAppDispatch();

    const [dynamicFields, setDynamicFields] = useState<NewFieldType[]>([])
    const [projectData, setProjectData] = useState<CreateProjectType>({})
    const [errorMessage, setErrorMessage] = useState<string[]>([])
    const [files, setFiles] = useState<any[]>([])
    const [fileUploaded, setFileUploaded] = useState<string[]>([])
    const [isCreatedAll, setIsCreatedAll] = useState<boolean>(true)
    const [isFileUploading, setIsFileUploading] = useState<boolean>(false)

    const {isCreated, projectCreated, isCreating, errorCreate, data: currentProjectData} = useAppSelector(selectProject)

    // -------------------------------------------------------------------------------
    // If project is successfully created, open this project and go to current canvas
    // -------------------------------------------------------------------------------
    const successfullyForm = useCallback(
        () => {
            setIsCreatedAll(true)
            successToast(t('create_successfully', {name: projectCreated?.name}))

            setDynamicFields([])
            setErrorMessage([])
            setFiles([])
            setFileUploaded([])
            dispatch(clearCreateProject())

            // open page tool of current created project
            if (currentProjectData && projectCreated) {
                const project = currentProjectData.find(p => p.name === projectCreated.name);
                if (project) {
                    push(`/tool/${project.id}`, `/tool/${project.id}`, { locale })
                }
            }
            
            if (onClose) onClose();
        }, [onClose, dispatch, projectCreated, t, currentProjectData],
    );

    useEffect(() => {
        return () => {
            setProjectData({})
            setDynamicFields([])
            setErrorMessage([])
            setFiles([])
            setFileUploaded([])
        };
    }, [])

    useEffect(() => {
        dispatch(getProjectName()).then(response => {
            const initProjectData: CreateProjectType = {
                name: response.payload.result,
                thumbnail: undefined,
                dynamicFields: [],
                customer: undefined,
                operator: undefined,
            }
            setProjectData(initProjectData)
        })
    }, [dispatch]);

    useEffect(() => {
        if (isFileUploading) {
            if (fileUploaded.length !== files.length) {
                setIsFileUploading(true);
                setIsCreatedAll(false)
            }
            else if (projectCreated) {
                setIsCreatedAll(true)
                successfullyForm()
            }
        }
    }, [isFileUploading, fileUploaded, files, projectCreated]);

    useEffect(() => {
        if (isCreated && projectCreated) {
            const projectId = projectCreated.id;

            if (files.length > 0) {
                setIsFileUploading(true);
                files.forEach((uploadFile: any, index) => {
                    const formData = new FormData()
                    formData.append('file', uploadFile.originFileObj as Blob);
                    formData.append('key', uploadFile?.id ?? index.toString());
                    formData.append('projectIndex', index.toString());
                    formData.append('name', uploadFile.name);
                    const dataUpload: UploadFileToProjectModel = {
                        projectId: projectId,
                        data: formData
                    }
                    dispatch(uploadFileToProject({data: dataUpload})).unwrap()
                        .then(response => {
                        if (!response?.succeeded) {
                            errorToast(t('file_upload_error', {name: uploadFile.name, project: uploadFile.name}))
                        }
                    }).catch(() => {
                        errorToast(t('file_upload_error', {name: uploadFile.name, project: uploadFile.name}));
                    }).finally(() => setFileUploaded(prev => [...prev, uploadFile?.id ?? index.toString()]));

                });
            } else {
                setIsCreatedAll(true);
                successfullyForm();
            }
        }
    }, [files, isCreated, projectCreated]);

    useEffect(() => {
        if (files.length > 0) {
            setErrorMessage(errorCreate)
        }

        if (errorCreate.length > 0) {
            setIsCreatedAll(true)
        }
    }, [errorCreate]);

    useEffect(() => {
        if (isCreating) {
            setIsCreatedAll(false)
        }
    }, [isCreating, isCreatedAll, errorMessage]);

    const onHandleCreateProject = () => {
        dispatch(clearCreateProject())

        if (files.length < 1) {
            setErrorMessage([t('upload_least_file')])
            return;
        }

        let data = new FormData();
        data.append('saveTime', '0');
        data.append('dynamicFields', JSON.stringify(dynamicFields));
        if (!projectData.name) {
            setErrorMessage([t('field_is_required', {field:  t('project_name')})])
            return;
        } else {
            data.append('name', projectData.name);
        }

        if (projectData.thumbnail) {
            data.append('image', projectData.thumbnail as Blob);
        }

        if (projectData.customer) {
            data.append('customerId', projectData.customer);
        }
        if (projectData.operator) {
            data.append('operatorId', projectData.operator);
        }
        if (errorMessage.length > 0) {
            setIsCreatedAll(false)
            setIsCreatedAll(true)
        }

        if (checkedList) {
            checkedList.map((v, i) => {
                data.append(`tools[${i}]`, v);
            })
        }

        dispatch(createProject(data))
    }

    // Handle add new file to upload file list before create new a project
    const onHandleAddFileCreate = useCallback((fileList: any[]) => {
        if (fileList.length > 0) {
            const oldList = [...files];
            for (let i = 0; i < fileList.length; i++) {
                fileList[i].id = uuidv4();
                oldList.push(fileList[i])
            }
            setFiles(oldList);
        }
    }, [files])

    // Handle remove file in upload file list
    const onHandleRemoveFileCreate = useCallback((file: any) => {
        const oldList = [...files].filter(f => f?.id !== file?.id);
        setFiles(oldList);
    }, [files])

    // Handle change index file when drag and drop index file
    const changeIndexFile = useCallback((activeIndex: number, overIndex: number) => {
        const newList = arrayMove([...files], activeIndex, overIndex)
        setFiles(newList);
    }, [files])

    const changeFileName = (file: any, newName: string) => {
        setFiles(prev => [...prev].map(f => {
            if (file.uid === f.uid) {
                const newF = {...f}
                newF.name = newName;
                if (!newF.name.toLowerCase().endsWith('.dwg')) {
                    newF.name += '.dwg';
                }

                return newF;
            }
            return f;
        }))
    }

    return (
        <>
            <div style={{width: 'auto', height: 'auto', position: 'relative'}}>
                {!isCreatedAll ? <DataLoading title={t('creating')}/> : null }
                <div className={styles.formProject}>
                    <ProjectForm errorMessage={errorMessage} isCreate={true} projectData={projectData} setProjectData={setProjectData} dynamicFields={dynamicFields} setDynamicFields={setDynamicFields} />
                </div>
                <Divider />
                <div className={styles.projectFile}>
                    <DragAndDrop
                        changeIndexFile={changeIndexFile}
                        createFiles={files}
                        addFileCreate={onHandleAddFileCreate}
                        removeFileCreate={onHandleRemoveFileCreate}
                        isCreate={true} project={undefined}
                        changeFileName={changeFileName}
                    />
                </div>
            </div>
            <div className={styles.btnCreate}><AppButton loading={!isCreatedAll} onClick={() => onHandleCreateProject()}>{t('complete')}</AppButton></div>
        </>
    );
};

export default ProjectCreate;

export interface ProjectCreateProps {
    onClose?: () => void,
    checkedList?: string[]

}
