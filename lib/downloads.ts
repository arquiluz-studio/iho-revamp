export const DOWNLOAD_COOKIE = 'iho_dl'
/** Non-httpOnly companion so the client knows it can skip the lead form. Never trusted by the server. */
export const DOWNLOAD_FLAG_COOKIE = 'iho_dl_ok'
export const DOWNLOAD_ACCESS_DAYS = 30

export function downloadHref(mediaId: string): string {
  return `/api/media/${mediaId}/download`
}
