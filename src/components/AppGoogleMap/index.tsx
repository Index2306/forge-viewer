import React, {useCallback, useEffect, useState} from 'react';
import {GoogleMap, Marker, useLoadScript} from "@react-google-maps/api"
import DataLoading from "@/components/AppLoading/DataLoading";
import styles from './AppGoogleMap.module.scss';

import "@reach/combobox/styles.css"
import {Library} from "@googlemaps/js-api-loader";
import {PlacesAutocomplete} from "@/components/AppGoogleMap/PlacesAutocomplete";

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAP_KEY ?? '';
const MAP_ID = process.env.NEXT_PUBLIC_MAP_ID ?? '';
const libraries: Library[] = ["places"];

const AppGoogleMap: React.FC<AppGoogleMapProps> = ({initialData, changeData}) => {
    const [zoom, setZoom] = useState<number>(18)
    const [place, setPlace] = useState<string>('')
    const [coords, setCoords] = useState<any>(undefined);
    const [placeId, setPlaceId] = useState<string | undefined>(undefined);

    const {isLoaded} = useLoadScript(
        {
            googleMapsApiKey: API_KEY,
            libraries,
            mapIds: [MAP_ID],
        });

    useEffect(() => {
        if (!initialData?.coords) {
            navigator.geolocation.getCurrentPosition(({coords: {latitude, longitude}}) => {
                setCoords({lat: latitude, lng: longitude})
            })
        } else {
            setCoords(initialData?.coords)
        }
        setPlace(initialData?.place ?? '')
        setPlaceId(initialData?.place_id)
        setZoom(18)
    }, [initialData])

    const handleSetPlacesAndCoords = (data: any) => {
        setCoords(data.coords)
        setZoom(data.zoom)
        setPlace(data.place)
        setPlaceId(data?.place_id)
        changeData({
            place: data.place,
            place_id: data?.place_id,
            coords: data.coords
        })
    }

    const onClickCoords = useCallback((event: google.maps.MapMouseEvent | any) => {
        if (event?.placeId) {
            setPlaceId(event.placeId)
        }
    }, []);

    if (!coords || !isLoaded) return <div style={{height: '100%', width: '100%', position: 'relative'}}><DataLoading/></div>
    return (
        <div style={{height: '100%', width: '100%', position: 'relative'}}>
            <div className={styles.placesContainer}>
                <PlacesAutocomplete setPlaces={handleSetPlacesAndCoords} initialPlace={place} placeId={placeId}/>
            </div>

            <GoogleMap
                center={coords}
                zoom={zoom}
                mapContainerClassName={styles.mapContainer}
                options={{
                    disableDefaultUI: true,
                    mapId: MAP_ID,
                }}
                onClick={onClickCoords}
            >
                <Marker position={coords} onClick={onClickCoords} />
            </GoogleMap>
        </div>
    );
};

export default React.memo(AppGoogleMap);

interface AppGoogleMapProps {
    initialData: any,
    changeData: (data: any) => void
}