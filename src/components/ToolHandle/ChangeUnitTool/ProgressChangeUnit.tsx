import React, {useContext, useEffect, useState} from 'react'
import classNames from "classnames/bind";
import {useTranslation} from "next-i18next";
import {Progress} from "antd";

import styles from './ChangeUnitTool.module.scss'
import {ToolContext} from "@/context/ToolContext";

const cx = classNames.bind(styles)
const conicColors = {'0%': '#87d068', '50%': '#ffe58f', '100%': '#ffccc7'};
const ProgressChangeUnit = () => {
    const {t} = useTranslation()

    const {
        progressUnit, errUnit
    } = useContext(ToolContext)

    const [percent, setPercent] = useState<number>(0)

    useEffect(() => {
        setPercent(Math.round((progressUnit / 14) * 100))
    }, [progressUnit])


    return <div className={cx('progress-container')}>
        {progressUnit > 0 &&
            <>
                <Progress percent={percent} status={errUnit ? 'exception' : undefined} strokeColor={conicColors}/>
                {errUnit && <p>{errUnit}</p>}
            </>
        }
    </div>
}

export default ProgressChangeUnit