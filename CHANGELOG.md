# Changelog

## 1.0.8 – 2026-10-30

- Raster und Seitenauswahl an die neue native `Inventory.grid`-Schnittstelle
  angepasst: Seitengroesse, Seitenwechsel und Begrenzung laufen wieder zusammen.
- Suche, Filter und Presets lesen den neuen gemeinsamen Filter-Katalog mit
  `q:`-/`t:`-/`s:`-Werten. Alte einzelne Dropdown-Kataloge werden weiterhin gelesen.
- Suche greift vor nativer Stapelbildung; Sortierung waehlt passende Repraesentanten
  und behaelt Stapelinhalte, serverseitige Updates und native Inventar-Zulaessigkeit.
- Vollstaendigen Start mit gesperrter Dorf-Reliquie/Entfernungs-Countdown abgesichert.
  Suche und Randfenster starten; Timer und native Entfernungssperre bleiben erhalten.

## 1.0.7 – 2026-10-17

- Kampf-Defaults als zwei Bonus-Pools statt sechs fester Kombinationen:
  Offensiv = Axt-Angriff, LK-Angriff und Rammbock-Gebaeudeschaden;
  Defensiv = Speer-, Schwert- und SK-Verteidigung.
- Beliebige Mischungen und Wiederholungen erlaubt. Hauptbonus muss zum Pool
  gehoeren; beide passenden Substats ergeben 3/3, einer 2/3. Kombinierte
  Angriffs-/Verteidigungsboni zaehlen weiterhin fuer die jeweilige Richtung.
- Unveraenderte alte Kampfdefaults migrieren; eigene/bearbeitete Regeln,
  deaktivierte/geloeschte Gruppen und gespeicherte Rahmenfarben respektieren.
- Rohstoff-Pool bleibt erhalten. Pool-Editor, Hilfe und Forenentwurf aktualisiert.

## 1.0.6 – 2026-10-17

- Preset-Treffer verlangen immer den ausgewaehlten Hauptbonus. Zwei passende
  Substats bei falschem Hauptbonus werden nicht mehr als 2/3 markiert.
- Auch Rohstoffgruppen verlangen einen Hauptbonus aus der erlaubten Auswahl;
  ein passender Substat ergibt 2/3, beide ergeben einen Volltreffer.
- Hilfe, Forenentwurf und fertiges Userscript aktualisiert.

## 1.0.5 – 2026-10-17

- Shiny faerbt das Originalbild mit einer Regenbogen-Schattierung um.
  SVG-Farbmischung erhaelt die Bilddetails und benoetigt keine Ersatzdateien;
  native Bildknoten, URLs und Spielaktionen bleiben erhalten.
- Beide Preset-Trefferstufen erhalten durchgehende, kraeftige 4px-Rahmen mit
  dunkler Kontur. Gespeicherte Farben fuer Volltreffer und 2/3 bleiben erhalten.
- Hilfe, Forenentwurf und Standalone-Userscript aktualisiert.

## 1.0.4 – 2026-10-17

- Kompakte Preset-Anzeige auf Bogenwelten: Icons für beide Bogeneinheiten,
  begrenzte Zeilen und kurze Ersatztexte bei fehlenden Bildern.
- LK-Angriffsdefaults unabhängig von der abweichenden Stat-26-Beschriftung
  auf Bogenwelten zuordnen; ursprüngliche Defaultregeln behutsam migrieren.
- Shiny als Glanzeffekt über dem Reliquienbild, ohne eigenen Rahmen.
- Presets markieren auch zwei von drei passenden Boni: gestrichelt und orange;
  Volltreffer bleiben durchgehend und neon-gelb. Beide Farben sind einstellbar.
- Jede Bedingung belegt einen eigenen Bonusplatz, Volltreffer haben Vorrang.
  Shiny-Bedingungen bleiben für beide Trefferstufen wirksam.
- Hilfe, Forenentwurf und kompilierte JavaScript-Datei aktualisiert.

## 1.0.3 – 2026-10-14

- ScriptAPI durch den offiziellen Zwei-Zeilen-Aufruf direkt am Start ersetzt.
  Eigene Registrierungsfunktion, Verfügbarkeits- und Rückgabewertprüfung entfernt.
- Native API-Fehler bleiben unverändert; keine Umgehung der Kompatibilitätsprüfung.
- Forenentwurf und fertige JavaScript-Datei entsprechend aktualisiert.

## 1.0.2 – 2026-10-14

- Offiziellen Scriptnamen auf `reliquienUI` korrigiert: ScriptAPI, Userscript-
  Metadaten, Development-Loader und Forenentwurf stimmen damit überein.
- Fertige JavaScript-Datei neu gebaut; Dateipfad und gespeicherte Einstellungen
  bleiben erhalten.

## 1.0.1 – 2026-10-14

- Vorbereitung der ersten Einreichung für den deutschen Markt.
- Vorgeschriebene ScriptAPI-Registrierung vor allen Änderungen an der Oberfläche.
  Fehlende API, Ablehnung oder native Fehler verhindern den Start.
- MIT-Lizenz mit vollständigem Hinweis in der kompilierten Datei.
- Lesbares Standalone-Userscript im Repository, ohne Minifizierung, eval oder Dev-Server.
- Deutscher Forenentwurf als TXT nach dem Einreichungstemplate.

## 1.0.0 – 2026-10-14

Erster Entwicklungsstand, noch keine Freigabe durch das Stämme-Team:

- Dynamisches Reliquienraster, durchlässige Hover-Details und verschiebbare Randfenster.
- Linksklick legt eine Reliquie in die native Aufwertungsauswahl; Rechtsklick wählt
  sie für das separate Ausrüstfenster. Native Ausrüstbestätigung bleibt erhalten.
- Lokale Suche, Filter, Sortierung und Anzeige perfekter Substats.
- Konfigurierbare Highlight-Presets, Kampf-/Rohstoffdefaults und kombinierte Shiny-Markierung.
- Erststart-Einführung und jederzeit erneut aufrufbare Hilfe.
