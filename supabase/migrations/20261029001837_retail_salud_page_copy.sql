-- Retail and Salud use the same long space layout as Workspace. Photos stay empty until they are uploaded in the CMS.

update public.sectors
set page_content = $page${
  "hero": {
    "intro": {"es": "Tiendas y espacios comerciales pensados para la marca y para el recorrido de quien compra.", "en": "Stores and commercial spaces designed for the brand and for the path of each shopper."},
    "ctaLabel": {"es": "", "en": ""}
  },
  "intro": {
    "eyebrow": {"es": "Espacios comerciales", "en": "Retail spaces"},
    "title": {"es": "Retail", "en": "Retail"},
    "body": {"es": "Espacios pensados para los distintos momentos de la tienda: llegar, recorrer, elegir y permanecer.\n\nIntegramos soluciones arquitectónicas e iluminación de acuerdo con la identidad de la marca y la experiencia de cada visita.", "en": "Spaces designed for the different moments of a store: arriving, browsing, choosing and staying.\n\nWe integrate architectural solutions and lighting according to the identity of the brand and the experience of each visit."},
    "ctaLabel": {"es": "Hablemos de tu proyecto", "en": "Let's talk about your project"},
    "imageId": null
  },
  "banner": {
    "title": {"es": "Espacios comerciales *pensados*\npara cada recorrido", "en": "Retail spaces *designed*\nfor every path"},
    "text": {"es": "Una tienda reúne momentos y formas de uso distintas. Asesoramos en el diseño de vitrinas, piso de venta, caja, espera y zonas de apoyo. Cada decisión considera la circulación, la exhibición, la durabilidad y la iluminación del producto.", "en": "A store brings together different moments and ways of using the space. We advise on the design of displays, the sales floor, checkout, waiting and support areas. Each decision considers circulation, display, durability and the lighting of the product."}
  },
  "elements": {
    "eyebrow": {"es": "— Qué integramos", "en": "— What we integrate"},
    "title": {"es": "Lo que integramos\nen Retail", "en": "What we integrate\nin Retail"},
    "intro": {"es": "Cada tienda pide un conjunto de piezas. Esto es lo que podemos integrar:", "en": "Every store asks for its own set of pieces. This is what we can integrate:"},
    "moreLabel": {"es": "Ver más", "en": "See more"},
    "items": [
      {"title": {"es": "Vitrina y fachada", "en": "Display and facade"}, "text": {"es": "El primer encuentro con la marca y el producto.", "en": "The first encounter with the brand and the product."}, "imageId": null},
      {"title": {"es": "Piso de venta", "en": "Sales floor"}, "text": {"es": "Recorrido, exhibición y puntos de atención.", "en": "The path, the display and the points of attention."}, "imageId": null},
      {"title": {"es": "Espera y caja", "en": "Waiting and checkout"}, "text": {"es": "Mobiliario y luz para la pausa y el pago.", "en": "Furniture and light for the pause and the payment."}, "imageId": null},
      {"title": {"es": "Probadores", "en": "Fitting rooms"}, "text": {"es": "Privacidad, iluminación y almacenamiento.", "en": "Privacy, lighting and storage."}, "imageId": null},
      {"title": {"es": "Áreas de apoyo", "en": "Support areas"}, "text": {"es": "Bodega, back office y circulación del equipo.", "en": "Storage, back office and the team's circulation."}, "imageId": null},
      {"title": {"es": "Iluminación de espacios", "en": "Space lighting"}, "text": {"es": "Luz que destaca el producto y acompaña el recorrido.", "en": "Light that highlights the product and follows the path."}, "imageId": null}
    ]
  },
  "projects": {
    "eyebrow": {"es": "— Proyectos", "en": "— Projects"},
    "title": {"es": "Nuestros proyectos", "en": "Our projects"},
    "intro": {"es": "Conoce nuestros proyectos de tiendas y espacios comerciales en los que se integran mobiliario, soluciones arquitectónicas e iluminación.", "en": "See our store and retail projects, where furniture, architectural solutions and lighting come together."},
    "moreLabel": {"es": "Ver más", "en": "See more"}
  },
  "quote": {
    "text": {"es": "Asesoramos y diseñamos\nel recorrido", "en": "We advise and design\nthe path"},
    "attribution": {"es": "Un equipo multidisciplinario acompaña cada proyecto de inicio a fin. Las soluciones se ajustan a las condiciones del espacio y a la identidad de cada marca.", "en": "A multidisciplinary team stays with every project from start to finish. The solutions fit the conditions of the space and the identity of each brand."}
  },
  "process": {
    "eyebrow": {"es": "— Criterios de diseño", "en": "— Design criteria"},
    "title": {"es": "Cómo abordamos\ncada proyecto", "en": "How we approach\neach project"},
    "intro": {"es": "Partimos de la identidad de la marca, el recorrido de quien compra y las características del espacio. Coordinamos mobiliario, soluciones arquitectónicas e iluminación para que cada área responda a su uso y mantenga una relación coherente con el conjunto.", "en": "We start from the identity of the brand, the path of each shopper and the character of the space. We coordinate furniture, architectural solutions and lighting so each area fits its use and stays coherent with the whole."},
    "steps": [
      {"title": {"es": "Definimos el recorrido y las necesidades de cada área.", "en": "We define the path and the needs of each area."}, "text": {"es": "", "en": ""}},
      {"title": {"es": "Elegimos las piezas de acuerdo con el espacio y el uso.", "en": "We choose the pieces according to the space and how it is used."}, "text": {"es": "", "en": ""}},
      {"title": {"es": "Acompañamos el proyecto desde la asesoría hasta la integración de las soluciones.", "en": "We stay with the project from the advice through the integration of the solutions."}, "text": {"es": "", "en": ""}}
    ]
  },
  "brands": {"eyebrow": {"es": "— Marcas", "en": "— Brands"}},
  "close": {
    "eyebrow": {"es": "— Siguiente paso", "en": "— Next step"},
    "title": {"es": "Diseñemos tu espacio\ncomercial", "en": "Let's design your\nretail space"},
    "body": {"es": "Cuéntanos sobre tu tienda, la experiencia que buscas y las necesidades de tu proyecto. Te ayudamos a definir las soluciones adecuadas.", "en": "Tell us about your store, the experience you are after and the needs of your project. We help define the right solutions."},
    "ctaLabel": {"es": "Hablemos de tu proyecto", "en": "Let's talk about your project"}
  }
}$page$::jsonb
where slug = 'retail';

