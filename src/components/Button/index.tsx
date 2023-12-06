import React, {ReactNode, useCallback} from 'react';
import {Button} from "antd";
import styles from './Button.module.scss';

const AppButton: React.FC<AppButtonProps> = ({children, type, htmlType, onClick, size, fullWidth, largeWidth, fullHeight, flat, disabled, loading, className, style, secondary, ...props}) => {
    const renderClassName = useCallback(
        (): string => {
            if (size === undefined) {
                size = 'middle'
            }
            const fullW = fullWidth ? 'fullWidth' : 'noFullWidth';
            const largeW = largeWidth ? 'large-width': ''
            const fullH = fullHeight ? 'fullHeight' : ''
            const hasFlat = flat ? 'flat' : '';

            const guardDisabled = (clsName: any) => { return disabled ? styles['disabled'] : clsName}

            let target = `${guardDisabled(styles.button)} ${guardDisabled(type ? styles[type] : '')} ${styles[size]} ${styles[fullW]} ${styles[largeW]} ${styles[fullH]} ${styles[hasFlat]} ${className}}`
            if (secondary) {
                target = `${guardDisabled(styles['button-secondary'])} ${guardDisabled(type ? styles[type] : '')} ${styles[size]} ${styles[fullW]} ${styles[largeW]} ${styles[fullH]} ${styles[hasFlat]} ${className}}`
            }

            return target
        },
        [className, size, fullWidth, disabled, type],
    );

    return (
        // @ts-ignore
        <Button onClick={onClick} type={type} htmlType={htmlType} className={renderClassName()} loading={loading} disabled={disabled} style={style} {...props}>
            {children}
        </Button>
    );
};

interface AppButtonProps {
    children: ReactNode,
    type?: "link" | "text" | "default" | "primary" | "dashed" | "ghost" | "warning" | undefined
    htmlType?: "button" | "submit" | "reset" | undefined,
    onClick?: (React.MouseEventHandler<HTMLAnchorElement> & React.MouseEventHandler<HTMLButtonElement>) | undefined,
    size?: "small" | "middle" | "large" | undefined
    fullWidth?: boolean | undefined;
    largeWidth?: boolean;
    loading?: boolean,
    disabled?: boolean,
    className?: string | undefined,
    style?: React.CSSProperties | undefined,
    secondary?: boolean,
    fullHeight?: boolean,
    flat?: boolean,
    [key: string]: any
}

export default React.memo(AppButton);
