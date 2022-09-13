/* Copyright Contributors to the Open Cluster Management project */
import { PluginData } from '../../../components/PluginData'
import { PluginContextProvider } from '../../../components/PluginContextProvider'
import InfraEnvironments from './InfraEnvironments'

export default function InfraEnvironmentsPlugin() {
    return (
        <PluginContextProvider>
            <PluginData>
                <InfraEnvironments />
            </PluginData>
        </PluginContextProvider>
    )
}
