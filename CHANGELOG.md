# Changelog

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
