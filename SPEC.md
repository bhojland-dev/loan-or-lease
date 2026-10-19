# Specifikation – køb vs. privatleasing

Oct 19, 2026 · @Brian Højland Nielsen

Appen sammenligner TCO for køb og privatleasing af samme bil efter 12, 24, 36 og 48 måneder, op til leasingaftalens løbetid. Lavest TCO er billigst.

## 1. Input

Alle forudfyldte felter kan rettes af brugeren. Felter uden standardværdi skal udfyldes.

| Id | Felt | Gælder | Standardværdi | Validering |
| --- | --- | --- | --- | --- |
| I1 | Købspris (kr., faktisk pris efter evt. rabat) | Køb | Ingen | > 0 |
| I2 | Udbetaling (kr.) | Køb | Ingen | 0 ≤ I2 ≤ I1 |
| I3 | Debitorrente (% p.a.) | Køb | Ingen | ≥ 0. Kun ved lån |
| I4 | Lånets løbetid (mdr.) | Køb | Ingen | > 0, uafhængig af I13. Kun ved lån |
| I5 | Tinglysningsafgift (kr.) | Køb | 1.850 + 1,5 % af lånebehov, hele beløbet oprundet til nærmeste 100 kr. (fx 4.250 → 4.300) | ≥ 0. Kun ved lån |
| I6 | Stiftelsesprovision (kr.) | Køb | 1,25 % af lånebehov, min. 2.000, maks. 10.000 | ≥ 0. Kun ved lån |
| I7 | Løbende lånegebyr (kr./md.) | Køb | 0 | ≥ 0. Kun ved lån |
| I8 | Service (beløb + frekvens) | Køb | Ingen | ≥ 0. Ved leasing altid 0 kr. (inkluderet) |
| I9 | Afskrivning år 1 / 2 / 3 / 4 (%) | Køb | 20 / 14,5 / 14,5 / 14,5 | 0-100 |
| I10 | Forsikring (beløb + frekvens) | Begge | Ingen | ≥ 0. Ét fælles felt |
| I11 | Ejerafgift (beløb + frekvens) | Begge | 460 kr. halvårligt (typisk for moderne elbiler) | ≥ 0. Ét fælles felt |
| I12 | Forventet kørsel (km/år) | Begge | 15.000 | 10.000-45.000 i trin af 5.000 |
| I13 | Leasingaftalens løbetid (mdr.) | Leasing | 48 | 12, 24, 36 eller 48 |
| I14 | Førstegangsydelse (kr.) | Leasing | Ingen | ≥ 0 |
| I15 | Månedlig leasingydelse (kr.) | Leasing | Ingen | > 0 |
| I19 | Egenbetaling ved aflevering (kr.) | Leasing | 5.000 | ≥ 0 |
| I21 | Årlig afkastrente (%) | Begge | 0,25 | ≥ 0 |
| I22 | Skattesats på afkast (%) | Begge | 37 | 0-100 |
| I23 | Fradragsprocent for renter (%) | Køb | 33 | 0-100. Kun ved lån |

Frekvens for I8, I10 og I11 vælges blandt måned, kvartal, halvår og år.

I3-I7 og I23 bruges og valideres kun ved lån (B1 > 0). Er udbetalingen lig købsprisen, er der intet lån, og felterne skjules og ignoreres.

I16-I18 og I20 er udgået, og numrene genbruges ikke. Leasingaftalens inkluderede km antages at svare til I12, så der er hverken over- eller underkørsel. Afkast regnes altid med.

## 2. Beregning

Alle beregninger udføres for hvert tidspunkt t = 12, 24, 36, 48 mdr., hvor t ≤ I13. Tidspunkter mellem hele år understøttes ikke.

### 2.1 Lån (kun annuitetslån)

| Id | Størrelse | Beregning |
| --- | --- | --- |
| B1 | Lånebehov L | I1 − I2. Er L = 0, er der intet lån, og B2-B6 er 0 |
| B2 | Hovedstol H | L + I5 + I6. Omkostningerne beregnes af L, ikke af H |
| B3 | Månedsrente r | I3 / 12 |
| B4 | Ydelse A (rente + afdrag) | H × r / (1 − (1 + r)^−I4). Ved r = 0: H / I4 |
| B5 | Månedlig betaling | A + I7 |
| B6 | Restgæld efter k ydelser | H × (1 + r)^k − A × ((1 + r)^k − 1) / r. Ved r = 0: H − A × k. Er k ≥ I4, er restgælden 0 |
| B7 | Rentefradrag ved t | Summen af renterne i ydelse 1 … min(t, I4) × I23. Renten i ydelse k = B6(k − 1) × r |

Låneydelser betales bagud. Ved tidspunkt t er min(t, I4) ydelser betalt, og restgælden opgøres efter den sidste. Er lånets løbetid kortere end t, stopper ydelsen. Stiftelsesomkostninger refunderes ikke ved indfrielse.

### 2.2 Restværdi

Restværdi(t) = I1 × (1 − år 1 %) × … × (1 − år n %), hvor n = t / 12. Hvert års procent regnes af restværdien ved årets start.

### 2.3 Løbende udgifter

Beløb med frekvens betales forud. Antal betalinger ved tidspunkt t = t / frekvens i måneder (fx halvår ved 24 mdr. = 4 betalinger).

### 2.4 TCO køb

TCO køb(t) = I2 + min(t, I4) × B5 + B6(t) + forsikring(t) + ejerafgift(t) + service(t) − Restværdi(t) − B7(t) − Afkast køb(t)

Udbetalingen betales i måned 0. Kun renterne giver fradrag; gebyrer og stiftelsesomkostninger gør ikke.

### 2.5 TCO leasing

