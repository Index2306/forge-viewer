import {RcFile} from "antd/es/upload";

export const isNullOrEmpty = (text: string | undefined | null): boolean => {
    return text === undefined || text === null || text.trim() === ''
}

export const getBase64 = (file: RcFile | Blob): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file as Blob);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
    });

export const autoLineBreakText = (text: any): string => {
    try {
        return text.split('\n').map((val: string) => {
            return `<p>${val}</p>`
        }).join('');
    } catch (err) {
        return text
    }
}

export function renderNumberToString(n: number): string {
    const isFloat = (n: number): boolean  => {
        return Number(n) === n && n % 1 !== 0
    }

    if (isFloat(n)) {
        return n.toFixed(3)
    }

    return n.toFixed(0)
}