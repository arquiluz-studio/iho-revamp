# Dominios en Vercel

El sitio decide el país por el dominio. En Vercel va un solo proyecto, y los cuatro dominios apuntan a ese mismo deployment. El código en `config/countries.ts` hace el resto.

| País | Dominio canónico | Código |
|---|---|---|
| México (sede) | `www.iho.com.mx` | `mx` |
| Guatemala | `www.iho.com.gt` | `gt` |
| Costa Rica | `www.iho.cr` | `cr` |
| Panamá | `www.iho.com.pa` | `pa` |

La URL pública no lleva el país en la ruta. `https://www.iho.com.pa/proyectos` es Panamá; `https://www.iho.com.mx/en/projects` es México en inglés. El segmento `[country]` es un rewrite interno. El apex (`iho.com.pa`, `iho.cr`, …) no sirve el sitio: redirige a su `www`.

## 1. Un proyecto, cuatro dominios

En el proyecto de Vercel: **Settings → Domains → Add**. Agrega cada dominio en su forma apex y en `www`:

- `iho.com.mx` y `www.iho.com.mx`
- `iho.com.gt` y `www.iho.com.gt`
- `iho.cr` y `www.iho.cr`
- `iho.com.pa` y `www.iho.com.pa`
- `admin.iho.com.mx` (el admin; ver más abajo)

En cada par, deja **`www` conectado a Production** y configura **Redirect** permanente (308) del apex hacia ese `www`. El origen canónico del código es con `www` (`https://www.iho.com.mx`, etc.). Si el apex también sirve el sitio, o si el código manda a la gente al apex mientras Vercel manda el apex de vuelta a `www`, el navegador entra en un loop (`ERR_TOO_MANY_REDIRECTS`).

Todos deben quedar en **Production**, en el mismo proyecto. Vercel emite el certificado cuando el DNS ya resuelve.

Si Vercel pide verificar el dominio porque está en otra cuenta, agrega el TXT que te muestre (`_vercel`).

## 2. DNS en el registrador

No cambies los nameservers si esos dominios ya tienen correo (MX), SPF o DKIM. Solo agrega o reemplaza los registros del sitio web. Copia el CNAME exacto que muestra Vercel en Domains: cada proyecto tiene un target propio (algo como `cname.vercel-dns-0.com` o un host `*.vercel-dns-017.com`). El valor de abajo es el habitual; si el panel muestra otro, usa ese.

| Dominio | Tipo | Host / Name | Valor |
|---|---|---|---|
| `iho.com.mx` | A | `@` | `76.76.21.21` |
| `www.iho.com.mx` | CNAME | `www` | el CNAME del proyecto |
| `admin.iho.com.mx` | CNAME | `admin` | el mismo CNAME |
| `iho.com.gt` | A | `@` | `76.76.21.21` |
| `www.iho.com.gt` | CNAME | `www` | el CNAME del proyecto |
| `iho.cr` | A | `@` | `76.76.21.21` |
| `www.iho.cr` | CNAME | `www` | el CNAME del proyecto |
| `iho.com.pa` | A | `@` | `76.76.21.21` |
| `www.iho.com.pa` | CNAME | `www` | el CNAME del proyecto |

En el apex (el dominio sin subdominio) usa **A**, no CNAME. `.mx`, `.gt`, `.cr` y `.pa` casi nunca aceptan CNAME o ALIAS en la raíz. Si el registrador sí ofrece ALIAS/ANAME en `@`, puedes usarlo hacia el mismo target CNAME de Vercel en lugar del A.

Si el dominio ya tiene un **AAAA** apuntando a otro sitio, quítalo. Vercel no atiende IPv6 en ese A, y quien resuelva por IPv6 no llegaría al proyecto.

El apex solo puede tener el A de Vercel. Un A extra al hosting anterior cierra el loop: ese servidor responde 301 a `https://iho.com.mx/`, la app (si la visita viene de Panamá, Costa Rica o Guatemala) devuelve al apex del país, y el ciclo no termina. Hoy `iho.com.pa` e `iho.cr` todavía resuelven también a `199.250.212.46` (Apache del sitio viejo). Hay que borrar ese registro y dejar solo el A que muestra Vercel. `iho.com.gt` y `www.iho.com.gt` no resuelven a nada.

TTL: 300–3600 segundos mientras pruebas. La propagación puede tardar desde unos minutos hasta 48 horas.

## 3. Variables de entorno

En **Settings → Environment Variables**, para Production:

```
ADMIN_HOST=admin.iho.com.mx
DEFAULT_COUNTRY=mx
SITE_URL=https://www.iho.com.mx
```

`SITE_URL` no lleva barra final. El resto (Supabase, `IHO_COOKIE_SECRET`, Resend, Turnstile) va en el mismo proyecto. Redeploy después de guardarlas: el middleware lee `ADMIN_HOST` al arrancar.

## 4. Qué pasa cuando el usuario cambia de país

No hace falta un rewrite ni un proyecto por país.

1. El host decide el país. `iho.com.pa` y `www.iho.com.pa` se leen como Panamá (`countryFromHost` quita el `www`).
2. El selector del header navega a `https://www.<dominio-del-país>/?ref=selector`. Ese query guarda la cookie `iho_country_pref` por un año, así el usuario no vuelve a ser redirigido.
3. Primera visita a la home de México (`www.iho.com.mx/`), sin esa cookie y sin ser un bot: si Vercel detecta Guatemala, Costa Rica o Panamá (`x-vercel-ip-country`), hay un 302 a `https://www.iho.com.gt/`, `https://www.iho.cr/` o `https://www.iho.com.pa/`. Quien entra directo a un dominio de país se queda ahí. Si su IP es de otro país IHO, aparece un aviso para cambiar, sin forzar el salto.

Ese header de geolocalización lo pone Vercel. En otro hosting la redirección automática no ocurre; el selector de país sí, porque solo usa el dominio.

## 5. Comprobar

Cuando Vercel marque cada dominio como **Valid Configuration**:

- `https://www.iho.com.mx` abre México. El home no muestra `/mx` en la URL.
- `https://iho.com.mx` redirige a `https://www.iho.com.mx`.
- Lo mismo para `.gt`, `.cr` y `.pa`: contenido de ese país, en `www`.
- Desde México, el selector a Panamá termina en `https://www.iho.com.pa/?ref=selector`.
- En una ventana privada, con VPN o red de Panamá, `https://www.iho.com.mx/` redirige a `https://www.iho.com.pa/`.
- `https://admin.iho.com.mx` abre el admin. En los dominios públicos, `/admin` no debe abrir el panel.
- `https://www.iho.com.pa/sitemap.xml` lista URLs de `www.iho.com.pa`, no de México.
