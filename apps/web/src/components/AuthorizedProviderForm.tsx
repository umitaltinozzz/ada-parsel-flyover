import { useState } from "react";
import type { FormEvent } from "react";
import { KeyRound, Link, ShieldCheck, TriangleAlert } from "lucide-react";
import { loadAuthorizedTkgmProvider } from "../providers/tkgmAuthorizedProvider";
import type { Parcel } from "../types/parcel";

type AuthorizedProviderFormProps = {
  onParcelLoaded: (parcel: Parcel) => void;
};

export function AuthorizedProviderForm({
  onParcelLoaded,
}: AuthorizedProviderFormProps) {
  const [endpoint, setEndpoint] = useState("");
  const [token, setToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      onParcelLoaded(
        await loadAuthorizedTkgmProvider({
          endpoint,
          token: token.trim() || undefined,
        }),
      );
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Resmi servis verisi yüklenemedi.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="panel-section">
      <div className="section-title">
        <h2>İzinli TKGM / resmi servis</h2>
        <span>{isLoading ? "Yükleniyor" : "WFS / GeoJSON"}</span>
      </div>
      <p className="section-note">
        Sadece erişim izniniz olan TKGM, belediye veya kurum servis URL'sini
        kullanın. Uygulama TKGM Parsel Sorgu ekranından otomatik veri çekmez.
      </p>

      <form className="endpoint-form" onSubmit={submit}>
        <label>
          <span>
            <Link size={14} aria-hidden="true" />
            Resmi servis URL'si
          </span>
          <input
            type="url"
            value={endpoint}
            placeholder="https://.../wfs?service=WFS&request=GetFeature..."
            onChange={(event) => setEndpoint(event.target.value)}
            required
          />
        </label>

        <label>
          <span>
            <KeyRound size={14} aria-hidden="true" />
            Erişim tokeni
          </span>
          <input
            type="password"
            value={token}
            placeholder="Varsa yapıştırın"
            onChange={(event) => setToken(event.target.value)}
          />
        </label>

        <button className="secondary-button" type="submit" disabled={isLoading}>
          <ShieldCheck size={17} aria-hidden="true" />
          Servisten parseli yükle
        </button>
      </form>

      {error ? (
        <p className="inline-error" role="alert">
          <TriangleAlert size={16} aria-hidden="true" />
          {error}
        </p>
      ) : null}
    </section>
  );
}
