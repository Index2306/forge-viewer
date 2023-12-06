import Image from 'next/image'

import styles from './IconAction.module.scss'

export default function IconAction({
    title,
    src,
    size,
    customSize,
    style,
    onClick,
    className,
    isHover = true,
}: IconActionProps) {
    const iconSize = () => {
        if (customSize) {
          return customSize
        }

        let content: number = 30
        switch (size) {
            case 'small':
                content = 24
                break
            case 'medium':
                content = 30
                break
            case 'large':
                content = 40
                break
            default:
                content
                break
        }

        return content
    }

    return (
        <Image
            src={src}
            alt={title}
            className={`${styles['icon-action']} ${className} ${isHover ? styles['icon-action--hover'] : ''}`}
            width={iconSize()}
            height={iconSize()}
            style={style}
            onClick={onClick}
        />
    )
}

interface IconActionProps {
    src: string
    size?: 'small' | 'medium' | 'large'
    title: string
    style?: React.CSSProperties
    onClick?: () => void
    className?: string
    isHover?: boolean
    customSize?: number
}
