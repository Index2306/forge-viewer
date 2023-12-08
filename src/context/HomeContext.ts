import {createContext} from 'react';

export const HomeContext = createContext<HomeContextProps>({});

export interface HomeContextProps {
        setHeadElement?: any,
}