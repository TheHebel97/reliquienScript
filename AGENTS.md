# Projektkontext fuer neue Chats

Zuerst diese Datei und `SITE_NOTES.md` lesen. `README.md` und `docs/handoff.md`
nur bei Bedarf fuer Setup bzw. historische Hintergruende lesen.

## Token- und browser-effizient arbeiten

- Zuerst am Code arbeiten, anhand der dokumentierten DOM-Struktur.
- Browser nicht zur allgemeinen Exploration verwenden.
- Browser/CDP nur bei einer benoetigten unbekannten DOM-Annahme, einem
  fehlgeschlagenen Test oder zur Endkontrolle der fertigen Implementierung.
- Keine Screenshots, sofern nicht notwendig; keine vollstaendigen DOM-Dumps
  oder Network-Logs. Nur relevante Elemente bzw. Requests untersuchen.
- Aenderungen buendeln und anschliessend einen einzigen gezielten End-to-End-Test
  durchfuehren. Bei Fehlern nur den betroffenen Pfad nach Korrektur erneut pruefen.
- Neue Website-Erkenntnisse in `SITE_NOTES.md` festhalten, damit sie nicht
  im naechsten Durchlauf erneut untersucht werden.
- Tool-Ausgaben knapp halten; bekannte Regeln und unveraenderten Code nicht
  wiederholt komplett ausgeben.

- TypeScript-/Webpack-Userscript fuer Die Staemme mit einem dynamischen Reliquienraster.
- Offizieller Scriptname: `reliquienUI` (auch ScriptAPI und Userscript-Header).
- Einstiegspunkt: `src/index.ts`. Lokaler Tampermonkey-Loader: `devUserscript.js`.
  Dev-Server/Loader: `http://127.0.0.1:9001/bundle.js` (9000 anderweitig belegt).
- Standalone-Userscript: `npm run build:userscript` oder
  `node node_modules/webpack/bin/webpack.js --config webpack.userscript.config.js`.
  Ergebnis `reliquiensrtipz.user.js` im Repo-Stamm, versioniert, lesbar ohne
  Minifizierung/eval/Dev-Server; Metadatenheader und vollstaendige MIT-Lizenz.
  Nach Quellcodeaenderungen neu bauen. `npm run verify:userscript` prueft den Build
  offline einschliesslich nativer API-Fehler. `src/index.ts` nutzt direkt die
  offizielle Zwei-Zeilen-Registrierung vor jeder UI-Aenderung, ohne eigene Wrapper/
  Verfuegbarkeits-/Rueckgabewertpruefung. Reine TS-Typen in `src/types/script-api.d.ts`.
  Native API-Fehler nicht abfangen oder umgehen.
  Forenentwurf: `docs/forum-einreichung.txt`, nur Deutsch. GitHub liefert den
  Pruefstand statt Pastebin; freigegebene Auslieferung erfolgt laut Regeln durch
  das Staemme-Team. Changelog und Versionen bei Einreichungsupdates pflegen.
- Fuer Browser-Tests ausschliesslich Opera mit der ChatGPT-Erweiterung
  verwenden. Keine Verbindung zur Chrome-ChatGPT-Erweiterung herstellen.
  Diese Nutzervorgabe vom 13.10.2026 ersetzt die fruehere Chrome-Vorgabe.
  Der Nutzer uebernimmt den Login selbst.
- Den aktuellen, auf `screen=relic_*` begrenzten Userscript-Match beachten.
- `src/ui/relic-grid.ts` installiert das CSS fuer `.relics-grid-row > #relics`.
- Raster nutzt volle Containerbreite, maximal 10 Spalten und 8 Reihen.
  55,25px Kachel-Mindestziel, 2px Abstand; Kacheln fuellen die Breite aus.
  Reihen nach verfuegbarer Fensterhoehe; native Seitengroesse = Spalten x Reihen.
- `.inventory-description` ist ausgeblendet. `#village_relic` und `#upgrade_panel`
  sind dezente 220px-Randpanels: links/rechts eingerastet, vertikal verschiebbar.
