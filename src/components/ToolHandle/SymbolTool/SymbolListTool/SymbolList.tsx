import symbolData from '@/assets/data.json'
import { CaretDownOutlined, CaretRightOutlined, SearchOutlined } from '@ant-design/icons'
import { useTranslation } from 'next-i18next'
import React, {useCallback, useContext, useEffect, useState} from 'react'
import Image from 'next/image'

import { GroupSymbolType, SymbolItemType } from '@/models/symbol'
import { useDebounce } from 'ahooks'

import styles from '../SymbolTool.module.scss'
import classNames from 'classnames/bind'
import {convertPointLayerToModel} from "@/ForgeViewer/CustomTool/Point";
import {SymbolDataModel} from "@/models";
import {v4 as uuid} from "uuid";
import {addSymbol, selectTool} from "@/store/slices/tool/tool.slice";
import {useAppDispatch, useAppSelector} from "@/hooks";
import {groupToolNames, toolName} from "@/components/ToolHandle/SymbolTool/SymbolListTool";
import Viewer3D = Autodesk.Viewing.Viewer3D;
import {useActiveGroupToolsOnViewer} from "@/hooks/useActiveGroupToolsOnViewer";
import { SearchBarApp } from '@/components/SearchBarApp'
import TooltipApp from "@/components/TooltipApp";
import { AppContext } from '@/context/AppContext'

const cx = classNames.bind(styles)

const iconSize = 40

// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------

function SymbolItem({
    valSymbol,
    element,
    selectedSymbol,
    onSelectedSymbolItem,
}: {
    valSymbol: GroupSymbolType
    element: SymbolItemType
    selectedSymbol: SymbolItemType | null
    onSelectedSymbolItem: (item: SymbolItemType) => void
}) {

    // -------------------------------------------------------------
    // --- Get Source of symbol base on Browser ---
    // -------------------------------------------------------------
    const {browser} = useContext(AppContext);

    const symbolSrcPath = useCallback(() => {
        const pngPath = '/assets/symbols/png';
        const svgPath = '/assets/symbols/svg';
        const symbolPath = `/Symbol/${valSymbol.folder}/${element?.code}`;
        const pngExt = '.png'
        const defaultExt = `${element.ext ? `${element.ext}` : '.png'}`

        if (browser === 'Chrome') {
            return svgPath + symbolPath + defaultExt;
        }

        return pngPath + symbolPath + pngExt;
    }, [browser])
    // -------------------------------------------------------------

    return (
        <div
            className={cx('tool-symbol__item', {
                'is-active': selectedSymbol?.id === element.id,
            })}
            onClick={() => {
                onSelectedSymbolItem(element)
            }}
        >
            {/* ------------------------------------------- SYMBOL-ITEM ICON */}

            <div className={cx('tool-symbol__item-icon')}>
                <Image
                    src={symbolSrcPath()}
                    alt={element?.code}
                    width={iconSize}
                    height={iconSize}
                />
            </div>

            {/* ------------------------------------------- SYMBOL-ITEM TITLE */}

            <TooltipApp placement='top' title={element.name}>
                <span
                    data-class='label__page-tool__tool-right-sidebar__subtool_list-item'
                    title={element?.name} className={cx('tool-symbol__item-title')}>
                    {element?.name}
                </span>
            </TooltipApp>
        </div>
    )
}

// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------

function GroupListOfSymbol({
    valSymbol,
    currentGroupSymbol,
    handleOpenItemSymbol,
    selectedSymbol,
    handleSelectedSymbolItem,
}: {
    valSymbol: GroupSymbolType
    currentGroupSymbol: string
    handleOpenItemSymbol: (symbolId: string) => void
    selectedSymbol: SymbolItemType | null
    handleSelectedSymbolItem: (item: SymbolItemType) => void
}) {
    return (
        <>
            {/* ------------------------------------------- GROUP-LIST-OF-SYMBOL TITLE */}

            <div
                data-class='label__page-tool__tool-right-sidebar__subtool_list-item'
                className={cx('tool-symbol__group-list-of-symbol__title', {
                    'is-active': currentGroupSymbol === valSymbol.id,
                })}
                onClick={() => handleOpenItemSymbol(valSymbol.id)}
            >
                <span>
                    {currentGroupSymbol === valSymbol.id ? (
                        <CaretDownOutlined />
                    ) : (
                        <CaretRightOutlined />
                    )}
                </span>
                <span>{valSymbol.id}</span>
            </div>

            {/* ------------------------------------------- GROUP-LIST-OF-SYMBOL CONTENT */}

            {currentGroupSymbol === valSymbol.id && (
                <div className={cx('tool-symbol__group-list-of-symbol__content')}>
                    {valSymbol?.children.map((element: SymbolItemType, index: number) => (
                        <SymbolItem
                            key={element.id}
                            valSymbol={valSymbol}
                            element={element}
                            selectedSymbol={selectedSymbol}
                            onSelectedSymbolItem={handleSelectedSymbolItem}
                        />
                    ))}
                </div>
            )}
        </>
    )
}

// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------

