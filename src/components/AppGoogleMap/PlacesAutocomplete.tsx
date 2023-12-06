import React, {useEffect, useState} from 'react';
import usePlacesAutocomplete, {getGeocode, getLatLng} from "use-places-autocomplete";
import {Combobox, ComboboxInput, ComboboxList, ComboboxOption, ComboboxPopover} from "@reach/combobox";
import styles from "@/components/AppGoogleMap/AppGoogleMap.module.scss";
import {useTranslation} from "next-i18next";

export const PlacesAutocomplete: React.FC<PlacesAutocompleteProps> = ({setPlaces, initialPlace, placeId}) => {
    const {t} = useTranslation()
    const [hideSuggest, setHideSuggest] = useState<boolean>(true)
    const {ready, value, setValue, suggestions: {status, data}, clearSuggestions} = usePlacesAutocomplete();

    useEffect(() => {
        setValue(initialPlace)
        console.log('-------------------------- initialPlace', initialPlace)
    }, [initialPlace])

    useEffect(() => {
        handleGetByPlaceId(placeId)
        console.log('-------------------------- placeId     ', placeId)
    }, [placeId])

    const handleSelect = async (address: string) => {
        setHideSuggest(false)
        setValue(address, false);
        clearSuggestions();

        const results = await getGeocode({ address });
        if (results.length > 0) {
            const { lat, lng } = await getLatLng(results[0]);
            setPlaces({place: results[0].formatted_address, place_id: results[0].place_id, coords: { lat, lng }, zoom: 18});
        }
    };


    const handleGetByPlaceId = async (placeId: string | undefined) => {
        if (!placeId) return;
        setHideSuggest(true)
        const results = await getGeocode({ placeId });
        if (results.length > 0) {
            const { lat, lng } = await getLatLng(results[0]);
            setPlaces({place: results[0].formatted_address, place_id: results[0].place_id, coords: { lat, lng }, zoom: 18});
        }
    }

    return <Combobox onSelect={handleSelect}>
        <ComboboxInput
            value={value}
            onChange={(e) => {
                setValue(e.target.value)
                setHideSuggest(false)
            }}
            disabled={!ready}
            className={styles.comboboxInput}
            placeholder={t('search_an_address')}
        />
        {hideSuggest ? null : <ComboboxPopover style={{zIndex: 1001}}>
            <ComboboxList>
                {status === "OK" &&
                    data.map(({ place_id, description }) => (
                        <ComboboxOption key={place_id} value={description} />
                    ))}
            </ComboboxList>
        </ComboboxPopover>
        }
    </Combobox>
}

interface PlacesAutocompleteProps {
    setPlaces: (val: any) => void
    initialPlace: string
    placeId: string | undefined
}