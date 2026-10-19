import { useState } from 'react'
import { useForm } from './formContext.ts'
import { ResetIcon } from './icons.tsx'

export function PageHeader() {
  return (
    <header className="page-header">
      <div className="page-header-text">
        <h1>Lån eller leasing</h1>
        <p>
          Sammenlign de samlede omkostninger (TCO) ved at købe bilen med billån og ved privatleasing af den samme bil
          efter 1, 2, 3 og 4 år.
        </p>
      </div>
      <ResetControl />
    </header>
  )
}

/** "Nulstil alt" med et bekræftelsestrin, da alle indtastninger slettes. */
function ResetControl() {
  const { reset } = useForm()
  const [confirming, setConfirming] = useState(false)
  return (
    <div className="reset" role="group" aria-label="Nulstil">
      {confirming ? (
        <>
          <span className="reset-question">Slet alle indtastninger?</span>
          <button
            type="button"
            className="button button-danger"
            onClick={() => {
              reset()
              setConfirming(false)
            }}
          >
            Ja, nulstil
          </button>
          <button type="button" className="button button-quiet" onClick={() => setConfirming(false)}>
            Annuller
          </button>
        </>
      ) : (
        <button type="button" className="button button-quiet" onClick={() => setConfirming(true)}>
          <ResetIcon />
          Nulstil alt
        </button>
      )}
    </div>
  )
}
