import React, { ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { HomeContext } from "@/context/HomeContext";
import TitlePage from "@/components/TitlePage";
import styles from "@/styles/CreateGeneralData.module.scss";
import Head from "next/head";
import UserLayout from "@/components/Layouts/user";
import AppButton from "@/components/Button";
import { AppContext } from "@/context/AppContext";
import { NewFieldType, OperatorModel, Project, ProjectModalType } from "@/models";
import AppTab, { TabItem } from "@/components/AppTab";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { clearUpdateOperator, selectUpdateOperator } from "@/store/slices/operator/update-operator.slice";
import {
    updateOperator,
} from "@/store/actions/operator.action";
import { errorToast, successToast } from "@/helpers/Toast";
import { Space } from "antd";
import ProjectCard from "@/components/Project/ProjectCard";
import DataLoading from "@/components/AppLoading/DataLoading";
import ProjectModal from "@/components/Project/ProjectCard/ProjectModal";
import { getOperatorById } from "@/store/actions/operator.action";
import OperatorForm from "../../components/GeneralForm/Operator/OperatorForm";
import { GetStaticPaths, GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { REGEX_HELPER, validateDataByRegex } from '@/helpers/Regex';
import { selectProject } from '@/store/slices/project/project.slice';
import {removeCache} from "@/store/slices/cache.slice";
import OperatorConfirmDelete from "@/components/GeneralForm/Operator/OperatorConfirmDelete";

import classNames from 'classnames/bind';
import PageLoading from "@/components/AppLoading/PageLoading";
const cx = classNames.bind(styles);

const EditOperatorPage = () => {
    const { locale, query, push } = useRouter()
    const { id } = query;
    const { t } = useTranslation(['common'])
    const titlePage = `${t('edit_operator')} | ${process.env.NEXT_PUBLIC_APP_NAME}`;
    const { isLoading } = useContext(AppContext);
    const { setHeadElement } = useContext(HomeContext)

    const [tools, setTools] = useState<string[]>([])
    const [operatorProjects, setOperatorProjects] = useState<Project[]>([])
    const [dynamicFields, setDynamicFields] = useState<NewFieldType[]>([])
    const [operatorData, setOperatorData] = useState<OperatorModel | undefined>(undefined)
    const [errorMessage, setErrorMessage] = useState<string[]>([])
    const [activeKey, setActiveKey] = useState<string>('1');
    const [pageLoading, setPageLoading] = useState<boolean>(true);
    const [isOpenModal, setIsOpenModal] = useState<boolean>(false);

    const [selected, setSelected] = useState<ProjectModalType | undefined>(undefined);
    const [deletedProjectId, setDeletedProjectId] = useState<string | undefined>(undefined);
    const [projectEmptyTools, setProjectEmptyTools] = useState<Project[]>([])
    const [projectWithChangedTools, setProjectWithChangedTools] = useState<{id: string, tools: string[]} | undefined>(undefined)

    const { data, isError, isSuccess, errorMessage: errors, isFetching } = useAppSelector(selectUpdateOperator)
    const {isDeleted: isDeletedProjectSelector} = useAppSelector(selectProject)

    const dispatch = useAppDispatch()

      // Handle render projects of current customer
      const projectList = useMemo(() => {
        if (operatorProjects.length === 0) {return []}

        if (isDeletedProjectSelector && deletedProjectId) {
            setDeletedProjectId(undefined); // reset
            setProjectEmptyTools(prev => prev.filter(p => p.id !== deletedProjectId))
            const projectAfterDeleted = [...operatorProjects].filter(pro => pro.id !== deletedProjectId);
            setOperatorProjects([...projectAfterDeleted]);
            return projectAfterDeleted
        }

        if (projectWithChangedTools) {
            let index = [...operatorProjects].findIndex(p => p.id === projectWithChangedTools.id) as number;
            let projectAfterChangeTools = operatorProjects[index]

            projectAfterChangeTools = {...projectAfterChangeTools, tools: projectWithChangedTools.tools}
            let result = [...operatorProjects]
            result[index] = projectAfterChangeTools

            if (projectWithChangedTools.tools.length === 0) {
                setProjectEmptyTools(prev => [...prev, projectAfterChangeTools])
            } else {
                setProjectEmptyTools(prev => prev.filter(p => p.id !== projectAfterChangeTools.id))
            }
            setOperatorProjects(prev => {
                prev[index] = projectAfterChangeTools
                return prev
            })
            setProjectWithChangedTools(undefined)

            return result
        }

        return operatorProjects;
    }, [isDeletedProjectSelector, deletedProjectId, operatorProjects, projectWithChangedTools])

    const loadOperatorById = useCallback(() => {
        dispatch(clearUpdateOperator())
        dispatch(getOperatorById(id as string)).unwrap().then(response => {
            setPageLoading(false)
            if (response.succeeded) {
                let map = '';
                try {
                    map = JSON.parse(response?.result?.map)
                } catch (err) {}


                setOperatorData({
                    ...response.result,
                    map
                })
                setDynamicFields(JSON.parse(response.result.dynamicFields))

                const projects = response.result.projects;
                setOperatorProjects(projects)

                const tools: string[] = [];
                const projectsHaveNoTools: Project[] = []

                projects.map((p: Project) => {
                    if (p.tools.length === 0) {
                        projectsHaveNoTools.push(p)
                    }
                    return p.tools.map((t: string) => tools.push(t))
                });

                setProjectEmptyTools(projectsHaveNoTools)

                const tabArr = Array.from(new Set(tools));
                setTools(tabArr)
                return;
            }
            errorToast(t('error_loading_data'))
        }).catch(err => {
            setPageLoading(false)
            errorToast(t('error_loading_data'))
        });
    }, [dispatch, id, t])

    const handleOnOpenModal = (projectModal: ProjectModalType) => {
        if (projectModal && projectModal.type === 'delete') {
            setDeletedProjectId(projectModal?.project?.id)
        }
        setSelected(projectModal)
        setIsOpenModal(true)
    }

    const tabs: TabItem[] = useMemo(() => {
        const result = [
            {
                id: "1",
                label: <span>{t('basic_data')}</span> ,
                children: <div className={styles.contentTab}>
                    <OperatorForm
                        errorMessage={errorMessage}
                        isCreate={false}
                        operatorData={operatorData}
                        setOperatorData={setOperatorData}
                        dynamicFields={dynamicFields}
                        setDynamicFields={setDynamicFields} />
                </div>,
                closeIcon: <></>
            },
        ]

        const toolsFilter = []

        // When this Operator have projects with no tools assign to it
        if (projectEmptyTools.length !== 0) {
            toolsFilter.push({
                toolName: t('no_tools'),
                projectsBasedOnToolName: projectEmptyTools,
            })
        }

        for (let i = 0; i < tools.length; i++) {
            let projectsBasedOnToolName: Project[] = []

            projectsBasedOnToolName = [...projectsBasedOnToolName, ...projectList.filter(p => p.tools?.includes(tools[i]))]
            console.log(projectsBasedOnToolName)

            // If none of projects in this tool, let's skip it
            if (projectsBasedOnToolName.length === 0) {
                continue;
            }

            toolsFilter.push({
                toolName: tools[i],
                projectsBasedOnToolName,
            })
        }

        for (let i = 0; i < toolsFilter.length; i++) {
            const tabFilter = {
                id: `${i + 2}`,
                label:
                <div>
                    <span>{`${t(toolsFilter[i].toolName, { ns: 'config' })}`}</span>
                    <span
                        style={{
                            border: '1px solid',
                            borderColor: activeKey === `${i + 2}` ? 'var(--primary-color)' : '#636463',
                            borderRadius: '100%',
                            padding: '1px 5px',
                            color: 'white',
                            backgroundColor: activeKey === `${i + 2}` ? 'var(--primary-color)' : '#636463',
                            fontSize: '12px',
                            marginLeft: '8px'
                        }}
                    >{`${toolsFilter[i].projectsBasedOnToolName.length}`}
                    </span>
                </div>,
                children: <div className={`${styles.contentTab} ${styles.contentTabProject}`}>
                    <Space direction="horizontal" size={50} style={{ display: 'flex' }} wrap>
                        {toolsFilter[i].projectsBasedOnToolName.map(pro => <ProjectCard key={pro.id} project={pro} openModal={handleOnOpenModal}/>)}
                    </Space>
                </div>,
                closeIcon: <></>
            }

            result.push(tabFilter)
        }

        // If user is in current tab (tool tab), and he deletes all projects in this tool tab
        // he will be moved to the first tab (Basic data)
        const haveTab = result.some(tab => tab.id === activeKey)
        if (!haveTab) {
            const resetToFirstTab = String(1)
            setActiveKey(resetToFirstTab)
        }

        return result
    }, [tools, t, errorMessage, operatorData, dynamicFields, projectList, id, activeKey, projectEmptyTools])

    const handleOnCloseModal = useCallback(() => {
        setSelected(undefined)
        setIsOpenModal(false)
    }, [])

    const successfullyForm = useCallback(
        () => {
            successToast(t('update_successfully', { name: data?.company }))
            setErrorMessage([])
            dispatch(clearUpdateOperator())
        }, [dispatch, data?.company, t],
    );

    const onHandleUpdateOperator = () => {
        dispatch(clearUpdateOperator())
        const data = new FormData();
        data.append('dynamicFields', JSON.stringify(dynamicFields));

        const errMessage: string[] = [];

        if (operatorData?.company) {
            data.append('company', operatorData.company);
        } else {
            errMessage.push(t('field_is_required', { field: t('company') }))
        }

        if (operatorData?.street) {
            data.append('street', operatorData.street);
        } else {
            // errMessage.push(t('field_is_required', {field:  t('street')}))
        }

        if (operatorData?.location) {
            data.append('location', operatorData.location);
        } else {
            // errMessage.push(t('field_is_required', {field:  t('location')}))
        }

        if (operatorData?.postcode) {
            data.append('postcode', operatorData.postcode);
        } else {
            // errMessage.push(t('field_is_required', {field:  t('postcode')}))
        }

        if (operatorData) {
            data.append('logo', operatorData?.logo);
        }

        if (operatorData?.logoUpload) {
            data.append('newLogo', operatorData.logoUpload as Blob);
        }

        if (operatorData?.map) {
            data.append('map', JSON.stringify(operatorData.map));
        }

        if (operatorData?.email) {
            const isValidEmail = validateDataByRegex(operatorData?.email, REGEX_HELPER.email);
            if (isValidEmail) {
                data.append('email', operatorData.email);
            } else {
                errMessage.push(t('email_invalid'))
            }
        }

        if (operatorData?.telephone) {
            const isValidTelephone = validateDataByRegex(operatorData?.telephone, REGEX_HELPER.phone);
            if (isValidTelephone) {
                data.append('telephone', operatorData.telephone);
            } else {
                errMessage.push(t('phone_invalid'))
            }
        }

        if (errMessage.length > 0) {
            setErrorMessage(errMessage)
            return;
        }

        dispatch(removeCache(operatorData?.logo))
        dispatch(updateOperator({ id, data }))
    }

    const elementHeader = (): ReactNode => {
        return <TitlePage
            pageName='general_data'
            name='edit_operator'
            createButton={
                <div className={cx('title-page-function')}>
                    <div>
                    <OperatorConfirmDelete id={id}/>
                    </div>
                    <div>
                        <AppButton style={{minWidth: '100px', fontSize: '1.1rem'}} size='small' className={styles.saveBtn} disabled={isLoading} onClick={() => onHandleUpdateOperator()}>
                            <span>{t('save')}</span>
                        </AppButton>
                    </div>
                </div>
            } />
    }

    const onHandleBackToListPage = useCallback(() => {
        push('/operator', '/operator', {locale})
    }, [locale, push])

    useEffect(() => {
        setErrorMessage([])
        loadOperatorById();

        return () => {
            dispatch(clearUpdateOperator())
            setErrorMessage([])
        }
    }, [])

    useEffect(() => {
        if (isSuccess) {
            successfullyForm();
            setPageLoading(false)
        }
    }, [isSuccess]);

    useEffect(() => {
        if (isError) {
            setErrorMessage(errors)
            setPageLoading(false)
        } else {
            setErrorMessage([])
        }

        if (isFetching) {
            setPageLoading(true)
        }
    }, [isError, isFetching]);

    useEffect(() => {
        setHeadElement(elementHeader())
    }, [dynamicFields, operatorData, setHeadElement, isLoading])

    const onHandleCreateNewProject = () => {
        push('/create', '/create', { locale })
    }

    /* When user change tool in selected project, should notify */
    const handleChangeToolSelectedProject = (id: string, tools: string[]) => {
    setProjectWithChangedTools(prev => {
        return {
            ...prev,
            id,
            tools,
        }
    })
}

    return (
        <>
            <Head>
                <title>{titlePage}</title>
            </Head>
            <div className={styles.container}>
                {pageLoading ? <PageLoading /> : null}
                <AppTab tabs={tabs} activeKey={activeKey} setActiveKey={setActiveKey} btnBack={true} btnBackDisabled={isFetching} onHandleAdd={onHandleCreateNewProject} onHandleBack={onHandleBackToListPage}/>
                <ProjectModal isOpen={isOpenModal} onClose={handleOnCloseModal} projectModal={selected} onChangeToolsSelectedProject={handleChangeToolSelectedProject}/>
            </div>
        </>
    );
};

export default EditOperatorPage;

EditOperatorPage.Layout = UserLayout;

export const getStaticProps: GetStaticProps = async ({ locale }) => {
    return {
        props: {
            ...(await serverSideTranslations(locale ?? "en", ["common", "config"]))
        }
    }
}

export const getStaticPaths: GetStaticPaths<{ id: string }> = async () => {

    return {
        paths: [], //indicates that no page needs be created at build time
        fallback: 'blocking' //indicates the type of fallback
    }
}

