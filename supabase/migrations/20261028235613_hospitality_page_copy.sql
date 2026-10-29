-- Hospitality uses the same long space layout as Workspace. Photos stay empty until they are uploaded in the CMS.

update public.sectors
set page_content = $page${
  "hero": {
    "intro": {"es": "Hoteles, restaurantes y espacios de servicio pensados para quien llega y para la operación de cada lugar.", "en": "Hotels, restaurants and service spaces designed for the guest and for how each place operates."},
    "ctaLabel": {"es": "", "en": ""}
  },
  "intro": {
    "eyebrow": {"es": "Espacios de hospitalidad", "en": "Hospitality spaces"},
    "title": {"es": "Hospitality", "en": "Hospitality"},
    "body": {"es": "Espacios pensados para los distintos momentos de cada lugar: llegar, permanecer, comer y reunirse.\n\nIntegramos soluciones arquitectónicas e iluminación de acuerdo con la identidad del sitio y la experiencia de cada visita.", "en": "Spaces designed for the different moments of each place: arriving, staying, dining and gathering.\n\nWe integrate architectural solutions and lighting according to the identity of the place and the experience of each visit."},
    "ctaLabel": {"es": "Hablemos de tu proyecto", "en": "Let's talk about your project"},
    "imageId": null
  },
  "banner": {
    "title": {"es": "Espacios de hospitalidad *pensados*\npara cada momento", "en": "Hospitality spaces *designed*\nfor every moment"},
    "text": {"es": "Un hotel o un restaurante reúne momentos y formas de uso distintas. Asesoramos en el diseño de lobby, habitaciones, comedor, bar y terrazas. Cada decisión considera la circulación, la acústica, la durabilidad y la iluminación del entorno.", "en": "A hotel or a restaurant brings together different moments and ways of using the space. We advise on the design of the lobby, guest rooms, dining room, bar and terraces. Each decision considers circulation, acoustics, durability and the lighting of the surroundings."}
  },
  "elements": {
    "eyebrow": {"es": "— Qué integramos", "en": "— What we integrate"},
    "title": {"es": "Lo que integramos\nen Hospitality", "en": "What we integrate\nin Hospitality"},
    "intro": {"es": "Cada lugar pide un conjunto de piezas. Esto es lo que podemos integrar:", "en": "Every place asks for its own set of pieces. This is what we can integrate:"},
    "moreLabel": {"es": "Ver más", "en": "See more"},
    "items": [
      {"title": {"es": "Lobby y recepción", "en": "Lobby and reception"}, "text": {"es": "El primer encuentro: espera, circulación y la identidad del lugar.", "en": "The first encounter: waiting, circulation and the identity of the place."}, "imageId": null},
      {"title": {"es": "Habitaciones", "en": "Guest rooms"}, "text": {"es": "Mobiliario, iluminación y acústica para el descanso.", "en": "Furniture, lighting and acoustics for rest."}, "imageId": null},
      {"title": {"es": "Restaurante y bar", "en": "Restaurant and bar"}, "text": {"es": "Mesas, luz y atmósfera para el servicio.", "en": "Tables, light and atmosphere for service."}, "imageId": null},
      {"title": {"es": "Terrazas", "en": "Terraces"}, "text": {"es": "Piezas de exterior para la estadía al aire libre.", "en": "Outdoor pieces for time spent outside."}, "imageId": null},
      {"title": {"es": "Salas y eventos", "en": "Rooms and events"}, "text": {"es": "Espacios para reuniones, grupos y celebraciones.", "en": "Spaces for meetings, groups and celebrations."}, "imageId": null},
      {"title": {"es": "Iluminación de espacios", "en": "Space lighting"}, "text": {"es": "Luz adecuada para cada momento del día.", "en": "Light suited to each moment of the day."}, "imageId": null}
    ]
  },
  "projects": {
    "eyebrow": {"es": "— Proyectos", "en": "— Projects"},
    "title": {"es": "Nuestros proyectos", "en": "Our projects"},
    "intro": {"es": "Conoce nuestros proyectos de hoteles, restaurantes y espacios de hospitalidad en los que se integran mobiliario, soluciones arquitectónicas e iluminación.", "en": "See our hotel, restaurant and hospitality projects, where furniture, architectural solutions and lighting come together."},
    "moreLabel": {"es": "Ver más", "en": "See more"}
  },
  "quote": {
    "text": {"es": "Asesoramos y diseñamos\nla estadía", "en": "We advise and design\nthe stay"},
    "attribution": {"es": "Un equipo multidisciplinario acompaña cada proyecto de inicio a fin. Las soluciones se ajustan a las condiciones del espacio y a la identidad de cada lugar.", "en": "A multidisciplinary team stays with every project from start to finish. The solutions fit the conditions of the space and the identity of each place."}
  },
  "process": {
    "eyebrow": {"es": "— Criterios de diseño", "en": "— Design criteria"},
    "title": {"es": "Cómo abordamos\ncada proyecto", "en": "How we approach\neach project"},
    "intro": {"es": "Partimos de la operación del lugar, los momentos de la visita y las características del espacio. Coordinamos mobiliario, soluciones arquitectónicas e iluminación para que cada área responda a su uso y mantenga una relación coherente con el conjunto.", "en": "We start from how the place operates, the moments of the visit and the character of the space. We coordinate furniture, architectural solutions and lighting so each area fits its use and stays coherent with the whole."},
    "steps": [
      {"title": {"es": "Definimos los momentos y las necesidades de cada área.", "en": "We define the moments and the needs of each area."}, "text": {"es": "", "en": ""}},
      {"title": {"es": "Elegimos las piezas de acuerdo con el espacio y el uso.", "en": "We choose the pieces according to the space and how it is used."}, "text": {"es": "", "en": ""}},
      {"title": {"es": "Acompañamos el proyecto desde la asesoría hasta la integración de las soluciones.", "en": "We stay with the project from the advice through the integration of the solutions."}, "text": {"es": "", "en": ""}}
    ]
  },
  "brands": {"eyebrow": {"es": "— Marcas", "en": "— Brands"}},
  "close": {
    "eyebrow": {"es": "— Siguiente paso", "en": "— Next step"},
    "title": {"es": "Diseñemos tu espacio\nde hospitalidad", "en": "Let's design your\nhospitality space"},
    "body": {"es": "Cuéntanos sobre tu hotel o restaurante, la experiencia que buscas y las necesidades de tu proyecto. Te ayudamos a definir las soluciones adecuadas.", "en": "Tell us about your hotel or restaurant, the experience you are after and the needs of your project. We help define the right solutions."},
    "ctaLabel": {"es": "Hablemos de tu proyecto", "en": "Let's talk about your project"}
  }
}$page$::jsonb
where slug = 'hospitality';
