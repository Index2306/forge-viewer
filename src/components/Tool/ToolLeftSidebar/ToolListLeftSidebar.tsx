import React, {ReactElement, ReactNode, useContext, useEffect, useState} from 'react'
import {ForgeViewerContext} from '@/context/ForgeViewerContext'
import {ToolContext} from '@/context/ToolContext'
import styles from '@/components/Tool/ToolLeftSidebar/ToolLeftSidebar.module.scss'

import classNames from 'classnames/bind'
import DrawingTool from '@/components/ToolHandle/DrawingTool'

const cx = classNames.bind(styles)

const ToolListLeftSidebar: React.FC<ToolLeftSidebarProps> = ({}) => {
    const [firstShow, setFirstShow] = useState<boolean>(true)
    const [toolMenu, setToolMenu] = useState<ReactElement[]>([])

    const {isToolReady} = useContext(ToolContext)
    const {activeTool} = useContext(ForgeViewerContext)

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
        <div key={'group-part-1'} className={cx('tool-list-left-sidebar__group-part-1')}>
            <DrawingTool key={1} />
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
