# Reliquiensrtipz

TypeScript-Userscript-Grundgeruest, uebernommen aus
[TheHebel97/standdeff-organizer](https://github.com/TheHebel97/standdeff-organizer)
(Branch `master`, abgerufen am 11.09.2026).

Die Reliquienliste wird durch `src/ui/relic-grid.ts` in bis zu zehn Spalten
und acht Reihen angezeigt. Das Layout gilt auch nach Filtern und Blaettern; die bestehenden
Kacheln und deren Klickfunktionen bleiben erhalten.

Kachel-Mindestziel: 55,25 CSS-Pixel bei 2px Abstand. Quadratische Kacheln
fuellen die verfuegbare Rasterbreite; die Reihenzahl folgt der Fensterhoehe.

Die Einleitung `.inventory-description` ist ausgeblendet. Dorf-Reliquie
(`#village_relic`) und Aufwerten (`#upgrade_panel`) erscheinen als dezente,
220px-Panels buendig am Bildschirmrand und unterhalb der Kopfzeile. Nur die
vom Rand abgewandten Ecken sind abgerundet.
An der Titelleiste vertikal ziehen; zum Wechsel
der Seite die Titelleiste 40% der Bildschirmbreite von der Startseite aus ziehen.
Die Panels bleiben horizontal eingerastet und halten untereinander 8px Abstand.
Bei wenig Platz scrollt ihr Inhalt. Alternativ die Titelleiste per Tab fokussieren:
Pfeil links/rechts waehlt den Rand, hoch/runter verschiebt vertikal.
Seite und Position bleiben nach dem Neuladen gespeichert.
Umsetzung: `src/ui/docked-panels.ts` und `src/ui/dock-layout.ts`.

Randfenster verwenden keine sichtbaren Scrollbalken und teilen die Hoehe nach
ihrem Inhalt auf. Reicht der Platz an einem Rand nicht, springen andere Fenster
an den gegenueberliegenden Rand; das gerade gezogene Fenster bleibt an der
gewaehlten Seite. Bei sehr kleinen Fenstern bleiben Inhalte per Mausrad, Touch
oder Tastatur erreichbar.

Die Detailansicht einer Raster-Reliquie wird nicht mehr im Seitenfluss gezeigt.
Beim ersten Start erscheint eine kurze Einfuehrung mit den wichtigsten Funktionen.
Sie laesst sich ueber `Verstanden`, das Kreuz oder Escape schliessen.
Die Entscheidung bleibt fuer diese Spielwelt im Browser gespeichert; `?` neben
der Suche oeffnet die Hilfe jederzeit erneut.

Beim Ueberfahren einer Kachel waehlt das Userscript sie aus und zeigt ihre
Details direkt im Hover-Fenster. Ein Linksklick uebergibt die Reliquie an die
native Aufwertungsauswahl. Das Hover-Fenster zeigt nur Details und ist fuer die
Maus durchlaessig: Darunterliegende Kacheln lassen sich direkt ueberfahren.
Ein Rechtsklick waehlt eine Reliquie fuer ein separates Randfenster aus.
Die Auswahl bleibt beim Hover ueber andere Kacheln bestehen; `Ausrüsten` im
Randfenster ruft die native Aktion samt Bestaetigung auf. Schliessen oder
Entfernen der ausgewaehlten Kachel verwirft diese Auswahl.

Rechts in der Reliquien-Subnavigation schaltet `Entdeckt von: an/aus` die
Entdeckerzeile in allen Reliquien-Details. Die Wahl bleibt gespeichert.

`Presets` neben dem Filter-Schalter oeffnet ein eigenes Randfenster. Dort lassen
sich benannte Highlight-Regeln mit einem Reliquien-Typ/Hauptbonus und gewuenschten
Substats speichern, bearbeiten, ein-/ausschalten und loeschen. Alle Bedingungen
eines Presets muessen passen; die Reihenfolge der Substats ist egal. Typ oder
Substats koennen einzeln verwendet werden. Treffer erhalten einen konfigurierbaren
Rahmen (Standard: gedecktes Neon-Gelb mit dunkler Innenkontur). Das Farbfeld im
Presetfenster gilt fuer alle Presets und bleibt gespeichert. Bei Shiny-Treffern
bleiben Presetfarbe und Pink sichtbar. Die Suche und Sortierung
werden dadurch nicht geaendert. Presets bleiben im Browser fuer diese Spielwelt
gespeichert, auch nach Neuladen oder Zuruecksetzen der Suche.
Das Presetfenster ist 220px breit mit 340px Mindesthoehe. Zehn kompakte
Schalterzeilen passen gemeinsam ohne Blaettern; native Einheitensymbole zeigen
Hauptbonus und Substats. `Neues Preset` oder der Stift oeffnet ein separates Modal;
Escape/Abbrechen verwirft den Entwurf. Dort lassen sich auch Shiny-only-Regeln
und Gruppenregeln fuer alle drei Boni einstellen.
Sechs Kampfdefaults und die Gruppe `Rohstoffe & Beute` werden einmalig angelegt.
Bei dieser Gruppe muessen Hauptbonus und beide Substats aus Holz-/Eisen-/Lehmproduktion,
Kaserne-Kostenreduktion oder Beutekapazitaet stammen. Kombinierte Einheitenboni
erfuellen passende Angriff- oder Verteidigungsbedingungen. Bearbeitete,
deaktivierte und geloeschte Defaults werden beim Neuladen nicht zurueckgesetzt.

Das Aufwertungs-Panel zeigt eine Vorschau: Bei drei gleichen Typen bleiben
die Substats der ersten Reliquie erhalten; angezeigt werden ihre aktuellen
Basisdetails inklusive Substat-Farben. Gemischte Typen zeigen einen Hinweis auf
eine zufaellige Aufwertung. Unbekannte Ergebniswerte werden nicht vorhergesagt.
Website-Struktur und effiziente Arbeitsweise sind in `SITE_NOTES.md` und
`AGENTS.md` dokumentiert.

## Installation und Entwicklung

Voraussetzung: Node.js mit npm.

Fuer die dauerhafte Nutzung in Opera das Standalone-Userscript bauen:

```sh
npm run build:userscript
```

`dist/reliquiensrtipz.user.js` in Tampermonkey importieren und aktivieren,
anschliessend die Reliquienseite neu laden. Dieser Build enthaelt den
Tampermonkey-Header und braucht keinen lokalen Server. Einen vorhandenen
Development-Loader deaktivieren, damit das Script nicht doppelt startet.
Browser-Tests erfolgen ausschliesslich in Opera; die Chrome-ChatGPT-Erweiterung
wird nicht verbunden. Den Login uebernimmt der Nutzer.

Fuer die lokale Entwicklung:

```sh
npm ci
npm start
```

Der Webpack-Dev-Server liefert `http://localhost:9000/bundle.js`.
`devUserscript.js` in Tampermonkey installieren und eine Spielseite auf
`https://*.die-staemme.de/game.php?village=*&screen=relic_*` neu laden. Der Loader fuehrt das lokale
Bundle aus. Nach Quellcode-Aenderungen kompiliert Webpack automatisch;
zum Ausfuehren der neuen Version die Spielseite neu laden.
Je nach Browser muss der Zugriff auf das lokale Netzwerk erlaubt werden.

Dies ist ein Userscript-Projekt; es gibt keine eigenstaendige HTML-Startseite.

## Befehle

| Befehl | Ergebnis |
| --- | --- |
| `npm start` | Entwicklungsserver auf Port 9000 |
| `npm run build` | Entwicklungsbundle unter `dist/bundle.js` |
| `npm run build:production` | Minimiertes Bundle unter `dist/bundle.js` |
| `npm run build:userscript` | Standalone-Tampermonkey-Script unter `dist/reliquiensrtipz.user.js` |
| `npm run typecheck` | TypeScript-Pruefung ohne Dateiausgabe |
| `npm test` | Jest-Tests fuer Layout, Suche, Sortierung, Vorschau, Hover-Aktionen und Presets |

`dist/bundle.js` enthaelt keinen Tampermonkey-Metadatenheader. `devUserscript.js`
ist der Loader fuer die lokale Entwicklung.

## Struktur

```text
src/
  index.ts          Einstiegspunkt, installiert das Reliquienlayout
  helpers/          Hilfsfunktionen
  types/            Eigene Typdefinitionen
  ui/components/    UI und wiederverwendbare Komponenten
  assets/           Platz fuer spaetere Assets
devUserscript.js     Tampermonkey-Loader
webpack.config.js    TypeScript-Bundling und Entwicklungsserver
tsconfig.json       Striktes TypeScript mit ES5-Ziel
babel.config.js     Babel-Konfiguration fuer Jest/TypeScript
```

Webpack, ts-loader, TypeScript, Babel, Jest und die jQuery-Typen inklusive
der festgeschriebenen Paketversionen stammen aus dem Referenzprojekt.
jQuery selbst wird wie dort von der Spielseite bereitgestellt.
Fuer Assets ist bisher kein eigener Webpack-Loader konfiguriert.

Anpassungen: Projektname, minimaler Einstiegspunkt, Loader fuer Spielseiten,
einheitlicher Port 9000, deaktivierter Dev-Server-Client sowie zusaetzliche
Build- und Typecheck-Befehle. Das Unix-spezifische `build2` mit `sed` wurde
nicht uebernommen. Die Standdeff-Fachlogik ist nicht Teil dieses Grundgeruests.
