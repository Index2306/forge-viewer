import React, {ReactElement, ReactNode, useContext, useEffect, useState} from 'react'
import ChooseTool from '@/components/ToolHandle/ChooseTool'
import DistanceTool from '@/components/ToolHandle/DistanceTool'
import ChangeUnitTool from '@/components/ToolHandle/ChangeUnitTool'
import {ForgeViewerContext} from '@/context/ForgeViewerContext'
import ManualCallPointTool from '@/components/ToolHandle/ManualCallPointTool'
import RoomTool from '@/components/ToolHandle/RoomTool'
import SmokeDetectorTool from '@/components/ToolHandle/SmokeDetectorTool'
import {ToolContext} from '@/context/ToolContext'

import styles from '@/components/Tool/ToolLeftSidebar/ToolLeftSidebar.module.scss'
import SymbolTool from '@/components/ToolHandle/SymbolTool'

import classNames from 'classnames/bind'

const cx = classNames.bind(styles)

const ToolListLeftSidebar: React.FC<ToolLeftSidebarProps> = ({isFirst}) => {
    const [firstShow, setFirstShow] = useState<boolean>(true)
    const [toolMenu, setToolMenu] = useState<ReactElement[]>([])

    const {isToolReady} = useContext(ToolContext)
    const {activeTool} = useContext(ForgeViewerContext)

    useEffect(() => {
        let isFirstShow = isFirst ?? false
        if (!isToolReady) {
            isFirstShow = true
        }

        setFirstShow(isFirstShow)

    }, [isFirst, isToolReady])

    useEffect(() => {
        if (activeTool) {
            switch (activeTool) {
                default: {
                    setToolMenu(initTools)
                    break
                }
            }
        } else {
            setToolMenu(initTools)
        }
    }, [firstShow, activeTool])

    const initTools = [
        // Part 1
        <div key={'group-part-1'} className={cx('tool-list-left-sidebar__group-part-1')}>
            <ChooseTool key={1} isFirst={firstShow}/>

            {/* Show: when the first time user need to set change unit for drawing */}
            {isFirst && <ChangeUnitTool key={6} isFirst={firstShow}/>}
        </div>,

        // Part 2
        <div key={'group-part-2'} className={cx('tool-list-left-sidebar__group-part-2')}>
            <RoomTool key={2} isFirst={firstShow} />
            <SmokeDetectorTool key={3} isFirst={firstShow} />
            <ManualCallPointTool key={4} isFirst={firstShow} />
            <SymbolTool key={8} isFirst={firstShow} />
        </div>,

        // Part 3
        <div key={'group-part-3'} className={cx('tool-list-left-sidebar__group-part-3')}>
            <DistanceTool key={5} isFirst={firstShow} />

            {/* Show: After unit of drawing has changed */}
            {!isFirst && <ChangeUnitTool key={6} isFirst={firstShow} />}
        </div>,
    ]

    return (
        <>
            <div className={styles['tool-list-left-sidebar']}>
                {toolMenu.map((element: ReactNode) => element)}
            </div>
        </>
    )
}

export default React.memo(ToolListLeftSidebar)

export interface ToolLeftSidebarProps {
    isFirst?: boolean
}
