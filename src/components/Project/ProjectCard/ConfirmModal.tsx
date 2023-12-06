import React, { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'next-i18next'
import { Project } from '@/models/project'
import styles from './ProjectCard.module.scss'
import { useAppDispatch, useAppSelector } from '@/hooks'
import { deleteProject } from '@/store/actions/project.action'
import { clearDeleteProject, selectProject } from '@/store/slices/project/project.slice'
import { toast } from 'react-toastify'
import ModalApp from '@/components/ModalApp'

import AppButton from '@/components/Button'

const ConfirmModal: React.FC<{
    isOpen: boolean | undefined
    onClose: () => void
    project: Project | undefined
}> = ({ isOpen, onClose, project }) => {
    const { t } = useTranslation()
    const [isLoading, setIsLoading] = useState<boolean>(false)

    const dispatch = useAppDispatch()
    const { isDeleting, isDeleted, errorDelete } = useAppSelector(selectProject)

    useEffect(() => {
        return () => {
            dispatch(clearDeleteProject())
            setIsLoading(false)
        }
    }, [dispatch])

    useEffect(() => {
        setIsLoading(isDeleting)

        if (isDeleted) {
            toast.success(t('delete_successfully'), {
                position: 'top-right',
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: 'colored',
                style: { backgroundColor: styles.success },
            })
            onClose()
        }

        if (errorDelete?.length > 0) {
            errorDelete.map((msg: string) => {
                toast.error(msg, {
                    position: 'top-right',
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: 'colored',
                    style: { backgroundColor: styles.error },
                })
            })
        }
    }, [t, onClose, isDeleting, isDeleted, errorDelete])

    const handleDeleteProject = useCallback(() => {
        setIsLoading(true)
        dispatch(deleteProject(project?.id ?? ''))
    }, [dispatch, project])

    return (
        <ModalApp
            title={t('delete_confirmation')}
            open={isOpen ? isOpen : false}
            onCancel={onClose}
            width={400}
            renderFooter={
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <AppButton onClick={handleDeleteProject} loading={isLoading}>
                        {t('confirm')}
                    </AppButton>
                    <AppButton type='ghost' onClick={() => onClose()}>
                        {t('cancel')}
                    </AppButton>
                </div>
            }
        >
            <div className={styles.modalContent}>
                {t('question_delete', { name: project?.name })}
            </div>
        </ModalApp>
    )
}

export default ConfirmModal