- Gemeinsame Steuerung: `src/ui/docked-panels.ts`; Kollisionslayout: `src/ui/dock-layout.ts`.
  Panels halten 8px Abstand; Hoehen nach natuerlichem Inhalt statt gleicher Quote.
  Wenn ein Rand zu voll ist, wechseln andere Fenster automatisch an den
  gegenueberliegenden Rand. Das gerade gezogene/geoeffnete Fenster bleibt auf
  seiner gewaehlten Seite. Kapazitaet nach Hoehenbedarf, keine feste Fensterzahl.
  Randfenster zeigen keine Scrollbalken; bei extremem Platzmangel bleiben Inhalte
  per Rad/Touch/Tastatur erreichbar. Keine dauerhaften Erklaerungsbloecke.
- Seite und Hoehe beider Panels werden unter `reliquiensrtipz:docked-panels`
  in LocalStorage gespeichert. Die fruehere freie Position wird nicht mehr verwendet.
- Der Nutzer erlaubt Tests direkt im Spiel mit seinem Testaccount.
- Erststart-Hilfe: `src/ui/relic-onboarding.ts` am Ende der UI-Installation.
  Ein natives Dialogfenster erklaert Linksklick/Aufwertungsslots, Rechtsklick/
  Ausruestfenster, Hover, Suche, Filter/Sortierung und Presets. `Verstanden`,
  Kreuz oder Escape speichern `reliquiensrtipz:onboarding-seen=1`.
  Danach kein automatisches Oeffnen; `?` neben Suche oeffnet die Hilfe jederzeit.
  Nur bei vorhandener Inventar-/Such-UI installieren; Fokus nach Schliessen
  zur vorherigen Steuerung bzw. Suche zurueckgeben. Speicherfehler blockieren nicht.
- Aufwertungsvorschau in `src/ui/upgrade-preview.ts`: Basisdetails bei gleichen
  Typen, Zufallshinweis bei gemischten Typen; Details/Annahmen in `SITE_NOTES.md`.
- Rasterdetails: `src/ui/relic-hover-details.ts` waehlt beim Hover aus und zeigt
  Details direkt im Tooltip; Linksklick fuehrt die gewaehlte Reliquie ueber den
  nativen Spielbutton dem naechsten freien Aufwertungsslot zu. Hover-Fenster ist
  mit `pointer-events:none` durchlaessig, ohne Aktionen; nur die Kachel zaehlt als Hover.
  Rechtsklick auf Reliquie oeffnet `#relic-equip-window` (220px, normales Dock-System).
  `src/ui/relic-equip-panel.ts` haelt diese Auswahl unabhaengig vom spaeteren Hover;
  vor Klick auf nativen `#equip_button` exakte gepinnte Reliquie wieder auswaehlen.
  Native Bestaetigung beibehalten. Schliessen/Entfernen der Kachel (auch Filter/Seite)
  verwirft die Equip-Auswahl. Leere Kacheln behalten ihr Browser-Kontextmenue.
  Sanitisiertes Detailklonen/Disabled-Pruefung gemeinsam in `relic-details-dom.ts`.
- Native Auswahl sitzt auf `#relics img`: immer das Bild klicken, nicht das
  Wrapper-Div. Details und Auswahlbutton werden vom Spiel synchron erzeugt.
- Shiny-Glanz: `src/ui/relic-shiny-highlight.ts` faerbt native Rasterbilder per SVG-Filter mit Regenbogen-Schattierung um, ohne Rahmen,
  wenn mindestens ein `sub_stats[].perfect === true` ist; auch ohne Hover.
