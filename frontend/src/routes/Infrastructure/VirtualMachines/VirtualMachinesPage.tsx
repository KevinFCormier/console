/* Copyright Contributors to the Open Cluster Management project */
import { PageSection } from '@patternfly/react-core'

import { AcmPage, AcmPageContent, AcmPageHeader } from '../../../ui-components'
import { FleetK8sResourceCommon, useFleetK8sWatchResource } from '@stolostron/multicluster-sdk'

function ConfigMapDisplayComponent() {
  const [result] = useFleetK8sWatchResource<FleetK8sResourceCommon & { data: { value: string } }>({
    cluster: 'spoke',
    groupVersionKind: { kind: 'ConfigMap', version: 'v1' },
    name: 'kevin-test',
    namespace: 'default',
  })
  const value = result?.data?.value
  return (
    <dl>
      <dt>Secret Value</dt>
      <dd>{value}</dd>
    </dl>
  )
}

export default function VirtualMachinesPage() {
  return (
    <AcmPage hasDrawer header={<AcmPageHeader title="Testing" />}>
      <AcmPageContent id="virtual-machines">
        <PageSection>Testing</PageSection>
        <PageSection>
          <ConfigMapDisplayComponent />
        </PageSection>
        <PageSection>
          <ConfigMapDisplayComponent />
        </PageSection>
      </AcmPageContent>
    </AcmPage>
  )
}
