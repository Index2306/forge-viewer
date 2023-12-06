import React, { useEffect, useState } from 'react'
import { NewFieldType } from '@/models'
import { Space } from 'antd'
import InputCustom from '../InputCustom'
import NewField from '../NewField'
import { useDebounce } from 'ahooks'

export default function FloorSettingNewFields({
    newFields,
    setNewFields,
}: FloorSettingNewFieldsProps) {
    // --- Functions control Dynamic fields ---
    const [inputNF, setInputNF] = useState<{name?: string, value: any}>({
        name: undefined,
        value: ''
    })

    const inputNFDebounce = useDebounce(inputNF, { maxWait: 300 })

    useEffect(() => {
        const mapCallback = (list: NewFieldType[]) => {
            return [...list].map((f) => {
                return f.name === inputNFDebounce.name ? { ...f, value: inputNFDebounce.value } : f
            })
        }
        setNewFields(mapCallback)
    }, [inputNFDebounce])

    const handleAddNewDynamicField = (value: NewFieldType): boolean => {
        const currentList = [...newFields]
        const existIndex = currentList.findIndex((v: NewFieldType) => v.name === value.name)
        if (existIndex >= 0) {
            return false
        }

        currentList.push(value)
        setNewFields(currentList)

        return true
    }

    const handleChangeDynamicField = (name: string | undefined, value: any) => {
        setInputNF({name, value})
    }

    const handleRemoveDynamicField = (fieldObject: NewFieldType) => {
        const filterCallback = (list: NewFieldType[]) => {
            const remainFields = [...list].filter((f) => f.name !== fieldObject.name)
            return [...remainFields]
        }

        setNewFields(filterCallback)
    }

    const handleUpdateDynamicField = (oldValue?: NewFieldType, newValue?: NewFieldType) => {
        if (!oldValue) return false

        const currentList = [...newFields]
        const indexOldField = currentList.findIndex((v: NewFieldType) => v.name === oldValue.name)
        if (indexOldField < 0) return false

        let oldField = currentList[indexOldField]

        if (newValue) {
            if (oldValue?.name != newValue?.name) {
                const existIndex = currentList.findIndex(
                    (v: NewFieldType) => v.name === newValue.name,
                )
                if (existIndex >= 0) {
                    return false
                } else {
                    oldField = {
                        ...oldField,
                        name: newValue?.name,
                    }
                }
            }

            oldField = { ...oldField, hide: newValue.hide }
            currentList[indexOldField] = oldField
            setNewFields(currentList)
        }

        return true
    }

    return (
        <Space direction='vertical' size='middle' style={{ marginTop: '28px', width: '330px' }}>
            {newFields?.map((f: NewFieldType, index: number) => (
                <InputCustom
                    key={index}
                    name={f.name}
                    label={f.name}
                    changeValue={(name, value) => {
                        handleChangeDynamicField(name, value)
                    }}
                    initValue={f.value}
                    dynamicField={f}
                    onRemoveField={handleRemoveDynamicField}
                    onFinishUpdate={handleUpdateDynamicField}
                />
            ))}
            <NewField onAddNewField={handleAddNewDynamicField} placement='bottom' />
        </Space>
    )
}

type FloorSettingNewFieldsProps = {
    newFields: NewFieldType[]
    setNewFields: React.Dispatch<React.SetStateAction<NewFieldType[]>>
}
