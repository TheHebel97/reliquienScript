# Uebergabe am 11.09.2026

## Aktueller Einstieg

Zuerst `AGENTS.md` und `SITE_NOTES.md` lesen. Der Nutzer verlangt ab jetzt
Code-first, gezielte Browserpruefungen und einen gebuendelten End-to-End-Test.
`SITE_NOTES.md` ist die aktuelle kompakte DOM-/Verhaltensreferenz.
Neu: 40%-Randwechsel und Aufwertungsvorschau (Basisdetails vs. random).
Build, neun Unit-Tests und ein gezielter Browser-Abschlusstest bestanden.
Historische Eintraege unten nur bei Bedarf lesen.

## Aktuell: zwei einrastende Randpanels

- Freies Verschieben wurde ersetzt: `#village_relic` und `#upgrade_panel`
  sind 220px breite, dezent gestaltete Panels, immer links oder rechts eingerastet.
- Vertikal an der Titelleiste ziehen; zum anderen Rand ziehen wechselt die Seite.
  Pfeiltasten unterstuetzen dieselben Aktionen.
- Gemeinsames Layout verhindert Ueberlappungen mit 8px Mindestabstand.
  Hoehen werden bei Platzmangel begrenzt, Inhalte bleiben scrollbar.
  ResizeObserver behandelt Hoehenaenderungen durch Spielinhalte.
- Speicherung: `reliquiensrtipz:docked-panels` mit `side` und `top` je Panel.
- Die Datei `src/ui/village-relic-panel.ts` wurde durch `src/ui/docked-panels.ts`
  und den separat getesteten Layouthelfer `src/ui/dock-layout.ts` ersetzt.
- Im Spiel geprueft: Vertikal-Drag, Wechsel nach links, Kollisionsschutz rechts
  und links (8px Abstand), Rueckkehr nach rechts per Tastatur, Persistenz nach Reload,
  kein horizontaler Inhaltsueberlauf. Zuletzt Dorf rechts, Aufwerten links.
- Webpack-Build und alle fuenf Jest-Tests bestanden.
- Acht Spalten und die gemerkte Kachelgroesse bleiben unveraendert.
- Aeltere Beschreibungen unten dokumentieren nur den bisherigen Verlauf.

## Neuester Stand: acht Spalten und Dorf-Reliquienfenster

- Nutzerwunsch: acht statt neun Spalten; Groesse fuer Folgearbeiten merken.
- Gemessen im Spiel: 55,25 x 55,25 CSS-Pixel je Kachel, acht Spalten,
  2px Abstand, 460px Raster-Innenbreite. Kacheln skalieren bei anderer Rasterbreite.
- `.inventory-description` wird ausgeblendet.
- `village_relic` ist auf der Spielseite eine ID. `#village_relic` bleibt im
  Original-DOM und wird als fixes 240px-Fenster am rechten Fensterrand angezeigt.
- Drag-Titelleiste und Pfeiltasten erlauben Verschieben. Position wird unter
  `reliquiensrtipz:village-panel-position` in LocalStorage gespeichert.
- Build erfolgreich; im echten Chrome-Spieltab geprueft: acht Spalten,
  Beschreibung unsichtbar, Panel sichtbar, Ziehen verschiebt es, Neuladen
  stellt dieselbe Position wieder her und erzeugt nur eine Titelleiste.
- Dateien: `src/ui/relic-grid.ts`, `src/ui/village-relic-panel.ts`, `src/index.ts`.
- Die folgenden Eintraege sind historische Zwischenschritte.

## Aktueller Stand nach dem ersten Spieltest

- Haupt-Chrome ist erreichbar; Login und Tampermonkey-Injection auf
  `screen=relic_system` wurden am 11.09.2026 im Browser bestaetigt.
- Der Nutzer erlaubt Tests direkt im Spiel mit seinem Testaccount.
- Erster Auftrag umgesetzt: Reliquienliste in neun Spalten statt fuenf.
- `src/ui/relic-grid.ts` injiziert einmalig CSS fuer
  `.relics-grid-row > #relics`; Kacheln skalieren quadratisch in die vorhandene Breite.
- Im Spiel geprueft: neun Kacheln pro voller Zeile, kein horizontaler Ueberlauf,
  Auswahl zeigt passende Reliquiendetails, Vor-/Zurueckblaettern erhaelt das Raster.
- Dev-Server auf Port 9000 lieferte das aktualisierte Bundle. Der bestehende,
  vom Nutzer gestartete Server wurde nicht beendet.
- Die folgenden Abschnitte beschreiben die vorherige Uebergabe und Diagnose.

## Naechster Arbeitsschritt

Der Nutzer hat die ChatGPT-Browser-Erweiterung inzwischen im normalen
Haupt-Chrome eingerichtet und meldet, dass sie zu funktionieren scheint.
Er will sich selbst im Spiel anmelden und anschliessend in einem neuen Chat
mit der eigentlichen Arbeit beginnen.

