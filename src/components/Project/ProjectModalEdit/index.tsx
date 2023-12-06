import React, { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'next-i18next'
import AppTab, { TabItem } from '@/components/AppTab'
import ConfigPage from '@/components/Project/ConfigPage'
import { ConfigItem } from '@/components/Project/ConfigPage/ConfigList'
import ProjectEdit from '@/components/Project/ProjectEdit'
import { GeneralData, GeneralDataType, NewFieldType, Project, UpdateProjectType } from '@/models'
import { getProjectById, updateProject } from '@/store/actions/project.action'
import { errorToast, successToast } from '@/helpers/Toast'
import { useAppDispatch } from '@/hooks'
import { arrayMove } from '@dnd-kit/sortable'
import AppButton from '@/components/Button'
import { clearEditProject, setProjectEdit } from '@/store/slices/project/edit-project.slice'
import ModalApp from '@/components/ModalApp'

import styles from './ProjectModalEdit.module.scss'
import classNames from 'classnames/bind'
const cx = classNames.bind(styles)

const ProjectModalEdit: React.FC<ProjectModalEditProps> = ({
    isOpen,
    onClose,
    setChangeData,
    project: initProject,
    onChangeToolsSelectedProject,
}) => {
    const { t } = useTranslation()

    const [checkedList, setCheckedList] = useState<string[]>([])
    const [activeKey, setActiveKey] = useState<string>('1')

    const [project, setProject] = useState<Project | undefined>(undefined)
    const [isFirstGetData, setIsFirstGetData] = useState<boolean>(false)
    const [isUpdating, setIsUpdating] = useState<boolean>(false)
    const [dynamicFields, setDynamicFields] = useState<NewFieldType[]>([])
    const [errorMessage, setErrorMessage] = useState<string[]>([])
    const [files, setFiles] = useState<any[]>([])

    const dispatch = useAppDispatch()

    const onCheck = useCallback(
        (record: ConfigItem) => {
            // Check the selected tools.
            const id = record.key
            if (!checkedList.includes(id)) {
                if (record.unique && record.unique.length > 0) {
                    setCheckedList((prev) =>
                        [...prev, id].filter((v1) => !record.unique?.includes(v1)),
                    )
                    return
                }
                setCheckedList((prev) => [...prev, id])
            } else {
                setCheckedList((prev) => [...prev].filter((v) => v !== id))
            }
        },
        [checkedList],
    )

    useEffect(() => {
        setIsFirstGetData(true)
        if (initProject) {
            setActiveKey('2')
            dispatch(getProjectById(initProject.id))
                .then((response: any) => {
                    if ('error' in response) {
                        response.payload.map((msg: string) => errorToast(msg))
                        onClose()
                        return
                    }

                    if ('payload' in response && 'result' in response.payload) {
                        const initProj = { ...response.payload.result }

                        setDynamicFields(JSON.parse(initProj.dynamicFields))

                        initProj.customer = undefined
                        initProj.operator = undefined

                        const customer = initProj?.generalData.find(
                            (d: GeneralData) => d.type === GeneralDataType.customer,
                        )
                        if (customer) {
                            initProj.customer = customer.id
                        }

                        const operator = initProj?.generalData.find(
                            (d: GeneralData) => d.type === GeneralDataType.operator,
                        )
                        if (operator) {
                            initProj.operator = operator.id
                        }

                        setFiles(initProj.files)
                        setProject(initProj)
                        setIsFirstGetData(false)
                        setCheckedList(initProj.tools)
                        return
                    }

                    errorToast(`${t('error')}, ${t('please_try_again')}`)
                    onClose()
                })
                .catch((err) => {
                    onClose()
                    errorToast(`${t('error')}, ${t('please_try_again')}`)
                })
        }

        return () => {
            setProject(undefined)
            setIsFirstGetData(false)
            dispatch(clearEditProject())
        }
    }, [initProject])

    const onHandleUpdateProject = useCallback(() => {
        dispatch(clearEditProject())
        if (project === undefined) return

        if (setChangeData) {
            setChangeData(false)
        }
        setIsUpdating(true)
        setErrorMessage([])

        let formData = new FormData()
        formData.append('saveTime', '0')
        formData.append('dynamicFields', JSON.stringify(dynamicFields))

        files.forEach((f, index) => {
            formData.append(`files[][${index}][id]`, f.id)
            formData.append(`files[][${index}][name]`, f.name)
            formData.append(`files[][${index}][projectIndex]`, index.toString())
        })

        if (!project.name) {
            setErrorMessage([`${t('field_is_required', { field: t('project_name') })}`])
            setIsUpdating(false)
            return
        } else {
            formData.append('name', project.name)
        }

        if (project.thumbnail) {
            if (typeof project.thumbnail === 'string') {
                formData.append('thumbnail', project.thumbnail)
            } else {
                formData.append('image', project.thumbnail as Blob)
            }
        }

        if (project.customer) {
            formData.append('customerId', project.customer)
        }
        if (project.operator) {
            formData.append('operatorId', project.operator)
        }

        checkedList.forEach((v, i) => {
            formData.append(`tools[${i}]`, v)
        })

        const dataUpdate: UpdateProjectType = { id: project.id, data: formData }

        dispatch(updateProject(dataUpdate))
            .then((response: any) => {
                if ('error' in response) {
                    errorToast(`${t('error')} ${t('please_try_again')}`)
                    setErrorMessage(response.payload)
                    setIsUpdating(false)
                    return
                }

                if ('payload' in response && 'result' in response.payload) {
                    if (response.payload.succeeded) {
                        if (onChangeToolsSelectedProject) {
                            const projectId = response.payload.result.id
                            const projectTools = response.payload.result.tools
                            onChangeToolsSelectedProject!(
                                projectId as string,
                                projectTools as string[],
                            )
                        }
                        dispatch(updateProject(response.payload.result))
                        dispatch(setProjectEdit(response.payload.result))
                        successToast(
                            t('update_successfully', { name: response.payload.result.name }),
                        )
                    } else {
                        setErrorMessage(response.payload.errors)
                    }
                    setIsUpdating(false)
                    setErrorMessage([])
                    return
                }

                errorToast(`${t('error')} ${t('please_try_again')}`)
                setIsUpdating(false)
            })
            .then((err) => {
                errorToast(err)
                setIsUpdating(false)
            })
    }, [dynamicFields, project, t, dispatch, files, setChangeData, checkedList])

    const onHandleSetDynamicFields = useCallback(
        (newList: NewFieldType[]) => {
            setDynamicFields(newList)
            if (setChangeData) {
                setChangeData(true)
            }
        },
        [setChangeData],
    )

    // Handle add new file to upload file list before create new a project
    const onHandleAddFileCreate = useCallback(
        (fileList: any[]) => {
            if (fileList.length > 0) {
                setFiles((oldArr) => [...oldArr, ...fileList])
                if (setChangeData) {
                    setChangeData(true)
                }
            }
        },
        [setChangeData],
    )

    // Handle remove file in upload file list
    const onHandleRemoveUpdateFileList = useCallback(
        (file: any) => {
            const oldList = [...files].filter((f) => f?.id !== file?.id)
            setFiles(oldList)
            if (setChangeData) {
                setChangeData(true)
            }
        },
        [files, setChangeData],
    )

    // Handle change index file when drag and drop index file
    const changeIndexFile = useCallback(
        (activeIndex: number, overIndex: number) => {
            const newList = arrayMove([...files], activeIndex, overIndex)
            setFiles(newList)
            if (setChangeData) {
                setChangeData(true)
            }
        },
        [files, setChangeData],
    )

    const changeFileName = (file: any, newName: string) => {
        setFiles((prev) =>
            [...prev].map((f) => {
                if (file.id === f.id) {
                    const newF = { ...f }
                    newF.name = newName
                    if (!newF.name.toLowerCase().endsWith('.dwg')) {
                        newF.name += '.dwg'
                    }

                    return newF
                }
                return f
            }),
        )
    }

    const tabs: TabItem[] = [
        {
            id: '1',
            label: <span data-class='label__project-modal-edit__tabname'>{t('config')}</span>,
            children: (
                <div className={cx('contentTab')}>
                    <ConfigPage checkedList={checkedList} onCheck={onCheck} />
                </div>
            ),
        },
        {
            id: '2',
            label: <span data-class='label__project-modal-edit__tabname'>{t('basic_data')}</span>,
            children: (
                <div className={cx('contentTabCreate')}>
                    <ProjectEdit
                        isUpdating={isUpdating}
                        isFirstGetData={isFirstGetData}
                        errorMessage={errorMessage}
                        project={project}
                        setProject={setProject}
                        dynamicFields={dynamicFields}
                        onHandleSetDynamicFields={onHandleSetDynamicFields}
                        onHandleAddFileCreate={onHandleAddFileCreate}
                        files={files}
                        onHandleRemoveUpdateFileList={onHandleRemoveUpdateFileList}
                        changeIndexFile={changeIndexFile}
                        changeFileName={changeFileName}
                    />
                </div>
            ),
        },
    ]

    return (
        <ModalApp
            destroyOnClose={true}
            title={t('project_edit')}
            open={isOpen}
            onCancel={onClose}
            width={1000}
            footer={
                <div className={cx('project-modal-edit__footer')}>
                    <AppButton
                        loading={isUpdating}
                        disabled={isFirstGetData}
                        onClick={() => onHandleUpdateProject()}
                    >
                        {t('complete')}
                    </AppButton>
                </div>
            }
            bodyStyle={{ overflowY: 'auto', minHeight: '520px' }}
        >
            <div className={cx('project-modal-edit__content')}>
                <AppTab tabs={tabs} activeKey={activeKey} setActiveKey={setActiveKey} />
            </div>
        </ModalApp>
    )
}

export default ProjectModalEdit

export interface ProjectModalEditProps {
    isOpen: boolean
    onClose: () => void
    setChangeData?: (value: boolean) => void
    project?: Project
    onChangeToolsSelectedProject?: (id: string, tools: string[]) => void
}
