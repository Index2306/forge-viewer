import React, { useState } from 'react'
import { Dropdown } from 'antd'
import { useTranslation } from 'next-i18next'

import { FiSettings } from 'react-icons/fi'

import DropdownNav, { DropdownNavMenuItemType } from '../../DropdownNav'
import IconAction from '@/components/IconAction'
import LanguageSetting from './LanguageSetting'

import classNames from 'classnames/bind'
import styles from './SettingDropdown.module.scss'
const cx = classNames.bind(styles)

const SettingDropdown: React.FC = () => {
    const { t } = useTranslation('common')

    const menuItems: DropdownNavMenuItemType[] = [
        {
            label: (
                <div className={cx('setting-dropdown__menu-item')}>
                    <IconAction
                        className={cx('setting-dropdown__menu-item__icon')}
                        src={`/assets/icons/icon_language.svg`}
                        title={'switch_language'}
                        isHover={false}
                        customSize={20}
                    />
                    <span className={cx('setting-dropdown__menu-item__text')}>{t('language', {ns: 'common'})}</span>
                </div>
            ),
            children: LanguageSetting().languageItems,
        },
        // {
        //     label: <span>Level 1 Item 2</span>,
        //     children: [],
        // },
    ]

    const [dropDownOpen, setDropdownOpen] = useState(false)

    return (
        <div className={cx('setting-dropdown')}>
            <Dropdown
                trigger={['click']}
                placement='bottomRight'
                arrow={false}
                overlayClassName={cx('setting-dropdown__main')}
                open={dropDownOpen}
                dropdownRender={() => (
                    <DropdownNav onOpenChange={setDropdownOpen} items={menuItems} />
                )}
                onOpenChange={(isOpen) => {
                    setDropdownOpen(isOpen)
                }}
            >
                <div className={cx('setting-dropdown__icon')}>
                    <FiSettings/>
                </div>
            </Dropdown>
        </div>
    )
}

export default SettingDropdown
