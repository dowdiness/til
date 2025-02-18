import { Textarea } from '@/components/ui/textarea'
import { updateFlags } from '@/core'
import { useCallback } from 'react'
import { useLang } from './useLang'

export const CodeEditor = () => {
  const [langSnap, langProxy] = useLang()

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      try {
        updateFlags.isEditingCode = true
        langProxy.code = e.target.value
      } finally {
        updateFlags.isEditingCode = false
      }
    },
    [langProxy],
  )

  return (
    <div className="flex flex-col w-full gap-4 p-4">
      <div className="flex flex-col gap-2">
        <label htmlFor="code" className="font-medium text-md">
          Code
        </label>
        <Textarea
          id="program"
          name="program"
          value={langSnap.code}
          className="w-full h-40 md:w-2/3"
          placeholder="Type your code here."
          onChange={handleChange}
        />
      </div>
      <div className="flex flex-col gap-2">
        <div className="font-medium text-md">Steps</div>
        <code className="w-full h-auto p-2 overflow-auto font-mono text-sm whitespace-pre-line">
          {langSnap.steps}
        </code>
      </div>
      <div className="flex flex-col gap-2">
        <div className="font-medium text-md">Result</div>
        <pre className="w-full h-auto p-2 overflow-auto font-mono text-sm">{langSnap.result}</pre>
      </div>
      {langSnap.error && (
        <div className="flex flex-col gap-2">
          <div className="text-sm font-medium text-red-500">Error</div>
          <pre className="w-full h-32 p-2 overflow-auto font-mono text-sm text-red-500 border border-red-100 rounded-md bg-red-50">
            {langSnap.error}
          </pre>
        </div>
      )}
    </div>
  )
}
