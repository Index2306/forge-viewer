import React, {useContext} from "react";
import {ToolContext} from "@/context/ToolContext";

import styles from "./WiringTool.module.scss";
import classNames from "classnames/bind";
import {useTranslation} from "next-i18next";

const cx = classNames.bind(styles)

export default function PopupWiringDistance() {
    const {distanceWiring} = useContext(ToolContext)
    
    const {t} = useTranslation('tool')

    return (
        <>
            {/* Convert distance wiring to number and check if it is a number, then show it */}

            {!Number.isNaN(Number(distanceWiring)) &&
                <div className={cx('popup-wiring-distance')}>
                    <span className={cx('popup-wiring-distance__text')} data-class='label__page-tool__popup-wiring-distance'>
                        {t('distance')}: {Number.parseFloat(`${distanceWiring}`).toFixed(2)} m
                    </span>
                </div>
            }
        </>
    )
}