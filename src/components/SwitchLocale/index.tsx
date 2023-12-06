import React from 'react'
import { useRouter } from 'next/router'
import { Dropdown, MenuProps } from 'antd'
import Image from 'next/image'
import IconAction from '../IconAction'

import styles from './SwitchLocale.module.scss'
import classNames from 'classnames/bind'
const cx = classNames.bind(styles)

const SwitchLocale: React.FC<SwitchLocaleProps> = ({
    size,
    dark
}) => {
    const { asPath, locales, push } = useRouter()

    const items: MenuProps['items'] = locales?.map((value) => {
        return {
            label: (
                <div className={cx('switch-locale__menu-item')} onClick={() => changeLocale(value)}>
                    <Image
                        src={`/assets/img/${value}.png`}
                        width={size}
                        height={size}
                        alt={value}
                    />
                    <span className={cx('switch-locale__menu-item__text')}>{value === 'en' ? 'English' : 'Deutsch'}</span>
                </div>
            ),
            key: value,
        }
    })

    const changeLocale = (l: string) => {
        push(asPath, asPath, { locale: l })
    }

    return (
        <div className={cx('switch-locale')}>
            <Dropdown
                menu={{ items }}
                trigger={['click']}
                placement='bottomRight'
                arrow={false}
            >
                <IconAction
                    className={cx('switch-locale__icon', `${dark ? 'switch-locale__icon-dark' : ''}`)}
                    src={`/assets/icons/icon_language.svg`}
                    title={'switch_language'}
                    isHover={false}
                    customSize={size}
                />
            </Dropdown>
        </div>
    )
}

export default SwitchLocale

interface SwitchLocaleProps {
    size: number
    dark?: boolean
}