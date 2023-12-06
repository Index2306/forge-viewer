import React, {useState} from 'react';
import ModalConfirmDelete from "@/components/ModalConfirmDelete";
import {deleteOperator} from "@/store/actions/operator.action";
import {errorToast, successToast} from "@/helpers/Toast";
import {clearUpdateOperator} from "@/store/slices/operator/update-operator.slice";
import {useAppDispatch} from "@/hooks";
import {useRouter} from "next/router";
import {useTranslation} from "next-i18next";

const OperatorConfirmDelete : React.FC<OperatorConfirmDeleteProps>= ({id}) => {
    const dispatch = useAppDispatch()
    const { locale, query, push } = useRouter()
    const {t} = useTranslation();

    const [isOpenModalConfirmDelete, setIsOpenModalConfirmDelete] = useState<boolean>(false);
    const [isFetching, setIsFetching] = useState<boolean>(false);

    const onHandleDeleteOperator = () => {
        setIsFetching(true)
        dispatch(deleteOperator(id as string))
            .unwrap()
            .then(response => {
                if (response.succeeded) {
                    push('/operator', '/operator', { locale })
                    successToast(t('delete_successfully'))
                    dispatch(clearUpdateOperator())
                    return;
                }
                errorToast(t('delete_error'))
            })
            .catch(err => {
                errorToast(t('delete_error'))
            }).finally(() => {
                setIsOpenModalConfirmDelete(false)
                setIsFetching(false)
             })
    }

    return (
        <>
            <ModalConfirmDelete callback={onHandleDeleteOperator} isOpen={isOpenModalConfirmDelete} isFetching={isFetching}/>
        </>
    );
};

export default OperatorConfirmDelete;

interface OperatorConfirmDeleteProps {
    id?: string | string[] | undefined
}