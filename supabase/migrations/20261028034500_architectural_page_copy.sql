-- Fills the Architectural page with the copy and the four project photos from the layout.

update public.business_lines
set page_content = $content$
{
  "hero": {
    "eyebrow": { "es": "Soluciones arquitectónicas", "en": "Architectural solutions" },
    "intro": {
      "es": "Integramos pisos, plafones, muros y acústica para dar forma al espacio.",
      "en": "We integrate floors, ceilings, walls and acoustics to shape the space."
    },
    "ctaLabel": { "es": "Cotizar", "en": "Request a quote" }
  },
  "intro": {
    "eyebrow": { "es": "", "en": "" },
    "title": { "es": "Soluciones arquitectónicas", "en": "Architectural solutions" },
    "body": {
      "es": "Cada proyecto encuentra su expresión en la arquitectura. Integramos pisos, plafones, muros y acústica que dialogan con los materiales, las proporciones y el uso para dar forma a espacios coherentes y funcionales.",
      "en": "Every project finds its expression in architecture. We integrate floors, ceilings, walls and acoustics that work with the materials, the proportions and the use to shape coherent, functional spaces."
    },
    "ctaLabel": { "es": "Cotizar", "en": "Request a quote" },
    "imageId": null
  },
  "banner": {
    "text": { "es": "Su coordinación empieza *desde el diseño.*", "en": "Coordination starts *with the design.*" }
  },
  "elements": {
    "title": { "es": "Elementos que construyen\nel conjunto", "en": "Elements that build\nthe whole" },
    "items": [
      {
        "title": { "es": "Pisos", "en": "Floors" },
        "text": { "es": "Textiles, vinílicos y duros para el plano de piso.", "en": "Textile, vinyl and hard surfaces for the floor plane." },
        "imageId": null
      },
      {
        "title": { "es": "Plafones", "en": "Ceilings" },
        "text": { "es": "Cielos que ordenan la luz, la acústica y la instalación.", "en": "Ceilings that organize light, acoustics and services." },
        "imageId": null
      },
      {
        "title": { "es": "Muros y recubrimientos", "en": "Walls and finishes" },
        "text": { "es": "Acabados que dan materia y color al espacio.", "en": "Finishes that give the space material and color." },
        "imageId": null
      }
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
    "body": {
      "es": "La especificación cambia con el uso: el puesto y la sala, el lobby y la habitación, el recorrido de la tienda, el aula o la vivienda.",
      "en": "The specification changes with the use: the workstation and the room, the lobby and the guest room, the path through the store, the classroom or the home."
    },
    "imageId": null
  },
  "process": {
    "title": { "es": "Cómo los abordamos", "en": "How we approach them" },
    "steps": [
      {
        "title": { "es": "El proyecto", "en": "The project" },
        "text": { "es": "Leemos el uso, la arquitectura y lo que el espacio tiene que resolver.", "en": "We read the use, the architecture and what the space has to solve." }
      },
      {
        "title": { "es": "La especificación", "en": "The specification" },
        "text": { "es": "Definimos pisos, plafones, muros y acústica como un solo conjunto.", "en": "We define floors, ceilings, walls and acoustics as one whole." }
      },
      {
        "title": { "es": "La coordinación", "en": "The coordination" },
        "text": { "es": "La solución se alinea con el diseño, el mobiliario y la obra.", "en": "The solution lines up with the design, the furniture and the site." }
      },
      {
        "title": { "es": "La instalación", "en": "The installation" },
        "text": { "es": "Acompañamos la puesta en sitio hasta dejar el espacio terminado.", "en": "We stay through installation until the space is complete." }
      }
    ]
  },
  "quote": {
    "text": { "es": "Asesoramos y diseñamos espacios", "en": "We advise and design spaces" },
    "attribution": { "es": "", "en": "" }
  },
  "gallery": {
    "items": [
      { "caption": { "es": "Empresa de streaming", "en": "Streaming company" }, "imageId": "930454cf-c738-475c-ae54-4d978a61d298" },
      { "caption": { "es": "Office Depot", "en": "Office Depot" }, "imageId": "99c9bf85-29d7-401a-b94b-4f2f09a1050d" },
      { "caption": { "es": "Empresa de entretenimiento digital", "en": "Digital entertainment company" }, "imageId": "fa9ea8f7-3e52-4549-aa09-319fef1d5aef" },
      { "caption": { "es": "Empresa de e-commerce", "en": "E-commerce company" }, "imageId": "2af5b406-15eb-4ffe-b40f-7fda87f11fc4" }
    ]
  },
  "close": {
    "title": { "es": "Un espacio,\nmuchas posibilidades", "en": "One space,\nmany possibilities" },
    "ctaLabel": { "es": "Cotizar", "en": "Request a quote" }
  }
}
$content$::jsonb
where slug = 'architectural';
