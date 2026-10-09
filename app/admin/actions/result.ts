export type ActionResult<T extends object = object> =
  | ({ ok: true } & T)
  | { ok: false; error: string; fieldErrors?: Record<string, string[] | undefined> }

export const FORBIDDEN = { ok: false, error: 'No tienes permisos para esta acción.' } as const
export const EXPIRED = { ok: false, error: 'Tu sesión expiró. Vuelve a iniciar sesión.' } as const

/** Maps common PostgREST / Postgres errors to messages for editors. */
export function dbError(error: { code?: string; message?: string } | null): { ok: false; error: string } {
  switch (error?.code) {
    case '23505':
      return { ok: false, error: 'Ya existe un registro con ese valor (slug, código o email duplicado).' }
    case '23503':
      return { ok: false, error: 'El registro está en uso o referencia algo que no existe.' }
    case '42501':
      return FORBIDDEN
    case '23514':
      return { ok: false, error: 'Algún valor no cumple las reglas de la base de datos.' }
    default:
      return { ok: false, error: error?.message ? `Error al guardar: ${error.message}` : 'Error al guardar.' }
  }
}
