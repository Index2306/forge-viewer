import DataLoading from "@/components/AppLoading/DataLoading";
import AppEmpty from "@/components/Empty";
import CustomerLocationModal from "../CustomerLocationModal";
import { errorToast } from "@/helpers/Toast";
import { useAppDispatch } from "@/hooks";
import { LocationModel } from "@/models";
import { getAllLocationByCustomerId } from "@/store/actions/location.action";
import styles from "@/styles/Customer.module.scss";
import { ConfigProvider, Table } from "antd";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import React, {useEffect, useMemo, useState} from 'react';
import { ANT_THEME } from "@/contants/common";

const initialColumns = [
    {key: 'company', dataIndex: 'company'},
    {key: 'street', dataIndex: 'street'},
    {key: 'postcode', dataIndex: 'postcode'},
    {key: 'location', dataIndex: 'location'},
    {key: 'telephone', dataIndex: 'telephone'},
    {key: 'email', dataIndex: 'email'},
]

const CustomerLocation: React.FC<CustomerLocationProps> = ({
    id,
    isOpenModalLocation,
    setIsOpenModalLocation,
    onChangeLocationNumber,
}) => {
    const { locale, push } = useRouter()
    const { t } = useTranslation()
    const dispatch = useAppDispatch();

    const [data, setData] = useState<LocationModel[]>([])
    const [isFetching, setIsFetching] = useState<boolean>(true)

    const [selected, setSelected] = useState<string | undefined>(undefined)

    useEffect(() => {
        dispatch(getAllLocationByCustomerId(id)).unwrap()
            .then(response => {
                setIsFetching(false)
                if (response.succeeded) {
                    setData(response.result.map((val: LocationModel) => ({ ...val, key: val.id })))
                    return;
                }
                response.errors.map((err: string) => errorToast(err))
            })
            .catch(() => {
                errorToast(t('error_loading_data'))
                setIsFetching(false)
            })
    }, [])


    const columns = useMemo(() => {
        return initialColumns.map(({key, dataIndex}) => {
            return {
                title: <p><span>{t(key)}</span></p>,
                dataIndex,
            }
        })
    }, [t])

    const onHandleCancel = () => {
        setSelected(undefined)
        setIsOpenModalLocation(false)
    }

    const onHandleAddNewData = (data: LocationModel) => {
        setData(prev => {
            const result = [...prev, { ...data, key: data?.id }]
            onChangeLocationNumber!(result.length)
            return result
        })
    }

    const onHandleRemoveNewData = (id: string | undefined) => {
        setData(prev => {
            const result = [...prev].filter(d => d.id !== id)
            onChangeLocationNumber!(result.length)
            return result
        })
    }

    const onHandleUpdateData = (data: LocationModel) => {
        setData(prev => [...prev].map((d: LocationModel) => {
            if (d.id === data.id) {
                return data;
            }
            return d;
        }))
    }

    return (
        <div className={styles.containerContentTab}>
            {isFetching ? <DataLoading /> : null}
            <ConfigProvider theme={ANT_THEME}>
                <Table locale={{ emptyText: <AppEmpty message={t('no_location')}/> }}
                    className={styles.table}
                    style={{ marginTop: '12px' }}
                    columns={columns}
                    dataSource={data}
                    // pagination={{ position: ['bottomCenter'] }}
                    pagination={false}
                    onRow={(record, rowIndex) => {
                        return {
                            onClick: (event) => {
                                setSelected(record.id);
                                setIsOpenModalLocation(true);
                            }, // click row
                        };
                    }} />
            </ConfigProvider>
            <CustomerLocationModal
                customerId={id}
                locationId={selected}
                isOpen={isOpenModalLocation}
                isCreate={!selected}
                onHandleCancel={onHandleCancel}
                onHandleAddNewData={onHandleAddNewData}
                onHandleRemoveNewData={onHandleRemoveNewData}
                onHandleUpdateData={onHandleUpdateData} />
        </div>
    );
};

export default CustomerLocation;

export interface CustomerLocationProps {
    id: string,
    isOpenModalLocation: boolean,
    setIsOpenModalLocation?: any
    onChangeLocationNumber?: (value: number) => void
}