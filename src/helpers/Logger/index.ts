export const debug = (message?: any, ...optionalParams: any[]): void => {
    if (!process.env.NEXT_PUBLIC_PRODUCT) {
        console.log(message, optionalParams)
    }
}

export const error = (message?: any, ...optionalParams: any[]): void => {
    console.error(message, optionalParams)
}

export const warn = (message?: any, ...optionalParams: any[]): void => {
    console.warn(message, optionalParams)
}