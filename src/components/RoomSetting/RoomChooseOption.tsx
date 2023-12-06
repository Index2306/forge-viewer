import React, { useCallback, useState } from 'react'
import styles from './RoomSetting.module.scss'
import { Checkbox, Col, Row, Space } from 'antd'
import { useTranslation } from 'next-i18next'
import { CheckboxChangeEvent } from 'antd/es/checkbox'

const RoomChooseOption: React.FC<RoomChooseOptionProps> = ({
    keyName,
    question,
    checked: initChecked,
    defaultChecked,
    children,
    onChange,
    description,
    vertical,
}) => {
    const { t } = useTranslation(['common'])

    const [checkedYes, setCheckedYes] = useState<boolean>(
        initChecked === true || defaultChecked === true,
    )
    const [checkedNo, setCheckedNo] = useState<boolean>(
        initChecked === false || defaultChecked === false,
    )

    const onChangeYes = useCallback(
        (e: CheckboxChangeEvent) => {
            const status = e.target.checked
            if (status) {
                setCheckedNo(false)
                setCheckedYes(true)
            } else {
                setCheckedNo(true)
                setCheckedYes(false)
            }
            onChange(keyName, status)
        },
        [onChange, keyName],
    )

    const onChangeNo = useCallback(
        (e: CheckboxChangeEvent) => {
            const status = e.target.checked
            if (status) {
                setCheckedNo(true)
                setCheckedYes(false)
            } else {
                setCheckedNo(false)
                setCheckedYes(true)
            }
            onChange(keyName, !status)
        },
        [onChange, keyName],
    )

    return (
        <div className={styles.roomChooseOption}>
            <div className={styles.roomChooseQuestion}>
                {question}
                <span className={styles.description}>{description}</span>
            </div>
            <Row align='middle'>
                <Col span={vertical ? 8 : 24}>
                    <Space
                        className={styles.roomChooseCheckbox}
                        direction={vertical ? 'vertical' : 'horizontal'}
                    >
                        <Checkbox checked={checkedYes} onChange={onChangeYes}>
                            {t('yes')}
                        </Checkbox>
                        <Checkbox checked={checkedNo} onChange={onChangeNo}>
                            {t('no')}
                        </Checkbox>
                    </Space>
                </Col>
                {vertical ? <Col span={16}>{children}</Col> : <Col span={24}>{children}</Col>}
            </Row>
        </div>
    )
}

export default React.memo(RoomChooseOption)

interface RoomChooseOptionProps {
    onChange: (keyName: string, status: boolean) => void
    keyName: string
    question: any
    description?: any
    checked?: boolean
    defaultChecked?: boolean
    children?: string | JSX.Element | JSX.Element[] | React.ReactNode
    vertical?: boolean
}
