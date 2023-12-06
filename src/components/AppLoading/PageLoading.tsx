import DataLoading from "@/components/AppLoading/DataLoading";
import styles from './AppLoading.module.scss'
import classNames from "classnames/bind";
import {ReactNode} from "react";
const cx = classNames.bind(styles)

export default function PageLoading({title}: {title?: string | ReactNode}) {
    return (
        <div className={cx('page-loading')}><DataLoading title={title}/></div>
    )
}