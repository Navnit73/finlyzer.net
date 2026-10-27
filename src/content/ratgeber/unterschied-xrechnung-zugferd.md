---
slug: "unterschied-xrechnung-zugferd"
title: "Unterschied zwischen XRechnung und ZUGFeRD: Welches Format brauchen Sie?"
shortTitle: "XRechnung vs. ZUGFeRD"
metaTitle: "Unterschied XRechnung vs. ZUGFeRD: Vergleich & Empfehlung"
metaDescription: "XRechnung und ZUGFeRD im Vergleich: Dateiformat, Syntax, Empfänger und wann welches Format für B2B, B2G oder B2C Pflicht ist."
intro: "XRechnung und ZUGFeRD erfüllen beide die europäische Norm EN 16931 – trotzdem sind sie technisch grundverschieden. Hier erfahren Sie, worin sich die Formate unterscheiden und welches Sie für Ihre Rechnungsstellung brauchen."
badgeText: "E-Rechnung Ratgeber"
datePublished: "2026-10-27"
dateModified: "2026-10-27"
author: "Finlyzers Redaktion"
mainCta:
  title: "Format wählen und Rechnung umwandeln"
  label: "Format wählen und Rechnung umwandeln"
  href: "/de/konverter/e-rechnung"
  description: "Wandeln Sie Ihre PDF-Rechnung wahlweise in ZUGFeRD oder XRechnung um – kostenlos, browserbasiert und nach EN 16931 geprüft."
keywords:
  - "unterschied xrechnung und zugferd"
  - "unterschied zugferd xrechnung"
  - "zugferd xrechnung unterschied"
related:
  - "zugferd-rechnung"
faqs:
  - question: "Gibt es ZUGFeRD mit XRechnung-Profil?"
    answer: "Ja. Seit ZUGFeRD 2.1 existiert ein eigenes XRECHNUNG-Profil: Die Rechnung wird als ZUGFeRD-PDF mit eingebetteter XML ausgestellt, die XML-Daten folgen dabei exakt den Regeln der XRechnung. Für reine B2G-Übertragungswege über ZRE oder OZG-RE wird trotzdem meist die separate XRechnung-XML-Datei verlangt, nicht das PDF-Hybrid."
  - question: "Kann ich eine PDF in beide Formate umwandeln?"
    answer: "Ja. Mit dem Finlyzers-Konverter laden Sie Ihre bestehende PDF-Rechnung einmal hoch und wählen anschließend, ob eine ZUGFeRD-Datei (PDF/A-3 mit eingebetteter XML) oder eine reine XRechnung-XML erzeugt werden soll."
---

## XRechnung und ZUGFeRD im Überblick

Wer sich erstmals mit der E-Rechnungspflicht in Deutschland befasst, stößt unweigerlich auf zwei Begriffe: **XRechnung** und **ZUGFeRD**. Beide gelten als zulässige elektronische Rechnungsformate, beide basieren auf derselben gesetzlichen Grundlage – und doch handelt es sich um zwei technisch unterschiedliche Formate mit jeweils eigenem Einsatzbereich.

### Gemeinsamkeit: beide folgen EN 16931

XRechnung und ZUGFeRD sind beides konkrete Umsetzungen der europäischen Norm **EN 16931**, die ein einheitliches semantisches Datenmodell für elektronische Rechnungen in der EU vorgibt. Beide Formate enthalten dieselben Pflichtangaben – Rechnungsnummer, Steuerbeträge, Leistungsdatum, Bankverbindung und mehr – in maschinenlesbarer Form. Rechtlich gelten beide als vollwertige E-Rechnung im Sinne des § 14 UStG.

### Kernunterschied: reine XML oder PDF mit XML

Der entscheidende Unterschied liegt in der Verpackung der Daten:

- **XRechnung** ist eine **reine XML-Datei**. Es gibt kein begleitendes PDF-Layout – die Datei ist ausschließlich für Softwaresysteme gedacht und für Menschen ohne spezielles Anzeigeprogramm nicht lesbar.
- **ZUGFeRD** ist ein **Hybridformat**: ein optisch vertrautes PDF/A-3-Dokument, in das eine strukturierte XML-Datei (`factur-x.xml`) eingebettet ist. Menschen sehen die Rechnung wie gewohnt, Buchhaltungssysteme lesen parallel die eingebettete XML aus.

Mehr zum technischen Aufbau des Hybridformats finden Sie im Ratgeber zur [ZUGFeRD-Rechnung](/de/ratgeber/zugferd-rechnung).

### Dateiformat, Lesbarkeit, Empfänger

