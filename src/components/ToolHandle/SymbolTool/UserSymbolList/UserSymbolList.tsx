import React, {useEffect, useState} from 'react';
import {SymbolDataModel} from "@/models";
import {useTranslation} from "next-i18next";
import {useAppDispatch, useAppSelector} from "@/hooks";
import {selectTool} from "@/store/slices/tool/tool.slice";
import UserSymbolItem from "@/components/ToolHandle/SymbolTool/UserSymbolList/UserSymbolItem";
import styles from './UserSymbolList.module.scss';
import classNames from 'classnames/bind'

const cx = classNames.bind(styles)

const UserSymbolListView : React.FC<UserSymbolListProps> = () => {
    const { t } = useTranslation(['common', 'config', 'tool'])
    const dispatch = useAppDispatch()
    const {currentFile} = useAppSelector(selectTool)

    const [symbolList, setSymbolList] = useState<SymbolDataModel[]>([]);
    const [isShowAll, setIsShowAll] = useState<boolean>(false)
    const [indeterminate, setIndeterminate ] = useState<boolean>(false)

    useEffect(() => {
        const newList = (currentFile?.fileData?.symbols ?? []).map((symbol: SymbolDataModel) => {
           const existSymbol = symbolList.find((s: SymbolDataModel) => s.id === symbol.id);
           let isShow = symbol.isShow;
           if (existSymbol) {
               if (existSymbol.isShow) {
                   isShow = existSymbol.isShow
               }
           }

           return {
               ...symbol,
               isShow
           }
        });

        setSymbolList(newList)

        return () => {
            setSymbolList([])
        }
    }, [currentFile?.fileData?.symbols])

    useEffect(() => {
        const showLength = symbolList.filter((symbol: SymbolDataModel) => symbol.isShow).length;
        if (showLength === symbolList.length && showLength > 0) {
            setIsShowAll(true)
            setIndeterminate(false)
        } else if (showLength < symbolList.length && showLength > 0) {
            setIsShowAll(false)
            setIndeterminate(true)
        } else {
            setIsShowAll(false)
            setIndeterminate(false)
        }
    }, [symbolList])

    const onChangeShowAll = (e?: any) => {
        setIndeterminate(false)
        if (!isShowAll) {
            setIsShowAll(true)
            setSymbolList(prev => prev.map((symbol: SymbolDataModel) => ({...symbol, isShow: true})))
        } else {
            setIsShowAll(false)
            setSymbolList(prev => prev.map((symbol: SymbolDataModel) => ({...symbol, isShow: false})))
        }
    }

    const onChangeShowItem = (symbolId?: string) => {
        if (!symbolId) return;
        const newList = symbolList.map((symbol: SymbolDataModel) => {
            if (symbol.id === symbolId) {
                return {
                    ...symbol,
                    isShow: !symbol.isShow
                }
            }
            return symbol
        });
        setSymbolList(newList)
    }

    return (
        <div className={cx('symbol-list__content')}>
            <UserSymbolItem key={'all'} isShow={isShowAll} indeterminate={indeterminate} symbol={undefined} onChangeAll={onChangeShowAll}/>
            {symbolList.map((symbol: SymbolDataModel) => <UserSymbolItem key={symbol.id} isShow={symbol?.isShow ?? false} symbol={symbol} onChangeCheckBox={onChangeShowItem}/>)}
        </div>
    );
};

export default React.memo(UserSymbolListView);

interface UserSymbolListProps {

}