- Eigene Highlight-Presets: `src/ui/relic-presets.ts`, reine Regeln/Speicherformat
  in `relic-preset-model.ts`. Schalter neben Filter oeffnet `#relic-preset-window`
  im Dock-System. Name, optionaler Typ/Hauptbonus und beliebig viele Substat-IDs;
  Volltreffer: alle Bedingungen UND, mehrere aktive Presets ODER. Dreierregeln
  markieren zusaetzlich Hauptbonus + einen Substat (2/3). Gewaehlter Hauptbonus
  ist Pflicht; beide Substats bei falschem Hauptbonus ergeben keinen Treffer.
  Keine Treffer ueber verschiedene Regeln zusammenzaehlen. Keine Filterung/Sortierung.
  Speichern, Bearbeiten, Aktivieren/Deaktivieren, Loeschen; LocalStorage unter
  `reliquiensrtipz:relic-presets` mit Formatversion 2 (liest auch Version 1).
  Defaults in `relic-preset-defaults.ts` einmalig installieren, installierte IDs
  speichern, damit Aenderungen/Deaktivierung/Loeschung nicht zurueckgesetzt werden.
  Kombinierte Einheitenboni erfuellen passende Angriff-/Verteidigungsbedingungen;
  jede Bedingung braucht einen eigenen Substat. Optional `shinyOnly`.
  `allBonuses` verlangt immer Hauptbonus aus dem erlaubten Pool, dazu einen (2/3)
  oder beide (3/3) der genau zwei Substats. Fremder/unbekannter Hauptbonus: kein Treffer.
  Konfigurierbare globale Rahmenfarbe ueber `#relic-preset-color`, im gleichen
  Speicherformat als `color` gespeichert. Default gedecktes Neon-Gelb #d2d51b;
  CSS-Variable `--relic-preset-color`, dunkle Innenkontur fuer Kontrast.
  Beide Trefferstufen: kraeftiger 4px-Rahmen, durchgehend; 2/3-Default #e69732.
  Zweite Farbe in `partialColor`, Picker `#relic-preset-partial-color`.
  Volltreffer haben Vorrang; Shiny-Schattierung ist mit beiden Stufen kombinierbar.
  `matchesPreset` prueft weiterhin Volltreffer, `presetMatchLevel` liefert 0/2/3.
  LK-Angriffsdefaults nutzen `light-attack` statt numerischer ID 26; native Namen
  unterscheiden LK von berittenen Boegen bei widerspruechlicher Welt-Beschriftung.
  Nur originale Defaultbedingungen migrieren, deaktivierte/angepasste/geloeschte Regeln respektieren.
  Presetfenster wie die anderen Randfenster 220px breit, 340px Mindesthoehe.
  Kompakte 20px-Schalterzeilen, keine Paginierung; zehn Regeln passen gemeinsam.
  Editor als natives `#relic-preset-editor`-Dialogmodal (420px), Escape/Abbrechen
  verwirft Entwurf und gibt Fokus zurueck. Substats per Dropdown/entfernbare Chips.
  Sechs Kampf-Defaults und eine Rohstoff-Gruppenregel laut Nutzervorgabe.
  Zeilen/Chips zeigen native Einheitensymbole fuer Einheiten-Substats/Hauptboni;
  kurze A/D-, A-, D-Angaben und volle Titel/ARIA-Bezeichnungen.
  Grafik-Assetversion aus aktuellen Seitenbildern ableiten, keinen CDN-Hash fixieren.
- Suche/Togglefilter: `src/ui/relic-search.ts`, reine Suchlogik und Tests in
  `relic-search-model.ts`. Ersetzt native Dropdownfilter lokal; native
  Verfuegbarkeit, Gruppierung, Paginierung und Slotaktionen bleiben bestehen.
- Visuelle Filter stehen im `#relic-filter-window`, registriert ueber
  `addDockedPanel` im bestehenden Dock-System. Inventar: Suche, Filter-Schalter,
  Zuruecksetzen und Trefferzahl. Filterzustand nur in SearchState; Query-Parsing
  abgeleitet. Position wird mit den anderen Panels gespeichert.
- Sortierung: `src/ui/relic-sort.ts`; schmale Zeile unter Suche, vor Trefferzahl.
  Standard, Qualitaet, Typ, Bereich, Shiny-Substat-Anzahl. Nach Filterung, vor
  nativer Gruppierung/Paginierung. Reset setzt auch Sortierung auf Standard.
- Substat-Sortierung im selben Dropdown: `substat:<id>`, Prozentwert numerisch
  als Bonusstaerke; startet absteigend, Reliquien ohne Stat immer zuletzt.
- `src/ui/discovered-by-toggle.ts` fuegt rechts in der Reliquien-Subnavigation
  den persistenten Entdeckt-von-Schalter ein.