| Eigenschaft | XRechnung | ZUGFeRD |
| :--- | :--- | :--- |
| **Dateiformat** | Reine XML-Datei | PDF/A-3 mit eingebetteter XML |
| **Visuell lesbar** | Nein (nur mit Viewer-Software) | Ja, wie ein normales PDF |
| **Maschinenlesbar** | Ja, direkt | Ja, über eingebettete XML |
| **Syntax** | UBL oder CII | CII |
| **Haupteinsatz** | B2G (Behörden & Bund) | B2B (Unternehmen) |
| **Übertragungsweg** | Zentrale Portale (ZRE, OZG-RE) | E-Mail, Kundenportal |

### Syntax: CII oder UBL

Technisch erlaubt die XRechnung-Spezifikation zwei unterschiedliche XML-Syntaxen: **UBL** (Universal Business Language) und **CII** (Cross Industry Invoice). Welche Syntax ein Rechnungsempfänger akzeptiert, hängt von dessen Eingangsplattform ab. ZUGFeRD setzt dagegen ausschließlich auf **CII**, da dieses Schema die engere Kompatibilität mit dem PDF/A-3-Container und dem französischen Factur-X-Standard bietet.

## Vergleichstabelle

| Kriterium | XRechnung | ZUGFeRD |
| :--- | :--- | :--- |
| **Norm** | EN 16931 | EN 16931 |
| **Dateityp** | .xml | .pdf (mit eingebetteter .xml) |
| **Ohne Spezialsoftware lesbar** | Nein | Ja |
| **Leitweg-ID** | Zwingend bei Behörden | Nur bei öffentlichen Auftraggebern |
| **Typischer Empfänger** | Behörden, öffentliche Auftraggeber | Geschäftskunden (B2B) |
| **Archivierung** | Separates PDF zusätzlich nötig | Bild und Daten in einer Datei |

## Welches Format für wen?

Die Wahl des richtigen Formats hängt fast ausschließlich davon ab, an wen Sie Ihre Rechnung stellen.

### Rechnung an Unternehmen (B2B)

Im Geschäftsverkehr zwischen Unternehmen ist **ZUGFeRD** meist die praktischere Wahl. Ihr Kunde kann die Rechnung ohne zusätzliche Software öffnen, ausdrucken oder archivieren, während sein Buchhaltungsprogramm gleichzeitig die eingebettete XML automatisch verarbeitet. Das senkt die Einstiegshürde auf Empfängerseite erheblich, besonders bei kleineren Geschäftspartnern ohne spezialisierte E-Rechnungs-Software.

### Rechnung an Behörden (B2G)

Für Rechnungen an Bundesministerien, Bundesbehörden und viele Kommunen ist **XRechnung** in Deutschland der Standard. Öffentliche Auftraggeber erwarten die Übermittlung als reine XML-Datei über zentrale Eingangsplattformen wie ZRE oder OZG-RE, inklusive der verpflichtenden Leitweg-ID zur eindeutigen Zuordnung an die zuständige Stelle.

### Rechnung an Privatkunden (B2C)

Für Rechnungen an Privatpersonen besteht keine gesetzliche E-Rechnungspflicht. In der Praxis bleibt hier die klassische PDF- oder Papierrechnung üblich, da Privatkunden in der Regel keine XML-Daten verarbeiten.

#### Wann Behörden auch ZUGFeRD akzeptieren

Einige wenige öffentliche Auftraggeber und Landesbehörden akzeptieren neben der reinen XRechnung auch ZUGFeRD-Rechnungen im XRECHNUNG-Profil. Verlassen Sie sich im Zweifel jedoch immer auf die konkrete Vorgabe des jeweiligen Auftraggebers oder Eingangsportals, bevor Sie das Format wählen.

## Häufige Fragen

### Gibt es ZUGFeRD mit XRechnung-Profil?

Ja. Seit ZUGFeRD 2.1 existiert ein eigenes **XRECHNUNG-Profil**: Die Rechnung wird als ZUGFeRD-PDF mit eingebetteter XML ausgestellt, die XML-Daten folgen dabei exakt den Regeln der XRechnung. Für reine B2G-Übertragungswege über ZRE oder OZG-RE wird trotzdem meist die separate XRechnung-XML-Datei verlangt, nicht das PDF-Hybrid.

### Kann ich eine PDF in beide Formate umwandeln?

Ja. Mit dem Finlyzers-Konverter laden Sie Ihre bestehende PDF-Rechnung einmal hoch und wählen anschließend, ob eine ZUGFeRD-Datei (PDF/A-3 mit eingebetteter XML) oder eine reine XRechnung-XML erzeugt werden soll.
