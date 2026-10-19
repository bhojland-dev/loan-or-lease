// Typer for beregningsmotoren. Id'er (I1-I23, B1-B7, O1-O10) henviser til SPEC.md.

export type Frequency = 'month' | 'quarter' | 'halfYear' | 'year'

export interface PeriodicAmount {
  amount: number
  frequency: Frequency
}

export type LeaseTerm = 12 | 24 | 36 | 48

/** Afskrivning år 1-4 i procent (I9). */
export type DepreciationPct = readonly [number, number, number, number]

/**
 * Brugerens input, som det står i formularen. Felter uden værdi er `undefined`.
 * I5 og I6 er `undefined`, når standardværdien (beregnet af lånebehovet) skal bruges.
 */
export interface InputDraft {
  purchasePrice?: number // I1
  downPayment?: number // I2
  interestRatePct?: number // I3, % p.a.
  loanTermMonths?: number // I4
  registrationFee?: number // I5, tinglysningsafgift
  establishmentFee?: number // I6, stiftelsesprovision
  monthlyLoanFee?: number // I7
  service?: Partial<PeriodicAmount> // I8
  depreciationPct?: DepreciationPct // I9
  insurance?: Partial<PeriodicAmount> // I10
  ownershipTax?: Partial<PeriodicAmount> // I11, ejerafgift
  annualKm?: number // I12
  leaseTermMonths?: number // I13
  leaseInitialPayment?: number // I14, førstegangsydelse
  leaseMonthlyPayment?: number // I15
  returnCost?: number // I19, egenbetaling ved aflevering
  annualReturnPct?: number // I21
  returnTaxPct?: number // I22
  interestDeductionPct?: number // I23, fradragsprocent for renter
}

/** Valideret og komplet input. Procenter er stadig i procent (fx 6 = 6 %). */
export interface Inputs {
  purchasePrice: number // I1
  downPayment: number // I2
  interestRatePct: number // I3 (0 når der intet lån er)
  loanTermMonths: number // I4 (0 når der intet lån er)
  registrationFee: number // I5
  establishmentFee: number // I6
  monthlyLoanFee: number // I7
  service: PeriodicAmount // I8
  depreciationPct: DepreciationPct // I9
  insurance: PeriodicAmount // I10
  ownershipTax: PeriodicAmount // I11
  annualKm: number // I12
  leaseTermMonths: LeaseTerm // I13
  leaseInitialPayment: number // I14
  leaseMonthlyPayment: number // I15
  returnCost: number // I19
  annualReturnPct: number // I21
  returnTaxPct: number // I22
  interestDeductionPct: number // I23 (0 når der intet lån er)
}

export type InputField = keyof InputDraft

export interface ValidationError {
  field: InputField
  message: string
}

export type ValidationResult =
  | { ok: true; inputs: Inputs }
  | { ok: false; errors: ValidationError[] }

/** B1-B5 og lånets løbetid. Restgæld (B6) og rentefradrag (B7) beregnes i loan.ts. */
export interface Loan {
  loanNeed: number // B1
  principal: number // B2
  monthlyRate: number // B3, som brøk (0,005 = 0,5 %)
  installment: number // B4, rente + afdrag
  monthlyPayment: number // B5, ydelse + løbende gebyr
  termMonths: number // I4
}

/** Én række i afviklingsprofilen (O3). */
export interface AmortizationRow {
  month: number
  installment: number
  interest: number
  principalPaid: number
  fee: number
  balance: number
}

export interface BuyBreakdown {
  downPayment: number
  loanPayments: number
  remainingDebt: number
  insurance: number
  ownershipTax: number
  service: number
  residualValue: number
  interestDeduction: number // B7
  investmentReturn: number
  total: number
}

export interface LeaseBreakdown {
  initialPayment: number
  monthlyPayments: number
  insurance: number
  ownershipTax: number
  returnCost: number
  investmentReturn: number
  total: number
}

export type Cheapest = 'buy' | 'lease' | 'equal'

/** O10: gennemsnitlig fast udgift pr. måned frem til t, uden engangsbeløb (SPEC.md 2.8). */
export interface MonthlyCosts {
  /** Låneydelse inkl. gebyr (køb) eller leasingydelse (leasing). */
  payment: number
  insurance: number
  ownershipTax: number
  service: number
  beforeTax: number
  interestDeduction: number
  afterTax: number
}

/** O1: én række pr. tidspunkt t. */
export interface ComparisonRow {
  months: number
  buy: BuyBreakdown
  lease: LeaseBreakdown
  /** TCO køb − TCO leasing. Negativ betyder, at køb er billigst. */
  difference: number
  cheapest: Cheapest
  monthly: { buy: MonthlyCosts; lease: MonthlyCosts } // O10
}

/** O2: break-even pr. tidspunkt t. Værditab som brøk (0,2 = 20 %). */
export interface BreakEvenRow {
  months: number
  breakEvenResidualValue: number
  breakEvenDepreciation: number
  expectedDepreciation: number
}

export interface Warning {
  code: 'highMileage' // O4
  field: InputField
  message: string
}

export interface Result {
  comparison: ComparisonRow[] // O1
  breakEven: BreakEvenRow[] // O2
  amortization: AmortizationRow[] // O3
  warnings: Warning[] // O4
}
