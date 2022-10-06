/* Copyright Contributors to the Open Cluster Management project */
import { ReactNode, useContext, useEffect } from 'react'
import { PluginDataContext } from '../lib/PluginDataContext'
import { LoadingPage } from './LoadingPage'

export function PluginData(props: { children?: ReactNode }) {
    const { loaded, load } = useContext(PluginDataContext)
    useEffect(() => {
        if (!loaded) {
            load()
        }
    }, [load, loaded])
    return loaded ? <>{props.children}</> : <LoadingPage />
}
