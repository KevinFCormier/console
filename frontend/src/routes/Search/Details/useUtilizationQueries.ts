/* Copyright Contributors to the Open Cluster Management project */

import { UseUtilizationQueries } from '../../../plugin-extensions/extensions/KubevirtContext'

enum VMQueries {
  CPU_REQUESTED = 'CPU_REQUESTED',
  CPU_USAGE = 'CPU_USAGE',
  FILESYSTEM_READ_USAGE = 'FILESYSTEM_READ_USAGE',
  FILESYSTEM_USAGE_TOTAL = 'FILESYSTEM_TOTAL_USAGE',
  FILESYSTEM_WRITE_USAGE = 'FILESYSTEM_WRITE_USAGE',
  INSTANT_MIGRATION_DATA_PROCESSED = 'INSTANT_MIGRATION_DATA_PROCESSED',
  INSTANT_MIGRATION_DATA_REMAINING = 'INSTANT_MIGRATION_DATA_REMAINING',
  MEMORY_USAGE = 'MEMORY_USAGE',
  MIGRATION_DATA_PROCESSED = 'MIGRATION_DATA_PROCESSED',
  MIGRATION_DATA_REMAINING = 'MIGRATION_DATA_REMAINING',
  MIGRATION_DISK_TRANSFER_RATE = 'MIGRATION_DISK_TRANSFER_RATE',
  MIGRATION_MEMORY_DIRTY_RATE = 'MIGRATION_MEMORY_DIRTY_RATE',
  NETWORK_IN_BY_INTERFACE_USAGE = 'NETWORK_IN_BY_INTERFACE_USAGE',
  NETWORK_IN_USAGE = 'NETWORK_IN_USAGE',
  NETWORK_OUT_BY_INTERFACE_USAGE = 'NETWORK_OUT_BY_INTERFACE_USAGE',
  NETWORK_OUT_USAGE = 'NETWORK_OUT_USAGE',
  NETWORK_TOTAL_BY_INTERFACE_USAGE = 'NETWORK_TOTAL_BY_INTERFACE_USAGE',
  NETWORK_TOTAL_USAGE = 'NETWORK_TOTAL_USAGE',
  STORAGE_IOPS_TOTAL = 'STORAGE_IOPS_TOTAL',
}

export const useUtilizationQueries: UseUtilizationQueries = (prometheusQueries, duration) => {
  let queries = prometheusQueries
  const searchParams = new URLSearchParams(decodeURIComponent(window.location.search))
  const name = searchParams.get('name')
  const namespace = searchParams.get('namespace')
  const cluster = searchParams.get('cluster')
  if (cluster) {
    // convert prometheus query to thanos query
    let query: string
    queries = {}
    const filter = `name='${name}',namespace='${namespace}',cluster='${cluster}'`
    Object.keys(prometheusQueries).map((key) => {
      switch (key) {
        case VMQueries.CPU_USAGE:
          query = `sum(rate(kubevirt_vmi_cpu_usage_seconds_total{${filter}}[${duration}])) BY (cluster, name, namespace)`
          break
        case VMQueries.CPU_REQUESTED:
          query = `sum by (cluster, namespace, name, node)(last_over_time(kubevirt_vm_resource_requests{${filter}, resource="cpu", unit="cores"}[${duration}])) *
          sum by (cluster, namespace, name, node)(last_over_time(kubevirt_vm_resource_requests{${filter}, resource="cpu", unit="threads"}[${duration}])) *
          sum by (cluster, namespace, name, node)(last_over_time(kubevirt_vm_resource_requests{${filter}, resource="cpu", unit="sockets"}[${duration}]))`
          break
        case VMQueries.FILESYSTEM_USAGE_TOTAL:
          query = `sum by (name, namespace, cluster)(rate(kubevirt_vmi_storage_iops_read_total{${filter}}[${duration}])) + 
            sum by (name, namespace, cluster)(rate(kubevirt_vmi_storage_iops_write_total{${filter}}[${duration}]))`
          break
        default:
          query = prometheusQueries[key]?.replace(/\{([^}]+)\}/g, (_, key) => {
            return `{${key},cluster='${cluster}'}`
          })
      }
      queries[key] = query
    })
  }
  return queries
}