Im neuen Chat die erreichbaren Browser und Tabs frisch abfragen, den passenden
Spieltab im Haupt-Chrome auswaehlen und die lokale Userscript-Injection pruefen.
Die Verbindung zum Haupt-Chrome und die Injection wurden vom Agenten noch
nicht bestaetigt. Kein Login oder erfolgreicher Zugriff darf vorausgesetzt werden.
Konkrete gewuenschte Reliquien-Funktionen wurden noch nicht beschrieben.

## Projektstand

- Arbeitsordner: `C:\Users\Player 3\Documents\codexe\reliquiensrtipz`.
- Referenz: https://github.com/TheHebel97/standdeff-organizer,
  Branch `master`, am 11.09.2026 heruntergeladen.
- Uebernommen wurden Setup und gesperrte Paketversionen: Webpack 5.90.3,
  TypeScript 5.4.2, ts-loader, Babel/Jest und jQuery-Typen.
- Standdeff-Fachlogik wurde nicht kopiert. `src/index.ts` gibt bisher nur
  `[reliquiensrtipz] Userscript geladen.` aus, sobald das Dokument bereit ist.
- Ordner fuer `helpers`, `types`, `ui/components` und `assets` sind vorbereitet.
- `npm start`: Webpack-Dev-Server auf `127.0.0.1:9000`.
- `devUserscript.js`: Tampermonkey-Loader fuer `http://localhost:9000/bundle.js`.
  CORS ist im Dev-Server konfiguriert; der Loader verwendet `@grant none`.
- Aktueller Match (nachtraeglich gegenueber dem initialen Setup eingegrenzt):
  `https://*.die-staemme.de/game.php?village=*&screen=relic_*`.
  Diese bestehende Aenderung beibehalten und die tatsaechliche Spiel-URL
  beim Injection-Test damit vergleichen.
- Quellcode-Aenderungen werden automatisch kompiliert; die Spielseite muss
  zum erneuten Ausfuehren neu geladen werden. Kein HMR-/WebSocket-Client.
- Das gebaute Bundle hat keinen Tampermonkey-Metadatenheader.
- Die Unix-/sed-Variante `build2` aus der Vorlage wurde nicht uebernommen.

## Bereits geprueft

Beim initialen Setup erfolgreich:

- `npm run build`
- `npm run build:production`
- `npm run typecheck`
- JavaScript-Syntax des damaligen Dev-Loaders
- HTTP-Abruf von `localhost:9000/bundle.js`: 200, CORS-Header `*`
- Start des Bundles mit simuliertem Dokumentstatus `loading` und `complete`

Jest ist eingerichtet, es gibt bislang keine Tests. Kein Test im echten Spiel
wurde durchgefuehrt. Der fuer die Pruefung gestartete Dev-Server wurde danach
beendet; vor dem Browser-Test den aktuellen Serverstatus pruefen.

## npm in der bisherigen Codex-Umgebung

Node.js 24.19.0 war vorhanden, `npm`/`npm.cmd` jedoch nicht im PATH.
Zur Installation und Pruefung wurde npm 10.9.3 temporaer aus der offiziellen
npm-Registry heruntergeladen. Die Abhaengigkeiten sind in `node_modules` installiert.
Zuerst im neuen Chat die aktuelle Umgebung pruefen. Falls npm weiterhin fehlt
und die temporaere Datei noch vorhanden ist, kann PowerShell verwenden:

```powershell
node (Join-Path $env:TEMP 'codex-npm-10.9.3\package\bin\npm-cli.js') start
```

Der Temp-Pfad ist keine dauerhafte Projektvoraussetzung. Mit regulaer
installiertem Node.js/npm gelten die Befehle aus der README.

## Bisherige Portable-Chrome-Diagnose

Nur als Historie; der Nutzer hat inzwischen auf Haupt-Chrome gewechselt:

- Portable Chrome lief unter
  `C:\Users\Player 3\Downloads\GoogleChromePortable64`.
- Profildaten: `Data\profile`; die ChatGPT-Erweiterung war in `Profile 15`
  installiert und aktiviert.
- Die Browser-Schnittstelle lieferte nur den internen Codex-Browser.
  Chrome-Auswahl und Tab-Abfrage scheiterten mit `Browser is not available: chrome`.
- Die mitgelieferte Diagnose liess sich ueber `CODEX_CHROMIUM_USER_DATA_DIR`
  auf das portable Profil richten. Das war nur eine erfolgreiche Profilerkennung,
  keine erfolgreiche Browser-Verbindung und keine dauerhafte Konfigurationsaenderung.
- Die Native-Host-Pruefung meldete fehlende Registrierung und fehlendes Manifest
  fuer `com.openai.codexextension`, auch ausserhalb der Sandbox.
- Browser-Installation, Registry und Benutzerprofile wurden nicht geaendert.
- Nicht erneut automatisch Portable Chrome untersuchen; aktuelles Ziel ist der
  normale Haupt-Chrome mit der dort eingerichteten Erweiterung.