TCO leasing(t) = I14 + t × I15 + forsikring(t) + ejerafgift(t) + I19 − Afkast leasing(t)

- Førstegangsydelsen betales i måned 0, leasingydelsen forud.
- I19 gælder ved hvert tidspunkt, da bilen afleveres. Førtidigt ophør koster ikke ekstra.
- Service er altid inkluderet i ydelsen og tæller 0 kr.

### 2.6 Afkast

For hver måned m = 0 … t − 1 beregnes udgiften i begge scenarier (måned 0 inkl. udbetaling og førstegangsydelse). Måned m dækker perioden fra m til m + 1: forudbetalinger falder i starten af måneden, og låneydelse nr. m + 1 (bagud) i slutningen. Alle min(t, I4) ydelser indgår dermed. Rentefradraget for ydelse nr. m + 1 (renten × I23) trækkes fra købets udgift i samme måned. Det scenarie med den laveste udgift indskyder forskellen på sin konto. Kontoen forrentes månedligt med I21 / 12. Et indskud i måned m forrentes til tidspunkt t, dvs. i t − m måneder.

Ved t: gevinst = saldo − samlede indskud. Afkast = gevinst × (1 − I22). Afkastet trækkes fra det pågældende scenaries TCO. Indfrielse af restgæld ved t indgår ikke i den månedlige udgift. Det gør engangsbeløbet I19 ved t heller ikke.

### 2.7 Break-even

Break-even-restværdi(t) = TCO køb(t) uden restværdi − TCO leasing(t)

Break-even-værditab(t) = 1 − Break-even-restværdi(t) / I1

Er det forventede værditab mindre end break-even, er køb billigst.

### 2.8 Månedlige faste udgifter

Gennemsnitlig udgift pr. måned frem til tidspunkt t, uden engangsbeløb (udbetaling, førstegangsydelse, restgæld og I19):

- Køb før skat = (min(t, I4) × B5 + forsikring(t) + ejerafgift(t) + service(t)) / t
- Køb efter skat = Køb før skat − B7(t) / t
- Leasing før skat = (t × I15 + forsikring(t) + ejerafgift(t)) / t
- Leasing efter skat = Leasing før skat (intet fradrag)

## 3. Output

| Id | Output | Indhold |
| --- | --- | --- |
| O1 | Sammenligning | For hvert tidspunkt t ≤ I13: TCO køb, TCO leasing, forskel i kr. og hvilket scenarie der er billigst |
| O2 | Break-even | For hvert tidspunkt: break-even-værditab i % sammenholdt med det forventede værditab fra I9 |
| O3 | Afviklingsprofil | Lånets hele løbetid, én række pr. måned: ydelse, rente, afdrag, løbende gebyr, restgæld |
| O4 | Advarsel km | Er I12 > 20.000 km/år: restværdien ved køb kan være for høj, og afskrivningsprocenterne bør hæves |
| O5 | Note ved I9 | Kilde: Bilbasen/Bilinfo (ca. 2016): ca. 20 % tab i år 1 og ca. 50 % efter 4 år. Fordelingen på år 2-4 er ligelig |
| O8 | Validering | Udbetaling > købspris giver fejl. Beregning gennemføres ikke, før alle påkrævede felter er udfyldt |
| O9 | Note ved I19 | Egenbetalingen kan dækkes af en afleveringsforsikring. Så svarer beløbet til forsikringens selvrisiko, fx 5.000 kr. |
| O10 | Månedlige faste udgifter | For hvert tidspunkt t: køb og leasing før og efter skat, jf. 2.8 |

O6 og O7 er udgået.

## 4. Forenklinger, åbne punkter og kilder

### Bevidste forenklinger

- Standardværdier for afskrivning er ca. 10 år gamle og skelner ikke mellem el og fossil.
- Afskrivning afhænger ikke af km; der vises kun en advarsel (O4).
- Lånets omkostninger beregnes af lånebehovet (forskel ca. 180 kr. ved 160.000 kr.).
- Skat af afkast beregnes samlet med én sats. Der tages ikke højde for grænsen på 55.000 kr. eller skat år for år.
- Rentefradrag beregnes med én sats (I23) uden hensyn til grænsen for negativ kapitalindkomst, og fradraget falder samme måned som renten.
- Leasing antages uden over- eller underkørte km og uden omkostning ved førtidigt ophør.
- Service inkluderet i leasing bygger på FDM's standardkontrakt.

### Åbne punkter

Ingen åbne punkter.

### Kilder

- [Bilbasen/Bilinfo: værditab de første 4 år](https://blog.bilbasen.dk/penge-ud-af-vinduet-sa-meget-vaerdi-taber-din-nye-bil-4472)
- [Tinglysningsretten: tinglysningsafgifter](https://www.domstol.dk/tinglysningsretten/tingboegerne/tinglysningsafgifter/)
- [Skat.dk: tinglysningsafgift 2026](https://skat.dk/erhverv/afgifter-paa-varer-og-ydelser-punktafgifter/nyhedsbrev-afgifter/tinglysningsafgift-ny-afgiftssats-pr-1-januar-2026)
- [AL Sydbank: prisliste udlån april 2026](https://www.al-bank.dk/dokumenter/prislister/privat/prisliste-udlaan-og-kredit)
- [BankInvest: skatteguide 2026](https://bankinvest.dk/media/mwyfi5sp/4312131_bankinvest_skatteguide_2026-ckj.pdf)
- [FDM: leasingkontrakt](https://fdm.dk/guides/bilkoeb-leasing-og-salg-af-bil/fdm-leasingkontrakt-giver-tryghed)
- [If: tilbageleveringsforsikring (Leasing Super)](https://www.if.dk/globalassets/dk/files/privat/bilmarker/volvo_forsikring.pdf)
