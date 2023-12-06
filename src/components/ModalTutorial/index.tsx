import {useState} from 'react'
import ModalApp from '@/components/ModalApp'
import AppButton from '@/components/Button'
import {useTranslation} from 'react-i18next'

import styles from './ModalTutorial.module.scss'
import classNames from 'classnames/bind'
import Image from 'next/image'

const cx = classNames.bind(styles)

const imgHint = '/assets/icons/icon_information_02.svg';

export default function ModalTutorial({onUnderstandTutorial, imgTutorial, title, description, hint}: ModalTutorial) {
    const {t} = useTranslation(['tool', 'common'])
    // -------------------------------------------------------------- For modal tutorial
    const [openTutorialModal, setOpenTutorialModal] = useState(true)

    const handleClickUnderstand = () => {
        // Turn off Modal
        setOpenTutorialModal(false)
        // Control state from the Parent
        onUnderstandTutorial()
    }

    return (
        <ModalApp
            title={title}
            width={520}
            open={openTutorialModal}
            onCancel={() => {
                handleClickUnderstand()
            }}
            onOk={() => {
                handleClickUnderstand()
            }}
            renderFooter={
                <div style={{display: 'flex', justifyContent: 'flex-end'}}>
                    <AppButton
                        onClick={() => {
                            handleClickUnderstand()
                        }}
                    >
                        {t('understand', {ns: 'common'})}
                    </AppButton>
                </div>
            }
            maskClosable={false}
        >
            <div className={cx('modal-tutorial__content')}>
                {/* -------------------------------------------------------- DESCRIPTION */}{' '}
                <div
                    data-class='label__page-tool__modal-tutorial__description'
                    className={cx('modal-tutorial__description')}
                >
                    {description}
                </div>
                {/* -------------------------------------------------------- GIF IMAGE */}{' '}
                {imgTutorial && (
                    <div className={cx('modal-tutorial__image')}>
                        <Image
                            src={imgTutorial}
                            alt={title}
                            width={468}
                            height={263}
                        />
                    </div>
                )}
                {/* -------------------------------------------------------- IMAGE INFO */}{' '}
                <div
                    className={cx('modal-tutorial__hint')}
                >
                    <div
                        className={cx('modal-tutorial__hint__icon')}
                    >
                        <Image
                            src={imgHint}
                            alt='icon_info_02'
                            width={15}
                            height={15}
                        />
                    </div>
                    <div
                        data-class='label__page-tool__modal-tutorial__hint'
                        className={cx('modal-tutorial__hint__text')}
                    >
                        {hint}
                    </div>
                </div>
            </div>
        </ModalApp>
    )
}

interface ModalTutorial {
    onUnderstandTutorial: () => void
    imgTutorial?: string
    title: string
    description: string
    hint: string
}
