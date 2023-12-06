import React, { ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import UserLayout from '@/components/Layouts/user'
import { GetStaticProps } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import Head from 'next/head'
import { useTranslation } from 'next-i18next'
import { HomeContext } from '@/context/HomeContext'
import TitlePage from '@/components/TitlePage'
import AppButton from '@/components/Button'
import { Icon } from '@chakra-ui/react'
import { AiOutlinePlus } from 'react-icons/ai'
import { Col, ConfigProvider, Row, Table, TableProps } from 'antd'
import styles from '@/styles/Customer.module.scss'
import { BsArrowDown, BsArrowDownUp, BsArrowUp } from 'react-icons/bs'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { OperatorModel, SortType } from '@/models'
import AppEmpty from '@/components/Empty'
import DataLoading from '@/components/AppLoading/DataLoading'
import { useAppDispatch } from '@/hooks'
import { getAllOperator } from '@/store/actions/operator.action'
import { errorToast } from '@/helpers/Toast'
import { HiOutlineWrenchScrewdriver } from 'react-icons/hi2'
import { IconType } from 'react-icons'
import { AppContext } from '@/context/AppContext'
import { ANT_THEME } from '@/contants/common'

import classNames from 'classnames/bind'
import PageLoading from "@/components/AppLoading/PageLoading";
const cx = classNames.bind(styles)

const DEFAULT_PAGE_SIZE = 10

const initialColumns = [
    { key: 'company', dataIndex: 'company' },
    { key: 'street', dataIndex: 'street' },
    { key: 'postcode', dataIndex: 'postcode' },
    { key: 'location', dataIndex: 'location' },
    { key: 'telephone', dataIndex: 'telephone' },
    { key: 'email', dataIndex: 'email' },
]

const OperatorPage = () => {
    const { t } = useTranslation(['common'])
    const { locale, push } = useRouter()
    const titlePage = `${t('operator')} | ${process.env.NEXT_PUBLIC_APP_NAME}`
    const { setHeadElement } = useContext(HomeContext)
    const { isLoading } = useContext(AppContext)
    const dispatch = useAppDispatch()

    const [operatorData, setOperatorData] = useState<OperatorModel[]>([])
    const [isFetching, setIsFetching] = useState<boolean>(true)
    const [pageNumber, setPageNumber] = useState<number>(1)
    const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE)
    const [totalRecord, setTotalRecord] = useState<number>(0)
    const [isChangePage, setIsChangePage] = useState<boolean>(false)
    const [sorts, setSorts] = useState<SortType[] | undefined>(undefined)
    const [search, setSearch] = useState<string | null>(null)

    const loadOperatorList = useCallback(
        (searchQuery?: any) => {
            setIsFetching(true)
            dispatch(
                getAllOperator({
                    pageNumber,
                    pageSize,
                    sorts: [...(sorts ?? [])],
                    search: searchQuery,
                }),
            )
                .then((response) => {
                    setIsFetching(false)

                    if ('payload' in response) {
                        if (!response.payload.succeeded) {
                            response.payload.errors.map((v: string) => errorToast(v))
                            return
                        }

                        const {
                            pageNumber: pn,
                            pageSize: ps,
                            totalRecords: tr,
                            items,
                        } = response.payload.result
                        setOperatorData(items.map((v: OperatorModel) => ({ ...v, key: v.id })))
                        setPageNumber(pn)
                        setPageSize(ps)
                        setTotalRecord(tr)
                        return
                    }
                    errorToast(t('error_loading_data'))
                })
                .catch((err) => {
                    setIsFetching(false)
                    errorToast(t('error_loading_data'))
                })
        },
        [dispatch, pageNumber, pageSize, t, sorts],
    )

    const getIconSort = useCallback(
        (key: string): IconType => {
            const find: any = sorts?.find((sort: SortType) => sort.name === key)
            if (find?.status === 0) return BsArrowUp
            if (find?.status === 1) return BsArrowDown
            return BsArrowDownUp
        },
        [sorts],
    )

    const onChangeSort = useCallback(
        (key: string) => {
            setSorts([])
            const find: any = sorts?.find((sort: any) => sort.name === key)
            if (find === undefined) {
                const newSort: SortType = { name: key, status: 0 }
                setSorts((prev) => [...(prev ?? []), newSort])
                return
            }

            find.status += 1
            if (find.status > 1) {
                setSorts((prev) => [...(prev ?? [])].filter((v) => v.name !== key))
            } else {
                setSorts((prev) => [...[...(prev ?? [])].filter((v) => v.name !== key), find])
            }
        },
        [sorts],
    )

    const columns = useMemo(() => {
        return initialColumns.map(({ key, dataIndex }) => {
            return {
                title: (
                    <p>
                        <span>{t(key)}</span>{' '}
                        <Icon
                            onClick={() => onChangeSort(dataIndex)}
                            className={cx('iconSort')}
                            as={getIconSort(dataIndex)}
                        />
                    </p>
                ),
                dataIndex,
            }
        })
    }, [t, onChangeSort, getIconSort])

    useEffect(() => {
        setHeadElement(elementHeader())
    }, [setHeadElement, isLoading]) // "isLoading" should be here that support switch language the right way

    useEffect(() => {
        loadOperatorList()

        return () => {
            setOperatorData([])
            setIsFetching(true)
            setPageNumber(1)
            setPageSize(pageSize)
            setTotalRecord(0)
            setIsChangePage(false)
        }
    }, [])

    // handle get sorts
    useEffect(() => {
        if (sorts) {
            loadOperatorList()
        }
    }, [sorts])

    // Handle get search
    useEffect(() => {
        if (search === undefined) return
        const timeOutId = setTimeout(() => {
            loadOperatorList(search)
        }, 500)

        return () => clearTimeout(timeOutId)
    }, [search])

    useEffect(() => {
        if (isChangePage) {
            loadOperatorList()
        }

        return () => setIsChangePage(false)
    }, [isChangePage])

    const onChange: TableProps<OperatorModel>['onChange'] = (
        pagination,
        filters,
        sorter,
        extra,
    ) => {
        // console.log('params', pagination, filters, sorter, extra);
    }

    const handleOnSearch = (value: any) => {
        setPageSize(pageSize)
        setPageNumber(1)
        setSearch(value)
    }

    const onChangePage = (page: number, pageSize: number) => {
        setPageSize(pageSize)
        setPageNumber(page)
        setIsChangePage(true)
    }

    const elementHeader = (): ReactNode => {
        return (
            <TitlePage
                pageName='general_data'
                name='operator'
                search={handleOnSearch}
                createButton={
                    <div className={cx('title-page-btn')}>
                        <Link href='/operator/create' locale={locale}>
                            <AppButton
                                fullHeight
                                flat
                                fullWidth
                                icon={
                                    <div className={cx('title-page-btn__icon')}>
                                        <div style={{ fontSize: '20px', alignSelf: 'center' }}>
                                            <HiOutlineWrenchScrewdriver />
                                        </div>
                                        <div
                                            style={{
                                                fontSize: '16px',
                                                alignSelf: 'flex-start',
                                                marginLeft: '-2px',
                                            }}
                                        >
                                            <AiOutlinePlus />
                                        </div>
                                    </div>
                                }
                            >
                                {`${t('new')} ${t('operator')}`}
                            </AppButton>
                        </Link>
                    </div>
                }
            />
        )
    }
    return (
        <>
            {/* ------------------------------------------------ LOADING */}

            {isFetching ? (
              <PageLoading />
            ) : null}

            {/* ------------------------------------------------ MAIN CONTENT */}
            <Head>
                <title>{titlePage}</title>
            </Head>
            <div className={cx('container')}>
                <ConfigProvider theme={ANT_THEME}>
                    <Table
                        locale={{ emptyText: <AppEmpty message={t('no_operator')} /> }}
                        className={cx('table')}
                        columns={columns}
                        dataSource={operatorData}
                        onChange={onChange}
                        pagination={{
                            position: ['bottomCenter'],
                            pageSize: pageSize,
                            total: totalRecord,
                            current: pageNumber,
                            onChange: onChangePage,
                        }}
                        rowKey={(record) => record.id}
                        onRow={(record, rowIndex) => {
                            return {
                                onClick: (event) => {
                                    push(`/operator/${record.id}`, `/operator/${record.id}`, {
                                        locale,
                                    })
                                }, // click row
                            }
                        }}
                    />
                </ConfigProvider>
            </div>
        </>
    )
}

export default OperatorPage

OperatorPage.Layout = UserLayout

export const getStaticProps: GetStaticProps = async ({ locale }) => {
    return {
        props: {
            ...(await serverSideTranslations(locale ?? 'en')),
        },
    }
}
