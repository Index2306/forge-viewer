import React, { useState } from 'react'
import { Flex, Spacer } from '@chakra-ui/react'
import styles from './NewField.module.scss'
import { AiOutlinePlus } from 'react-icons/ai'
import { Popover } from 'antd'
import FormAdd from '@/components/NewField/FormAdd'
import { useTranslation } from 'next-i18next'
import { NewFieldType } from '@/models'
import { TooltipPlacement } from 'antd/es/tooltip'

import classNames from 'classnames/bind'
const cx = classNames.bind(styles)

const NewField: React.FC<NewFieldProps> = ({ onAddNewField, placement }) => {
    const { t } = useTranslation()

    const [isOpen, setIsOpen] = useState<boolean>(false)

    const handleOpenChange = (newOpen: boolean) => {
        setIsOpen(newOpen)
    }

    return (
        <Flex>
            <Spacer />
            <Popover
                open={isOpen}
                onOpenChange={handleOpenChange}
                placement={placement ? placement : 'left'}
                content={<FormAdd onFinish={onAddNewField} setOpen={handleOpenChange} />}
                title={t('new_field')}
                trigger='click'
                overlayInnerStyle={{width: '240px'}}
            >
                <span className={cx('newField')}>
                    {t('new_field')} <AiOutlinePlus />
                </span>
            </Popover>
        </Flex>
    )
}

export default NewField

interface NewFieldProps {
    onAddNewField: (value: NewFieldType) => boolean
    placement?: TooltipPlacement
}
