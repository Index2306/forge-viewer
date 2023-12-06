import styles from './ToolListTitle.module.scss'
import classNames from "classnames/bind"
const cx = classNames.bind(styles)

export default function ToolListTitle({title, className, ...rest}:{title: string, className?: string, [key: string]: any}) {
  return (
      <div data-class='label__page-tool__subtool' className={cx('tool-list-title', className)} {...rest}>{title}</div>
  )
}