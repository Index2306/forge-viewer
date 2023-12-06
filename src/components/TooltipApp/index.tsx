import React from "react";
import {TooltipPlacement} from "antd/es/tooltip";
import {Tooltip, TooltipProps} from "antd";

export default function TooltipApp({placement, title, children, ...rest}: TooltipAppProps) {
    return (
        <Tooltip placement={placement} title={() => (<span data-class='label__tooltip'>{title}</span>)} color={'var(--secondary-color)'} {...rest}>
            {children}
        </Tooltip>
    )
}

type TooltipAppProps = {
    placement: TooltipPlacement;
    title: any;
    children: React.ReactNode
} & TooltipProps