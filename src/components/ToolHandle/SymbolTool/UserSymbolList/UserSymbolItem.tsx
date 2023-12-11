import React, {useCallback, useContext, useEffect, useState} from 'react';
import {SymbolDataModel} from "@/models";
import styles from './UserSymbolList.module.scss';
import classNames from 'classnames/bind'
import {Checkbox, Col, Popover, Row, Space} from "antd";
import {useTranslation} from "next-i18next";
import {useActiveGroupToolsOnViewer} from "@/hooks/useActiveGroupToolsOnViewer";
import {PolygonType, ToolName} from "@/contants/tool";
import {insertSymbolToViewer} from "@/ForgeViewer/CustomTool/Edit2D/draw";
import {deleteShape, removeSymbolPlaneMesh} from "@/ForgeViewer/CustomTool/Edit2D";
import ConfirmDelete from "@/components/ConfirmDelete";
import IconAction from "@/components/IconAction";
import {useAppDispatch} from "@/hooks";
import {removeSymbol} from "@/store/slices/tool/tool.slice";
import { AppContext } from '@/context/AppContext';

const toolName = ToolName.SYMBOL_USER_LIST;
const cx = classNames.bind(styles)

const groupToolNames = [
    toolName,
    ToolName.SYMBOL_TOOL,
    ToolName.SYMBOL_LIST,
]

const UserSymbolItem : React.FC<UserSymbolItemProps> = ({symbol, isShow, indeterminate, onChangeCheckBox, onChangeAll, }) => {
    const {t} = useTranslation(['common', 'tool'])
    const dispatch = useAppDispatch();
    const {activeTool, setCursorCustomer, isActiveCurrentTool} = useActiveGroupToolsOnViewer({groupToolNames})
    const [show, setShow] = useState<boolean>(false)
    const [isOpenPopover, setIsOpenPopover] = useState<boolean>(false)

    const onChaneCheckBox = (e: any) => {
        if (onChangeAll) {
            onChangeAll(e)
        }
        if (onChangeCheckBox) {
            onChangeCheckBox(symbol?.id)
        }
    }

    // -------------------------------------------------------------
    // --- Get Source of symbol base on Browser ---
    // -------------------------------------------------------------

    const {browser} = useContext(AppContext);

    const symbolSrcPath = useCallback(() => {
        if (!symbol) return;

        const pngPath = '/assets/symbols/png';
        const svgPath = '/assets/symbols/svg';

        const symbolPath = `/Symbol/${symbol.folder}/${symbol?.code}`

        const pngExt = '.png'
        const defaultExt = `${symbol.ext ? `${symbol.ext}` : '.png'}`

        if (browser === 'Chrome') {
            return svgPath + symbolPath + defaultExt;
        }

        return pngPath + symbolPath + pngExt;
    }, [browser, symbol])
    // -------------------------------------------------------------

    useEffect(() => {

        return () => {
            setShow(false)
            setIsOpenPopover(false)
            onHandleRemoveSymbolOnViewer();
        }
    }, [])

    useEffect(() => {
        if (isShow != show) {
            onHandleRemoveSymbolOnViewer();
            if (groupToolNames.includes(activeTool) && isShow) {
                onHandleShowSymbolOnViewer()
            }
            setShow(isShow)
        }
    }, [symbol, isShow])

    const onHandleShowSymbolOnViewer = () => {
        if (!symbol) return;
        new Promise(() => {
            const callback = (planeMesh: any) => {
                window.symbolList.push({planeMesh: planeMesh, id: symbol.id})
                window.NOP_VIEWER.overlays.addScene(`${planeMesh.uuid}`);
                window.NOP_VIEWER.overlays.addMesh(planeMesh, `${planeMesh.uuid}`);
                window.NOP_VIEWER.impl.invalidate(true, true, true);
            }

            insertSymbolToViewer(symbol.id, symbol.position_layer, PolygonType.SYMBOL, symbolSrcPath(), callback, symbol.ratio == 1 ? symbol.size + 0.2 : symbol.size, symbol.ratio == 1 ? 0.6 : 1)
        })
    }

    const onHandleRemoveSymbolOnViewer = () => {
        new Promise(() => {
            if (!symbol) return;
            deleteShape(window.edit2dLayer?.shapes?.filter((shape: any) => shape.type === PolygonType.SYMBOL && shape.name === symbol.id))

            window.symbolList.filter((s: any) => s.id === symbol.id)
                .forEach((s: any) => {
                    removeSymbolPlaneMesh(s.planeMesh, s.id)
                })
        })
    }

    const handleDelete = () => {
        if (!symbol) return
        dispatch(removeSymbol(symbol))
        // setIsOpenPopover(false)
    }

    const handleCancel = () => {
        setIsOpenPopover(false)
    }

    return (
        <div className={cx('symbol-item', `${symbol ? 'symbol-item__highlight' : 'symbol-item__all'}`)}>
            <Row className={cx('symbol-item__list')}>
                <Col span={21}>
                    <Checkbox onChange={onChaneCheckBox} checked={isShow} indeterminate={indeterminate}>
                        <span data-class='label__page-tool__tool-right-sidebar__subtool_list-item' >
                            {symbol?.name ?? t('show_all', {ns: 'tool'})}
                        </span>
                    </Checkbox>
                </Col>
                <Col span={3}>
                    <Space>
                        {symbol ?  <Popover onOpenChange={() => setIsOpenPopover(prev => !prev)} open={isOpenPopover} placement="top" content={<ConfirmDelete name={symbol?.id} onHandleDelete={handleDelete} onCancel={handleCancel}/>} trigger="click">
                            <IconAction className={cx('symbol-item__icon')} src="/assets/icons/icon_delete.svg" title="Trash Icon" size='large'/>
                        </Popover> : null}
                    </Space>
                </Col>
            </Row>


        </div>
    );
};

export default UserSymbolItem;

interface UserSymbolItemProps {
    symbol?: SymbolDataModel
    isShow: boolean,
    indeterminate?: boolean
    onChangeCheckBox?: (symbolId?: string) => void
    onChangeAll?: (e?: any) => void
}