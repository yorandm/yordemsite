BESTELMAIL-ASSISTENT
====================

Starten
-------
1. Pak de map uit op je computer.
2. Open index.html in Chrome of Edge.
3. Kies het PurchaseAdvice-bestand (.xlsx of .xlsm).
4. Vul bij Instellingen eenmalig de e-mailadressen van de leveranciers in en klik op "Instellingen opslaan".
5. Kies een leverancier en gebruik telkens dezelfde grote knop:
   - kopieer e-mailadres -> plak in Aan/To
   - kopieer onderwerp -> plak in Onderwerp/Subject
   - kopieer body -> plak in de mail
   - verstuur de mail en klik "Mail verstuurd -> volgende leverancier"

Werking
-------
- De app leest bij voorkeur het werkblad "data" (anders het eerste werkblad).
- De indeling is gebaseerd op de meegeleverde PurchaseAdvice/Bestelselectie-bestanden.
- De mailbody gebruikt de kolommen:
  Naam | Totaal kilo's | Totaal liters | Totaal stuks | Aantal verpakkingen
- "Aantal verpakkingen" wordt in de mail getoond als "Te bestellen hoeveelheid".
- Onderwerp standaard:
  Bestelling VTI Aalst => [leverancier] datum: DD/MM/JJ
- E-mailadressen en tekstinstellingen worden alleen in localStorage van de browser bewaard.
- Het Excelbestand blijft lokaal; er is geen server, Node, login of internetverbinding nodig.

Bestanden
---------
index.html              interface
styles.css              opmaak
app.js                  Excel-inleeslogica + kopieerworkflow
vendor/jszip.min.js     lokale ZIP-lezer voor .xlsx/.xlsm (JSZip)
vendor/JSZIP-LICENSE.md licentie JSZip

Opmerking over klembord
-----------------------
Kopiëren werkt op een gebruikersklik. Dat is nodig omdat browsers om veiligheidsredenen niet toestaan dat een pagina zonder klik zelfstandig het klembord blijft overschrijven.
