import { UserOutlined } from '@ant-design/icons'
import styles from './AccountNavItem.module.scss'
import classNames from 'classnames/bind'
import { useState } from 'react'
const cx = classNames.bind(styles)

export default function AccountNavItem() {
    const [open, setOpen] = useState<boolean>(false)
    return (
        <>
            {/* ---------------------------------------------- Modal Account Nav item */}
            <div onClick={() => setOpen(prev => !prev)}>
              <UserOutlined style={{ color: '#fff', fontSize: '24px', cursor: 'pointer' }} />
            </div>

            {/* ---------------------------------------------- Modal Account Nav item */}
        </>
    )
}
