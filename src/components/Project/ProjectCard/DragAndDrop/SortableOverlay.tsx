import {defaultDropAnimationSideEffects, DragOverlay, DropAnimation} from "@dnd-kit/core";
import React, {PropsWithChildren} from "react";
import styles from './DragAndDrop.module.scss';

const dropAnimationConfig: DropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
        styles: {
            active: {
                opacity: "0.4"
            }
        }
    })
};
export function SortableOverlay({ children }: PropsWithChildren<Props>) {
    return (
        <DragOverlay dropAnimation={dropAnimationConfig}>
            <div className={styles.itemOverlay}>
                {children}
            </div>
        </DragOverlay>
    );
}

interface Props {}
