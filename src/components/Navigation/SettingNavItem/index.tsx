import { useState } from 'react'
import styles from './SettingNavItem.module.scss'
import classNames from 'classnames/bind'
import SettingNavItemModal from './SettingNavItemModal'
import { FiSettings } from 'react-icons/fi'
const cx = classNames.bind(styles)

export default function SettingNavItem() {
    const [open, setOpen] = useState<boolean>(false)
    return (
      <>
            {/* ---------------------------------------------- Modal Setting Nav item */}
            <div onClick={() => setOpen(prev => !prev)}>
              <FiSettings style={{ color: '#fff', fontSize: '24px', cursor: 'pointer' }} />
            </div>

            {/* ---------------------------------------------- Modal Setting Nav item */}
            <SettingNavItemModal open={open} setOpen={setOpen}/>
      </>
    )
}
