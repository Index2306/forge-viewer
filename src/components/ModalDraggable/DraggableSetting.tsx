import React, {memo, ReactNode, useRef, useState} from 'react';
import Draggable, {DraggableData, DraggableEvent} from 'react-draggable';

const DraggableSetting : React.FC<DraggableSettingProps> = ({ modal, disabled }) => {
    const [bounds, setBounds] = useState({
        left: 0,
        top: 0,
        bottom: 0,
        right: 0,
    });

    // reference to Draggable
    const draggleRef = useRef<any>(null);

    const onStart = (_event: DraggableEvent, uiData: DraggableData) => {
        const { clientWidth, clientHeight } = window.document.documentElement;

        const targetRect = draggleRef.current?.getBoundingClientRect();
        if (!targetRect) {
            return;
        }
        setBounds({
            left: -targetRect.left + uiData.x,
            right: clientWidth - (targetRect.right - uiData.x),
            top: -targetRect.top + uiData.y,
            bottom: clientHeight - (targetRect.bottom - uiData.y),
        });
    };

    return (
        <Draggable
            disabled={disabled}
            bounds={bounds}
            onStart={(event, uiData) => {
                onStart(event, uiData);
            }}
        >
            <div ref={draggleRef}>{modal}</div>
        </Draggable>
    );
}

export default memo(DraggableSetting);

interface DraggableSettingProps {
    modal: ReactNode
    disabled?: boolean
}
