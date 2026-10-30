# Website-Notizen – Die Staemme / Reliquien

Stand: 13.10.2026. Vor Browserzugriff diese bekannten Strukturen verwenden.

## Update 30.10.2026: echter Sperrfall mit partialReload und GM-Speicher

- Im vorbereiteten Opera-Testfall wurde ein Banner ausgeruestet (vom Nutzer).
  Ein freies Inventarobjekt blieb vorhanden, aber Such-UI fehlte, village_relic
  war nicht mehr gedockt und grid.page/per_page waren NaN (JSON zeigt null).
- Nach Reload wurde ein nativer XHR `game.php?...&_partial` beobachtet.
  `partialReload()` ruft TribalWars.fetch auf; handleResponse ersetzt synchron
  `#content_value` und startet native Inventar-Initialisierung mit einem neuen Grid.
  Ein weiteres DOMContentLoaded wird nicht ausgeloest. Vorhandene UI-Styles und
  body-Randfenster ueberleben den Austausch, Referenzen auf alte Nodes sind veraltet.
- Lifecycle nach Root-Identitaet (#page_inventory, sonst Content-Anker) beobachten;
  normale Kachel-/Timer-Mutationen nicht als neue Seite behandeln. Alte UI-Nodes,
  Styles, Observer und globale Listener entsorgen, native Hooks restaurieren,
  anschliessend ganze UI inkl. Dock-Registrierung neu aufbauen. Kein Eingriff in
  Timer/Entfernen- oder Premiumaktionen. Vorheriger statischer Cooldown-Test allein
  deckte diesen Austausch nicht ab; Bundlepruefung erweitert um zwei echte Rootwechsel.
- Alte Raster-Resize-Observer liefen auf getrenntem Element weiter: leere Padding-
  Werte ergaben NaN, das ins neue Grid geschrieben wurde. isConnected und endliche
  Messwerte pruefen, geplante RAFs abbrechen; Kapazitaetsmodell nie NaN liefern lassen.
- Neuer Speicher `src/ui/relic-storage.ts`: GM-Werte als Strings, Schluessel
  `${location.hostname}:reliquiensrtipz:...`. Vier bekannte Einstellungen; pro Key
  Migrationsmarker `:migrated`. Vorhandene GM-Werte gewinnen, alte LocalStorage-Kopie
  bleibt fuer Rueckweg erhalten. Keine neuen LS-Schreibzugriffe. Fehlende Grants
  erlauben nur Sitzungsspeicher mit Hinweis, nicht heimlichen LS-Fallback.
- @sandbox raw fuer native lexikalische RelicSystem-Bindung; GM_getValue/GM_setValue
  und unsafeWindow explizit freigeben. Dev-Loader 0.2.0 braucht direkten eval, um
  GM-Bindungen zu behalten. Der Team-getScript-Loader exportiert stattdessen eine
  auf die vier weltbezogenen Keys plus Migrationsmarker begrenzte Speicherbruecke.
  Quellen: https://www.tampermonkey.net/documentation.php?q=sandbox und ?q=GM_values.
- Im echten gesperrten Opera-Inventar nach Fix: freie ID 323537 wieder sichtbar,
  nativer Countdown weiter aktiv, Seite 0 und per_page 60. Zwei native partialReload-
  Aufrufe (davon einer bei offenem Preseteditor) wiederholen den kompletten Aufbau
  ohne doppelte Fenster/Modals oder NaN. Suche, Presets, Ausruestfenster und Hilfe
  funktionieren; Editor nach Seitenwechsel geschlossen, Aufwertungsslots unveraendert.
- GM-Backend offline direkt sowie mit echtem Initialisierungscode aus dem Foren-
  entwurf getestet. Letzterer laedt den Hauptcode ohne GM-Globals; nur die begrenzte
  Bruecke ist verfuegbar. Weltfremde/unbekannte Keys erreichen GM nicht. Beide
  Varianten bestehen zwei Rootwechsel samt unveraenderten Einstellungen.

## Update 30.10.2026: neues natives Grid und gemeinsamer Filter-Katalog

- Opera-Erweiterung erreichbar, auch wenn das Chat-/Accessibility-Overlay nicht
  erscheint. Welt 259 lieferte reproduzierbar `inventory.getMaxPage is not a function`.
- Seitenauswahl liegt jetzt auf `RelicSystem.Inventory.grid`: `page`, `per_page`,
  `getMaxPage()`, `setPage(n)`, `getPageStacks()`. `Inventory.relics_per_page` und
  `Inventory.page` sind keine Steuerung mehr; `getGroupedInventoryRelics()` entfaellt.
- `grid.getIncludedRelics()` wendet native include-Regel an: keine ausgeruesteten/
  angebotenen Reliquien oder IDs in `relics_to_upgrade`. Danach `matchesFilters`,
  `getFilteredRelics()`, `getStacks()` und Seitenschnitt. `updateData` ersetzt Daten
  via `grid.setRelics()`; Methode und volle Quelldaten nicht fuer Suche umschreiben.
- `RelicSelect.groupRelics` behaelt alle Records und nimmt den ersten als
  `representative`. Daher eigene Sortierung vor Gruppierung (staerkster Substat/
  Shiny-Repraesentant) und nach nativer Stapelsortierung (sonst quality_desc-Vorrang).
- Native Selects heissen `inventory_filter_slot1/slot2`, optgroups mit `q:quality`,
  `t:type`, `s:substat`. Sortierung in `inventory_filter_sort`, Anzahl in
  `inventory_filter_count`. Alte quality/type/sub1-Selects fehlen. Gemeinsamer Leser
  `src/ui/relic-inventory.ts` entfernt Praefixe und dedupliziert beide Slots;
  Suche und Presets verwenden denselben Katalog, gespeicherte IDs bleiben gleich.
- Native Controls liegen in `.relic-controls` und `.relic-filters`; bei eigener
  Suche mitsamt Beschriftungen ausblenden, nicht nur Dropdown-Widgets.
- Gemeldeter Welt-258-Cooldown-DOM: remove_relic_button existiert mit display-none,
  countdown_container/timer bleiben vorhanden; restliche Inventar-/Upgrade-IDs gleich.
  URL village=5485&screen=relic_system passt zum Match. Anonymisierte Minimalfassung
  in `scripts/fixtures/relic-cooldown.html`; verify-userscript prueft komplettes Bundle
  samt Suche/Presets/Docks, erhaelt Timer und Sperre und fuehrt keine Spielaktion aus.
  Welt-258-Link in Opera fuehrte auf abgelaufene Sitzung; dort keine Live-Pruefung.
- Endkontrolle Welt 259: 10 Spalten x 6 Reihen, native grid.per_page=60 statt 20;
  Suche Grossaxt 1/2, leere Treffer, Typfilter Banner, Sortierung Typ absteigend und
  Reset erfolgreich. Eine Reliquie per Linksklick testweise in Aufwertungsslot 0,
  danach wieder entfernt. Keine Aufwertung/Ausruestung ausgefuehrt. Slots danach
  alle null, native Gesamt-/Trefferzahl wieder 2/2, keine neuen Scriptfehler.
  80 Jest-Tests plus Typecheck, lesbarer Build und kompilierter Cooldown-Start bestanden.

## Update 17.10.2026: Kampf-Pools statt fester Kombinationen (1.0.7)

- Nutzerpraezisierung: Offensiv aus Axt-Angriff, LK-Angriff und ausschliesslich
  Rammbock-Gebaeudeschaden. Defensiv aus Speer-/Schwert-/SK-Verteidigung.
  Alle drei Plaetze duerfen beliebige Mischungen/Wiederholungen enthalten.
  Screenshot: Grossaxt + LK A/D + LK Angriff ist damit 3/3.
- Defaults `default:offence` / `default:defence` verwenden vorhandenes allBonuses;
  Hauptbonus-Pflicht aus 1.0.6 bleibt. Haupttypen Off: greataxe/shortspear/morningstar;
  Def: halberd/longsword/banner. Reine Ram-Angriffs-/Verteidigungsstaerke, Katapult-
  Gebaeudeschaden oder fremder Hauptbonus zaehlen nicht zum Off-Pool.
- Sechs alte Originaldefaults durch Gruppen ersetzen. Rename, fachliche Aenderung
  oder Shiny-only behalten die alte Regel. Neue Gruppe nur aktivieren, wenn eine
  ihrer ersetzten Originalregeln aktiv war; komplett geloeschte/deaktivierte
  Altgruppen nicht einschalten. Neue IDs/Tombstones fuer alte und neue Defaults
  merken, neue Gruppen spaeter nicht neu anlegen. Farben unveraendert lassen.
- UI klassifiziert Kampf/Rohstoffe nach Default-ID, nicht nach allBonuses;
  Kampf-Pools zeigen Namen + Einheitenicons. Eigene feste Kombinationen bleiben
  AND-Regeln mit getrennten Substatplaetzen, Poolregeln zaehlen tatsaechliche Boni.
- Nutzer hat den installierten Opera-Dev-Loader auf Port 9001 umgestellt.
- Endkontrolle: drei Pools im richtigen Bereich, je 20px ohne Ueberlauf; Off-
  Schalter entfernt/stellt Rahmen korrekt wieder her, Farben bleiben erhalten.
  Screenshotfall und alle Wiederholungen/Mischungen automatisiert geprueft;
  75 Tests, Typecheck und Standalonepruefung erfolgreich.
- Performance-Eintraege koennen gleichzeitig Bundles von 9000 und 9001 enthalten.
  HTTP-Pruefung: 9000 liefert ein anderes Projekt, 9001 reliquienUI. Das ist kein
  Beweis fuer zwei reliquienUI-Loader; gewollte andere Projektskripte nicht pauschal
  deaktivieren lassen. Aktuelle Pool-UI und 9001-Abruf bestaetigt.

## Update 17.10.2026: Development-Port 9001

- Port 9000 laut Nutzer anderweitig belegt. Webpack und Dev-Loader gemeinsam auf
  `http://127.0.0.1:9001/bundle.js` umgestellt; HTTP 200 mit aktuellem Bundle geprueft.
  Explizites IPv4 vermeidet die frueheren localhost/IPv6-Verwechslungen.
- Dev-Loader-Version 0.1.1. Standalone-Userscript enthaelt weiterhin keinen lokalen
  Loader; Offlinepruefung verwirft lokale Serveradressen jetzt unabhaengig vom Port.
- Direkter Zugriff auf Tampermonkey-Editor in Opera erneut explizit durch die
  Browser-URL-Sicherheitspruefung blockiert (nur http/https erlaubt). Nutzer muss
  die URL im installierten Loader selbst umstellen; keine Umgehung per CDP/UI/API.

## Update 17.10.2026: Hauptbonus als Pflichtbedingung (1.0.6)

- Nutzerkorrektur ersetzt die fruehere 2/3-Regel: bei gewaehltem Typ muss der
  Hauptbonus immer passen. Hauptbonus + ein Substat = 2/3; Hauptbonus + beide
  Substats = Volltreffer. Zwei Substats bei fremdem Hauptbonus: keine Markierung.
- Auch bei Rohstoff-/Poolregeln muss der Hauptbonus zur erlaubten Auswahl gehoeren.
  Fehlende/unbekannte Zuordnung nicht durch zwei passende Substats kompensieren.
- Regeln mit ausdruecklich beliebigem Typ bleiben unabhaengig vom Typ. Gates
  stehen gemeinsam in presetScore, gelten somit fuer Voll-/Teiltreffer, Shiny-
  Bedingungen und nach nativen Raster-Neuaufbauten. Speicherformat unveraendert.

## Update 17.10.2026: kraeftige Rahmen und Regenbogen-Shiny (1.0.5)

- Ersetzt das vorherige Glanzoverlay und die gestrichelte Trefferstufe:
  beide Presetstufen jetzt 4px solide, dunkle Innen-/Aussenkontur, z-index 2.
  Vorhandene globale Farben und Trefferprioritaet bleiben erhalten.
- Originalbild `greataxe_shoddy.webp` ist RGB/184px, ohne Alphakanal. Daher keine
  CSS-Maske mit dem Originalbild als vermeintlicher Gegenstands-Silhouette verwenden.
- Shiny per inline SVG-Filter `reliquien-shiny-rainbow`: selbst enthaltenes
  Gradient-SVG als feImage, feBlend/color mit SourceGraphic, leichter Helligkeits-
  und Saettigungsboost. Weiche radiale Farbmaske bewahrt die Bildecken weitgehend;
  sie ist keine exakte Gegenstandsfreistellung. Keine neuen Bild-Assets pro Typ.
- `primitiveUnits=objectBoundingBox` und feImage-Breite/-Hoehe 1 verwenden;
  Prozentwerte am 0px-Defs-SVG ergeben keine sichtbare Regenbogenquelle.
  Zusaetzliches feComposite nach dem Farbblend zeigte in Opera keine Faerbung;
  der direkte feBlend-Ausgang funktioniert. SVG-Definitionen einmalig erstellen.
- Auch nach Grid-Neuaufbau nur `relic-shiny` setzen/entfernen, Original-img und
  src fuer native Aktionen behalten. Keine Canvas-Lesezugriffe/CORS-Abhaengigkeit.
- Lokal existierte noch ein veraltetes `dist/reliquiensrtipz.user.js` (1.0.0).
  Diese ignorierte Altdatei wurde entfernt; fertiges Userscript nur im Repo-Stamm.
- Endkontrolle in Opera mit kurz simulierter `relic-shiny`-Klasse: Regenbogen
  sichtbar, beide Rahmen 4px/solid mit korrekter gespeicherter Farbe. Testklasse
  danach entfernt; native Reliquiendaten unberuehrt. 70 Tests und Bundlepruefung bestanden.

## Update 17.10.2026: Bogenwelt, Shiny und Preset-Trefferstufen

- Lesend in Opera auf Welt 259 bestaetigt: zusaetzliche Typen `longbow` und
  `shortbow`, kombinierte Einheitenboni 4 (Bogen) und 6 (berittener Bogen).
  Native Assets `unit_archer.webp` / `unit_marcher.webp` unter aktuellem Graphic-Base.
- Native Substat-Auswahl bezeichnet 26 hier als berittenen Bogen-Angriff und
  enthaelt keinen separaten LK-Angriff. Die bisherige Annahme, dass die Beschriftung
  fuer 26 auf allen Welten LK ist, ist damit ungueltig. Echte Substat-Daten liefern
  `name` und `benefit.img`; nicht nur aus der UI-Beschriftung auf LK schliessen.
- LK-Defaults verwenden `light-attack`: bei vorhandenen Namen nur LK-Angriff oder
  LK-Angriff/Verteidigung akzeptieren. Numerischer Fallback nur ohne native Namen.
  Originale Defaultpaare [24,26] werden migriert; geloeschte oder fachlich bearbeitete
  Defaults nicht wiederherstellen. Eigene numerische Bedingungen bleiben erhalten.
- Preset-Zeilen bleiben 20px/Panel 220px. Unbekannte Boni kompakt mit Auslassung,
  defekte Icons mit kurzem Einheitenkuerzel; voller Text in Titel/ARIA, kein Ueberlauf.
- Shiny: durchlaessiges ::before-Glanzoverlay und leichter Bildfilter, kein Rahmen.
  Preset: ::after-Rahmen, Volltreffer solide in `color`, 2/3 gestrichelt in
  `partialColor`. Volltreffer gewinnt, jede Bedingung braucht eigenen Bonusplatz.
  Kurze eigene Regeln bleiben Volltrefferregeln; 2/3 nur bei drei Bedingungen.
  Rohstoffgruppen zaehlen die drei tatsaechlichen Boni statt der Poolgroesse.
  Speicherformat bleibt Version 2, neue Farbe optional mit kompatiblem Default.
- Eigene numerische Einheitenbedingungen werden gegen den Katalog der aktuellen
  Welt und den nativen Namen des tatsaechlichen Substats geprueft. Damit erfuellt
  LK-Angriff/Verteidigung die hier als Bogen-Angriff bezeichnete Auswahl 26 nicht.
- Abschluss in Opera/Welt 259: Panel 220px, sieben Reihen je 20px ohne Ueberlauf;
  Icons einschliesslich beider Bogeneinheiten geladen. Temporäres Preset wechselt
  2/3 gestrichelt -> Volltreffer solide -> nach Shiny-Bedingung zurueck zu 2/3.
  Testpreset entfernt, keine Spielaktion ausgefuehrt. Echte Shiny nicht vorhanden;
  Glanz/CSS ohne Rahmen und Kombinationen ueber automatisierte Tests abgedeckt.

## Umgebung

- Foren-Initialisierung 14.10.2026 nach Nutzerkorrektur: Codefeld im TXT-Template
  enthaelt Tampermonkey-Header, offizielle Zwei-Zeilen-ScriptAPI und getScript mit
  ausdruecklichem Platzhalter fuer die Team-Server-URL. Keine Konfigurationsvariablen;
  Einstellungen erfolgen in der UI. Dieser Loader ist vom vollstaendigen GitHub-
  Pruefstand zu unterscheiden; dessen Hauptcode bleibt unveraendert.

- API-Vereinfachung 14.10.2026, Version 1.0.3: Nutzer verlangt die offizielle
  Zwei-Zeilen-Vorlage direkt am Anfang von main(). Eigene Registrierungsfunktion,
  Verfuegbarkeits-/Rueckgabewertpruefung und zugehoerige Wrapper-Tests entfernt.
  TypeScript-Typen stehen separat in einer d.ts-Datei und erscheinen nicht im Build.
  Native Exceptions nicht abfangen. Offline-Bundlepruefung deckt window und
  unsafeWindow sowie fehlende API/nativen Abbruch vor DOM-Aenderungen ab.

- Namenskorrektur 14.10.2026: offizieller Name laut Nutzer `reliquienUI`.
  API-Registrierung, Header, Dev-Loader, Forenentwurf und Pruefungen entsprechend
  korrigiert; Version 1.0.2. Dateiname/Repository/Persistenzkeys bleiben erhalten.

- Einreichungsvorbereitung 14.10.2026: Regelthemen aus dem verlinkten Forum in
  Opera gelesen, Web-Suche fuer diesen Host durch robots.txt gesperrt.
  Quellen: Genehmigungsprozess (Thread 192975), Template (192974), Script API
  (192973), Scripting-Regeln (192969). Nutzer moechte ausschliesslich deutschen
  Forenentwurf als TXT; keine englische Ticketfassung erstellen. Eine im Prozess
  verlinkte Ankuendigung zur Skriptbibliothek nennt Tickets; der Nutzer hat diesen
  Weg fuer seinen Vorgang ausdruecklich als veraltet korrigiert.
  GitHub statt passwortgeschuetztem Pastebin ist Nutzerwunsch fuer die Pruefdatei,
  im Entwurf als Abweichung klar benannt. Nicht als Spieler-Hosting/Freigabe ausgeben:
  die gelesenen Regeln verlangen Team-Hosting. Offizielle Loader-URL steht noch aus.
  API-Aufruf vor allen UI-Installern: register('Reliquien-Inventarhelfer', true,
  'TheHebel97', 'support-nur-im-forum@die-staemme.de'), ueber window/unsafeWindow.
  Keine Umgehung bei fehlender/ablehnender API oder nativen Exceptions.
  Version 1.0.1, MIT-Lizenz und Changelog hinzugefuegt; kompilierter Pruefstand
  `reliquiensrtipz.user.js` im Repo-Stamm, ohne Minifizierung/Dev-Loader/eval.
  Offline-Startpruefung am wirklichen kompilierten Bundle; keine weiteren Live-
  Spieltests fuer die Einreichungsvorbereitung. Klickweiterleitungen/Hoverauswahl
  und offizielle Grafikbilder im Entwurf offen beschreiben, Freigabe nicht behaupten.
  Build/Typecheck und 65 Tests bestanden; separate Offline-Bundlepruefung bestaetigt
  Registrierung vor DOM-Aenderungen, Abbruch bei fehlender/ablehnender API und
  Exception sowie korrekten Header/Lizenz und fehlenden Dev-Loader/eval/Ajax.

- Lesende Spielcode-Pruefung 12.09.2026 auf Dorfübersicht, ohne Navigation,
  Klicks oder Spielaktionen: geladenes `merged/game.7681c0.js` enthaelt einen
  verschleierten Pruefblock, initialisiert durch `a9fb6feee2c()`.
  Dieser beobachtet hinzugefuegte Script-Elemente und meldet deren externe
  src-Adressen; daneben bestehen gezielte Signaturpruefungen auf bestimmte
  DOM-Elemente, globale Variablen und einen LocalStorage-Eintrag.
  Meldepfad nutzt Connection.emit oder einen Bildrequest. Das Vorhandensein
  dieser Logik beweist keine Erkennung unseres Userscripts. Keine pauschale
  Unauffaelligkeit aus fehlenden eigenen Serverrequests ableiten.
  Reliquienmodul war in diesem Tab nicht geladen und wurde nicht untersucht.

- Userscript-Match: `https://*.die-staemme.de/game.php?village=*&screen=relic_*`.
- Getestete Ansicht: `screen=relic_system` (Inventar).
- Aktuelle Nutzervorgabe: ausschliesslich Opera mit ChatGPT-Erweiterung;
  keine Verbindung zur Chrome-ChatGPT-Erweiterung herstellen. Fruehere
  Chrome-Tests sind historische Ergebnisse, keine aktuelle Browserfreigabe.
  Browser-/Tab-IDs pro Sitzung ermitteln, nicht fest im Code speichern.
- 13.10.2026: Offenes Opera-Fenster mit Die-Staemme-Spielseite erkannt.
  Computer-Use-Zugriff anschliessend vom Werkzeug gestoppt: aktuelle
  Browser-URL konnte nicht zuverlaessig ermittelt werden. Keine Installation
  oder Spielaktionen durchgefuehrt; Tampermonkey-Status nicht verifiziert.
  Standalone-Build inklusive TypeScript-Pruefung und 27 Unit-Tests erfolgreich.
- Lokales Bundle: `http://localhost:9000/bundle.js`, Dev-Server laeuft zuletzt.
- Injection asynchron: nach Reload auf ein erwartetes Userscript-Element warten,
  nicht sofort ein fehlendes Panel als Fehler behandeln.
- Nutzer erlaubt direkte Tests auf seinem Spiel-Testaccount.

## Bekannte DOM-Struktur

Die vom Nutzer teils als Klassen bezeichneten Panelnamen sind **IDs**.

| Selektor | Funktion / Details |
| --- | --- |
| `.inventory-description` | Erklaerender Absatz, per Userscript ausgeblendet |
| `#page_inventory` | Elterncontainer der Inventarbereiche |
| `#relics_container` | Filter und Raster, urspruenglich maximal 490px breit |
| `.relics-grid-row` | Flex-Zeile mit Vor-Pfeil, `#relics`, Nach-Pfeil |
| `#relics > div > img` | Kachel; Bild traegt `data-id` der Reliquie |
| `#relics .relic-selected img` | Aktuell gewaehlte Kachel |
| `#prev_page`, `#next_page` | Blaettern; aktive Klassen `arrowLeft` / `arrowRight` |
| `#selected_relic_details .relic-details` | Ausgewaehlte Reliquie: `.header .description`, `.image img`, `.body` |
| `.sub_stats .sub_stat` | Substat-Zeilen innerhalb der Details; Farbklassen und Inline-Stile erhalten |
| `.range`, `.discovered_by` | Bereich und Entdecker innerhalb der Details |
| `#add_relic_to_upgrade_panel_button` | Ausgewaehlte Reliquie in einen Aufwertungsslot legen; verbraucht sie noch nicht |
| `#equip_button` | Nativer Ausruesten-Button in `#selected_relic_details .buttons`; auch ohne Userscript am 13.10.2026 in Opera bestaetigt |
| `#village_relic` | Ausgeruestete Dorf-Reliquie; Original-DOM fuer Spiel-Events beibehalten |
| `#village_relic_image`, `#village_relic_details` | Dorf-Bild und Details |
| `#remove_relic_button` | Entfernt die ausgeruestete Reliquie, kein Panel-Steuerelement |
| `#upgrade_panel` | Aufwertungsslots und eigentlicher Aufwertungsbutton |
| `#relics_to_upgrade` | Container mit drei Slot-Divs |
| `#relics_to_upgrade_0`, `_1`, `_2` | Slot-**Bilder**, Basis ist Slot 0; keine `data-id` am Slot beobachtet |
| `#relics_to_upgrade_remove_0`, `_1`, `_2` | Entfernen aus Slots; versteckt mit `.display-none` |
| `#upgrade_relic_button` | Fuehrt die eigentliche Aufwertung aus; `.btn-disabled` bei unvollstaendiger Auswahl |
| `table.vis` mit Inventar-Link | Reliquien-Subnavigation; rechter, vom Userscript angehaengter Slot fuer den Entdeckt-von-Schalter |

## Detailvorschau und Regeln

- Preset-Vorbereitung 13.10.2026: native Filterkataloge in Opera liefern
  16 Typen, 5 Qualitaeten und 35 Substat-Arten, unabhaengig von den aktuell
  vorhandenen Inventar-Reliquien. Das belegt den aktuellen Auswahlkatalog,
  nicht die serverseitige Zulaessigkeit aller theoretischen Kombinationen.
  Auslesen aus `inventory_filter_type`, `inventory_filter_quality` und
  `inventory_filter_sub1`; keine festgeschriebenen Browser-/Tab-IDs verwenden.
- Relevante Substat-IDs fuer das Nutzerbeispiel: 3 Axtkaempfer Angriff+Verteidigung,
  5 Leichte Kavallerie Angriff+Verteidigung, 24 Axtkaempfer Angriff,
  26 Leichte Kavallerie Angriff, 33 Axtkaempfer Verteidigung,
  35 Leichte Kavallerie Verteidigung. Grossaxt-Typ `greataxe` hat im beobachteten
  Inventar Axtkaempfer Angriff+Verteidigung als Hauptbonus.

- Shiny-Kriterium verifiziert: `RelicSystem.getRelicById(id).sub_stats` enthaelt
  pro Substat `perfect: boolean`. Der Spielrenderer setzt fuer `perfect: true`
  die Klasse `.relic-perfect-stat` (farbiger Stat im Tooltip).
- `src/ui/relic-shiny-highlight.ts` setzt `.relic-shiny` am Raster-Wrapper,
  sobald mindestens ein Substat perfect ist. 3px pinker Innenrahmen (#ff4fc3)
  als Outline am Bild verschiebt keine Kacheln und bleibt bei Auswahl sichtbar.
  ChildList-Observer erneuert die Markierung bei jedem Raster-Neuaufbau.
- Endtest: Sattel ID 59659 mit perfektem Katapult-Verteidigungsstat korrekt
  pink markiert; alle sichtbaren Kacheln mit Spieldaten abgeglichen, 0 Abweichungen.
  Webpack-Build inklusive TypeScript-Pruefung erfolgreich.
- Beim Klick auf `#add_relic_to_upgrade_panel_button` wird die Detailansicht geleert.
  Basisdetails deshalb VOR dem Spielhandler per Capture-Click sichern.
- Slot-Bildadressen verwenden z.B. `relics_184/handsaw_shoddy.webp` und
  `horseshoe_shoddy.webp`: Dateiname liefert Typ + Qualitaet, nicht die individuelle ID.
- Leere Bilder: `placeholder_relic_to_upgrade.png` (Slot 0),
  `placeholder_relic_upgrade_material.png` (Material).
- Beobachtete Qualitaetsoptionen: `shoddy`, `polished`, `refined`, `superior`, `renowned`.
- Nutzervorgabe: Drei gleiche Typen behalten die Substats der ersten Reliquie,
  inklusive pinker/Shiny-Substats. Verschiedene Typen ergeben eine zufaellige
  Aufwertung; dabei koennen Shinys entstehen. Gleiche Qualitaet erforderlich.
- Umsetzung behandelt auch 2+1 gemischte Typen als random; diese Variante ist
  eine Interpretation von "gleicher Typ vs. random", keine serverseitig bestaetigte Regel.
- Exakte neue Zahlenwerte und Zufallsergebnisse sind nicht bekannt. Bei gleichen
  Typen aktuelle Basisdetails mit entsprechendem Hinweis anzeigen; nichts erfinden.
- Substat-Farben beim Kopieren per computed `color` sichern, da CSS vom
  Elternselektor abhaengen kann. Keine duplizierten IDs oder Aktionsbuttons kopieren.
- Nur Slots auf DOM-Aenderungen beobachten, nicht die eigene Vorschau (Endlosschleife).

## Layout und Dateien

- Ausruestfenster-Optik 14.10.2026: Native `.relic-details` brachte eigenen
  braunen Aussenrahmen mit, Header/Body 5px Padding und Hauptbonus-Absatz 12px
  vertikale Margins. Erste Dock-Integration hatte diese Stile nicht zurueckgesetzt.
  Jetzt eigener kompakter Stil nur unter `#relic-equip-window`: kein innerer
  Aussenrahmen, Grid-Kopf mit 44px-Bild und Titel, Hauptbonus volle Inhaltsbreite,
  dezente Trennlinie, 11px-Substats/10px-Metadaten, vereinheitlichte Buttons.
  Native Qualitaetsklassen und inline Substat-Farben beibehalten.
  Opera-Endkontrolle: 220px Breite, 265,8px Hoehe statt vorher 291,6px,
  Hauptbonus 204,4px breit; kein Scrollbedarf und keine Dockueberlappung.
  Build/Typecheck und neun Hover-/Equip-Bedienungstests bestanden.

- Onboarding-Korrektur 14.10.2026: redundante Fussbuttons Ueberspringen/Los geht's
  durch einen Button `Verstanden` ersetzt. Die Einfuehrung ist eine einseitige
  Uebersicht; Kreuz/Escape erlauben direktes Schliessen. Speicherflag/Hilfe bleiben.

- Onboarding 13.10.2026: `relic-onboarding.ts` nach den anderen UI-Installern,
  nur bei Raster und Suchzeile. Einseitiges natives Dialogmodal `#relic-onboarding`
  mit sechs kompakten Themen (Links-/Rechtsklick zuerst). Kein Tour-/Schrittsystem.
  Schliessen/Skip/Fertig/Escape speichern `reliquiensrtipz:onboarding-seen=1`;
  bei Reload nicht automatisch oeffnen. `#relic-onboarding-help` (?) neben der
  Suche oeffnet manuell, Fokus nach Schliessen zur Ausloesesteuerung bzw. Suche.
  Storage-Ausnahme laesst Oeffnen/Schliessen nutzbar. Bei schmalen Viewports
  einspaltig, maximal verfuegbare Fensterhoehe; Modalinhalt bei Bedarf scrollbar.
  Opera-Endtest: Erststart sichtbar, 560x606px ohne Scrollbedarf im normalen
  Viewport; Ueberspringen -> geschlossen/Fokus Suche, Reload -> geschlossen,
  Hilfe manuell geoeffnet/Escape -> Fokus Hilfe. Build/Typecheck und 63 Tests
  erfolgreich. Keine Spielaktion ausgefuehrt.

- Hover-/Equip-Trennung 13.10.2026 ersetzt die fruehere interaktive Hover-Vorschau:
  Hover-Tooltip hat `pointer-events:none`, keine Aktionsbuttons/fokussierbaren Links;
  Verlassen der Kachel schliesst sofort, auch Richtung Statsflaeche. Darunterliegende
  Nachbarkacheln empfangen den Pointer direkt, keine Umwege um die Vorschau mehr.
  Rechtsklick auf echte Reliquie verhindert nur deren Browser-Kontextmenue und
  oeffnet `#relic-equip-window` als fuenftes 220px-Dockfenster. Platz-/Positionsregeln
  unveraendert, Auswahl nicht persistent. Pinned ID/Details getrennt von Hover;
  vor Ausruesten per aktuellem Rasterbild die exakte ID nativ erneut auswaehlen.
  Fehlende/entfernte/gefilterte Reliquie schliesst die Auswahl, keine stale Aktion.
  Native Button-Beschriftung/Disabled und Bestaetigungsdialog beibehalten.
  Shared DOM-Helfer `relic-details-dom.ts`: sanitisiertes Klonen ohne IDs/Handler/
  Buttons/aktive Links; Substat-Farbe direkt vom Original uebernehmen.
  Regressionen zuerst auf altem Code fehlgeschlagen (Mausdurchlaessigkeit und
  festgehaltenes Hover bei Verlassen), danach alle 57 Tests plus Typecheck/Build bestanden.
  Opera-Endtest bei 1590x1022: Vorschau ohne Buttons; elementFromPoint im Bereich
  der Vorschau trifft darunterliegende Rasterkachel. Echter Wechsel zur benachbarten
  leeren Kachel schliesst sofort. Rechtsklick auf ID 283148 oeffnet korrektes Panel
  220x291,6px ohne Dockueberlappung; Ausruesten mittig, native 24h-Bestaetigung
  erscheint. Mit Abbrechen geschlossen, nichts ausgeruestet/verbraucht, Slots leer.
  Mangels zweiter echter Reliquie Pin-gegen-spaeteren-Hover-Verwechslung im DOM-Test
  mit zwei nativen Auswahlhandlern geprueft; Ausruestaktion verwendet gepinnte ID.

- Presetfarbe 13.10.2026: `#relic-preset-color` im kompakten 18px-Toolbarbereich
  neben der Trefferzahl. Globale Farbe fuer Rasterrahmen und Presetzeilen,
  Standard gedecktes Neon-Gelb #d2d51b; inset 1px #443b29 als dunkle Innenkontur.
  CSS-Variable `--relic-preset-color` an Raster/Panel/Modal; Pink bleibt unveraendert.
  Speicherformat 2 ergaenzt `color`, alte/fehlende/ungueltige Farbwerte nutzen Default.
  Opera-Endtest: Wechsel auf Rot #c73721 ueber echtes Farbfeld wirkt sofort und
  bleibt nach Reload erhalten; anschliessend Gelb wiederhergestellt. Eigene Regeln
  und Default-Schalter erhalten. Build/Typecheck und 55 Tests erfolgreich,
  inklusive Farbwechsel bei kombinierten Shiny-/Preset-Klassen in DOM-Testdaten.

- Preset-Ausbau 13.10.2026: sechs Nutzer-Kampfdefaults plus Rohstoffregel in
  `relic-preset-defaults.ts`. Typen Grossaxt=greataxe, Kurzspeer=shortspear,
  Hellebarde=halberd, Banner=banner, Langschwert=longsword. MAIN_BONUSES folgt
  der aktuellen offiziellen Hilfe (Juni 2026+):
  https://support.innogames.com/kb/TribalWars/de_DE/6055?ls=1
  Rucksack=Kaserne-Kosten, Sattel=Stall-Kosten, Handsaege=Werkstatt-Kosten;
  aeltere Hilfe beschreibt diese Typen abweichend, nicht fuer neue Welten verwenden.
  Aktueller Weltkatalog enthaelt keine Kaserne-Kosten-Substatoption. Semantische
  Bedingung `barracks-cost` erkennt einen tatsaechlich gelieferten Substat anhand
  seiner nativen Bezeichnung; keine unbestaetigte numerische Kosten-ID festlegen.
  Rohstoffgruppe erlaubt Hauptbonus+genau zwei Substats aus Holz/Eisen/Lehm,
  Kaserne-Rekrutierungskosten und Beutekapazitaet; fremder/fehlender Bonus faellt raus.
  Kombinierte Einheitenboni zaehlen fuer Angriff oder Verteidigung; separate
  Angriffsboni zaehlen nicht als Verteidigung. Ein Stat fuellt nur eine Bedingung.
  Optional `shinyOnly` im Modal. Gemeinsamer Blau-/Pink-Rahmen mit echten
  Highlight-Installern an kuenstlichen perfect-Daten getestet (auch Toggle/Rasterersetzung),
  kein Shiny-Spieltest auf dem leeren Account behaupten.
  Speicherformat 2 migriert Format 1; installierte Default-IDs verhindern
  Zuruecksetzen bearbeiteter/deaktivierter/geloeschter Defaults bei Reload.
  Kompakte 20px-Zeilen statt Seiten/Karten, Editor im nativen Dialog mit Fokus-
  rueckgabe und Escape. Opera: zehn Zeilen gemeinsam bei 1487x918 ohne Scrollbedarf
  im 220x340px-Panel, Modal 420px breit; zwei temporaere Layout-Testpresets entfernt.
  Temporaere Viewportvorgabe zurueckgesetzt. Ausgangsviewport war nur 234px breit;
  dort ist wegen gemeinsamer Kollisionsspur Scrollbedarf erwartbar.

- Preset-Symbole 13.10.2026: Der vom Nutzer erwaehnte Versammlungsplatz war
  bereits in Opera offen; keine Chrome-Verbindung benoetigt. Native farbige Bilder
  unter `/graphic/unit/unit_{spear,sword,axe,spy,light,heavy,ram,catapult}.webp`.
  Keine inactive-Variante in den beobachteten Bildadressen. Aktuelle CDN-Assetwurzel
  aus einem bestehenden `/graphic/`-Bild der Reliquienseite ableiten.
  Presetkarten/Editorchips nutzen 18px-Symbole, kurze Bonuslabels und volle
  Titel/ARIA-Bezeichnungen. Grossaxt zeigt Axtsymbol als bestaetigten Hauptbonus;
  weitere Typen und Nicht-Einheiten-Boni bleiben Text, keine Zuordnung raten.
  Fehlende Bilder fallen auf die volle Textbezeichnung zurueck.
  Opera-Endtest: Axt/LK/Axt geladen, Panel weiterhin 220x340px, Karte und Editor
  ohne Scrollbedarf; gespeicherte Regel unveraendert. Build/Typecheck und 50 Tests
  bestanden. Konkrete System-Defaults werden vom Nutzer noch schriftlich geliefert.

- Nutzerkorrektur 13.10.2026: Presetfenster wieder 220px breit, genauso wie
  alle anderen Randfenster. Mehr Platz soll ausschliesslich durch Hoehe entstehen;
  340px Mindesthoehe und Name/Typ im Editor wieder untereinander. Die folgenden 400px-Messungen sind
  historisch und durch diese Vorgabe ersetzt.
- Platzabhaengiger Randwechsel: `balanceDockSides` verwendet natuerliche Hoehen
  (inkl. Mindesthoehe) und 8px-Abstaende. Passt eine Seite nicht, moeglichst wenige
  andere Fenster auf die Gegenseite verschieben. Drag-/Tastaturziel und gerade
  geoeffnetes/vergroessertes Fenster bevorzugen; Seitenwechsel mit den Positionen
  speichern. Keine feste Drei-Fenster-Grenze; bei mehr Fensterhoehe passen auch vier.
  Beide Seiten ausnutzen, bevor Hoehen begrenzt werden. Auf sehr schmalen Viewports
  bleibt die gemeinsame Kollisionsspur erhalten.
- Opera-Test bei 1487x918: Presets 220x340px. Beim Ziehen von links nach rechts
  mit drei anderen Fenstern rechts bleibt Presets rechts; Aufwerten springt nach
  links. Alle Fenster ohne Ueberlappung/Scrollbedarf. Editor einspaltig (204px
  Innenbreite), bestehende Substats unveraendert. Build/Typecheck und 50 Tests
  erfolgreich, inklusive Seitentausch und stabiler Verteilung bei Platzmangel.

- Randfenster-Proportionen 13.10.2026: Erklaerungsbloecke in Filter/Presets
  entfernt. Aufwertungsvorschau bei leeren Slots verborgen; sonst nur kurze
  Statuszeile/Basisdetails, keine langen Regeltexte. Filter-/Preset-Schliessen
  rechts in der Kopfzeile statt eigener voller Zeile.
- Presetfenster jetzt 400px breit, Karten mit 8px Innenabstand und zwei Karten
  pro Seite (Navigation bei mehr Presets). Editor/Listendarstellung wechseln:
  Name+Typ nebeneinander, Substats per Dropdown/Hinzufuegen und entfernbaren Chips.
  Keine Liste mit 35 Checkboxen im Panel mehr. Speicher-/Matching-Modell bleibt
  unveraendert; auch Presets auf anderen Kartenseiten matchen weiterhin.
- `dockHeightLimits` verteilt Hoehen nach natuerlichem Inhalt: kurze Fenster
  behalten ihre Hoehe, groessere nutzen den verbleibenden Platz. Breitenabhaengige
  Kollisionsspur beachtet das 400px-Fenster. Content-MutationObserver beobachtet
  ChildList/Text/hidden/open, sodass Editorwechsel und geoeffnete Sektionen die
  Hoehen aktualisieren, selbst wenn zuvor eine Maximalhoehe gesetzt war.
  Scrollbalken an Randpanels/Filterlisten sind ausgeblendet; bei extrem wenig
  Platz bleibt Overflow per Rad/Touch/Tastatur nutzbar, Inhalte nicht abschneiden.
- Opera-Endkontrolle bei 1487x918: alle vier geoeffneten Randfenster ohne
  Ueberlappung und ohne Scrollbedarf. Preset-Editor mit zwei bestehenden Substats
  400x269px; Filter 220x196px, Dorf 220x178px, Aufwerten 220x135px.
  Substats 5/24 im neuen Entwurf hinzugefuegt, Chip entfernt und Entwurf verworfen;
  gespeichertes `Axt + LK Off` unveraendert. Build/Typecheck und 45 Tests bestanden.
  Nutzer will System-Defaults erst als naechstes nach Bewertung der Proportionen
  vorgeben; noch keine weiteren Default-Kombinationen anlegen.

- Frei konfigurierbare Presets seit 13.10.2026: `src/ui/relic-presets.ts`,
  Modell `relic-preset-model.ts`. `#relic-preset-trigger` neben dem Filter-Schalter
  oeffnet das standardmaessig geschlossene Dockfenster `#relic-preset-window`.
  Kollisions-/Drag-/Resize-/Positionsspeicherung laeuft ueber `addDockedPanel`.
  Dock-CSS umfasst nun auch dieses Fenster; keine Ueberlappung im Opera-Endtest.
- Preset: Name (max. 80 Zeichen), optionaler Typ (legt Hauptbonus fest),
  ausgewaehlte Substat-IDs, aktiv/inaktiv. Typ und alle Substats muessen passen;
  Substat-Reihenfolge egal. Mindestens eine Bedingung erforderlich. Mehrere
  Presets als ODER. Zahlenwerte/Qualitaet/Shiny sind keine Preset-Bedingungen.
  Unbekannte gespeicherte Typen/Stats bleiben beim Bearbeiten sichtbar und
  koennen nicht unbemerkt als reduzierte Regel gespeichert werden.
- Treffer bekommen `.relic-preset` und `data-relic-preset-names` am Wrapper.
  Pointer-events-freies Pseudoelement zeigt 3px Blau (#3687ff); zusammen mit
  `.relic-shiny` inset 6px/2px Blau, sodass der vorhandene pinke Bildrahmen bleibt.
  Beobachtet nur Raster-ChildList; keine nativen Daten-/UI-Methoden gewrappt,
  keine Serverrequests, keine neue Filterung oder Sortierung.
- Versioniertes JSON `{version:1,presets:[...]}` unter
  `reliquiensrtipz:relic-presets`, pro Browser/Spiel-Origin. Ungueltige Regeln
  komplett verwerfen statt durch Weglassen von Bedingungen breiter zu matchen.
  Bei Speicherfehlern fuer die Sitzung weiter nutzbar, mit sichtbarem Hinweis.
- Opera-Endtest: Testkombination Grossaxt + IDs 5/9 markiert ID 283148 blau;
  3px-Blau verifiziert, Speicherung nach Reload und Deaktivieren/Reaktivieren
  bestaetigt. Danach als Nutzerbeispiel `Axt + LK Off` auf Grossaxt + IDs 5/24
  geaendert und gespeichert. ID 283148 bleibt korrekt unmarkiert (hat 5/9).
  Suche Sattel -> 0 Kacheln, Suche geleert -> 1; Preset erhalten. Keine
  Spielaktionen beim Presettest. Reale Doppelmarkierung mangels Shiny im
  aktuellen Inventar nicht im Spiel getestet; Klassenerhalt per DOM-Test geprueft.
  Build/Typecheck und 42 Tests erfolgreich.

- Hover-Fenster seit 13.10.2026: eigener `#relic-hover-equip-button` leitet
  an den originalen `#equip_button` weiter. Native Beschriftung/Verfuegbarkeit
  uebernehmen; keine eigenen Equip-Requests oder kopierten Spielhandler.
  Vor der Aktion exakte Hover-Reliquie synchron auswaehlen. Klick auf die Kachel
  bleibt Auswahl fuer den naechsten Aufwertungsslot, keine direkte Aufwertung.
- Reproduzierter Hover-Fehler: Verlassen der Kachel liess das Fenster durch den
  120-ms-Timer sichtbar; Fokusverlust und Rasterersetzung hatten keinen eigenen
  Schliesspfad. Timer entfernt. Tooltip liegt unmittelbar rechts neben der
  Kachel (bei Platzmangel links), damit der Ausruesten-Button ohne Luecke erreichbar
  bleibt. Ausserhalb beider Bereiche, bei Focusout, Escape, Window-Blur,
  Tabwechsel, Scrollen ausserhalb des Tooltips, Resize oder entfernten Kacheln
  schliessen und aktive Hover-Referenzen loeschen. Nach Slot-/Equip-Klick sofort
  schliessen. Native Detail-Mutationen duerfen das Fenster danach nicht wieder oeffnen.
- Keine Hover-Detail-Cache-Snapshots mehr; Details synchron vom Spiel uebernehmen.
  Eigener Aktionsbutton bleibt bei Observer-Updates derselbe DOM-Knoten, damit
  Tastaturfokus erhalten bleibt. DOM-Regressionstests in `relic-hover-details.test.ts`
  nutzen `jest-environment-jsdom` (Dev-Abhaengigkeit).
- Opera-Abschlusstest 13.10.2026: neuer Ausruesten-Button mittig unter den
  Details (Abweichung zur Fenstermitte < 0,01px). Echter Mauswechsel von Kachel
  ins angrenzende Fenster haelt es offen; Verlassen und Tab-Focusout schliessen
  sofort. Linksklick legt Grossaxt ID 283148 in Slot 0; Fenster schliesst.
  Slot anschliessend geleert, keine Aufwertung ausgefuehrt.
- Klick auf Hover-Ausruesten oeffnet die native `#confirmation-box`. Diese
  weist auf 24 Stunden Sperre fuer einen Reliquienwechsel hin. Fuer den Test
  mit `Abbrechen` geschlossen; keine Reliquie ausgeruestet, Dorf und Inventar
  unveraendert, alle Slots leer. Native Bestätigung weder umgehen noch fuer
  einen kurzen Funktionstest bestaetigen. Build/Typecheck und 34 Tests bestanden.
- Opera-Erweiterungsanbindung ueber Browser-ID fuer Opera funktioniert jetzt.
  Tampermonkey-Seite hat `chrome-extension:`-URL auch in Opera. Zugriff wurde
  durch Browser-Sicherheitspruefung blockiert; Nutzer schaltet das Userscript
  selbst aus/ein. Nicht ueber CDP oder andere UI-Werkzeuge umgehen.
- Lokaler Server am 13.10.2026: `127.0.0.1:9000/bundle.js` liefert den neuen
  Webpack-Code. Shell-Abruf von `localhost:9000/bundle.js` lieferte 404;
  mehrere Prozesse lauschen auf Port 9000 (IPv4/IPv6). Bei Loader-Problemen
  Adresse pruefen statt einen weiteren Server zu starten.

- Sortierung: `.sort-line` direkt zwischen `.search-line` und `.search-status`,
  22px hoch, `#relic-sort-field` und `#relic-sort-direction`. Nicht im Dockfenster.
  Registry in `relic-sort.ts`: Standard (native Reihenfolge), Qualitaet nach
  shoddy/polished/refined/superior/renowned, Typ nach deutschem Optionslabel,
  Bereich nach numerischem `range`, Shiny-Substats nach Anzahl `perfect === true`.
- Haupt-/Substats enthalten beobachtet keine separaten numerischen Bonuswerte,
  nur formatierte Namen/Benefit-Texte. Auf Nutzerwunsch Substat-Sortierung:
  Optgroup Substat-Staerke im vorhandenen Dropdown, Felder `substat:<id>` aus
  nativem Substat-Katalog. `substatStrength` extrahiert genau einen Prozentwert
  als Zahl (Dezimalkomma/-punkt), vergleicht Staerke als Betrag; -10% Kosten
  staerker als -2%. Fehlend/mehrdeutig zuletzt, niemals als 0 interpretieren.
  Auswahl startet absteigend, Pfeil kehrt um. Keine zusaetzliche Filterung.
  Endtest Katapult-Verteidigung: +2% vor +1%, umgekehrt korrekt; ohne Stat zuletzt.
  Zeile weiterhin 22px hoch. Build und 27 Tests bestanden.
  `groupRelics` behaelt die Reihenfolge des ersten Auftretens per Map bei.
- Pipeline: originales updateData -> eigene Filter -> sortRelics -> native
  Gruppierung/Paginierung. Sortiert Kopie, Gleichstaende behalten native Reihenfolge,
  fehlende Werte immer zuletzt. Standard stellt Originalfilterreihenfolge her;
  Richtung dabei deaktiviert. Sortierwechsel auf Seite 0; Reset setzt alles zurueck.
- Sortier-Endtest: Zeilenposition/-hoehe bestaetigt, Typen alphabetisch nach
  deutschen Namen; Suche hufeisen sattel + Shiny absteigend zeigt 12 Treffer und
  ID 59659 zuerst. Reset liefert exakt die urspruengliche ID-Reihenfolge.
  Build inklusive Typecheck und 25 Unit-Tests bestanden.
- Filterfenster-Refactor: `#relic-filter-window` enthaelt alle sechs Sektionen,
  aktive Chips und Suchhilfe. Inventar `#relic-search` enthaelt nur Suchzeile
  mit Filter-Schalter/Reset und Trefferzahl; keine leeren Filter-Platzhalter.
- Gemeinsames Dock-System bietet `addDockedPanel(element, title, top)` mit
  `setVisible` / `setTitle`. Verwendet unveraenderten Drag-, Tastatur-, Resize-,
  Kollisions- und LocalStorage-Pfad. Versteckte Panels nehmen keinen Kollisionsplatz
  ein. Fenster ist 220px breit, scrollbar, am Rand ohne Rundung.
- Filter-Schalter toggelt Fenster; Schliessen gibt Fokus an Schalter zurueck.
  Position persistent, Sichtbarkeit wie bei vorhandenen Fenstern nicht gespeichert.
  Titel/Schalter und geschlossene Sektionen zeigen aktive Filterzahlen inklusive
  erkannter Query-Filter. SearchState ist einzige Quelle; Parsergebnis abgeleitet,
  kein eigener Zustand im Fenster. Vorhandene Such-/Toggle-UND-Semantik erhalten.
- Endtest Refactor: 0 Inline-Sektionen, 6 im Fenster; shiny -katapult unveraendert;
  Hufeisen+Sattel 12 Treffer, Titel Filter (2), Typ (2). Schliessen/oeffnen behaelt
  Suche. Per Maus links angedockt, drei Panels ohne Ueberlappung; Seite/Position
  nach Reload wiederhergestellt. Reset liefert 34 Treffer und 0 aktive Chips.
- Smarte Suche: `src/ui/relic-search.ts` versteckt `.ui-dropdown` im
  Reliquiencontainer. Optionskatalog aus `inventory_filter_quality`,
  `inventory_filter_type`, `inventory_filter_sub1`; zweite Substat-Auswahl entfällt.
- Eigene Filter: Qualitaet, Typ, Eigenschaften, Einheiten/Gebaeude, Substat-IDs,
  Shiny. Innerhalb einer Gruppe ODER, zwischen Gruppen UND; Substats optional
  ALLE erforderlich. Aktive Chips sind entfernbar; Gruppen aufklappbar.
- Parser `relic-search-model.ts`: Qualitaets-/Typbegriffe werden als Filter
  erkannt, weitere Begriffe durchsuchen Name, Typ, Haupt-/Substats (UND).
  Shiny/pink, ohne/kein/nicht shiny, -shiny; Ausschluss -begriff, zitierte
  Phrasen. Kuerzel lk/sk/kata/off/def/speed; Umlaute und ae/oe/ue normalisiert.
  Mehrere erkannte Typen/Qualitaeten als ODER; Suche und manuelle Chips als UND.
  Erkannte Suchfilter erscheinen separat als entfernbare Suche-Chips.
- Integration: Wrapper um `Inventory.updateData` setzt native Filter auf null,
  ruft Original auf (Dorf, Handel, Aufwertungsslots bleiben ausgeschlossen),
  filtert danach `inventory_relics`. Keine Spielserver-Requests durch Filter.
  Wrapper um `updateUI` begrenzt page und aktualisiert Treffer-/Seitenzahl.
  Native `getGroupedInventoryRelics` arbeitet auf dem gefilterten Array.
  Bei Eingaben Seite 0, Auswahl/Tooltip zuruecksetzen; bei Gruppenhoehenwechsel
  Rasterkapazitaet ueber resize neu berechnen. Keine Such-Persistenz implementiert.
- Endtest Suche: shiny katapult verteidigung / shiny kata def -> ID 59659,
  Hufeisen + Sattel -> 12 Treffer beider Typen; ohne shiny -> 11 Treffer.
  Hover mit 429 Zeichen bestaetigt. Linksklick entfernt passenden Treffer in
  Slot 0; Entfernen aus Slot bringt ihn in die Suche zurueck. Abschliessend
  Filter zurueckgesetzt, 34 Treffer, Slots leer. Build und 20 Unit-Tests bestanden.
- Raster: volle Containerbreite, maximal 10 Spalten und 8 Reihen, 2px Abstand.
  `src/ui/relic-grid-layout.ts` berechnet Spalten mit 55,25px Mindestziel und
  Reihen aus Fensterhoehe minus Rasteroberkante minus 40px Fussbereich.
  Kacheln bleiben quadratisch und fuellen die Breite. ResizeObserver und
  Fenster-resize aktualisieren das Layout, mindestens eine Reihe/Spalte.
- Native Paginierung in `RelicSystem.Inventory`: `relics_per_page` (nativ 20),
  nullbasierte `page`, `getMaxPage()`, `getGroupedInventoryRelics()`, `updateUI()`.
  RelicSystem ist ein globales lexikalisches Binding, KEINE window-Eigenschaft.
  Seitengroesse auf Spalten x Reihen setzen, Seite anhand des vorherigen ersten
  Eintrags neu berechnen und begrenzen. `updateUI()` rendert Bilder plus leere
  Platzhalter, installiert Bildlistener und aktualisiert Pfeile/Filter-/Slotansicht.
- `single-page` am Container aendert die Pfeilbreite; ResizeObserver gleicht
  die resultierende Rasterbreite ab. Native Filter und Blaetterhandler beibehalten.
- Raster-Endtest: bei 855px Fensterhoehe 10 Spalten x 6 Reihen, Kapazitaet 60,
  alle 34 Inventargruppen sichtbar, Hover mit Detailinhalt bestaetigt. Bei 600px
  Fensterhoehe 30 Plaetze, zweite Seite mit 4 Bildern per echtem Mausklick geprueft.
  Fenstergroesse danach zurueckgesetzt: Seite 0, Kapazitaet 60, 34 Bilder.
  Build/Typecheck und 14 Unit-Tests bestanden.
- `.relic-dock` auf Dorf-/Aufwertungs-Panel, Breite 220px, direkt buendig am
  linken oder rechten Rand, 9px Rundung nur an der vom Rand abgewandten Seite
  und 8px Abstand nur zwischen Panels.
  `src/ui/docked-panels.ts`, Kollisionsberechnung `src/ui/dock-layout.ts`.
- Panelhoehen werden bei Platzmangel begrenzt, Inhalt scrollbar.
- `.relic-details` hat nativ 10px linken Aussenabstand: im Panel auf 0 setzen,
  sonst horizontaler Ueberlauf. Originale Kacheln/Slots/Spiel-Listener behalten.
- Randwechsel jetzt bei 40% von der Startseite: links -> rechts ab x=40%,
  rechts -> links ab x=60%. Startseite fuer einen Drag festhalten (kein Flackern).
- Spielkopfzeile endet beobachtet bei etwa 47px; Panels werden vorsichtshalber
  erst ab y=57px positioniert, damit sie nie hinter der Kopfzeile liegen.
- Speicherung unter `reliquiensrtipz:docked-panels`, je Panel `side` und `top`.
- Entdeckt-von-Schalter: `src/ui/discovered-by-toggle.ts`; findet die passende
  `table.vis` ueber ihren Inventar-Link, ergaenzt rechts den Toggle und speichert
  die Sichtbarkeit unter `reliquiensrtipz:show-discovered-by`. CSS blendet
  global `.discovered_by` aus, daher gilt die Wahl fuer Hover-, Dorf- und
  Aufwertungsvorschau-Details.
- Vorschau: `src/ui/upgrade-preview.ts`, Regeln `src/ui/upgrade-preview-model.ts`.
- Gezielte Tests: `node node_modules/jest/bin/jest.js --runInBand`.
  Build: `node node_modules/webpack/bin/webpack.js --mode development`.
  npm alternativ temporaer verfuegbar, siehe README/Handoff bei Bedarf.

## Letzter gezielter Abschlusstest

- Drei gleiche Hufeisen: Vorschau zeigte Basisdetails, Substats stimmten exakt
  mit der ersten ausgewaehlten Reliquie ueberein.
- Ein Material gegen Handsaege getauscht: Anzeige wechselte auf Zufallsaufwertung.
- Slots anschliessend geleert; keine Aufwertung ausgefuehrt/keine Reliquien verbraucht.
- Randwechsel nahe der Mitte getestet; kein Ueberlappen.
- Pink/Shiny-Farberhalt ist implementiert, wurde noch nicht mit einer echten
  Shiny-Reliquie im Spiel verifiziert.
- Build und 9 Unit-Tests erfolgreich. Ein gebuendelter Browser-Abschlusstest,
  ohne Screenshots oder vollstaendige DOM-Dumps.
- Nach Layoutanpassung: 10 Unit-Tests bestanden; Endkontrolle bestaetigte
  linke Buendigkeit, 9px Rundung und Top y=57px unter der Kopfzeile.
- Rasterdetails: `#selected_relic_details` bleibt fuer Spielhandler im DOM,
  ist aber unsichtbar. `src/ui/relic-hover-details.ts` waehlt eine Kachel beim
  Hover bewusst aus, damit die Spielseite ihre Details sofort liefert und im
  Tooltip anzeigt. Der Tooltip hat keinen eigenen Aufwertungsbutton.
- Verifiziert im Spielcode: Der native Auswahlhandler sitzt auf `#relics img`,
  NICHT auf dem umgebenden Div. `tile.click()` loest ihn nicht aus und war die
  Ursache fuer den leeren Hover und die wirkungslose Slot-Auswahl.
- `RelicDetailsPanel.showRelic` rendert synchron per `innerHTML` und installiert
  sofort den nativen Aufwertungs-Auswahlbutton. Die fruehere Annahme eines
  verzoegerten Renderings war falsch. Nach `image.click()` Details direkt kopieren;
  keine Renderframe-Verzoegerung vor der Slot-Auswahl (verhindert Verwechslungen
  bei schnellem Wechsel). Der MutationObserver deckt weitere Detailaenderungen ab.
- Linksklick auf `#relics > div` wird im Capture-Handler abgefangen und klickt
  den nativen `#add_relic_to_upgrade_panel_button`; das Spiel fuellt dadurch
  den naechsten freien Aufwertungsslot. Falls die Kachel noch nicht ausgewaehlt
  war, erfolgt zuerst `image.click()` unter einer Rekursionssperre. Danach wird
  der native Button synchron geklickt. Beim erneuten Klick auf ein bereits
  ausgewaehltes Bild wuerde das Spiel die Auswahl aufheben; diesen Bildklick
  deshalb ueberspringen.
- Das Userscript registriert keinen `contextmenu`-Handler am Raster. Rechtsklick
  veraendert daher keine Aufwertungsslots.
- Hover-Fenster erhaelt die Details der ersten angeklickten Kachel korrekt;
  die Dockkante am linken Rand wurde mit 0px, die aeussere Ecke mit 9px geprueft.
- Navbar-Toggle: im letzten Zellenplatz der Reliquien-Subnavigation bestaetigt;
  Aus- und Einschalten blendet `.discovered_by` korrekt aus/ein und stellt die
  vorherige Einstellung wieder her.
- Abschlusstest nach Korrektur des Bild-Handlers: echter Maus-Hover per CDP
  zeigt Handsaegen-Details (424 Zeichen), alle Slots bleiben leer. Linksklick
  legt ID 84618 in Slot 0; Basisvorschau stimmt. Nach Raster-Neuaufbau zeigt
  Hover Hufeisen-Details; Linksklick legt ID 60974 in Slot 1. Rechtsklick laesst
  die Slots unveraendert. Beide Testslots anschliessend entfernt, keine
  Aufwertung ausgefuehrt. Typecheck, Build und 10 bestehende Unit-Tests bestanden.
- Browser-Testhinweis: `playwright.evaluate` ist nur lesend, bietet keine echten
  DOM-Events oder `.click()`. Fuer Maus-Hover `Input.dispatchMouseEvent` ueber die
  dokumentierte CDP-Capability nutzen. Nicht aus einem wirkungslosen Containerklick
  auf einen Fehler des Browseradapters schliessen.
