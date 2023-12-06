import React from 'react';
import {LayoutProps} from "@/models";

const AdminLayout = ({children}: LayoutProps) => {
    return (
        <div>{children}</div>
    );
};

export default AdminLayout;