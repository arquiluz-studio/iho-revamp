-- Cultural, Educación and Residencial use the same long space layout. Photos stay empty until they are uploaded in the CMS.

update public.sectors
set page_content = $page${
  "hero": {
    "intro": {"es": "Museos, auditorios y espacios culturales pensados para quien visita y para la operación de cada lugar.", "en": "Museums, auditoriums and cultural venues designed for the visitor and for how each place operates."},
    "ctaLabel": {"es": "", "en": ""}
  },
  "intro": {
    "eyebrow": {"es": "Espacios culturales", "en": "Cultural spaces"},
    "title": {"es": "Cultural", "en": "Cultural"},
    "body": {"es": "Espacios pensados para los distintos momentos de la visita: llegar, recorrer, permanecer y reunirse.\n\nIntegramos soluciones arquitectónicas e iluminación de acuerdo con el programa del lugar y la experiencia de cada visita.", "en": "Spaces designed for the different moments of a visit: arriving, walking through, staying and gathering.\n\nWe integrate architectural solutions and lighting according to the program of the place and the experience of each visit."},
    "ctaLabel": {"es": "Hablemos de tu proyecto", "en": "Let's talk about your project"},
    "imageId": null
  },
  "banner": {
    "title": {"es": "Espacios culturales *pensados*\npara cada visita", "en": "Cultural spaces *designed*\nfor every visit"},
    "text": {"es": "Un museo o un auditorio reúne momentos y formas de uso distintas. Asesoramos en el diseño de foyer, salas, galerías, circulación y áreas de apoyo. Cada decisión considera la acústica, la circulación, la conservación y la iluminación de la obra.", "en": "A museum or an auditorium brings together different moments and ways of using the space. We advise on the design of the foyer, halls, galleries, circulation and support areas. Each decision considers acoustics, circulation, conservation and the lighting of the work."}
  },
  "elements": {
    "eyebrow": {"es": "— Qué integramos", "en": "— What we integrate"},
    "title": {"es": "Lo que integramos\nen Cultural", "en": "What we integrate\nin Cultural"},
    "intro": {"es": "Cada lugar pide un conjunto de piezas. Esto es lo que podemos integrar:", "en": "Every place asks for its own set of pieces. This is what we can integrate:"},
    "moreLabel": {"es": "Ver más", "en": "See more"},
    "items": [
      {"title": {"es": "Foyer y recepción", "en": "Foyer and reception"}, "text": {"es": "El primer encuentro: espera, orientación y la identidad del lugar.", "en": "The first encounter: waiting, orientation and the identity of the place."}, "imageId": null},
      {"title": {"es": "Salas y auditorios", "en": "Halls and auditoriums"}, "text": {"es": "Butacas, acústica e iluminación para la función.", "en": "Seating, acoustics and lighting for the performance."}, "imageId": null},
      {"title": {"es": "Galerías", "en": "Galleries"}, "text": {"es": "Recorrido, exhibición y condiciones para la obra.", "en": "The route, the display and the conditions for the work."}, "imageId": null},
      {"title": {"es": "Áreas de encuentro", "en": "Gathering areas"}, "text": {"es": "Lounge y pausa para la visita y el evento.", "en": "Lounge and a pause for the visit and the event."}, "imageId": null},
      {"title": {"es": "Circulación", "en": "Circulation"}, "text": {"es": "Recorridos claros para el público y el equipo.", "en": "Clear paths for the public and the team."}, "imageId": null},
      {"title": {"es": "Iluminación de espacios", "en": "Space lighting"}, "text": {"es": "Luz para la obra, la sala y el recorrido.", "en": "Light for the work, the hall and the route."}, "imageId": null}
    ]
  },
  "projects": {
    "eyebrow": {"es": "— Proyectos", "en": "— Projects"},
    "title": {"es": "Nuestros proyectos", "en": "Our projects"},
    "intro": {"es": "Conoce nuestros proyectos de museos, auditorios y espacios culturales en los que se integran mobiliario, soluciones arquitectónicas e iluminación.", "en": "See our museum, auditorium and cultural projects, where furniture, architectural solutions and lighting come together."},
    "moreLabel": {"es": "Ver más", "en": "See more"}
  },
  "quote": {
    "text": {"es": "Asesoramos y diseñamos\nla visita", "en": "We advise and design\nthe visit"},
    "attribution": {"es": "Un equipo multidisciplinario acompaña cada proyecto de inicio a fin. Las soluciones se ajustan a las condiciones del espacio y a la identidad de cada lugar.", "en": "A multidisciplinary team stays with every project from start to finish. The solutions fit the conditions of the space and the identity of each place."}
  },
  "process": {
    "eyebrow": {"es": "— Criterios de diseño", "en": "— Design criteria"},
    "title": {"es": "Cómo abordamos\ncada proyecto", "en": "How we approach\neach project"},
    "intro": {"es": "Partimos del programa del lugar, los momentos de la visita y las características del espacio. Coordinamos mobiliario, soluciones arquitectónicas e iluminación para que cada área responda a su uso y mantenga una relación coherente con el conjunto.", "en": "We start from the program of the place, the moments of the visit and the character of the space. We coordinate furniture, architectural solutions and lighting so each area fits its use and stays coherent with the whole."},
    "steps": [
      {"title": {"es": "Definimos los momentos de la visita y las necesidades de cada área.", "en": "We define the moments of the visit and the needs of each area."}, "text": {"es": "", "en": ""}},
      {"title": {"es": "Elegimos las piezas de acuerdo con el espacio y el uso.", "en": "We choose the pieces according to the space and how it is used."}, "text": {"es": "", "en": ""}},
      {"title": {"es": "Acompañamos el proyecto desde la asesoría hasta la integración de las soluciones.", "en": "We stay with the project from the advice through the integration of the solutions."}, "text": {"es": "", "en": ""}}
    ]
  },
  "brands": {"eyebrow": {"es": "— Marcas", "en": "— Brands"}},
  "close": {
    "eyebrow": {"es": "— Siguiente paso", "en": "— Next step"},
    "title": {"es": "Diseñemos tu espacio\ncultural", "en": "Let's design your\ncultural space"},
    "body": {"es": "Cuéntanos sobre tu museo o auditorio, la experiencia que buscas y las necesidades de tu proyecto. Te ayudamos a definir las soluciones adecuadas.", "en": "Tell us about your museum or auditorium, the experience you are after and the needs of your project. We help define the right solutions."},
    "ctaLabel": {"es": "Hablemos de tu proyecto", "en": "Let's talk about your project"}
  }
}$page$::jsonb
where slug = 'cultural';

