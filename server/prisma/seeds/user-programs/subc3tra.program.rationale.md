# Styrka & HIT, Block 1 (4 veckor, 4 pass/vecka)

Upplägg: Mån (Zercher Squat + drag + knä), Tis (Deadlift + push), Ons (lättare Zercher + grepp + knä), Fre (tyngsta Deadlift + press, ingen BJJ). Varje pass avslutas med en HIT-finisher.

## Övningsval och placering

- **Ball Over-Shoulder Drop (onsdag):** ett hip-hinge-mönster från golvet, så det passar inte på deadlift-dagarna (tis/fre). Måndag ligger direkt före tisdagens deadlift. Onsdagens lättare Zercher lämnar mest utrymme, och bollen läggs direkt efter Zerchern medan du är fräsch.
- **Ball Shoulder Carry + KB Suitcase Carry (fredag):** fredag är enda dagen utan carry (mån/ons har Farmers Carry) och din BJJ-fria, friskaste dag. Placerad efter pressen och före Back Extension så att greppet inte är slut efter marklyftet.
- **ATG Split Squat och Sissy Squat:** knäfokus på mån/ons enligt ditt utkast.
- **Militärpress** är loggad som `Overhead Press` (stående skivstång).
- **Ingen uppvärmningssektion:** du värmer upp med cykling.

## Att veta inför första passet

Inga övningar har förifyllda måltyngder (`targetWeight` är `null`). Första passet av varje dagmall kör du utan förifyllda mål och sätter din egen startnivå, som sedan blir baslinjen appen bygger vidare på kommande veckor (carry-forward). Programmet är alltså inte ofärdigt, det är standardbeteendet för nya dagmallar.

## Kända begränsningar

- **Bollkarry (fredag):** carry-övningar har bara ett viktfält. Bollvikten loggas i viktfältet, kettlebellvikten skrivs i anteckningen. Kan göras mer dynamiskt senare.
- **Fredagens stege-finisher:** `targetReps` är `null` eftersom schemat saknar fält för fallande rep-schema. Stegen (10-9-8...1) ligger i anteckningen.
- **Finishers:** varv/omgångar är loggade som antal set per övning.
