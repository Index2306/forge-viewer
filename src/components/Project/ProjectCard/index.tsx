import React, { useCallback, useEffect, useState } from 'react'
import { Project, ProjectModalType } from '@/models/project'
import { Dropdown, MenuProps } from 'antd'
import { AiFillEdit, AiOutlineEllipsis } from 'react-icons/ai'
import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'
import { useAppSelector } from '@/hooks'
import { selectEditProject } from '@/store/slices/project/edit-project.slice'
import AppImageAntd from '@/components/AppImage/AppImageAntd'
import Cookies from 'js-cookie'

import AppButton from '@/components/Button'

import Image from 'next/image'
import TooltipApp from "@/components/TooltipApp";

import classNames from 'classnames/bind'
import styles from './ProjectCard.module.scss'
const cx = classNames.bind(styles)

const ProjectCard: React.FC<{
    project: Project
    openModal?: (projData: ProjectModalType) => void
}> = ({ project, openModal }) => {
    const { locale, push } = useRouter()
    const { t } = useTranslation()

    const [projectData, setProjectData] = useState<Project>(project)
    const [isOpenInfo, setIsOpenInfo] = useState<boolean>(false)

    const { data: projectEdited } = useAppSelector(selectEditProject)

    useEffect(() => {
        setProjectData(project)
    }, [project])

    useEffect(() => {
        if (projectEdited && projectEdited.id === projectData.id) {
            setProjectData(projectEdited)
        }
    }, [projectEdited])

    const handleOpenModal = useCallback(
        (projectData: ProjectModalType) => {
            setIsOpenInfo(false)
            if (openModal) {
                openModal(projectData)
            }
        },
        [openModal],
    )

    const items = useCallback(() => {
        const arrItem: MenuProps['items'] = [
            {
                label: (
                    <div
                        className={cx('project-card__dropdown-menu-item')}
                        onClick={() => handleOpenModal({ project: projectData, type: 'edit' })}
                    >
                        <span className={cx('project-card__dropdown-menu-item__icon')}>
                            <AiFillEdit />
                        </span>
                        <span
                            data-class='label__project-card__dropdown-option'
                            className={cx('project-card__dropdown-menu-item__text')}>{t('edit')}</span>
                    </div>
                ),
                key: '0',
            },
            {
                type: 'divider',
            },
            {
                label: (
                    <div
                        className={cx('project-card__dropdown-menu-item')}
                        onClick={() => handleOpenModal({ project: projectData, type: 'delete' })}
                    >
                        <Image
                            src={`/assets/icons/icon_delete.svg`}
                            width={20}
                            height={20}
                            alt={'icon_delete'}
                            className={cx('project-card__dropdown-menu-item__icon')}
                        />
                        <span
                            data-class='label__project-card__dropdown-option'
                            className={cx('project-card__dropdown-menu-item__text')}>{t('delete')}</span>
                    </div>
                ),
                key: '2',
            },
        ]

        return arrItem
    }, [handleOpenModal, projectData])

    const goToProject = useCallback(() => {
        push(`/tool/${projectData.id}`, `/tool/${projectData.id}`, { locale })
    }, [push, projectData, locale])

    return (
        <div className={cx('project-card')}>
            <div className={cx('project-card__btn-call-to-action', {'is-active': isOpenInfo})}>
                <Dropdown
                    overlayClassName={cx('project-card__dropdown-menu')}
                    menu={{ items: items() }}
                    trigger={['click']}
                    onOpenChange={() => setIsOpenInfo((prev) => !prev)}
                >
                    <a onClick={(e) => e.preventDefault()}>
                        <AiOutlineEllipsis className={cx('project-card__btn-call-to-action__icon')} />
                    </a>
                </Dropdown>
            </div>
            <div className={cx('project-card__thumbnail')} onClick={() => goToProject()}>
                <AppImageAntd
                    className={cx('project-card__thumbnail__img')}
                    width={200}
                    height={200}
                    url={typeof projectData?.thumbnail === 'string' ? projectData?.thumbnail : ''}
                    token={Cookies.get('access_token')}
                    preview={false}
                    fallback={'/assets/img/fallback-img.png'}
                    alt={projectData.name}
                    isReload={projectEdited && projectEdited.id == project.id}
                />

                {/*<Image  width={200}*/}
                {/*        height={200}*/}
                {/*        src={typeof projectData?.thumbnail === 'string' ? projectData?.thumbnail : ''}*/}
                {/*        fallback='/assets/img/fallback-img.png'*/}
                {/*        preview={false}*/}
                {/*        alt={projectData.name}*/}
                {/*        className={styles.thumbnailImage}*/}
                {/*/>*/}
            </div>
            <div className={cx('project-card__btn-project-name')} onClick={() => goToProject()}>
                <TooltipApp placement='bottom' title={projectData.name}>
                    <AppButton style={{ textTransform: 'none' }} fullWidth flat>
                        <span data-class="label__project-card__project-name">
                            {projectData.name}
                        </span>
                    </AppButton>
                </TooltipApp>
            </div>
        </div>
    )
}

export default React.memo(ProjectCard)
