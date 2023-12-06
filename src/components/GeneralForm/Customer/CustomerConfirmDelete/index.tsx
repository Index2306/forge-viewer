import React, {useCallback, useEffect, useState} from 'react';
import MultipleConfirmDelete from "@/components/ModalConfirmDelete/MultipleConfirmDelete";
import ModalConfirmDelete from "@/components/ModalConfirmDelete";
import {errorToast, successToast} from "@/helpers/Toast";
import {useAppDispatch} from "@/hooks";
import {useRouter} from "next/router";
import {useTranslation} from "next-i18next";
import {autoLineBreakText} from "@/helpers/StringHelper";
import {deleteCustomer} from "@/store/actions/customer.action";
import {clearUpdateCustomer} from "@/store/slices/customer/update-customer.slice";

const CustomerConfirmDelete : React.FC<CustomerConfirmDeleteProps> = ({id}) => {
    const { locale, query, push } = useRouter()
    const {t} = useTranslation()
    const dispatch = useAppDispatch();

    const [customerId, setCustomerId] = useState<string | string[] | undefined>(undefined)
    const [isDeleteProjects, setIsDeleteProjects] = useState<boolean>(false)
    const [isOpenChildModal, setIsOpenChildModal] = useState<boolean>(false)
    const [isFetching, setIsFetching] = useState<boolean>(false)

    useEffect(() => {
        setCustomerId(id)
        setIsDeleteProjects(false)

        return () => {
            setIsDeleteProjects(false)
            setCustomerId(undefined)
        }
    }, [id])

    const onHandleDeleteOperator = useCallback(() => {
        if (!customerId) return;
        setIsFetching(true)
        dispatch(deleteCustomer({id: customerId as string, deleteProjects: isDeleteProjects}))
            .unwrap()
            .then((response: any) => {
                if (response.succeeded) {
                    push('/customer', '/customer', { locale })
                    successToast(t('delete_successfully'))
                    dispatch(clearUpdateCustomer())
                    return;
                }
                errorToast(t('delete_error'))
            })
            .catch(_ => {
                errorToast(t('delete_error'))
            }).finally(() => {
                setIsOpenChildModal(false)
                setIsFetching(false)
        })
    }, [customerId, isDeleteProjects, push, locale, dispatch, t])

    const onHandleOkParentModal = useCallback(() => {
        setIsDeleteProjects(true)
        setIsOpenChildModal(true)
    }, [])

    const onHandleCancelParentModal = useCallback(() => {
        setIsDeleteProjects(false)
        setIsOpenChildModal(false)
    }, [])

    const onHandleCancelDeleteCustomer = useCallback(() => {
        setIsDeleteProjects(false)
        setIsOpenChildModal(false)
    }, [])

    if (!customerId) return null;
    return (
        <>
            <MultipleConfirmDelete
                title={t('confirm_delete_project_with_customer')}
                content={<div dangerouslySetInnerHTML={{__html: autoLineBreakText(t('question_confirm_delete_project_with_customer'))}}></div>}
                onOk={onHandleOkParentModal}
                onCancel={onHandleCancelParentModal}
            >
                <ModalConfirmDelete
                    key={'child_modal'}
                    title={t('confirm_delete_customer')}
                    content={t('question_confirm_delete_customer')}
                    callback={onHandleDeleteOperator}
                    onCancel={onHandleCancelDeleteCustomer}
                    hideButton={true}
                    isOpen={isOpenChildModal}
                    isFetching={isFetching}
                />
            </MultipleConfirmDelete>
        </>
    );
};

export default React.memo(CustomerConfirmDelete);

interface CustomerConfirmDeleteProps {
    id?: string | string[] | undefined
}