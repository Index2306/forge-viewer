import React from 'react';
import {LayoutProps} from "@/models";

const EmptyLayout = ({children}: LayoutProps) => {
    return (
        <div>{children}</div>
    );
};

export default EmptyLayout;