import { SortType } from '@/models'
import { useTranslation } from 'next-i18next'
import React, { useEffect, useState } from 'react'
import { BsArrowDown, BsArrowDownUp, BsArrowUp } from 'react-icons/bs'
import { IconType } from 'react-icons'
import Icon from '@ant-design/icons'
import { Checkbox } from 'antd'
import { RoomDataModalCustom } from './types'
import {
    NONE_STATUS,
    SORT_BY,
    SORT_STATUS,
    sortByLength,
    sortByName,
    sortByWidth,
    sortTargetHelper,
} from './share'

// ------------------------------------------------------------------

const SortedIcon: React.FC<{
    name: string
    data: Record<string, SortType>
    changeSortStatus: (name: string) => void
}> = ({ name, data, changeSortStatus }) => {
    const getSortedIcon = (name: string): IconType => {
        const result = data[name]
        if (result?.status === SORT_STATUS.ASC) return BsArrowUp
        if (result?.status === SORT_STATUS.DSC) return BsArrowDown
        // When NONE_STATUS => BsArrowDownUp
        return BsArrowDownUp
    }

    return (
        <Icon
            onClick={() => changeSortStatus(name)}
            component={getSortedIcon(name)}
            style={{ cursor: 'pointer' }}
        />
    )
}

export default function useSortRoomDataTable(
    setRooms: React.Dispatch<React.SetStateAction<RoomDataModalCustom[]>>,
    // ): [React.ReactNode, React.ReactNode, React.ReactNode] {
): [
    (
        indeterminate: boolean,
        checkAll: boolean,
        onHeaderCheckbox: (value: boolean) => void,
    ) => React.ReactNode,
    React.ReactNode,
    React.ReactNode,
] {
    // --- For translation ---

    const { t } = useTranslation(['tool', 'common'])

    // --- For Sorting ---

    const [sorts, setSorts] = useState<Record<string, SortType>>({
        name: {
            name: SORT_BY.NAME,
            status: NONE_STATUS,
        },
        width: {
            name: SORT_BY.WIDTH,
            status: NONE_STATUS,
        },
        length: {
            name: SORT_BY.LENGTH,
            status: NONE_STATUS,
        },
    })

    const [sortBy, setSortBy] = useState<{ name: string; status: number }>({
        name: SORT_BY.NAME,
        status: NONE_STATUS,
    })

    useEffect(() => {
        setRooms((prev) => {
            let target = [...prev]

            switch (sortBy.name) {
                case SORT_BY.NAME:
                    target = sortTargetHelper(target, sorts, SORT_BY.NAME, sortByName)
                    break
                case SORT_BY.WIDTH:
                    target = sortTargetHelper(target, sorts, SORT_BY.WIDTH, sortByWidth)
                    break
                case SORT_BY.LENGTH:
                    target = sortTargetHelper(target, sorts, SORT_BY.LENGTH, sortByLength)
                    break
            }
            return [...target]
        })
    }, [sortBy])

    const changeSortStatus = (key: string) => {
        const getObjWithCheckedIndex = (obj: { name: string; status: number }) => {
            let nextStatus = (obj.status + 1) % Object.keys(SORT_STATUS).length
            return { ...obj, name: key, status: nextStatus }
        }

        setSortBy(getObjWithCheckedIndex)

        setSorts((prev) => {
            prev[key] = getObjWithCheckedIndex(prev[key])
            return { ...prev }
        })
    }

    // --- Members for exporting ---

    const RoomHeaderTitle = (
        indeterminate: boolean,
        checkAll: boolean,
        onHeaderCheckbox: (value: boolean) => void,
    ) => {
        return (
            <div
                style={{
                    display: 'flex',
                    gap: '8px',
                    justifyContent: 'flex-start',
                    alignItems: 'center',
                }}
            >
                <Checkbox
                    indeterminate={indeterminate}
                    checked={checkAll}
                    onChange={(e) => onHeaderCheckbox(e.target.checked)}
                />
                <span style={{ marginRight: '4px' }}>{t('room')}</span>{' '}
                <SortedIcon name={SORT_BY.NAME} data={sorts} changeSortStatus={changeSortStatus} />
            </div>
        )
    }

    const WidthHeaderTitle = (
        <div>
            <span>
                {t('width')}
                <span
                    style={{
                        fontSize: '0.7rem',
                        margin: '0 4px',
                    }}
                >
                    (m)
                </span>
            </span>
            <SortedIcon name={SORT_BY.WIDTH} data={sorts} changeSortStatus={changeSortStatus} />
        </div>
    )

    const LengthHeaderTitle = (
        <div>
            <span>
                {t('length')}
                <span
                    style={{
                        fontSize: '0.7rem',
                        margin: '0 4px',
                    }}
                >
                    (m)
                </span>
            </span>
            <SortedIcon name={SORT_BY.LENGTH} data={sorts} changeSortStatus={changeSortStatus} />
        </div>
    )

    return [RoomHeaderTitle, WidthHeaderTitle, LengthHeaderTitle]
}
