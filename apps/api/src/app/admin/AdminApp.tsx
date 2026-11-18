"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  COLOURS,
  FABRICS,
  OCCASIONS,
  WEAVES,
  ZARI_LABELS,
  type Product,
} from "@jaiisha/catalogue";

/**
 * Product admin.
 *
 * Deliberately a single screen: a list on the left, one form on the right.
 * A shop owner adding a saree between customers should not have to navigate.
 *
 * The admin key is kept in sessionStorage, so it survives a page reload but
 * not closing the tab. It is sent as X-Admin-Key on every call.
 */

const KEY_STORAGE = "jaiisha:adminkey";

type Draft = {
  name: string;
  slug: string;
  tagline: string;
  story: string;
  price: string;
  mrp: string;
  stock: string;
  madeToOrder: boolean;
  leadTimeDays: string;
  colours: string[];
  occasions: string[];
  fabric: string;
  weave: string;
  zari: string;
  craft: string;
  origin: string;
  sareeLengthMetres: string;
  blousePiece: boolean;
  weightGrams: string;
  gstRate: string;
  badges: string[];
  seoTitle: string;
  seoDescription: string;
};

const BADGES = ["bestseller", "new-arrival", "handloom", "limited", "bridal"] as const;

const emptyDraft = (): Draft => ({
  name: "",
  slug: "",
  tagline: "",
  story: "",
  price: "",
  mrp: "",
  stock: "1",
  madeToOrder: false,
  leadTimeDays: "21",
  colours: [],
  occasions: [],
  fabric: "katan-silk",
  weave: "handloom",
  zari: "pure-zari",
  craft: "",
  origin: "Varanasi",
  sareeLengthMetres: "5.5",
  blousePiece: true,
  weightGrams: "",
  gstRate: "5",
  badges: [],
  seoTitle: "",
  seoDescription: "",
});

const draftFrom = (p: Product): Draft => {
  const v = p.variants[0];
  return {
    name: p.name,
    slug: p.slug,
    tagline: p.tagline,
    story: p.story,
    price: String(v.price.paise / 100),
    mrp: String(v.mrp.paise / 100),
    stock: v.stock === null ? "" : String(v.stock),
    madeToOrder: v.availability === "made_to_order",
    leadTimeDays: String(v.leadTimeDays ?? 21),
    colours: p.variants.map((x) => x.colour.slug),
    occasions: [...p.occasions],
    fabric: p.fabric,
    weave: p.weave,
    zari: p.zari,
    craft: p.craft,
    origin: p.origin,
    sareeLengthMetres: String(p.sareeLengthMetres),
    blousePiece: p.blousePieceMetres !== null,
    weightGrams: p.weightGrams ? String(p.weightGrams) : "",
    gstRate: String(p.tax.gstRate),
    badges: [...p.badges],
    seoTitle: p.seo.title,
    seoDescription: p.seo.description,
  };
};

