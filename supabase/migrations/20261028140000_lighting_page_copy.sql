-- Lighting uses the same page layout as Architectural and Mobiliario.

update public.business_lines
set page_content = $page${
  "hero": {
    "eyebrow": {"es": "Soluciones", "en": "Solutions"},
    "intro": {"es": "La luz transforma la manera de vivir un espacio. Diseñamos e integramos soluciones que revelan la arquitectura, crean atmósferas y acompañan cada momento.", "en": "Light transforms the way we experience a space. We design and integrate solutions that highlight the architecture, create atmospheres, and enhance every moment."},
    "ctaLabel": {"es": "Cotizar", "en": "Request a quote"}
  },
  "intro": {
    "eyebrow": {"es": "", "en": ""},
    "title": {"es": "Cada espacio,\nuna respuesta", "en": "Every space,\none response"},
    "body": {"es": "La luz revela la arquitectura y marca el ritmo del lugar. La elegimos según la actividad, la escala y la atmósfera que el espacio pide.\n\nIntegramos luz arquitectónica, decorativa y técnica que acompaña cada momento del día.", "en": "Light reveals the architecture and sets the rhythm of a place. We choose it for the activity, the scale, and the atmosphere the space asks for.\n\nWe integrate architectural, decorative, and technical light that stays with every moment of the day."},
    "ctaLabel": {"es": "Hablemos de tu proyecto", "en": "Let's talk about your project"},
    "imageId": null
  },
  "banner": {"text": {"es": "Luz arquitectónica, decorativa, técnica y de exterior responde a distintos momentos del espacio.", "en": "Architectural, decorative, technical, and outdoor light answers different moments of the space."}},
  "elements": {
    "eyebrow": {"es": "— Qué incluye", "en": "— What's included"},
    "title": {"es": "Elementos que construyen\nel conjunto", "en": "Elements that build\nthe whole"},
    "intro": {"es": "Cada proyecto requiere un conjunto de luz. Explora las soluciones que podemos integrar:", "en": "Every project needs its own set of light. Explore the solutions we can integrate:"},
    "items": [
      {"title": {"es": "Arquitectónica", "en": "Architectural"}, "text": {"es": "Luz integrada a la arquitectura del espacio.", "en": "Light built into the architecture of the space."}, "imageId": null},
      {"title": {"es": "Decorativa", "en": "Decorative"}, "text": {"es": "Luminarias que definen la atmósfera.", "en": "Luminaires that set the atmosphere."}, "imageId": null},
      {"title": {"es": "Exterior", "en": "Outdoor"}, "text": {"es": "Iluminación para fachadas, terrazas y paisaje.", "en": "Lighting for facades, terraces and landscape."}, "imageId": null},
      {"title": {"es": "Técnica", "en": "Technical"}, "text": {"es": "Sistemas para el puesto y el plano de trabajo.", "en": "Systems for the workstation and the work plane."}, "imageId": null},
      {"title": {"es": "Diseño", "en": "Design"}, "text": {"es": "Piezas de autor para el punto que el proyecto pide.", "en": "Author pieces for the point the project asks for."}, "imageId": null},
      {"title": {"es": "Piezas a medida", "en": "Made to measure"}, "text": {"es": "Cuando la luz tiene que hacerse para el lugar.", "en": "When the light has to be made for the place."}, "imageId": null}
    ]
  },
  "categories": [],
  "spaces": {
    "eyebrow": {"es": "— Espacios", "en": "— Spaces"},
    "title": {"es": "En cada tipo\nde proyecto", "en": "In every kind\nof project"},
    "body": {"es": "Integramos esta luz en proyectos corporativos, educativos, de retail, salud, hospitalidad y residenciales.\n\nCada selección responde al uso del espacio y a la atmósfera que el cliente busca.", "en": "We bring this light into corporate, education, retail, healthcare, hospitality, and residential projects.\n\nEach selection responds to how the space is used and to the atmosphere the client is after."},
    "imageId": null
  },
  "process": {
    "eyebrow": {"es": "— Diseño", "en": "— Design"},
    "title": {"es": "Cómo los abordamos", "en": "How we approach them"},
    "intro": {"es": "La selección considera el uso, la escala, los materiales y la relación entre la luz y la arquitectura. El objetivo es una atmósfera coherente, donde cada luminaria cumple una función y acompaña la experiencia.", "en": "The selection considers use, scale, materials, and the relationship between light and architecture. The aim is a coherent atmosphere, where each luminaire has a role and supports the experience."},
    "steps": [
      {"title": {"es": "Atención personalizada en proyectos de inicio a fin.", "en": "Personal attention on projects from start to finish."}, "text": {"es": "", "en": ""}},
      {"title": {"es": "Luz a la medida del uso y del espacio.", "en": "Light tailored to the use and the space."}, "text": {"es": "", "en": ""}},
      {"title": {"es": "Atmósferas que integran la cultura del cliente.", "en": "Atmospheres that carry the client's culture."}, "text": {"es": "", "en": ""}}
    ]
  },
  "quote": {
    "text": {"es": "Asesoramos y\niluminamos espacios", "en": "We advise and\nlight spaces"},
    "attribution": {"es": "Un equipo multidisciplinario acompaña cada proyecto de inicio a fin. La luz se ajusta a la arquitectura del espacio y a la cultura de cada cliente.", "en": "A multidisciplinary team stays with every project from start to finish. The light fits the architecture of the space and the culture of each client."}
  },
  "brands": {"eyebrow": {"es": "— Marcas de la solución", "en": "— Brands in the solution"}, "items": []},
  "gallery": {"eyebrow": {"es": "— Proyectos", "en": "— Projects"}, "items": []},
  "close": {
    "eyebrow": {"es": "— Siguiente paso", "en": "— Next step"},
    "title": {"es": "Un espacio,\nmuchas posibilidades", "en": "One space,\nmany possibilities"},
    "body": {"es": "Cuéntanos el proyecto y preparamos la propuesta.", "en": "Tell us about the project and we will prepare the proposal."},
    "ctaLabel": {"es": "Cotizar", "en": "Request a quote"}
  }
}$page$::jsonb
where slug = 'lighting';
