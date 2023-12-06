import {createContext} from 'react';

export const HomeContext = createContext<HomeContextProps>({isOpenCreateProjectModal: false});

export interface HomeContextProps {
        setIsTool?: (newValue: boolean) => void
        isOpenCreateProjectModal: boolean,
        setIsOpenCreateProjectModal?: any,
        setHeadElement?: any,
}