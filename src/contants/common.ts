import { ThemeConfig } from "antd";

export const GLOBAL = {
    PRIMARY_COLOR: '#eb5849',
    FONTS: `TTInterfaces-Regular, TTInterfaces-Medium, TTInterfaces-Semibold, TTInterfaces-LightItalic, TTInterfaces-Light, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif`,
} as const

export const ANT_THEME: ThemeConfig =  {
    token: {
        fontFamily: GLOBAL.FONTS,
        colorPrimary: GLOBAL.PRIMARY_COLOR,
    }
}
