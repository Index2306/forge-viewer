import Link from 'next/link'
import Image from 'next/image'
import SettingDropdown from './SettingNavItem/SettingDropdown'
import { useRouter } from 'next/router'
import LogoutNavItem from './LogoutNavItem'

import styles from './Navigation.module.scss'
import classNames from 'classnames/bind'
import { UserOutlined } from '@ant-design/icons'
import AccountNavItem from './AccountNavItem'
import SettingNavItem from './SettingNavItem'
const cx = classNames.bind(styles)

export default function Navigation() {
    const { locale } = useRouter()

    return (
        <nav className={cx('navigation-wrapper')}>

            {/* ---------------------------------------------- Navigation main */}

            <div className={cx('navigation-main')}>

                {/* ---------------------------------------------- Speam logo */}

                <div className={cx('navigation-main__logo')}>
                    {/* <Link href='/' locale={locale}>
                        <Image
                            src='/assets/img/logo_speamplan--white.svg'
                            alt='speam_logo'
                            width={170}
                            height={40}
                        />
                    </Link> */}
                </div>

                {/* ---------------------------------------------- Menu icon */}

                <div className={cx('navigation-main__menu-icon-list')}>
                    <div className={cx('navigation-main__menu-icon-item', 'account-nav-item')}>
                        <AccountNavItem />
                    </div>
                    <div className={cx('navigation-main__menu-icon-item', 'setting-nav-item')}>
                        <SettingNavItem />
                    </div>
                </div>
            </div>

            {/* ---------------------------------------------- Navigation logout */}

            <div className={cx('navigation-logout')}>
                <LogoutNavItem />
            </div>
        </nav>
    )
}
