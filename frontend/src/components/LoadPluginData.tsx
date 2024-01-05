/* Copyright Contributors to the Open Cluster Management project */
import { ReactNode, useContext, useEffect } from 'react'
import { PluginContext } from '../lib/PluginContext'
import { LoadingPage } from './LoadingPage'
import { LostChangesProvider } from './LostChanges'

export const LoadPluginData = (props: { children?: ReactNode }) => {
  const { dataContext } = useContext(PluginContext)
  const { dataPending, startLoading, load } = useContext(dataContext)
  useEffect(() => {
    if (!startLoading) {
      load()
    }
  }, [load, startLoading])
  return !dataPending ? <LostChangesProvider>{props.children}</LostChangesProvider> : <LoadingPage />
}
