import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { useLang } from './useLang'

export const CodeEditor = () => {
  const [snap, lang, isStep, setStep] = useLang()

  return (
    <article className="flex flex-col items-start w-full space-y-4">
      <div className="flex items-center space-x-2">
        <Label htmlFor="enable-step" className="pb-1">
          Enable step compile:
        </Label>
        <Switch id="enable-step" checked={isStep} onCheckedChange={(checked) => setStep(checked)} />
      </div>
      <Textarea
        id="program"
        name="program"
        value={snap.code}
        className="w-full h-40 md:w-2/3"
        placeholder="Type your code here."
        onChange={(event) => {
          lang.code = event.target.value
        }}
      />
      <code
        className={`
          ${snap.isError() ? 'text-red-600 whitespace-pre-line' : 'whitespace-pre-line'}`}
      >
        {snap.steps}
      </code>
      <p className={`${snap.isError() ? 'text-red-600' : ''}`}>
        <span>Result: {snap.result}: </span>
      </p>
      <p className="text-red-600">
        <span>{snap.error}: </span>
      </p>
    </article>
  )
}
