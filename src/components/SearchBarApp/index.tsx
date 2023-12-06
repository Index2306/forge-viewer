import { SearchOutlined } from '@ant-design/icons'
import styles from './SearchBarApp.module.scss'
import classNames from 'classnames/bind'
const cx = classNames.bind(styles)

export function SearchBarApp({onChangeSearch, searchValue, placeholder}: SearchBarAppProps) {
  return (
      <div className={cx('search-bar')}>
          <input
              type='text'
              className={cx('search-bar__input')}
              placeholder={placeholder}
              onChange={e => {
                  const text = e.target.value
                  onChangeSearch(text)
              }}
              value={searchValue}
              autoComplete="off"
          />
          <SearchOutlined className={cx('search-bar__icon')} />
      </div>
  )
}

interface SearchBarAppProps {
    onChangeSearch: (value: string) => void
    searchValue: string
    placeholder: string
}