update public.sectors
set page_content = $page${
  "hero": {
    "intro": {"es": "Escuelas, universidades y espacios de aprendizaje pensados para quien estudia y para la operación de cada lugar.", "en": "Schools, universities and learning spaces designed for the student and for how each place operates."},
    "ctaLabel": {"es": "", "en": ""}
  },
  "intro": {
    "eyebrow": {"es": "Espacios de educación", "en": "Education spaces"},
    "title": {"es": "Educación", "en": "Education"},
    "body": {"es": "Espacios pensados para los distintos momentos del aprendizaje: estudiar, reunirse, colaborar y concentrarse.\n\nIntegramos soluciones arquitectónicas e iluminación de acuerdo con el programa del lugar y la actividad de cada grupo.", "en": "Spaces designed for the different moments of learning: studying, meeting, collaborating and focusing.\n\nWe integrate architectural solutions and lighting according to the program of the place and the activity of each group."},
    "ctaLabel": {"es": "Hablemos de tu proyecto", "en": "Let's talk about your project"},
    "imageId": null
  },
  "banner": {
    "title": {"es": "Espacios de educación *pensados*\npara cada jornada", "en": "Education spaces *designed*\nfor every day"},
    "text": {"es": "Una escuela o una universidad reúne actividades y formas de uso distintas. Asesoramos en el diseño de aulas, bibliotecas, áreas comunes, circulación y zonas de concentración. Cada decisión considera la ergonomía, la acústica, la durabilidad y la iluminación del entorno.", "en": "A school or a university brings together different activities and ways of using the space. We advise on the design of classrooms, libraries, shared areas, circulation and focus zones. Each decision considers ergonomics, acoustics, durability and the lighting of the surroundings."}
  },
  "elements": {
    "eyebrow": {"es": "— Qué integramos", "en": "— What we integrate"},
    "title": {"es": "Lo que integramos\nen Educación", "en": "What we integrate\nin Education"},
    "intro": {"es": "Cada lugar pide un conjunto de piezas. Esto es lo que podemos integrar:", "en": "Every place asks for its own set of pieces. This is what we can integrate:"},
    "moreLabel": {"es": "Ver más", "en": "See more"},
    "items": [
      {"title": {"es": "Aulas", "en": "Classrooms"}, "text": {"es": "Puestos, mesas e iluminación para la clase.", "en": "Desks, tables and lighting for class."}, "imageId": null},
      {"title": {"es": "Bibliotecas", "en": "Libraries"}, "text": {"es": "Condiciones para la lectura, el estudio y el silencio.", "en": "Conditions for reading, study and quiet."}, "imageId": null},
      {"title": {"es": "Áreas comunes", "en": "Shared areas"}, "text": {"es": "Encuentro, pausa y trabajo en grupo.", "en": "Gathering, a pause and group work."}, "imageId": null},
      {"title": {"es": "Salas de reunión", "en": "Meeting rooms"}, "text": {"es": "Espacios para juntas, presentación y colaboración.", "en": "Spaces for meetings, presentations and collaboration."}, "imageId": null},
      {"title": {"es": "Circulación y almacenamiento", "en": "Circulation and storage"}, "text": {"es": "Recorridos claros y soluciones para guardar materiales.", "en": "Clear paths and solutions for storing materials."}, "imageId": null},
      {"title": {"es": "Iluminación de espacios", "en": "Space lighting"}, "text": {"es": "Luz adecuada para cada actividad y área.", "en": "Light suited to each activity and area."}, "imageId": null}
    ]
  },
  "projects": {
    "eyebrow": {"es": "— Proyectos", "en": "— Projects"},
    "title": {"es": "Nuestros proyectos", "en": "Our projects"},
    "intro": {"es": "Conoce nuestros proyectos de escuelas, universidades y espacios de aprendizaje en los que se integran mobiliario, soluciones arquitectónicas e iluminación.", "en": "See our school, university and learning projects, where furniture, architectural solutions and lighting come together."},
    "moreLabel": {"es": "Ver más", "en": "See more"}
  },
  "quote": {
    "text": {"es": "Asesoramos y diseñamos\nel estudio", "en": "We advise and design\nthe study"},
    "attribution": {"es": "Un equipo multidisciplinario acompaña cada proyecto de inicio a fin. Las soluciones se ajustan a las condiciones del espacio y a la actividad de cada grupo.", "en": "A multidisciplinary team stays with every project from start to finish. The solutions fit the conditions of the space and the activity of each group."}
  },
  "process": {
    "eyebrow": {"es": "— Criterios de diseño", "en": "— Design criteria"},
    "title": {"es": "Cómo abordamos\ncada proyecto", "en": "How we approach\neach project"},
    "intro": {"es": "Partimos del programa del lugar, las actividades de cada grupo y las características del espacio. Coordinamos mobiliario, soluciones arquitectónicas e iluminación para que cada área responda a su uso y mantenga una relación coherente con el conjunto.", "en": "We start from the program of the place, the activities of each group and the character of the space. We coordinate furniture, architectural solutions and lighting so each area fits its use and stays coherent with the whole."},
    "steps": [
      {"title": {"es": "Definimos las actividades y las necesidades de cada área.", "en": "We define the activities and the needs of each area."}, "text": {"es": "", "en": ""}},
      {"title": {"es": "Elegimos las piezas de acuerdo con el espacio y el uso.", "en": "We choose the pieces according to the space and how it is used."}, "text": {"es": "", "en": ""}},
      {"title": {"es": "Acompañamos el proyecto desde la asesoría hasta la integración de las soluciones.", "en": "We stay with the project from the advice through the integration of the solutions."}, "text": {"es": "", "en": ""}}
    ]
  },
  "brands": {"eyebrow": {"es": "— Marcas", "en": "— Brands"}},
  "close": {
    "eyebrow": {"es": "— Siguiente paso", "en": "— Next step"},
    "title": {"es": "Diseñemos tu espacio\nde aprendizaje", "en": "Let's design your\nlearning space"},
    "body": {"es": "Cuéntanos sobre tu escuela o universidad, las actividades de tus grupos y las necesidades de tu proyecto. Te ayudamos a definir las soluciones adecuadas.", "en": "Tell us about your school or university, the activities of your groups and the needs of your project. We help define the right solutions."},
    "ctaLabel": {"es": "Hablemos de tu proyecto", "en": "Let's talk about your project"}
  }
}$page$::jsonb
where slug = 'educacion';

