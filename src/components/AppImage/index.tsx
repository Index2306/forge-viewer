import React, {useEffect, useState} from 'react';
import Image from "next/image";

const AppImage : React.FC<AppImageProps> = ({className, width, height, url, token}) => {
    const [image, setImage] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            //Get if url already exists in local storage
            let cached = window.localStorage.getItem(url);
            if(cached){
                setImage(cached);
                //If not, get it from API
            } else {
                const response = await fetch(url, {
                    headers: {
                        'Method': 'GET',
                        'Authorization': `${token}`
                    }
                });
                //Extract image from response body
                const base64Image = await response.json();
                const imageObject = await fetch(`data:image/webp;base64,${base64Image}`);
                const blobImage = await imageObject.blob();

                //Create an Url that stores the image
                const objectURL = URL.createObjectURL(blobImage);

                //Save in local storage and component state
                setImage(objectURL);
                window.localStorage.setItem(url, objectURL);
            }
        })();
        () => {
            // clear memory if needed
            URL.revokeObjectURL(image ?? '');
            window.localStorage.removeItem(url);
        }
    }, [])

    return (
        <>
            {
                image ? <Image src={image} alt="profile" className="rounded-full" width={90} height={90}/> : null
            }
        </>
    )
};

export default AppImage;

interface AppImageProps {
    className: any,
    width: number,
    height: number,
    url: string,
    token: string
}