const inr = (paise: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(paise / 100);

type Row = Product & { _edited?: boolean };

export default function AdminApp() {
  const [key, setKey] = useState("");
  const [keyInput, setKeyInput] = useState("");
  const [authed, setAuthed] = useState(false);

  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<{ tone: "ok" | "err" | "info"; text: string } | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  /* ------------------------------------------------------------- calls - */

  const call = useCallback(
    async (path: string, init: RequestInit = {}) => {
      const res = await fetch(`/api/admin${path}`, {
        ...init,
        headers: {
          "Content-Type": "application/json",
          "X-Admin-Key": key,
          ...(init.headers ?? {}),
        },
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        const err = new Error(json?.error?.message ?? `Request failed (${res.status})`);
        (err as Error & { details?: Record<string, string> }).details = json?.error?.details;
        throw err;
      }
      return json;
    },
    [key],
  );

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const json = await call("/products");
      setRows(json.data as Row[]);
      setAuthed(true);
      setNotice(null);
    } catch (e) {
      setAuthed(false);
      setNotice({ tone: "err", text: (e as Error).message });
    } finally {
      setLoading(false);
    }
  }, [call]);

  // Restore a key from a previous page view and verify it straight away.
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(KEY_STORAGE);
      if (saved) setKey(saved);
    } catch {
      /* storage blocked — the key just has to be typed again */
    }
  }, []);

  useEffect(() => {
    if (key) void load();
  }, [key, load]);

  /* ------------------------------------------------------------ actions - */

  const signIn = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      sessionStorage.setItem(KEY_STORAGE, keyInput);
    } catch {
      /* ignore */
    }
    setKey(keyInput);
  };

  const signOut = () => {
    try {
      sessionStorage.removeItem(KEY_STORAGE);
    } catch {
      /* ignore */
    }
    setKey("");
    setKeyInput("");
    setAuthed(false);
    setRows([]);
  };

  const startNew = () => {
    setEditingId(null);
    setDraft(emptyDraft());
    setErrors({});
    setNotice(null);
  };

  const startEdit = (p: Product) => {
    setEditingId(p.id);
    setDraft(draftFrom(p));
    setErrors({});
    setNotice(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    try {
      const body = JSON.stringify({
        ...draft,
        price: Number(draft.price),
        mrp: draft.mrp === "" ? undefined : Number(draft.mrp),
        stock: draft.stock === "" ? undefined : Number(draft.stock),
        leadTimeDays: Number(draft.leadTimeDays),
        sareeLengthMetres: Number(draft.sareeLengthMetres),
        weightGrams: draft.weightGrams === "" ? undefined : Number(draft.weightGrams),
        gstRate: Number(draft.gstRate),
      });

      const json = editingId
        ? await call(`/products/${editingId}`, { method: "PATCH", body })
        : await call("/products", { method: "POST", body });

      setNotice({
        tone: "ok",
        text: `${json.data.name} ${editingId ? "updated" : "created"}. Rebuild the storefront to publish it.`,
      });
      startNew();
      await load();
    } catch (e) {
      const err = e as Error & { details?: Record<string, string> };
      setErrors(err.details ?? {});
      setNotice({ tone: "err", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const destroy = async (p: Product) => {
    if (!window.confirm(`Remove "${p.name}" from the catalogue?`)) return;
    try {
      const json = await call(`/products/${p.id}`, { method: "DELETE" });
      setNotice({
        tone: "ok",
        text: json.data.reversible
          ? `${p.name} hidden. It can be restored from .data/products.json.`
          : `${p.name} deleted.`,
      });
      if (editingId === p.id) startNew();
      await load();
    } catch (e) {
      setNotice({ tone: "err", text: (e as Error).message });
    }
  };

  /* --------------------------------------------------------------- ui - */

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setDraft((d) => ({ ...d, [k]: v }));

  const toggle = (k: "colours" | "occasions" | "badges", value: string) =>
    setDraft((d) => ({
      ...d,
      [k]: d[k].includes(value) ? d[k].filter((x) => x !== value) : [...d[k], value],
    }));

  const stats = useMemo(() => {
    const variants = rows.reduce((n, p) => n + p.variants.length, 0);
    const inStock = rows.filter((p) => p.variants.some((v) => v.availability === "in_stock")).length;
    return { products: rows.length, variants, inStock };
  }, [rows]);

  if (!authed) {
    return (
      <div className="admin">
        <form className="gate" onSubmit={signIn}>
          <h1>JAIISHA admin</h1>
          <p>
            Enter the admin key. It is the <code>ADMIN_KEY</code> value in{" "}
            <code>apps/api/.env.local</code>.
          </p>
          {notice && <div className={`notice notice--${notice.tone}`}>{notice.text}</div>}
          <label className="field">
            <span>Admin key</span>
            <input
              type="text"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              autoComplete="off"
              placeholder="paste the key"
            />
          </label>
          <div style={{ marginTop: "1rem" }}>
            <button className="btn btn--gold" type="submit" disabled={!keyInput || loading}>
              {loading ? "Checking…" : "Unlock"}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="admin">
      <header className="admin__bar">
        <div className="admin__brand">
          <strong>JAIISHA</strong>
          <span>Catalogue admin</span>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
          <span className="muted">
            {stats.products} products · {stats.variants} colourways · {stats.inStock} in stock
          </span>
          <button className="btn btn--sm" type="button" onClick={load} disabled={loading}>
            {loading ? "Loading…" : "Refresh"}
          </button>
          <button className="btn btn--sm" type="button" onClick={signOut}>
            Lock
          </button>
        </div>
      </header>

      <main className="admin__main">
        {notice && <div className={`notice notice--${notice.tone}`}>{notice.text}</div>}
        <div className="notice">
          Edits are live on this API immediately. The storefront compiles the catalogue in at build
          time, so run <code>npm run build</code> to publish them to the shop.
        </div>

        <div className="cols">
          {/* ---------------- list ---------------- */}
          <section className="panel">
            <div className="panel__head">
              <h2>Catalogue</h2>
              <button className="btn btn--gold btn--sm" type="button" onClick={startNew}>
                + New saree
              </button>
            </div>

            {rows.length === 0 ? (
              <p className="empty">Nothing in the catalogue yet.</p>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table className="tbl">
                  <thead>
                    <tr>
                      <th>Saree</th>
                      <th>Colours</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((p) => {
                      const v = p.variants[0];
                      const total = p.variants.reduce((n, x) => n + (x.stock ?? 0), 0);
                      const mto = p.variants.some((x) => x.availability === "made_to_order");
                      return (
                        <tr key={p.id}>
                          <td>
                            <div className="tbl__name">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                className="tbl__thumb"
                                src={`${process.env.NEXT_PUBLIC_STOREFRONT_ORIGIN ?? ""}${v.images[0]?.src ?? ""}`}
                                alt=""
                                onError={(e) => {
                                  (e.currentTarget as HTMLImageElement).style.visibility = "hidden";
                                }}
                              />
                              <div>
                                <div className="tbl__title">
                                  {p.name}{" "}
                                  {p._edited && <span className="pill pill--edited">edited</span>}
                                </div>
                                <div className="tbl__slug">/{p.slug}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="dots">
                              {p.variants.map((x) => (
                                <span
                                  key={x.id}
                                  className="dot"
                                  style={{ background: x.colour.hex }}
                                  title={x.colour.name}
                                />
                              ))}
                            </div>
                          </td>
                          <td className="tbl__num">{inr(v.price.paise)}</td>
                          <td>
                            {mto ? (
                              <span className="pill pill--mto">Made to order</span>
                            ) : total > 0 ? (
                              <span className="pill pill--stock">{total} in stock</span>
                            ) : (
                              <span className="pill pill--out">Sold out</span>
                            )}
                          </td>
                          <td>
                            <div className="tbl__actions">
                              <button
                                className="btn btn--sm"
                                type="button"
                                onClick={() => startEdit(p)}
                              >
                                Edit
                              </button>
                              <button
                                className="btn btn--sm btn--danger"
                                type="button"
                                onClick={() => destroy(p)}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* ---------------- form ---------------- */}
          <section className="panel">
            <div className="panel__head">
              <h2>{editingId ? "Edit saree" : "New saree"}</h2>
              {editingId && (
                <button className="btn btn--sm" type="button" onClick={startNew}>
                  Cancel
                </button>
              )}
            </div>

            <form className="form" onSubmit={save}>
              <fieldset className="form__group">
                <legend className="form__legend">Identity</legend>

                <label className={`field ${errors.name ? "field--err" : ""}`}>
                  <span>Name</span>
                  <input
                    type="text"
                    value={draft.name}
                    onChange={(e) => set("name", e.target.value)}
                    placeholder="Kadwa Buta Bridal Katan Silk Saree"
                  />
                  {errors.name && <span className="field__err">{errors.name}</span>}
                </label>

                <label className={`field ${errors.slug ? "field--err" : ""}`}>
                  <span>Web address</span>
                  <input
                    type="text"
                    value={draft.slug}
                    onChange={(e) => set("slug", e.target.value)}
                    placeholder="left blank, made from the name"
                  />
                  <span className="field__hint">/sarees/{draft.slug || "…"}</span>
                  {errors.slug && <span className="field__err">{errors.slug}</span>}
                </label>

                <label className="field">
                  <span>Tagline</span>
                  <input
                    type="text"
                    value={draft.tagline}
                    onChange={(e) => set("tagline", e.target.value)}
                    placeholder="The saree a bride keeps for her daughter."
                  />
                </label>

                <label className="field">
                  <span>Story</span>
                  <textarea
                    rows={4}
                    value={draft.story}
                    onChange={(e) => set("story", e.target.value)}
                    placeholder="How it is woven, and what it is for."
                  />
                </label>
              </fieldset>

              <fieldset className="form__group">
                <legend className="form__legend">Price &amp; stock</legend>

                <div className="form__row">
                  <label className={`field ${errors.price ? "field--err" : ""}`}>
                    <span>Price ₹</span>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={draft.price}
                      onChange={(e) => set("price", e.target.value)}
                    />
                    {errors.price && <span className="field__err">{errors.price}</span>}
                  </label>

                  <label className={`field ${errors.mrp ? "field--err" : ""}`}>
                    <span>MRP ₹</span>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={draft.mrp}
                      onChange={(e) => set("mrp", e.target.value)}
                      placeholder="same as price"
                    />
                    {errors.mrp && <span className="field__err">{errors.mrp}</span>}
                  </label>
                </div>

                <label className="switch">
                  <input
                    type="checkbox"
                    checked={draft.madeToOrder}
                    onChange={(e) => set("madeToOrder", e.target.checked)}
                  />
                  Made to order (woven after the order)
                </label>

                <div className="form__row">
                  {draft.madeToOrder ? (
                    <label className="field">
                      <span>Weaving days</span>
                      <input
                        type="number"
                        min="1"
                        value={draft.leadTimeDays}
                        onChange={(e) => set("leadTimeDays", e.target.value)}
                      />
                    </label>
                  ) : (
                    <label className="field">
                      <span>Stock per colour</span>
                      <input
                        type="number"
                        min="0"
                        value={draft.stock}
                        onChange={(e) => set("stock", e.target.value)}
                      />
                    </label>
                  )}
                  <label className="field">
                    <span>GST %</span>
                    <input
                      type="number"
                      min="0"
                      max="28"
                      value={draft.gstRate}
                      onChange={(e) => set("gstRate", e.target.value)}
                    />
                  </label>
                </div>
              </fieldset>

              <fieldset className="form__group">
                <legend className="form__legend">Colours woven</legend>
                <div className={`checks ${errors.colours ? "field--err" : ""}`}>
                  {COLOURS.map((c) => (
                    <label className="chk" key={c.slug}>
                      <input
                        type="checkbox"
                        checked={draft.colours.includes(c.slug)}
                        onChange={() => toggle("colours", c.slug)}
                      />
                      <span className="chk__dot" style={{ background: c.hex }} />
                      {c.name}
                    </label>
                  ))}
                </div>
                <span className="field__hint">
                  One stocked colourway, with its own SKU, is created per colour.
                </span>
                {errors.colours && <span className="field__err">{errors.colours}</span>}
              </fieldset>

              <fieldset className="form__group">
                <legend className="form__legend">Occasions</legend>
                <div className="checks">
                  {OCCASIONS.map((o) => (
                    <label className="chk" key={o.slug}>
                      <input
                        type="checkbox"
                        checked={draft.occasions.includes(o.slug)}
                        onChange={() => toggle("occasions", o.slug)}
                      />
                      {o.name}
                    </label>
                  ))}
                </div>
                {errors.occasions && <span className="field__err">{errors.occasions}</span>}
              </fieldset>

              <fieldset className="form__group">
                <legend className="form__legend">The cloth</legend>

                <div className="form__row">
                  <label className="field">
                    <span>Fabric</span>
                    <select value={draft.fabric} onChange={(e) => set("fabric", e.target.value)}>
                      {FABRICS.map((f) => (
                        <option key={f.slug} value={f.slug}>
                          {f.name}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="field">
                    <span>Weave</span>
                    <select value={draft.weave} onChange={(e) => set("weave", e.target.value)}>
                      {WEAVES.map((w) => (
                        <option key={w.slug} value={w.slug}>
                          {w.name}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <label className="field">
                  <span>Zari</span>
                  <select value={draft.zari} onChange={(e) => set("zari", e.target.value)}>
                    {Object.entries(ZARI_LABELS).map(([slug, label]) => (
                      <option key={slug} value={slug}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="form__row">
                  <label className="field">
                    <span>Technique</span>
                    <input
                      type="text"
                      value={draft.craft}
                      onChange={(e) => set("craft", e.target.value)}
                      placeholder="Kadwa buta"
                    />
                  </label>
                  <label className="field">
                    <span>Woven in</span>
                    <input
                      type="text"
                      value={draft.origin}
                      onChange={(e) => set("origin", e.target.value)}
                    />
                  </label>
                </div>

                <div className="form__row">
                  <label className="field">
                    <span>Length (m)</span>
                    <input
                      type="number"
                      step="0.1"
                      min="1"
                      value={draft.sareeLengthMetres}
                      onChange={(e) => set("sareeLengthMetres", e.target.value)}
                    />
                  </label>
                  <label className="field">
                    <span>Weight (g)</span>
                    <input
                      type="number"
                      min="0"
                      value={draft.weightGrams}
                      onChange={(e) => set("weightGrams", e.target.value)}
                      placeholder="optional"
                    />
                  </label>
                </div>

                <label className="switch">
                  <input
                    type="checkbox"
                    checked={draft.blousePiece}
                    onChange={(e) => set("blousePiece", e.target.checked)}
                  />
                  Blouse piece included
                </label>
              </fieldset>

              <fieldset className="form__group">
                <legend className="form__legend">Badges</legend>
                <div className="checks">
                  {BADGES.map((b) => (
                    <label className="chk" key={b}>
                      <input
                        type="checkbox"
                        checked={draft.badges.includes(b)}
                        onChange={() => toggle("badges", b)}
                      />
                      {b.replace("-", " ")}
                    </label>
                  ))}
                </div>
              </fieldset>

              <div className="form__actions">
                <button className="btn btn--gold" type="submit" disabled={saving}>
                  {saving ? "Saving…" : editingId ? "Save changes" : "Create saree"}
                </button>
                <button className="btn" type="button" onClick={startNew} disabled={saving}>
                  Reset
                </button>
              </div>

              <p className="muted">
                Photographs: the form points each colourway at{" "}
                <code>/img/products/{draft.slug || "slug"}-&lt;colour&gt;-&lt;view&gt;.svg</code>.
                Drop real photos at those paths in the storefront&rsquo;s public folder.
              </p>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}
