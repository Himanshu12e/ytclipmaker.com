---
version: alpha
name: SiteGPT
description: A bright, conversion-focused SaaS system with a confident blue accent and lightweight editorial spacing.
colors:
  primary: "#155DEE"
  secondary: "#101828"
  tertiary: "#667085"
  neutral: "#EAECF0"
  surface: "#FFFFFF"
  on-surface: "#101828"
  error: "#D92D20"
  border: "#E5E7EB"
  muted-surface: "#F8FAFC"
  subtle-surface: "#F2F4F7"
typography:
  headline-display:
    fontFamily: "Open Sauce Sans"
    fontSize: "48px"
    fontWeight: 700
    lineHeight: "48px"
    letterSpacing: "-1.2px"
  headline-lg:
    fontFamily: "Open Sauce Sans"
    fontSize: "36px"
    fontWeight: 700
    lineHeight: "40px"
    letterSpacing: "-0.9px"
  headline-md:
    fontFamily: "Open Sauce Sans"
    fontSize: "30px"
    fontWeight: 700
    lineHeight: "36px"
    letterSpacing: "-0.75px"
  headline-sm:
    fontFamily: "Inter"
    fontSize: "24px"
    fontWeight: 700
    lineHeight: "30px"
    letterSpacing: "-0.04em"
  body-lg:
    fontFamily: "Inter"
    fontSize: "18px"
    fontWeight: 400
    lineHeight: "30px"
  body-md:
    fontFamily: "Inter"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: "28px"
  body-sm:
    fontFamily: "Inter"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: "22px"
  label-lg:
    fontFamily: "Inter"
    fontSize: "18px"
    fontWeight: 600
    lineHeight: "22px"
  label-md:
    fontFamily: "Inter"
    fontSize: "16px"
    fontWeight: 600
    lineHeight: "20px"
  label-sm:
    fontFamily: "Inter"
    fontSize: "14px"
    fontWeight: 500
    lineHeight: "20px"
  caption:
    fontFamily: "Inter"
    fontSize: "12px"
    fontWeight: 500
    lineHeight: "16px"
    letterSpacing: "0.02em"
  eyebrow:
    fontFamily: "Inter"
    fontSize: "11px"
    fontWeight: 700
    lineHeight: "12px"
    letterSpacing: "0.08em"
rounded:
  none: 0px
  sm: 4px
  md: 8px
  lg: 12px
  xl: 16px
  full: 9999px
spacing:
  xs: 6px
  sm: 16px
  md: 32px
  lg: 64px
  xl: 96px
  gutter: 24px
  section: 80px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    typography: "{typography.label-lg}"
    rounded: "{rounded.lg}"
    padding: "16px 32px"
    height: "60px"
  button-primary-hover:
    backgroundColor: "#0F4FD1"
    textColor: "{colors.surface}"
    typography: "{typography.label-lg}"
    rounded: "{rounded.lg}"
    padding: "16px 32px"
    height: "60px"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    typography: "{typography.label-lg}"
    rounded: "{rounded.lg}"
    padding: "16px 32px"
    height: "60px"
  button-secondary-hover:
    backgroundColor: "{colors.muted-surface}"
    textColor: "{colors.on-surface}"
    typography: "{typography.label-lg}"
    rounded: "{rounded.lg}"
    padding: "16px 32px"
    height: "60px"
  button-link:
    backgroundColor: "transparent"
    textColor: "{colors.primary}"
    typography: "{typography.label-sm}"
    rounded: "{rounded.none}"
    padding: "0px"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.primary}"
    rounded: "{rounded.md}"
    padding: "16px"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.lg}"
    padding: "14px 16px"
  chip:
    backgroundColor: "{colors.muted-surface}"
    textColor: "{colors.on-surface}"
    typography: "{typography.label-sm}"
    rounded: "{rounded.full}"
    padding: "6px 12px"
---

# SiteGPT

## Overview
SiteGPT feels modern, optimistic, and conversion-oriented, with a crisp SaaS personality rather than a playful consumer-brand tone. The layout is spacious and centered around a strong hero message, which makes it feel polished and easy to scan for business buyers. The overall emotional tone is confident and helpful, emphasizing speed, trust, and clarity.

