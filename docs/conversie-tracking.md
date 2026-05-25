# Conversie-tracking — Froseo

Naslag voor de meting van leads via Google Tag Manager (GTM), GA4 en Google Ads.
De site geeft bij elke geslaagde inzending/klik een `dataLayer`-event af; GTM zet
dat om in conversies.

## dataLayer-events (zitten in de code)

| Event | Wanneer | Parameters |
|---|---|---|
| `generate_lead` | Formulier succesvol verzonden | `lead_type`: `analyse` of `contact`, `form_location` |
| `contact_click` | Klik op tel-, WhatsApp- of mailto-link (site-breed) | `contact_method`: `phone` / `whatsapp` / `email` |

Bronbestanden:
- `src/components/sections/CTA.astro` — homepage analyse-form (`lead_type: analyse`)
- `src/pages/contact.astro` — contactformulier (`lead_type: contact`)
- `src/layouts/BaseLayout.astro` — site-brede klik-listener (`contact_click`)

## GTM-container

- Container-ID: `GTM-TLW4G9R` (staat in `BaseLayout.astro`)
- Al aanwezig: Google-tag (GA4), Microsoft Clarity, 3 klik-triggers (affiliate/extern/intern)

## Google Ads-conversies

Account: **Froseo Ads** (211-415-4639). Beide zijn **primaire** acties (lead-bidding).
Conversie-ID is account-breed gelijk; alleen het label verschilt per actie.

| Conversieactie | Categorie | Conversie-ID | Label |
|---|---|---|---|
| Gratis analyse aangevraagd | Leadformulier indienen | `AW-18179117088` | `LBh1CNTbsbMcEKCgvdxD` |
| Contactformulier verzonden | Leadformulier indienen | `AW-18179117088` | `jAdJCKLembMcEKCgvdxD` |

Verbeterde conversies: **uit** (kan later aan zodra we het e-mailadres meesturen
in de dataLayer-push).

## GTM-setup (te bouwen)

### Variabele
- `dlv - lead_type` — Variabele voor gegevenslaag, naam `lead_type`
- `dlv - contact_method` — Variabele voor gegevenslaag, naam `contact_method`

### Triggers
- `Trigger - lead analyse` — Aangepaste gebeurtenis `generate_lead`, waar `dlv - lead_type` = `analyse`
- `Trigger - lead contact` — Aangepaste gebeurtenis `generate_lead`, waar `dlv - lead_type` = `contact`
- `Trigger - generate_lead (alle)` — Aangepaste gebeurtenis `generate_lead`, alle
- `Trigger - contact_click` — Aangepaste gebeurtenis `contact_click`, alle

### Tags
- `Conversion Linker` — type Conversielinker, trigger: Initialisatie / Alle pagina's
- `Ads - lead analyse` — Google Ads-conversietracking, ID `AW-18179117088`, label `LBh1CNTbsbMcEKCgvdxD`, trigger `Trigger - lead analyse`
- `Ads - lead contact` — Google Ads-conversietracking, ID `AW-18179117088`, label `jAdJCKLembMcEKCgvdxD`, trigger `Trigger - lead contact`
- `GA4 - generate_lead` — GA4-gebeurtenis `generate_lead`, param `lead_type = {{dlv - lead_type}}`, trigger `Trigger - generate_lead (alle)`
- (optioneel) `GA4 - contact_click` — GA4-gebeurtenis `contact_click`, param `contact_method = {{dlv - contact_method}}`, trigger `Trigger - contact_click`

### GA4
- Markeer `generate_lead` als **sleutelgebeurtenis** (Beheer → Gebeurtenissen).

## Testen
1. GTM → Voorbeeld (Preview) → `https://froseo.nl`.
2. Analyse-form versturen → `generate_lead` fired + `Ads - lead analyse` + `GA4 - generate_lead`.
3. Contactformulier versturen → `Ads - lead contact` fired (analyse mag NIET firen).
4. GTM → Verzenden / Publiceren.

## Nog te doen / later
- Verbeterde conversies aanzetten (e-mail meesturen in de dataLayer-push).
- Klik-leads (`contact_click`) eventueel als **secundaire** conversie in Ads (observeren, niet om op te bieden).
- GA4 ↔ Google Ads koppelen voor audience-import (optioneel).