const SymbolList: React.FC<SymbolListProps> = () => {
    const { t } = useTranslation(['common', 'config', 'tool'])

    const [currentGroupSymbol, setCurrentGroupSymbol] = useState('')

    const [selectedSymbol, setSelectedSymbol] = useState<SymbolItemType | null>(null)

    const [searchValue, setSearchValue] = useState<string>('')
    const searchValueDebounce = useDebounce(searchValue, { maxWait: 200 })
    const {activeTool, setCursorCustomer} = useActiveGroupToolsOnViewer({groupToolNames})
    const dispatch = useAppDispatch()
    const {currentFile} = useAppSelector(selectTool)

    // -------------------------------------------------------------
    // --- Get Source of symbol base on Browser ---
    // -------------------------------------------------------------
    const {browser} = useContext(AppContext);
    // -------------------------------------------------------------


    const handleOpenItemSymbol = (valSymbol: string) => {
        setCurrentGroupSymbol(currentGroupSymbol === valSymbol ? '' : valSymbol)
        setSelectedSymbol(null)
    }

    useEffect(() => {
        if (!selectedSymbol) return;

        // -----------------------------------------------------------------------------

        let pathToSymbol = '';

        const pngPath = '/assets/symbols/png';
        const svgPath = '/assets/symbols/svg';
        const symbolPath = `/Symbol/${selectedSymbol.folder}/${selectedSymbol?.code}`;
        const pngExt = '.png'
        const defaultExt = `${selectedSymbol.ext ? `${selectedSymbol.ext}` : '.png'}`

        if (browser === 'Chrome') {
            pathToSymbol = svgPath + symbolPath + defaultExt;
        }

        pathToSymbol = pngPath + symbolPath + pngExt;

        // -----------------------------------------------------------------------------

        handleChangeSymbolCursor(pathToSymbol)

        return () => handleChangeSymbolCursor(null)
    }, [selectedSymbol])

    const handleChangeSymbolCursor = (pathToSymbol: string | null) => {
        if (!window?.NOP_VIEWER?.canvas) return;
        if (pathToSymbol) {
            setCursorCustomer?.(pathToSymbol)
            window.NOP_VIEWER.canvas.addEventListener('click', onHandlePutSymbolOnViewer)
        } else {
            setCursorCustomer?.(undefined)
            window.NOP_VIEWER.canvas.removeEventListener('click', onHandlePutSymbolOnViewer)
        }
    }

    const handleSelectedSymbolItem = (item: SymbolItemType) => {
        // If current symbol is chosen by user again, disable it
        if (selectedSymbol?.id === item.id) {
            setSelectedSymbol(null)
            return
        }
        // set selected symbol
        setSelectedSymbol(item)
    }

    const onHandlePutSymbolOnViewer = useCallback((event: MouseEvent) => {

        if (activeTool !== toolName || !selectedSymbol || !window?.NOP_VIEWER?.canvas) return;
        // Get x, y coordinates of mouse click in canvas
        new Promise(() => {
            const canvas =  window.NOP_VIEWER?.canvas;
            const xCanvas = event.clientX - canvas.getBoundingClientRect().left;
            const yCanvas = event.clientY - canvas.getBoundingClientRect().top;

            const modelPt = (window.NOP_VIEWER.impl as Viewer3D).clientToWorld(xCanvas, yCanvas, false);
            const newCoordinates = {...modelPt.point};
            const newCoordinatesModel = convertPointLayerToModel(newCoordinates);

            const newSymbol: SymbolDataModel = {
                id: uuid(),
                code: selectedSymbol.code,
                folder: selectedSymbol.folder,
                ext: selectedSymbol?.ext,
                name: selectedSymbol.name,
                ratio: selectedSymbol.ratio,
                position_origin: {x: 0, y: 0, z: 0},
                position_layer: newCoordinates,
                position: newCoordinatesModel,

                isShow: true,
                size: 0.3
            }
            dispatch(addSymbol(newSymbol))

        })
    }, [selectedSymbol, activeTool, currentFile?.fileData?.rooms, window.NOP_VIEWER, dispatch, t])

    // -----------------------------------------------------

    return (
        <>
            {/* ---------------------------------------------------- SYMBOL SEARCH BAR */}

            <div className={cx('tool-symbol__search-bar-wrapper')}>
                <SearchBarApp searchValue={searchValue} onChangeSearch={setSearchValue} placeholder={`${t('search')}...`}/>
            </div>

            {/* ---------------------------------------------------- SYMBOL MAIN CONTENT */}

            <div className={cx('tool-symbol__main-content')}>
                {symbolData.map((groupSymbolElement: GroupSymbolType) =>
                    searchValueDebounce ? (
                        // ------------------------------------------------
                        // IF, SEARCH BAR IS ACTIVATED
                        // ------------------------------------------------
                        <div
                            key={groupSymbolElement.id}
                            className={cx('tool-symbol__group-list-of-symbol__content')}
                        >
                            {groupSymbolElement.children?.map((element: SymbolItemType, index) =>
                                element.name.includes(searchValueDebounce) ? (
                                    <SymbolItem
                                        key={index}
                                        valSymbol={groupSymbolElement}
                                        element={element}
                                        selectedSymbol={selectedSymbol}
                                        onSelectedSymbolItem={handleSelectedSymbolItem}
                                    />
                                ) : null,
                            )}
                        </div>
                    ) : (
                        // ------------------------------------------------
                        // ELSE, RENDER GROUP LIST OF SYMBOL
                        // ------------------------------------------------
                        <GroupListOfSymbol
                            key={groupSymbolElement.id}
                            valSymbol={groupSymbolElement}
                            currentGroupSymbol={currentGroupSymbol}
                            handleOpenItemSymbol={handleOpenItemSymbol}
                            handleSelectedSymbolItem={handleSelectedSymbolItem}
                            selectedSymbol={selectedSymbol}
                        />
                    ),
                )}
            </div>
        </>
    )
}

export default SymbolList

export interface SymbolListProps {}
