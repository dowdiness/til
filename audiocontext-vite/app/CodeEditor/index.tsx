import { useLang } from './useLang'

export const CodeEditor = () => {
  const [snap, lang] = useLang()

  return (
    <article className="flex flex-col items-start w-full space-y-4">
      <textarea
        id="program"
        name="program"
        value={snap.code}
        className="w-full h-32 p-2 border sm:w-2/3"
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
