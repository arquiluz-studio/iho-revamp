-- Workspace uses the long space layout. Other spaces keep the previous page until their copy is published.

alter table public.sectors
  add column if not exists page_content jsonb not null default '{}'::jsonb;

update public.sectors
set page_content = $page${
  "hero": {
    "intro": {"es": "Oficinas corporativas y espacios de trabajo pensados para las personas y la operación de cada organización.", "en": "Corporate offices and workspaces designed for people and for how each organization operates."},
    "ctaLabel": {"es": "", "en": ""}
  },
  "intro": {
    "eyebrow": {"es": "Espacios de trabajo", "en": "Workspaces"},
    "title": {"es": "Workspace", "en": "Workspace"},
    "body": {"es": "Espacios pensados para las distintas actividades de cada organización: trabajar, reunirse, colaborar y concentrarse.\n\nIntegramos soluciones arquitectónicas e iluminación de acuerdo con la cultura y la operación de cada equipo.", "en": "Spaces designed for the different activities of each organization: working, meeting, collaborating and focusing.\n\nWe integrate architectural solutions and lighting according to the culture and the operation of each team."},
    "ctaLabel": {"es": "Hablemos de tu proyecto", "en": "Let's talk about your project"},
    "imageId": null
  },
  "banner": {
    "title": {"es": "Espacios de trabajo *pensados*\npara cada jornada", "en": "Workspaces *designed*\nfor every workday"},
    "text": {"es": "Una oficina reúne actividades y formas de trabajo distintas. Asesoramos en el diseño de puestos individuales, salas de reunión, áreas colaborativas, espacios de concentración y zonas comunes. Cada decisión considera la ergonomía, la circulación, la acústica y la iluminación del entorno.", "en": "An office brings together different activities and ways of working. We advise on the design of individual workstations, meeting rooms, collaborative areas, focus spaces and shared zones. Each decision considers ergonomics, circulation, acoustics and the lighting of the surroundings."}
  },
  "elements": {
    "eyebrow": {"es": "— Qué integramos", "en": "— What we integrate"},
    "title": {"es": "Lo que integramos\nen Workspace", "en": "What we integrate\nin Workspace"},
    "intro": {"es": "Cada oficina pide un conjunto de piezas. Esto es lo que podemos integrar:", "en": "Every office asks for its own set of pieces. This is what we can integrate:"},
    "moreLabel": {"es": "Ver más", "en": "See more"},
    "items": [
      {"title": {"es": "Puestos de trabajo", "en": "Workstations"}, "text": {"es": "Escritorios individuales, las reuniones y las áreas colaborativas.", "en": "Individual desks, meetings and collaborative areas."}, "imageId": null},
      {"title": {"es": "Salas de reunión", "en": "Meeting rooms"}, "text": {"es": "Mobiliario, iluminación y acústica para presentaciones.", "en": "Furniture, lighting and acoustics for presentations."}, "imageId": null},
      {"title": {"es": "Zonas comunes", "en": "Shared zones"}, "text": {"es": "Equipo, áreas de encuentro, pausa y circulación.", "en": "Equipment, meeting areas, pause and circulation."}, "imageId": null},
      {"title": {"es": "Espacios de concentración", "en": "Focus spaces"}, "text": {"es": "Condiciones que favorecen el enfoque y reducen distracciones.", "en": "Conditions that support focus and reduce distractions."}, "imageId": null},
      {"title": {"es": "Divisiones y almacenamiento", "en": "Dividers and storage"}, "text": {"es": "Soluciones para organizar puestos de trabajo y guardar materiales.", "en": "Solutions to organize workstations and store materials."}, "imageId": null},
      {"title": {"es": "Iluminación de espacios", "en": "Space lighting"}, "text": {"es": "Luz adecuada para cada actividad y área.", "en": "Light suited to each activity and area."}, "imageId": null}
    ]
  },
  "projects": {
    "eyebrow": {"es": "— Proyectos", "en": "— Projects"},
    "title": {"es": "Nuestros proyectos", "en": "Our projects"},
    "intro": {"es": "Conoce nuestros proyectos de oficinas y espacios de trabajo en los que se integran mobiliario, soluciones arquitectónicas e iluminación.", "en": "See our office and workspace projects, where furniture, architectural solutions and lighting come together."},
    "moreLabel": {"es": "Ver más", "en": "See more"}
  },
  "quote": {
    "text": {"es": "Asesoramos y diseñamos\nespacios", "en": "We advise and design\nspaces"},
    "attribution": {"es": "Un equipo multidisciplinario acompaña cada proyecto de inicio a fin. Las soluciones se ajustan a las condiciones del espacio y a la cultura de cada cliente.", "en": "A multidisciplinary team stays with every project from start to finish. The solutions fit the conditions of the space and the culture of each client."}
  },
  "process": {
    "eyebrow": {"es": "— Criterios de diseño", "en": "— Design criteria"},
    "title": {"es": "Cómo abordamos\ncada proyecto", "en": "How we approach\neach project"},
    "intro": {"es": "Partimos de las necesidades de la organización, las actividades de sus equipos y las características del espacio. Coordinamos mobiliario, soluciones arquitectónicas e iluminación para que cada área responda a su uso y mantenga una relación coherente con el conjunto.", "en": "We start from the organization's needs, the activities of its teams and the character of the space. We coordinate furniture, architectural solutions and lighting so each area fits its use and stays coherent with the whole."},
    "steps": [
      {"title": {"es": "Definimos las actividades y necesidades de cada área.", "en": "We define the activities and needs of each area."}, "text": {"es": "", "en": ""}},
      {"title": {"es": "Elegimos las piezas de acuerdo con el espacio y el uso.", "en": "We choose the pieces according to the space and how it is used."}, "text": {"es": "", "en": ""}},
      {"title": {"es": "Acompañamos el proyecto desde la asesoría hasta la integración de las soluciones.", "en": "We stay with the project from the advice through the integration of the solutions."}, "text": {"es": "", "en": ""}}
    ]
  },
  "brands": {"eyebrow": {"es": "— Marcas", "en": "— Brands"}},
  "close": {
    "eyebrow": {"es": "— Siguiente paso", "en": "— Next step"},
    "title": {"es": "Diseñemos tu espacio\nde trabajo", "en": "Let's design your\nworkspace"},
    "body": {"es": "Cuéntanos sobre tu oficina, las actividades de tus equipos y las necesidades de tu proyecto. Te ayudamos a definir las soluciones adecuadas.", "en": "Tell us about your office, the activities of your teams and the needs of your project. We help define the right solutions."},
    "ctaLabel": {"es": "Hablemos de tu proyecto", "en": "Let's talk about your project"}
  }
}$page$::jsonb
where slug = 'workspace';
