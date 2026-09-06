# VerzamelLab – offlineversie

Deze versie werkt zonder Node.js, installatie of internetverbinding.

## Openen

1. Pak het zipbestand volledig uit.
2. Open de uitgepakte map `VerzamelLab-offline`.
3. Dubbelklik op `index.html`.

Laat de mappen `css`, `js` en `assets` naast `index.html` staan. Anders kan de browser de vormgeving of werking niet laden.

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