update public.sectors
set page_content = $page${
  "hero": {
    "intro": {"es": "Viviendas y desarrollos residenciales pensados para quien habita y para la vida de cada casa.", "en": "Homes and residential developments designed for the people who live there and for the life of each house."},
    "ctaLabel": {"es": "", "en": ""}
  },
  "intro": {
    "eyebrow": {"es": "Espacios residenciales", "en": "Residential spaces"},
    "title": {"es": "Residencial", "en": "Residential"},
    "body": {"es": "Espacios pensados para los distintos momentos de la casa: llegar, permanecer, comer y descansar.\n\nIntegramos soluciones arquitectónicas e iluminación de acuerdo con el carácter de la vivienda y la vida de cada casa.", "en": "Spaces designed for the different moments of a home: arriving, staying, dining and resting.\n\nWe integrate architectural solutions and lighting according to the character of the house and the life of each home."},
    "ctaLabel": {"es": "Hablemos de tu proyecto", "en": "Let's talk about your project"},
    "imageId": null
  },
  "banner": {
    "title": {"es": "Espacios residenciales *pensados*\npara cada casa", "en": "Residential spaces *designed*\nfor every home"},
    "text": {"es": "Una vivienda reúne momentos y formas de uso distintas. Asesoramos en el diseño de estar, comedor, recámaras, terraza y circulación. Cada decisión considera el confort, la acústica, los materiales y la iluminación del entorno.", "en": "A home brings together different moments and ways of using the space. We advise on the design of the living room, dining room, bedrooms, terrace and circulation. Each decision considers comfort, acoustics, materials and the lighting of the surroundings."}
  },
  "elements": {
    "eyebrow": {"es": "— Qué integramos", "en": "— What we integrate"},
    "title": {"es": "Lo que integramos\nen Residencial", "en": "What we integrate\nin Residential"},
    "intro": {"es": "Cada casa pide un conjunto de piezas. Esto es lo que podemos integrar:", "en": "Every home asks for its own set of pieces. This is what we can integrate:"},
    "moreLabel": {"es": "Ver más", "en": "See more"},
    "items": [
      {"title": {"es": "Estar", "en": "Living room"}, "text": {"es": "Lounge y piezas para la sala y la conversación.", "en": "Lounge and pieces for the living room and conversation."}, "imageId": null},
      {"title": {"es": "Comedor", "en": "Dining room"}, "text": {"es": "Mesas, sillería e iluminación para la comida.", "en": "Tables, seating and lighting for dining."}, "imageId": null},
      {"title": {"es": "Recámaras", "en": "Bedrooms"}, "text": {"es": "Mobiliario, iluminación y acústica para el descanso.", "en": "Furniture, lighting and acoustics for rest."}, "imageId": null},
      {"title": {"es": "Terraza y exterior", "en": "Terrace and outdoors"}, "text": {"es": "Piezas de exterior para la vida al aire libre.", "en": "Outdoor pieces for life outside."}, "imageId": null},
      {"title": {"es": "Circulación y almacenamiento", "en": "Circulation and storage"}, "text": {"es": "Recorridos y soluciones para organizar la casa.", "en": "Paths and solutions for organizing the home."}, "imageId": null},
      {"title": {"es": "Iluminación de espacios", "en": "Space lighting"}, "text": {"es": "Luz arquitectónica y decorativa para habitar.", "en": "Architectural and decorative light for living."}, "imageId": null}
    ]
  },
  "projects": {
    "eyebrow": {"es": "— Proyectos", "en": "— Projects"},
    "title": {"es": "Nuestros proyectos", "en": "Our projects"},
    "intro": {"es": "Conoce nuestros proyectos de viviendas y desarrollos residenciales en los que se integran mobiliario, soluciones arquitectónicas e iluminación.", "en": "See our home and residential projects, where furniture, architectural solutions and lighting come together."},
    "moreLabel": {"es": "Ver más", "en": "See more"}
  },
  "quote": {
    "text": {"es": "Asesoramos y diseñamos\nla casa", "en": "We advise and design\nthe home"},
    "attribution": {"es": "Un equipo multidisciplinario acompaña cada proyecto de inicio a fin. Las soluciones se ajustan a las condiciones del espacio y a la vida de cada casa.", "en": "A multidisciplinary team stays with every project from start to finish. The solutions fit the conditions of the space and the life of each home."}
  },
  "process": {
    "eyebrow": {"es": "— Criterios de diseño", "en": "— Design criteria"},
    "title": {"es": "Cómo abordamos\ncada proyecto", "en": "How we approach\neach project"},
    "intro": {"es": "Partimos de la vida de la casa, los momentos de quien habita y las características del espacio. Coordinamos mobiliario, soluciones arquitectónicas e iluminación para que cada área responda a su uso y mantenga una relación coherente con el conjunto.", "en": "We start from the life of the home, the moments of the people who live there and the character of the space. We coordinate furniture, architectural solutions and lighting so each area fits its use and stays coherent with the whole."},
    "steps": [
      {"title": {"es": "Definimos los momentos de la casa y las necesidades de cada área.", "en": "We define the moments of the home and the needs of each area."}, "text": {"es": "", "en": ""}},
      {"title": {"es": "Elegimos las piezas de acuerdo con el espacio y el uso.", "en": "We choose the pieces according to the space and how it is used."}, "text": {"es": "", "en": ""}},
      {"title": {"es": "Acompañamos el proyecto desde la asesoría hasta la integración de las soluciones.", "en": "We stay with the project from the advice through the integration of the solutions."}, "text": {"es": "", "en": ""}}
    ]
  },
  "brands": {"eyebrow": {"es": "— Marcas", "en": "— Brands"}},
  "close": {
    "eyebrow": {"es": "— Siguiente paso", "en": "— Next step"},
    "title": {"es": "Diseñemos tu espacio\nresidencial", "en": "Let's design your\nhome"},
    "body": {"es": "Cuéntanos sobre tu vivienda, la forma en que se habita y las necesidades de tu proyecto. Te ayudamos a definir las soluciones adecuadas.", "en": "Tell us about your home, the way it is lived in and the needs of your project. We help define the right solutions."},
    "ctaLabel": {"es": "Hablemos de tu proyecto", "en": "Let's talk about your project"}
  }
}$page$::jsonb
where slug = 'residencial';
