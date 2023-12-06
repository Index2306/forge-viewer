import Image from 'next/image'
import { useRouter } from 'next/router'

import { DropdownNavMenuItemType } from '../../DropdownNav'

import classNames from 'classnames/bind'
import styles from './SettingDropdown.module.scss'
const cx = classNames.bind(styles)

export default function LanguageSetting() {
    const { asPath, locales, push } = useRouter()

    const changeLocale = (l: string) => {
        push(asPath, asPath, { locale: l })
    }

    let languageItems: DropdownNavMenuItemType[] = []

    if (locales) {
        languageItems = locales?.map((value) => {
            return {
                label: (
                    <div
                        className={cx('setting-dropdown__menu-item')}
                        onClick={() => changeLocale(value)}
                    >
                        <Image
                            src={`/assets/img/${value}.png`}
                            width={20}
                            height={20}
                            alt={value}
                        />
                        <span className={cx('setting-dropdown__menu-item__text')}>
                            {value === 'en' ? 'English' : 'Deutsch'}
                        </span>
                    </div>
                ),
                children: [],
            }
        })
    }

    return {
        languageItems,
    }
}
