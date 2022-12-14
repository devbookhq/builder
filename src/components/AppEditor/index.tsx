import { useEditorControls } from 'components/Header/EditorControlsProvider'

import { App } from 'queries/types'

import EditorProvider from 'core/EditorProvider'

import Board from './Board'
import InspectorSidebar from './InspectorSidebar'
import ResourcesSidebar from './ResourcesSidebar'
import useSaveAppState from './useSaveApp'

export interface Props {
  app: App
}

function AppEditor({ app }: Props) {
  const saveAppState = useSaveAppState(app.id)

  const { setEditorInstance } = useEditorControls()

  return (
    <EditorProvider
      initialState={app.state}
      onInit={setEditorInstance}
      onStateChange={saveAppState}
    >
      <div className="flex flex-1">
        <ResourcesSidebar />
        <Board />
        <InspectorSidebar />
      </div>
    </EditorProvider>
  )
}

export default AppEditor
