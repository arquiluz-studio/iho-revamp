-- Page body of a solution: the sections of the long layout, with bilingual text and media ids.
-- The row's existing policies cover the column. An empty object publishes nothing.

alter table public.business_lines
  add column page_content jsonb not null default '{}'::jsonb;

update public.business_lines
set page_content = $content$
{
  "hero": {
    "eyebrow": { "es": "Soluciones arquitectónicas", "en": "Architectural solutions" },
    "intro": { "es": "", "en": "" },
    "ctaLabel": { "es": "Cotizar", "en": "Request a quote" }
  },
  "intro": {
    "eyebrow": { "es": "", "en": "" },
    "title": { "es": "Soluciones arquitectónicas", "en": "Architectural solutions" },
    "body": { "es": "", "en": "" },
    "ctaLabel": { "es": "", "en": "" },
    "imageId": null
  },
  "banner": {
    "text": { "es": "Su coordinación empieza *desde el diseño.*", "en": "Coordination starts *with the design.*" }
  },
  "elements": {
    "title": { "es": "Elementos que construyen\nel conjunto", "en": "Elements that build\nthe whole" },
    "items": [
      { "title": { "es": "", "en": "" }, "text": { "es": "", "en": "" }, "imageId": null },
      { "title": { "es": "", "en": "" }, "text": { "es": "", "en": "" }, "imageId": null },
      { "title": { "es": "", "en": "" }, "text": { "es": "", "en": "" }, "imageId": null }
    ]
  },
  "categories": [
    { "label": { "es": "Pisos", "en": "Floors" } },
    { "label": { "es": "Plafones", "en": "Ceilings" } },
    { "label": { "es": "Muros", "en": "Walls" } },
    { "label": { "es": "Acústica", "en": "Acoustics" } }
  ],
  "spaces": {
    "title": { "es": "Soluciones para distintos espacios", "en": "Solutions for different spaces" },
    "body": { "es": "", "en": "" },
    "imageId": null
  },
  "process": {
    "title": { "es": "Cómo los abordamos", "en": "How we approach them" },
    "steps": [
      { "title": { "es": "", "en": "" }, "text": { "es": "", "en": "" } },
      { "title": { "es": "", "en": "" }, "text": { "es": "", "en": "" } },
      { "title": { "es": "", "en": "" }, "text": { "es": "", "en": "" } },
      { "title": { "es": "", "en": "" }, "text": { "es": "", "en": "" } }
    ]
  },
  "quote": {
    "text": { "es": "Asesoramos y diseñamos espacios", "en": "We advise and design spaces" },
    "attribution": { "es": "", "en": "" }
  },
  "gallery": {
    "items": [
      { "caption": { "es": "", "en": "" }, "imageId": null },
      { "caption": { "es": "", "en": "" }, "imageId": null },
      { "caption": { "es": "", "en": "" }, "imageId": null },
      { "caption": { "es": "", "en": "" }, "imageId": null }
    ]
  },
  "close": {
    "title": { "es": "Un espacio,\nmuchas posibilidades", "en": "One space,\nmany possibilities" },
    "ctaLabel": { "es": "Cotizar", "en": "Request a quote" }
  }
}
$content$::jsonb
where slug = 'architectural';
