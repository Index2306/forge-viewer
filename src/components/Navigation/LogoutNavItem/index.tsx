import IconAction from '@/components/IconAction'
import Link from 'next/link'

import styles from './LogoutNavItem.module.scss'
import classNames from 'classnames/bind'
const cx = classNames.bind(styles)

export default function LogoutNavItem() {
    return (
        <div className={cx('logout-wrapper')}>
            <Link href='/auth/logout'>
                <IconAction
                    src='/assets/icons/icon_logout.svg'
                    className={cx('logout-icon')}
                    isHover={false}
                    title='logout_icon'
                    size='small'
                />
            </Link>
        </div>
    )
}
