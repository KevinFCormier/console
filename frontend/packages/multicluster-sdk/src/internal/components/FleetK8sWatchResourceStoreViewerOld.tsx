/* Copyright Contributors to the Open Cluster Management project */
import { Stack, StackItem, Truncate } from '@patternfly/react-core'
import { useFleetK8sWatchResourceStoreOld } from '../fleetK8sWatchResourceStoreOld'
import { FC, useEffect, useState } from 'react'

const TimestampAge: FC<{ timestamp: number }> = ({ timestamp }) => {
  const [now, updateNow] = useState(Date.now())
  useEffect(() => {
    const interval = setInterval(() => updateNow(Date.now), 100)
    return () => clearInterval(interval)
  }, [])
  return timestamp ? Math.round((now - timestamp) / 1000) : 0
}

const getWebSocketState = (state?: number) => {
  switch (state) {
    case WebSocket.CONNECTING:
      return 'CONNECTING'
    case WebSocket.OPEN:
      return 'OPEN'
    case WebSocket.CLOSING:
      return 'CLOSING'
    case WebSocket.CLOSED:
      return 'CLOSED'
    default:
      return 'N/A'
  }
}

export const FleetK8sWatchResourceStoreViewerOld = () => {
  const { resourceCache, socketCache } = useFleetK8sWatchResourceStoreOld()
  const resourceKeys = Object.keys(resourceCache)
  const socketKeys = Object.keys(socketCache)
  return (
    <Stack>
      <StackItem>
        <table style={{ tableLayout: 'fixed', width: '100%' }}>
          <tr>
            <th>Key</th>
            <th>Resource age</th>
          </tr>
          {Array.from(resourceKeys)
            .sort()
            .map((key) => (
              <tr key={key}>
                <td>
                  <Truncate position="start" content={key} />
                </td>
                <td>
                  <TimestampAge timestamp={resourceCache[key]?.timestamp} />
                </td>
              </tr>
            ))}
        </table>
      </StackItem>
      <StackItem>
        <table style={{ tableLayout: 'fixed', width: '100%' }}>
          <tr>
            <th>Key</th>
            <th>Socket readyState</th>
            <th>Socket age</th>
            <th>Socket refCount</th>
          </tr>
          {Array.from(socketKeys)
            .sort()
            .map((key) => (
              <tr key={key}>
                <td>
                  <Truncate position="start" content={key} />
                </td>
                <td>{getWebSocketState(socketCache[key]?.socket?.readyState)}</td>
                <td>
                  <TimestampAge timestamp={socketCache[key]?.timestamp} />
                </td>
                <td>{socketCache[key]?.refCount}</td>
              </tr>
            ))}
        </table>
      </StackItem>
    </Stack>
  )
}