## Colors
- **Primary (#155DEE):** A vivid electric blue used for key CTAs, brand marks, links, and the “AI” emphasis in the hero. It carries the system’s energy and makes the page feel active and trustworthy.
- **Secondary (#101828):** A deep near-black used for the main headlines, body copy, and navigation text. It provides strong contrast on white surfaces and gives the brand a professional SaaS voice.
- **Tertiary (#667085):** A muted slate gray used for supporting text, meta labels, and secondary UI details. It keeps the page calm and readable without competing with the primary call to action.
- **Neutral (#EAECF0):** A soft light gray used for subtle borders, dividers, and low-emphasis UI structure. It helps define containers without adding visual weight.
- **Surface (#FFFFFF):** The primary background and card fill color. The design relies heavily on white space, so this neutral surface is essential to the airy, high-clarity feel.
- **On-surface (#101828):** The default readable text color on light surfaces. It reinforces the high-contrast, editorial feel of the interface.
- **Border (#E5E7EB):** A very light border tone used on cards, inputs, and secondary buttons. It supports structure while keeping components understated.
- **Muted-surface (#F8FAFC):** A cool, almost-white tint for subtle UI states and secondary surfaces. It adds depth without creating heavy layering.
- **Subtle-surface (#F2F4F7):** A slightly darker pale gray for soft grouping and passive backgrounds. Useful when the interface needs just a touch more separation.
- **Error (#D92D20):** Reserved for validation and destructive states. It should stay rare so the primary blue remains the dominant accent.

## Typography
The system pairs **Open Sauce Sans** for prominent headlines with **Inter** for interface and long-form text. Open Sauce Sans gives the brand its bold, slightly editorial hero presence, while Inter keeps navigation, labels, and paragraphs clean and highly legible.

Headlines are tight and assertive, with negative letter spacing to create a compact, modern SaaS look. The largest display style is used for the hero statement, followed by progressively smaller heading styles for section structure and marketing content. Body text is medium-sized, open, and comfortable for quick scanning.

Labels and buttons are semibold, which gives calls to action and UI controls enough authority without feeling heavy. Uppercase and eyebrow-style treatment is used sparingly for small promotional labels such as product badges, where compact spacing and high emphasis help the message stand out.

## Layout
The layout uses a wide, centered marketing grid with generous outer margins and a clear split between copy on the left and product preview on the right. The hero area feels fixed-max-width rather than fully fluid, keeping the content aligned and readable on large desktop screens.

Spacing follows a spacious rhythm built around 6px, 16px, 32px, 64px, and 96px increments. Use `sm` and `md` for local spacing inside cards and groups, and reserve `lg` and `xl` for section separation, hero breathing room, and brand/logo clusters.

Cards and framed previews should use comfortable internal padding, with the hero visual receiving more vertical whitespace than dense UI. The overall density is low: content groups are clearly separated, and the page avoids crowded layouts.

## Elevation & Depth
Elevation is intentionally subtle. Rather than dramatic shadows, the design leans on thin borders, light tonal contrasts, and abundant white space to create hierarchy.

Primary buttons use a small soft shadow to lift them slightly from the background, while secondary elements rely on border-only framing. Cards and inputs should feel clean and lightly outlined, not heavily layered. This keeps the interface modern, lightweight, and product-led.

## Shapes
The shape language is friendly and moderately rounded, with 12px corners used for major interactive elements like buttons and cards. Smaller elements can use 4px or 8px radii, but the core feel should remain soft rather than pill-heavy or sharp.

Overall, the system balances approachable curves with clean geometric structure. Avoid exaggerated rounding; the brand should feel polished and precise.

## Components
Buttons are the most visually important components and should follow a clear primary/secondary split. `button-primary` is filled blue with white text, semibold type, 16px by 32px padding, and a 60px minimum height. It is the dominant CTA style and should be used for actions like “Start a free trial.” `button-primary-hover` should deepen the blue slightly while preserving contrast and shape.

`button-secondary` is a white or near-white button with dark text and a subtle border, used for lower-priority actions like “Book a demo.” It should feel present but deferential to the primary button. `button-secondary-hover` can introduce a faint muted-surface fill or slightly stronger border contrast without changing the overall tone. `button-link` should remain minimal, underlined, and blue for simple navigation or text actions.

Cards should use the `card` token style: white background, light border, modest padding, and soft radius. They should feel like containers, not elevated panels. In the screenshot, the assistant preview card is a good model: crisp outline, generous internal whitespace, and minimal visual noise.

Inputs should match the same lightweight framing as cards, with white background, soft border, and 12px or 16px corner treatment depending on scale. Keep focus states clear and blue-forward, but avoid thick outlines or heavy shadows.

Chips and badges should be compact, pill-shaped, and low noise. Use the `chip` style for small trust tags or meta pills, with muted backgrounds and concise label text. Lists and check-style benefit rows should use small circular blue icons with dark body text, maintaining the friendly but efficient marketing rhythm.

Top navigation links should be text-first and restrained, with semibold weight and ample horizontal spacing. Brand marks and small UI icons may use the primary blue as an accent, but they should not overpower the hero CTA hierarchy.

## Do's and Don'ts
- Do keep the interface airy with large gaps between hero content, CTAs, and supporting trust elements.
- Do use the primary blue sparingly but decisively for the most important action, highlights, and brand signals.
- Do favor thin borders and soft shadows over heavy elevation or layered surfaces.
- Do keep headline typography bold, compact, and tightly tracked for a modern SaaS feel.
- Don't introduce warm, saturated, or decorative colors that dilute the blue-led identity.
- Don't use oversized radii or pill buttons everywhere; reserve stronger rounding for specific controls.
- Don't crowd the page with dense text blocks or equal-weight CTAs.
- Don't rely on strong gradients, skeuomorphism, or elaborate shadows; the system should stay crisp and direct.