update public.sectors
set page_content = $page${
  "hero": {
    "intro": {"es": "Hospitales, clínicas y espacios de bienestar pensados para quien recibe atención y para la operación de cada lugar.", "en": "Hospitals, clinics and wellness spaces designed for the person receiving care and for how each place operates."},
    "ctaLabel": {"es": "", "en": ""}
  },
  "intro": {
    "eyebrow": {"es": "Espacios de salud", "en": "Healthcare spaces"},
    "title": {"es": "Salud", "en": "Healthcare"},
    "body": {"es": "Espacios pensados para los distintos momentos de la atención: llegar, esperar, consultar y recuperarse.\n\nIntegramos soluciones arquitectónicas e iluminación de acuerdo con la operación del lugar y la calma de cada visita.", "en": "Spaces designed for the different moments of care: arriving, waiting, consulting and recovering.\n\nWe integrate architectural solutions and lighting according to how the place operates and the calm of each visit."},
    "ctaLabel": {"es": "Hablemos de tu proyecto", "en": "Let's talk about your project"},
    "imageId": null
  },
  "banner": {
    "title": {"es": "Espacios de salud *pensados*\npara cada atención", "en": "Healthcare spaces *designed*\nfor every visit"},
    "text": {"es": "Un hospital o una clínica reúne momentos y formas de uso distintas. Asesoramos en el diseño de recepción, salas de espera, consultorios, circulación y áreas de descanso. Cada decisión considera la higiene, la acústica, la circulación y la iluminación del entorno.", "en": "A hospital or a clinic brings together different moments and ways of using the space. We advise on the design of reception, waiting rooms, consult rooms, circulation and rest areas. Each decision considers hygiene, acoustics, circulation and the lighting of the surroundings."}
  },
  "elements": {
    "eyebrow": {"es": "— Qué integramos", "en": "— What we integrate"},
    "title": {"es": "Lo que integramos\nen Salud", "en": "What we integrate\nin Healthcare"},
    "intro": {"es": "Cada lugar pide un conjunto de piezas. Esto es lo que podemos integrar:", "en": "Every place asks for its own set of pieces. This is what we can integrate:"},
    "moreLabel": {"es": "Ver más", "en": "See more"},
    "items": [
      {"title": {"es": "Recepción y espera", "en": "Reception and waiting"}, "text": {"es": "El primer encuentro: orientación, calma y circulación.", "en": "The first encounter: orientation, calm and circulation."}, "imageId": null},
      {"title": {"es": "Consultorios", "en": "Consult rooms"}, "text": {"es": "Mobiliario, iluminación y acústica para la atención.", "en": "Furniture, lighting and acoustics for the consultation."}, "imageId": null},
      {"title": {"es": "Circulación", "en": "Circulation"}, "text": {"es": "Recorridos claros para pacientes, visitas y equipo.", "en": "Clear paths for patients, visitors and staff."}, "imageId": null},
      {"title": {"es": "Áreas de descanso", "en": "Rest areas"}, "text": {"es": "Condiciones que favorecen la pausa y la recuperación.", "en": "Conditions that support a pause and recovery."}, "imageId": null},
      {"title": {"es": "Superficies y acústica", "en": "Surfaces and acoustics"}, "text": {"es": "Materiales para higiene, calma y continuidad.", "en": "Materials for hygiene, calm and continuity."}, "imageId": null},
      {"title": {"es": "Iluminación de espacios", "en": "Space lighting"}, "text": {"es": "Luz técnica y cálida para cada actividad.", "en": "Technical and warm light for each activity."}, "imageId": null}
    ]
  },
  "projects": {
    "eyebrow": {"es": "— Proyectos", "en": "— Projects"},
    "title": {"es": "Nuestros proyectos", "en": "Our projects"},
    "intro": {"es": "Conoce nuestros proyectos de hospitales, clínicas y espacios de bienestar en los que se integran mobiliario, soluciones arquitectónicas e iluminación.", "en": "See our hospital, clinic and wellness projects, where furniture, architectural solutions and lighting come together."},
    "moreLabel": {"es": "Ver más", "en": "See more"}
  },
  "quote": {
    "text": {"es": "Asesoramos y diseñamos\nla atención", "en": "We advise and design\nthe visit"},
    "attribution": {"es": "Un equipo multidisciplinario acompaña cada proyecto de inicio a fin. Las soluciones se ajustan a las condiciones del espacio y a la operación de cada lugar.", "en": "A multidisciplinary team stays with every project from start to finish. The solutions fit the conditions of the space and the operation of each place."}
  },
  "process": {
    "eyebrow": {"es": "— Criterios de diseño", "en": "— Design criteria"},
    "title": {"es": "Cómo abordamos\ncada proyecto", "en": "How we approach\neach project"},
    "intro": {"es": "Partimos de la operación del lugar, los momentos de la atención y las características del espacio. Coordinamos mobiliario, soluciones arquitectónicas e iluminación para que cada área responda a su uso y mantenga una relación coherente con el conjunto.", "en": "We start from how the place operates, the moments of care and the character of the space. We coordinate furniture, architectural solutions and lighting so each area fits its use and stays coherent with the whole."},
    "steps": [
      {"title": {"es": "Definimos los momentos de la atención y las necesidades de cada área.", "en": "We define the moments of care and the needs of each area."}, "text": {"es": "", "en": ""}},
      {"title": {"es": "Elegimos las piezas de acuerdo con el espacio y el uso.", "en": "We choose the pieces according to the space and how it is used."}, "text": {"es": "", "en": ""}},
      {"title": {"es": "Acompañamos el proyecto desde la asesoría hasta la integración de las soluciones.", "en": "We stay with the project from the advice through the integration of the solutions."}, "text": {"es": "", "en": ""}}
    ]
  },
  "brands": {"eyebrow": {"es": "— Marcas", "en": "— Brands"}},
  "close": {
    "eyebrow": {"es": "— Siguiente paso", "en": "— Next step"},
    "title": {"es": "Diseñemos tu espacio\nde salud", "en": "Let's design your\nhealthcare space"},
    "body": {"es": "Cuéntanos sobre tu clínica u hospital, la atención que ofreces y las necesidades de tu proyecto. Te ayudamos a definir las soluciones adecuadas.", "en": "Tell us about your clinic or hospital, the care you offer and the needs of your project. We help define the right solutions."},
    "ctaLabel": {"es": "Hablemos de tu proyecto", "en": "Let's talk about your project"}
  }
}$page$::jsonb
where slug = 'salud';
