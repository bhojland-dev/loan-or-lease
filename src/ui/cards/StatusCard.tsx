import { useForm } from '../formContext.ts'

/** Vises i stedet for resultatet, så længe der mangler eller er fejl i input. */
export function StatusCard() {
  const { problemCount, showProblems } = useForm()
  return (
    <section className="card status">
      <h2>Resultat</h2>
      <p>
        Udfyld de påkrævede felter for at se sammenligningen.{' '}
        {problemCount === 1 && '1 felt mangler eller skal rettes.'}
        {problemCount > 1 && `${problemCount} felter mangler eller skal rettes.`}
      </p>
      <button type="button" className="button" onClick={showProblems}>
        Vis felterne
      </button>
    </section>
  )
}
