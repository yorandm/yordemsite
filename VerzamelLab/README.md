# VerzamelLab – offlineversie

Deze versie werkt zonder Node.js, installatie of internetverbinding.

## Openen

1. Pak het zipbestand volledig uit.
2. Open de uitgepakte map `VerzamelLab-offline`.
3. Dubbelklik op `index.html`.

Laat de mappen `css`, `js` en `assets` naast `index.html` staan. Anders kan de browser de vormgeving of werking niet laden.

Bij een update: verwijder of hernoem eerst je oude uitgepakte programmamap en pak daarna het nieuwe zipbestand volledig uit. Je leerlinggegevens staan in de browser en blijven behouden; gebruik voor alle zekerheid vooraf de knop **Back-up**.

## Gegevens bewaren

Leerlingen, elementen, thema's en instellingen worden lokaal opgeslagen in de browser. Gebruik je een andere browser of computer, dan staan de ingevoerde gegevens daar niet automatisch in.

## Meerdere klassen

In de modus **Onze klas** staat bovenaan een klasselector.

- Gebruik **＋** om een nieuwe, lege klas toe te voegen.
- Kies een klas in de lijst om tussen klassen te wisselen.
- Gebruik **•••** om de huidige klas te hernoemen of te verwijderen.
- Elke klas bewaart afzonderlijk haar leerlingen, thema's en gekozen verzamelingen.
- De modus **Algemene verzamelingen** blijft onafhankelijk van de klassen.

Bestaande gegevens uit een eerdere offlineversie worden bij de eerste opening automatisch onder **Klas 1** geplaatst.

## Deelverzamelingen

De diagramweergave herkent onder andere:

- één deelverzameling binnen een grotere verzameling;
- twee afzonderlijke deelverzamelingen binnen dezelfde bovenverzameling;
- drie geneste verzamelingen;
- gewone overlap en disjuncte verzamelingen.

Lege gebieden krijgen niet automatisch het symbool `∅`; alleen werkelijk ingevoerde elementen worden in een gebied getoond.

De actuele versie tekent de diagrammen als SVG. Voor elk element wordt de volledige ruimte van het punt en de elementnaam geometrisch gecontroleerd. Alleen een positie die volledig binnen precies de juiste verzameling(en) en volledig buiten alle andere verzamelingen ligt, wordt gebruikt. Wanneer een diagram uitzonderlijk te vol wordt, verschijnen resterende elementen in een duidelijk benoemde lijst onder het diagram in plaats van in een fout gebied.

De browser meet daarbij de werkelijke breedte van iedere elementnaam. Hierdoor passen korte namen efficiënter in kleine doorsneden en blijft de normale leesgrootte zo lang mogelijk behouden. Pas daarna probeert de toepassing een beperkt kleinere tekstgrootte.

Met de schakelaar **Elementen buiten de gekozen verzameling(en)** bepaal je of elementen uit het buitengebied zichtbaar zijn. Verbergen verwijdert geen gegevens. De keuze wordt lokaal bewaard en maakt deel uit van een back-up.

## Volledig scherm

Nadat je een diagram hebt onthuld, verschijnt de knop **Volledig scherm**. Daarmee vergroot je uitsluitend de diagramkaart voor projectie. Gebruik dezelfde knop of `Esc` om terug te keren. Wanneer de browser de gewone fullscreenfunctie voor een lokaal bestand niet toestaat, gebruikt VerzamelLab automatisch een schermvullende lokale weergave.

## Back-up exporteren en importeren

Gebruik bovenaan de knop **Back-up**.

- **Back-up downloaden** bewaart alle klassen, leerlingen, thema's, algemene verzamelingen en instellingen in één `.json`-bestand.
- **Back-up kiezen** importeert zo'n bestand op dezelfde of een andere computer.
- Voor het importeren wordt de inhoud gecontroleerd en zie je hoeveel klassen en leerlingen het bestand bevat.
- Importeren vervangt pas na jouw bevestiging de gegevens die in de huidige browser staan.
- Exporteren en importeren gebeuren volledig lokaal. Het bestand wordt niet naar een server verstuurd.

Bewaar het back-upbestand bijvoorbeeld op een USB-stick. Maak best regelmatig een nieuwe back-up, want browsergegevens kunnen verdwijnen wanneer de browseropslag wordt gewist.

## Bestandsstructuur

```text
VerzamelLab-offline/
├── index.html
├── css/
│   └── style.css
├── js/
│   └── app.js
├── assets/
│   └── favicon.svg
└── README.md
```
