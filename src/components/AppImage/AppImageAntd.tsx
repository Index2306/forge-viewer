import React, {useEffect, useState} from 'react';
import {Image} from "antd";
import axios from "axios";
import {useAppDispatch, useAppSelector} from "@/hooks";
import {addCache, removeCache, selectCache} from "@/store/slices/cache.slice";
import {isNullOrEmpty} from "@/helpers/StringHelper";

const AppImageAntd : React.FC<AppImageAntdProps> = ({isReload, className, style, width, height, url, token, alt, fallback, preview}) => {
    const {thumbnail: cache} = useAppSelector(selectCache)
    const [oldUrl, setOldUrl] = useState<string | undefined>(undefined);
    const [image, setImage] = useState<string | undefined>(cache && cache[url]);
    const dispatch = useAppDispatch()

    useEffect(() => {
        if (!token) return;

        //Get if url already exists in local storage
        if (isNullOrEmpty(url)) {
            dispatch(removeCache(oldUrl))
            setImage(undefined)
            return;
        }

        if (url.includes('base64')) {
            setImage(url);
            return
        }

        setOldUrl(url)
        if ((isReload || !image) && token) {
            const options = {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache',
                    'Expires': '0',
                }
            };

            axios.get(`${url}`, {...options})
                .then(async response => {
                    if (response.status == 200 && response.headers['content-type'].includes('image')) {
                        //Extract image from response body
                        const base64Data = `data:image/webp;base64,${response.data}`;
                        setImage(base64Data);
                        dispatch(addCache({key: url, data: base64Data}))
                    } else {
                        setImage(undefined)
                        dispatch(removeCache(url));
                    }
                })
                .catch(()=> {
                    setImage(undefined)
                    dispatch(removeCache(url));
                })
        }
    }, [url, isReload])

    useEffect(() => {
        setImage(cache && cache[url])

        return () => {
            setImage(undefined)
        }
    }, [cache])

    if (!token) return null;
    return (
        <Image
            className={className}
            width={width}
            height={height}
            style={style}
            src={image}
            alt={alt}
            fallback={fallback}
            preview={preview ? {...preview} : false}
        />
    )
};

export default React.memo(AppImageAntd);

interface AppImageAntdProps {
    isReload?: boolean
    className?: any,
    style?: any,
    width?: number,
    height?: number,
    url: string,
    alt: string,
    fallback?: string
    token: any
    preview?: any
}