type Props = {
  page: number;
  totalPages: number;
  limit?: number;
  basePath: string;
};

export function Pagination({ page, totalPages, limit, basePath }: Props) {
  if (totalPages <= 1) return null;

  /* Lenkene må ta med sidestørrelsen, ellers faller den tilbake til
     standardverdien når man bytter side. basePath kommer utenfra, så
     samme komponent kan brukes på feeden, profilsiden og Min side. */
  const lenke = (tilSide: number) =>
    limit
      ? `${basePath}?page=${tilSide}&limit=${limit}`
      : `${basePath}?page=${tilSide}`;
  
  const lenkeStil =
    "rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-800 transition hover:bg-neutral-50";
  const avStil =
    "rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-400";

  return (
    <nav
      aria-label="Sider"
      className="mx-auto mt-8 flex max-w-5xl items-center justify-between gap-4">
      {page > 1 ? (
                <a href={lenke(page - 1)} className={lenkeStil}>
          Forrige
        </a>
      ) : (
        <span className={avStil} aria-disabled="true">
          Forrige
        </span>
      )}

      <p className="text-sm text-neutral-600">
        Side {page} av {totalPages}
      </p>

      {page < totalPages ? (
        <a href={lenke(page + 1)} className={lenkeStil}>
          Neste
        </a>
      ) : (
        <span className={avStil} aria-disabled="true">
          Neste
        </span>
      )}
    </nav>
  );
}