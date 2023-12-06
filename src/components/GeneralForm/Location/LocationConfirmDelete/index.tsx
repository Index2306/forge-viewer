import React, {useEffect, useState} from 'react';
import ModalConfirmDelete from "@/components/ModalConfirmDelete";
import {deleteLocation} from "@/store/actions/location.action";
import {errorToast, successToast} from "@/helpers/Toast";
import {useAppDispatch} from "@/hooks";
import {useTranslation} from "next-i18next";

const LocationConfirmDelete : React.FC<LocationConfirmDeleteProps> = ({id, onHandleCancel, onHandleRemoveNewData}) => {
    const dispatch = useAppDispatch();
    const {t} = useTranslation();

    const [isOpenModalConfirmDelete, setIsOpenModalConfirmDelete] = useState<boolean>(false);
    const [isFetching, setIsFetching] = useState<boolean>(false);

    useEffect(() => {
        return () => {
            setIsOpenModalConfirmDelete(false)
            setIsFetching(false)
        }
    }, [])

    const onHandleDelete = () => {

        // You must change the value of 'open' in the modal to true.
        setIsOpenModalConfirmDelete(true)

        setIsFetching(true)
        dispatch(deleteLocation(id as string ?? '')).unwrap().then(response => {
            if (response.succeeded) {
                successToast(t('delete_successfully'))
                onHandleCancel?.()
                onHandleRemoveNewData?.(id)
            } else {
                errorToast(t('delete_error'))
            }
        }).catch((errors) => {
            // errors.map((err: string) => errorToast(err))
            errorToast(t('delete_error'))
        }).finally(() => {
            setIsFetching(false)
            setIsOpenModalConfirmDelete(false)
        })
    }

    if (!id) return null;
    return (
        <>
            <ModalConfirmDelete callback={() => onHandleDelete()} isOpen={isOpenModalConfirmDelete} isFetching={isFetching}/>
        </>
    );
};

export default React.memo(LocationConfirmDelete);

interface LocationConfirmDeleteProps {
    id?: string | string[] | undefined
    onHandleCancel?: (val?: any) => void
    onHandleRemoveNewData?: (val?: any) => void
}