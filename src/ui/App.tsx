import { BuyCard } from './cards/BuyCard.tsx'
import { LeaseCard } from './cards/LeaseCard.tsx'
import { ReturnCard } from './cards/ReturnCard.tsx'
import { SharedCard } from './cards/SharedCard.tsx'
import { StatusCard } from './cards/StatusCard.tsx'
import { FormContext } from './formContext.ts'
import { CompareIcon } from './icons.tsx'
import { PageHeader } from './PageHeader.tsx'
import { Results } from './results/Results.tsx'
import { useFormState } from './useFormState.ts'

function App() {
  const form = useFormState()
  return (
    <FormContext.Provider value={form}>
      <PageHeader />
      <main className="page">
        <form
          className="inputs"
          onSubmit={(e) => {
            // Enter i et felt beregner også.
            e.preventDefault()
            form.commitAll()
          }}
          noValidate
        >
          <SharedCard />
          <div className="duel">
            <BuyCard />
            <div className="vs" aria-hidden="true">
              <CompareIcon />
            </div>
            <LeaseCard />
          </div>
          <ReturnCard />
        </form>
        <div className="results">{form.result ? <Results result={form.result} /> : <StatusCard />}</div>
      </main>
    </FormContext.Provider>
  )
}

export default App
