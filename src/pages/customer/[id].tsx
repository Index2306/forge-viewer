import React, { ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { HomeContext } from "@/context/HomeContext";
import TitlePage from "@/components/TitlePage";
import styles from "@/styles/CreateGeneralData.module.scss";
import Head from "next/head";
import UserLayout from "@/components/Layouts/user";
import AppButton from "@/components/Button";
import { Col, Row, Space } from "antd";
import { GetStaticPaths, GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import DataLoading from "@/components/AppLoading/DataLoading";
import AppTab, { TabItem } from "@/components/AppTab";
import { CustomerModel, LocationModel, NewFieldType, Project, ProjectModalType } from "@/models";
import CustomerForm from "../../components/GeneralForm/Customer/CustomerForm";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { errorToast, successToast } from "@/helpers/Toast";
import { deleteCustomer, getCustomerById, updateCustomer } from "@/store/actions/customer.action";
import { AppContext } from "@/context/AppContext";
import { clearUpdateCustomer, selectUpdateCustomer } from "@/store/slices/customer/update-customer.slice";
import ModalConfirmDelete from "@/components/ModalConfirmDelete";
import CustomerLocation from "../../components/GeneralForm/Location/CustomerLocation";
import ProjectCard from "@/components/Project/ProjectCard";
import ProjectModal from "@/components/Project/ProjectCard/ProjectModal";
import { selectProject } from '@/store/slices/project/project.slice';
import { REGEX_HELPER, validateDataByRegex } from '@/helpers/Regex';
import { getAllLocationByCustomerId } from '@/store/actions/location.action';
import {removeCache, selectCache} from "@/store/slices/cache.slice";
import CustomerConfirmDelete from "../../components/GeneralForm/Customer/CustomerConfirmDelete";

import classNames from 'classnames/bind';
import PageLoading from "@/components/AppLoading/PageLoading";
const cx = classNames.bind(styles);

const EditCustomerPage = () => {
    const { locale, query, push } = useRouter()
    const { id } = query;
    const [isOpenModalLocation, setIsOpenModalLocation] = useState<boolean>(false)

    const { t } = useTranslation(['common', 'config']);
    const titlePage = `${t('edit_customer')} | ${process.env.NEXT_PUBLIC_APP_NAME}`;
    const { isLoading } = useContext(AppContext);
    const { setHeadElement } = useContext(HomeContext)

    const [tools, setTools] = useState<string[]>([])
    const [customerProjects, setCustomerProjects] = useState<Project[]>([])
    const [dynamicFields, setDynamicFields] = useState<NewFieldType[]>([])
    const [customerData, setCustomerData] = useState<CustomerModel | undefined>(undefined)
    const [errorMessage, setErrorMessage] = useState<string[]>([])
    const [activeKey, setActiveKey] = useState<string>('1');
    const [pageLoading, setPageLoading] = useState<boolean>(true);
    const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
    const [selected, setSelected] = useState<ProjectModalType | undefined>(undefined);
    const [deletedProjectId, setDeletedProjectId] = useState<string | undefined>(undefined);
    const [locationNumber, setLocationNumber] = useState<string | undefined>(undefined)
    const [projectEmptyTools, setProjectEmptyTools] = useState<Project[]>([])
    const [projectWithChangedTools, setProjectWithChangedTools] = useState<{id: string, tools: string[]} | undefined>(undefined)

    const { data, isError, isSuccess, errorMessage: errors, isFetching } = useAppSelector(selectUpdateCustomer)
    const { isDeleted: isDeletedProjectSelector } = useAppSelector(selectProject)
    const { cache } = useAppSelector(selectCache)

    const dispatch = useAppDispatch()

    // Handle render projects of current customer
    const projectList: Project[] = useMemo(() => {
        if (customerProjects.length === 0) { return [] }

        if (isDeletedProjectSelector && deletedProjectId) {
            setDeletedProjectId(undefined); // reset
            setProjectEmptyTools(prev => prev.filter(p => p.id !== deletedProjectId))
            const projectAfterDeleted = [...customerProjects].filter(pro => pro.id !== deletedProjectId);
            setCustomerProjects([...projectAfterDeleted])
            return projectAfterDeleted
        }

        if (projectWithChangedTools) {
            let index = [...customerProjects].findIndex(p => p.id === projectWithChangedTools.id) as number;
            let projectAfterChangeTools = customerProjects[index]

            projectAfterChangeTools = {...projectAfterChangeTools, tools: projectWithChangedTools.tools}
            let result = [...customerProjects]
            result[index] = projectAfterChangeTools

            if (projectWithChangedTools.tools.length === 0) {
                setProjectEmptyTools(prev => [...prev, projectAfterChangeTools])
            } else {
                setProjectEmptyTools(prev => prev.filter(p => p.id !== projectAfterChangeTools.id))
            }
            setCustomerProjects(prev => {
                prev[index] = projectAfterChangeTools
                return prev
            })
            setProjectWithChangedTools(undefined)

            return result
        }

        return customerProjects;
    }, [isDeletedProjectSelector, deletedProjectId, customerProjects, projectWithChangedTools])

    const loadCustomerById = useCallback(() => {
        dispatch(clearUpdateCustomer())
        dispatch(getCustomerById(id as string)).unwrap().then(response => {
            setPageLoading(false)
            if (response.succeeded) {
                let map = '';
                try {
                    map = JSON.parse(response?.result?.map)
                } catch (err) {}

                setCustomerData({
                    ...response.result,
                    map
                })
                setDynamicFields(JSON.parse(response.result.dynamicFields))

                const projects = response.result.projects;
                setCustomerProjects(projects)

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

    const loadLocationById = useCallback(() => {
        dispatch(getAllLocationByCustomerId(id)).unwrap()
        .then(response => {
            if (response.succeeded) {
                const locationData = (response.result.map((val: LocationModel) => ({ ...val, key: val.id })) as LocationModel[]).length
                setLocationNumber(String(locationData))
                return;
            }
            response.errors.map((err: string) => errorToast(err))
        })
        .catch(() => {
            errorToast(t('error_loading_data'))
        })
    }, [dispatch, id, t])


    const  handleOnOpenModal = (projectModal: ProjectModalType) => {
        if (projectModal && projectModal.type === 'delete') {
            setDeletedProjectId(projectModal?.project?.id)
        }
        setSelected(projectModal)
        setIsOpenModal(true)
    }

    const handleChangeLocationNumber = (num: number) => {
        console.log(num)
        setLocationNumber(String(num))
    }

    // Render tabs of based on current page of with current customerId
    const tabs: TabItem[] = useMemo(() =>
    {
        const result = [
            {
                id: "1",
                label: <span>{t('basic_data')}</span>,
                children: <div className={cx('contentTab')}>
                    <CustomerForm
                        errorMessage={errorMessage}
                        isCreate={false}
                        customer={customerData}
                        setCustomer={setCustomerData}
                        dynamicFields={dynamicFields}
                        setDynamicFields={setDynamicFields} />

                </div>,
                closeIcon: <></>,
                nameHead: 'edit_customer'
            },
            {
                id: "2",
                label: <>
                   <span>{t('location')}</span>
                   {locationNumber && Number(locationNumber) > 0 && <span
                        style={{
                            border: '1px solid ',
                            borderColor: activeKey === `2` ? 'var(--primary-color)' : '#636463',
                            borderRadius: '100%',
                            padding: '1px 5px',
                            color: 'white',
                            backgroundColor: activeKey === `2` ? 'var(--primary-color)' : '#636463',
                            fontSize: '12px',
                            marginLeft: '8px'
                        }}
                    >{locationNumber}
                    </span>}
                </>,
                children: <div className={cx('contentTab')}>
                    <CustomerLocation
                    id={id as string}
                    isOpenModalLocation={isOpenModalLocation}
                    setIsOpenModalLocation={setIsOpenModalLocation}
                    onChangeLocationNumber={handleChangeLocationNumber}
                    />
                </div>,
                closeIcon: <></>,
                nameHead: 'location'
            }
        ]

        const toolsFilter = []

        // When this Customer have projects with no tools assign to it
        if (projectEmptyTools.length !== 0) {
            toolsFilter.push({
                toolName: t('no_tools'),
                projectsBasedOnToolName: projectEmptyTools,
            })
        }

        // for (const toolName of tools) {
        for (let i = 0; i < tools.length; i++) {
            let projectsBasedOnToolName: Project[] = []

            projectsBasedOnToolName = [...projectsBasedOnToolName, ...projectList.filter(p => p.tools?.includes(tools[i]))]

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
                id: `${i + 3}`,
                label:
                    <div>
                        <span>{`${t(toolsFilter[i].toolName, { ns: 'config' })}`}</span>
                        <span
                            style={{
                                border: '1px solid ',
                                borderColor: activeKey === `${i + 3}` ? 'var(--primary-color)' : '#636463',
                                borderRadius: '100%',
                                padding: '1px 5px',
                                color: 'white',
                                backgroundColor: activeKey === `${i + 3}` ? 'var(--primary-color)' : '#636463',
                                fontSize: '12px',
                                marginLeft: '8px'
                            }}
                        >{`${toolsFilter[i].projectsBasedOnToolName.length}`}
                        </span>
                    </div>,
                children: <div className={cx('contentTab', 'contentTabProject')}>
                    <Space direction="horizontal" size={50} style={{ display: 'flex' }} wrap>
                        {toolsFilter[i].projectsBasedOnToolName.map(pro => <ProjectCard key={pro.id} project={pro} openModal={handleOnOpenModal} />)}
                    </Space>
                </div>,
                closeIcon: <></>,
                nameHead: toolsFilter[i].toolName
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
    }, [tools, t, errorMessage, customerData, dynamicFields, projectList, id, activeKey, isOpenModalLocation, locationNumber, projectEmptyTools, cache])

    const handleOnCloseModal = useCallback(() => {
        setSelected(undefined)
        setIsOpenModal(false)
    }, [])

    const successfullyForm = useCallback(
        () => {
            successToast(t('update_successfully', { name: data?.company }))
            // setCustomerData(undefined)
            // setDynamicFields([])
            setErrorMessage([])
            dispatch(clearUpdateCustomer())
        }, [dispatch, data?.customerNumber, t],
    );

    const onHandleUpdateCustomer = () => {
        dispatch(clearUpdateCustomer())
        const data = new FormData();
        data.append('dynamicFields', JSON.stringify(dynamicFields));

        const errMessage: string[] = [];

        if (customerData?.customerNumber) {
            data.append('customerNumber', customerData.customerNumber);
        }
        else {
            data.append('customerNumber', " ");
        }

        if (customerData?.street) {
            data.append('street', customerData.street);
        } else {
            errMessage.push(t('field_is_required', { field: t('street') }))
        }

        if (customerData?.location) {
            data.append('location', customerData.location);
        } else {
            errMessage.push(t('field_is_required', { field: t('location') }))
        }

        if (customerData?.postcode) {
            data.append('postcode', customerData.postcode);
        } else {
            errMessage.push(t('field_is_required', { field: t('postcode') }))
        }

        if (customerData?.company) {
            data.append('company', customerData.company);
        } else {
            errMessage.push(t('field_is_required', { field: t('company') }))
        }

        if (customerData) {
            data.append('logo', customerData?.logo);
        }

        if (customerData?.logoUpload) {
            data.append('newLogo', customerData.logoUpload as Blob);
        }

        if (customerData?.map) {
            data.append('map', JSON.stringify(customerData.map));
        }

        if (customerData?.email) {
            data.append('email', customerData.email);
        }

        if (customerData?.contactPerson) {
            data.append('contactPerson', customerData.contactPerson);
        }

        if (customerData?.telephone) {
            const isValidTelephone = validateDataByRegex(customerData?.telephone, REGEX_HELPER.phone);
            if (isValidTelephone) {
                data.append('telephone', customerData.telephone);
            } else {
                errMessage.push(t('phone_invalid'))
            }
        }
        if (errMessage.length > 0) {
            setErrorMessage(errMessage)
            return;
        }

        dispatch(removeCache(customerData?.logo))
        dispatch(updateCustomer({ id, data }))
    }

    const titleTabs = tabs?.filter((value) => value?.id === activeKey)

    const elementHeader = (): ReactNode => {
        return <TitlePage
            pageName='general_data'
            name={titleTabs[0]?.nameHead}
            createButton={
                <div className={cx('title-page-function')}>
                    <div>
                        <CustomerConfirmDelete id={id}/>
                    </div>
                    <div>
                        <AppButton style={{ minWidth: '100px', fontSize: '1.1rem' }} size='small' className={cx('saveBtn')} onClick={() => onHandleUpdateCustomer()}>
                            <span>{t('save')}</span>
                        </AppButton>
                    </div>
                </div>
            } />
    }

    const onHandleBackToListPage = useCallback(() => {
        push('/customer', '/customer', {locale})
    }, [locale, push])

    useEffect(() => {
        setErrorMessage([])
        dispatch(clearUpdateCustomer())
        loadCustomerById();
        loadLocationById();

        return () => {
            dispatch(clearUpdateCustomer())
            dispatch(removeCache(customerData?.logo))
            dispatch(removeCache(customerData?.map))
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
    }, [dynamicFields, customerData, setHeadElement, isLoading, activeKey])

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
            {pageLoading ? <PageLoading /> : null}
            <Head>
                <title>{titlePage}</title>
            </Head>
            <div className={cx('container')}>
                <AppTab
                    isShowBtnLocation={true}
                    tabs={tabs}
                    activeKey={activeKey}
                    setActiveKey={setActiveKey}
                    btnBack={true}
                    btnBackDisabled={isFetching}
                    onHandleAdd={onHandleCreateNewProject}
                    setIsOpenModalLocation={setIsOpenModalLocation}
                    onHandleBack={onHandleBackToListPage}
                />
                <ProjectModal isOpen={isOpenModal} onClose={handleOnCloseModal} projectModal={selected} onChangeToolsSelectedProject={handleChangeToolSelectedProject} />
            </div>
        </>
    );
};

export default EditCustomerPage;

EditCustomerPage.Layout = UserLayout;

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
