/* Copyright Contributors to the Open Cluster Management project */

import { Cluster, mapClusters } from '../../../../../resources'
import { useContext, useMemo } from 'react'
import { useSharedAtoms, useRecoilValue } from '../../../../../shared-recoil'
import { PluginDataContext } from '../../../../../lib/PluginDataContext'

export function useAllClusters() {
    const { waitForAll } = useContext(PluginDataContext)
    const {
        managedClustersState,
        clusterDeploymentsState,
        managedClusterInfosState,
        certificateSigningRequestsState,
        managedClusterAddonsState,
        clusterClaimsState,
        clusterCuratorsState,
        agentClusterInstallsState,
        hostedClustersState,
        nodePoolsState,
    } = useSharedAtoms()
    const [
        managedClusters,
        clusterDeployments,
        managedClusterInfos,
        certificateSigningRequests,
        managedClusterAddons,
        clusterClaims,
        clusterCurators,
        agentClusterInstalls,
        hostedClusters,
        nodePools,
    ] = useRecoilValue(
        waitForAll([
            managedClustersState,
            clusterDeploymentsState,
            managedClusterInfosState,
            certificateSigningRequestsState,
            managedClusterAddonsState,
            clusterClaimsState,
            clusterCuratorsState,
            agentClusterInstallsState,
            hostedClustersState,
            nodePoolsState,
        ])
    )
    const clusters = useMemo(
        () =>
            mapClusters(
                clusterDeployments,
                managedClusterInfos,
                certificateSigningRequests,
                managedClusters,
                managedClusterAddons,
                clusterClaims,
                clusterCurators,
                agentClusterInstalls,
                hostedClusters,
                nodePools
            ),
        [
            clusterDeployments,
            managedClusterInfos,
            certificateSigningRequests,
            managedClusters,
            managedClusterAddons,
            clusterClaims,
            clusterCurators,
            agentClusterInstalls,
            hostedClusters,
            nodePools,
        ]
    )
    return clusters as Cluster[]
}
