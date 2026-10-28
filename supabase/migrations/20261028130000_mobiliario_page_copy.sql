-- Mobiliario uses the same page layout as Architectural, filled with the copy already on that page.

update public.business_lines
set page_content = $page${
  "hero": {
    "eyebrow": {"es": "Soluciones", "en": "Solutions"},
    "intro": {"es": "Cada pieza define una forma de habitar el espacio. Integramos mobiliario y equipamiento que responden al uso, la arquitectura y la identidad de cada proyecto.", "en": "Each piece defines a way of inhabiting the space. We incorporate furniture and fixtures that are tailored to the use, architecture, and identity of each project."},
    "ctaLabel": {"es": "Cotizar", "en": "Request a quote"}
  },
  "intro": {
    "eyebrow": {"es": "", "en": ""},
    "title": {"es": "Cada espacio,\nuna respuesta", "en": "Every space,\none response"},
    "body": {"es": "El mobiliario define cómo se habita el espacio. Elegimos piezas que responden a la escala, la actividad y la identidad de quien lo usa.\n\nIntegramos sillas, mesas, lounge y puestos de trabajo que dialogan con la arquitectura y con el resto del equipamiento.", "en": "Furniture defines how a space is inhabited. We choose pieces that answer the scale, the activity, and the identity of the people who use it.\n\nWe integrate chairs, tables, lounge, and workstations that speak to the architecture and to the rest of the fit-out."},
    "ctaLabel": {"es": "Hablemos de tu proyecto", "en": "Let's talk about your project"},
    "imageId": null
  },
  "banner": {"text": {"es": "Sillas, mesas, lounge y puestos de trabajo responden a distintas formas de habitar.", "en": "Chairs, tables, lounge, and workstations answer different ways of inhabiting a space."}},
  "elements": {
    "eyebrow": {"es": "— Qué incluye", "en": "— What's included"},
    "title": {"es": "Elementos que construyen\nel conjunto", "en": "Elements that build\nthe whole"},
    "intro": {"es": "Cada proyecto requiere un conjunto de piezas. Explora el mobiliario que podemos integrar:", "en": "Every project needs its own set of pieces. Explore the furniture we can integrate:"},
    "items": [
      {"title": {"es": "Mobiliario interior", "en": "Interior furniture"}, "text": {"es": "Sillas, mesas y lounge para el espacio cerrado.", "en": "Chairs, tables and lounge for enclosed rooms."}, "imageId": null},
      {"title": {"es": "Mobiliario exterior", "en": "Outdoor furniture"}, "text": {"es": "Colecciones para terrazas y áreas abiertas.", "en": "Collections for terraces and open areas."}, "imageId": null},
      {"title": {"es": "Puestos de trabajo", "en": "Workstations"}, "text": {"es": "Escritorios y sistemas para el día a día.", "en": "Desks and systems for the working day."}, "imageId": null},
      {"title": {"es": "Equipamiento", "en": "Equipment"}, "text": {"es": "Almacenamiento, juntas y soporte del puesto.", "en": "Storage, meeting and support for the workplace."}, "imageId": null},
      {"title": {"es": "Accesorios", "en": "Accessories"}, "text": {"es": "Complementos que cierran el conjunto.", "en": "Pieces that complete the set."}, "imageId": null},
      {"title": {"es": "Piezas a medida", "en": "Made to measure"}, "text": {"es": "Cuando el proyecto pide una pieza propia.", "en": "When the project needs its own piece."}, "imageId": null}
    ]
  },
  "categories": [],
  "spaces": {
    "eyebrow": {"es": "— Espacios", "en": "— Spaces"},
    "title": {"es": "En cada tipo\nde proyecto", "en": "In every kind\nof project"},
    "body": {"es": "Integramos este mobiliario en proyectos corporativos, educativos, de retail, salud, hospitalidad y residenciales.\n\nCada selección responde al uso del espacio y a la identidad de cada cliente.", "en": "We bring this furniture into corporate, education, retail, healthcare, hospitality, and residential projects.\n\nEach selection responds to how the space is used and to the identity of each client."},
    "imageId": null
  },
  "process": {
    "eyebrow": {"es": "— Diseño", "en": "— Design"},
    "title": {"es": "Cómo los abordamos", "en": "How we approach them"},
    "intro": {"es": "La selección considera el uso, la escala, los materiales y la relación entre las piezas. El objetivo es un conjunto coherente, donde cada mueble cumple una función y acompaña la experiencia.", "en": "The selection considers use, scale, materials, and the relationship between the pieces. The aim is a coherent whole, where each piece has a role and supports the experience."},
    "steps": [
      {"title": {"es": "Atención personalizada en proyectos de inicio a fin.", "en": "Personal attention on projects from start to finish."}, "text": {"es": "", "en": ""}},
      {"title": {"es": "Piezas a la medida del uso y del espacio.", "en": "Pieces tailored to the use and the space."}, "text": {"es": "", "en": ""}},
      {"title": {"es": "Conjuntos que integran la cultura del cliente.", "en": "Sets that carry the client's culture."}, "text": {"es": "", "en": ""}}
    ]
  },
  "quote": {
    "text": {"es": "Asesoramos y\nequipamos espacios", "en": "We advise and\nfurnish spaces"},
    "attribution": {"es": "Un equipo multidisciplinario acompaña cada proyecto de inicio a fin. Las piezas se ajustan al uso del espacio y a la cultura de cada cliente.", "en": "A multidisciplinary team stays with every project from start to finish. The pieces fit how the space is used and the culture of each client."}
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
where slug = 'mobiliario';
