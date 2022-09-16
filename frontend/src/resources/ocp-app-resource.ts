/* Copyright Contributors to the Open Cluster Management project */
import { IResourceDefinition } from './resource'

export enum OCPAppResourceKind {
    CronJob = 'cronjob',
    DaemonSet = 'daemonset',
    Deployment = 'deployment',
    DeploymentConfig = 'deploymentconfig',
    Job = 'job',
    StatefulSet = 'statefulset',
}
export interface OCPAppResource extends IResourceDefinition {
    apiVersion: 'apps/v1' | 'batch/v1' | 'v1'
    kind: OCPAppResourceKind
    name: string
    namespace: string
    label: string
    status?: any
    transformed?: {
        clusterCount?: string
    }
}
