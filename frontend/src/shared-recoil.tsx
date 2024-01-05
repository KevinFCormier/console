/* Copyright Contributors to the Open Cluster Management project */
// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import { RecoilState, RecoilValue, SetterOrUpdater } from 'recoil'

import { PluginContext } from './lib/PluginContext'
import { useContext, useLayoutEffect } from 'react'

/* Do not export - wrapper functions should be used to track atom usage */
function useSharedRecoil() {
  const { dataContext } = useContext(PluginContext)
  const { recoil } = useContext(dataContext)

  return recoil
}

function useWaitForRecoilValue<T>(param: RecoilValue<T>) {
  const { dataContext } = useContext(PluginContext)
  const { setDataRequired } = useContext(dataContext)
  useLayoutEffect(() => {
    setDataRequired(true)
  }, [setDataRequired])
}

export function useSharedAtoms() {
  const { dataContext } = useContext(PluginContext)
  const { atoms } = useContext(dataContext)

  return atoms
}

export function useSharedSelectors() {
  const { dataContext } = useContext(PluginContext)
  const { selectors } = useContext(dataContext)

  return selectors
}

export function useRecoilValue<T>(param: RecoilValue<T>): T {
  useWaitForRecoilValue(param)
  const { useRecoilValue: useSharedRecoilValue } = useSharedRecoil()
  return useSharedRecoilValue(param)
}

export function useSetRecoilState<T>(param: RecoilState<T>): SetterOrUpdater<T> {
  const { useSetRecoilState: useSharedSetRecoilState } = useSharedRecoil()
  return useSharedSetRecoilState(param)
}

export function useRecoilValueGetter<T>(param: RecoilValue<T>): () => T {
  useWaitForRecoilValue(param)
  const { useRecoilCallback } = useSharedRecoil()
  return useRecoilCallback<[], T>(
    ({ snapshot }) =>
      () =>
        snapshot.getLoadable(param).contents,
    []
  )
}
