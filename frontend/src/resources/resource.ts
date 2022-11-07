/* Copyright Contributors to the Open Cluster Management project */
// https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.19

import { join } from 'path'
import { APIResourceNames, getApiPaths } from '../lib/api-resource-list'
import { Metadata } from './metadata'

export interface IResourceDefinition {
    apiVersion: string
    kind: string
}

export interface IResource extends IResourceDefinition {
    status?: any
    apiVersion: string
    kind: string
    metadata?: Metadata
}

export interface ResourceList<Resource extends IResource> {
    kind: string
    items?: Resource[]
}

/*
Todo: 
    1. use getResourcePlural to execute getApiResoruceList
    2. check to see if cache is empty, and if loading is false
    3. load, look for resource
    4. if resource is not found and loaded bool is false, reload and force update 
    5. if resource is not found and loaded bool is true, exit.

    Notes: With a queue, I can avoid redundant, parallel, calls to the api (so no need for the load state...)
    it seem like in any case, if the resource is not found, we will ring the 
    API a second time. To avoid making needless calls, each chained promise will check the cache
    if the resource isn't there, it will ping the api again.

    TODO: restore fallback code for getResourcePlural (which adds plural endings)
    */

let apiResourceList: APIResourceNames = {}
const callCache: Promise<string>[] = []
let pendingPromise = false

export function fallbackPlural(resourceDefinition: IResourceDefinition) {
    if (resourceDefinition.kind.endsWith('s')) {
        return resourceDefinition.kind.toLowerCase()
    }

    return resourceDefinition.kind?.toLowerCase().endsWith('y')
        ? resourceDefinition.kind?.toLowerCase().slice(0, -1) + 'ies'
        : resourceDefinition.kind?.toLowerCase() + 's'
}

function getPluralFromCache(resourceDefinition: IResourceDefinition) {
    return apiResourceList[resourceDefinition.apiVersion as string] &&
        apiResourceList[resourceDefinition.apiVersion as string][resourceDefinition.kind]
        ? apiResourceList[resourceDefinition.apiVersion as string][resourceDefinition.kind].pluralName
        : ''
}

export function getApiResourceList() {
    return getApiPaths().promise
}

export async function getResourcePlural(resourceDefinition: IResourceDefinition): Promise<string> {
    let plural = getPluralFromCache(resourceDefinition)
    if (plural) {
        return plural
    }

    if (pendingPromise) {
        // when queuing another call, we find the last call in the list and execute our next call in
        // the resolving callback. In that call back we check to see if the resource
        // is in the newly populated cache
        const previousCall = callCache[callCache.length - 1]
        const queuedAsyncResult = previousCall.then(() => {
            plural = getPluralFromCache(resourceDefinition)
            if (plural) {
                return plural
            }
            return getApiResourceList().then((list) => {
                apiResourceList = list
                callCache.shift()
                pendingPromise = callCache.length == 0 ? false : true
                plural = getPluralFromCache(resourceDefinition)
                return plural ? plural : fallbackPlural(resourceDefinition)
            })
        })
        callCache.push(queuedAsyncResult)
        return queuedAsyncResult
    } else {
        pendingPromise = true
        const asyncResult = getApiResourceList().then((list) => {
            apiResourceList = list
            callCache.shift()
            pendingPromise = callCache.length == 0 ? false : true
            plural = getPluralFromCache(resourceDefinition)
            return plural ? plural : fallbackPlural(resourceDefinition)
        })

        callCache.push(asyncResult)
        return asyncResult
    }
}

export function getApiVersionResourceGroup(apiVersion: string) {
    if (apiVersion.includes('/')) {
        return apiVersion.split('/')[0]
    } else {
        return ''
    }
}

export function getResourceGroup(resourceDefinition: IResourceDefinition) {
    if (resourceDefinition.apiVersion.includes('/')) {
        return resourceDefinition.apiVersion.split('/')[0]
    } else {
        return ''
    }
}

export function getResourceName(resource: Partial<IResource>) {
    return resource.metadata?.name
}

export function getResourceNamespace(resource: Partial<IResource>) {
    return resource.metadata?.namespace
}

export async function getResourceApiPath(options: {
    apiVersion: string
    kind?: string
    plural?: string
    metadata?: { namespace?: string }
}) {
    const { apiVersion } = options

    let path: string
    if (apiVersion?.includes('/')) {
        path = join('/apis', apiVersion)
    } else {
        path = join('/api', apiVersion)
    }

    const namespace = options.metadata?.namespace
    if (namespace) {
        path = join(path, 'namespaces', namespace)
    }

    if (options.plural) {
        path = join(path, options.plural)
        return path.replace(/\\/g, '/')
    } else if (options.kind) {
        const pluralName = await getResourcePlural({ apiVersion: options.apiVersion, kind: options.kind })
        path = join(path, pluralName)
    }

    return path.replace(/\\/g, '/')
}

export async function getResourceNameApiPath(options: {
    apiVersion: string
    kind?: string
    plural?: string
    metadata?: { name?: string; namespace?: string }
}) {
    let path = await getResourceApiPath(options)

    const name = options.metadata?.name
    if (name) {
        path = join(path, name)
    }

    return path.replace(/\\/g, '/')
}

export function getResourceNameApiPathTestHelper(options: {
    apiVersion: string
    kind?: string
    plural?: string
    metadata?: { name?: string; namespace?: string }
}) {
    let path = getResourceApiPathTestHelper(options)

    const name = options.metadata?.name
    if (name) {
        path = join(path, name)
    }

    return path.replace(/\\/g, '/')
}

export function getResourceApiPathTestHelper(options: {
    apiVersion: string
    kind?: string
    plural?: string
    metadata?: { name?: string; namespace?: string }
}) {
    const { apiVersion } = options

    let path: string
    if (apiVersion?.includes('/')) {
        path = join('/apis', apiVersion)
    } else {
        path = join('/api', apiVersion)
    }

    const namespace = options.metadata?.namespace
    if (namespace) {
        path = join(path, 'namespaces', namespace)
    }

    if (options.plural) {
        path = join(path, options.plural)
        return path.replace(/\\/g, '/')
    } else if (options.kind) {
        const pluralName = fallbackPlural({ apiVersion: options.apiVersion, kind: options.kind })
        path = join(path, pluralName)
    }

    return path.replace(/\\/g, '/')
}
