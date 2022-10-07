/* Copyright Contributors to the Open Cluster Management project */
// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import * as atoms from '../atoms'
// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import * as recoil from 'recoil'
// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import * as selectors from '../selectors'

import { Dispatch, ProviderProps, createContext, useState, SetStateAction, useMemo } from 'react'
import { LoadData } from '../atoms'

const { RecoilRoot, waitForAll } = recoil

export type PluginData = {
    recoil: typeof recoil
    atoms: typeof atoms
    selectors: typeof selectors
    waitForAll: typeof waitForAll
    loaded: boolean
    startLoading: boolean
    setLoaded: Dispatch<SetStateAction<boolean>>
    load: () => void
}

const defaultContext = {
    recoil,
    atoms,
    selectors,
    waitForAll,
    loaded: false,
    startLoading: false,
    setLoaded: () => {},
    load: () => {},
}

export const PluginDataContext = createContext<PluginData>(defaultContext)

export const usePluginDataContextValue = () => {
    const [loaded, setLoaded] = useState(false)
    const [startLoading, setStartLoading] = useState(false)

    const contextValue = useMemo(
        () => ({
            recoil,
            atoms,
            selectors,
            loaded,
            startLoading,
            defaultContext,
            setLoaded,
            load: () => setStartLoading(true),
        }),
        [loaded, setLoaded, startLoading]
    )

    return contextValue
}

export const PluginDataContextProvider = (props: ProviderProps<PluginData>) => {
    return (
        <PluginDataContext.Provider value={props.value}>
            <RecoilRoot>{props.value.startLoading ? <LoadData>{props.children}</LoadData> : props.children}</RecoilRoot>
        </PluginDataContext.Provider>
    )
}
