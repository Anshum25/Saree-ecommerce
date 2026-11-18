import { PRODUCTS } from "@jaiisha/catalogue";

/**
 * A plain index of the API. Not a customer-facing page — it exists so whoever
 * picks this up next can see every endpoint and its state without reading the
 * source.
 */

const LIVE = [
  { method: "GET", path: "/api/products", note: "Filter, sort and paginate the catalogue." },
  { method: "GET", path: "/api/products/[slug]", note: "One saree, with reviews and related pieces." },
  { method: "GET", path: "/api/facets", note: "Taxonomies and counts for a filter UI." },
  { method: "GET", path: "/api/reviews?product=slug", note: "Published reviews." },
  { method: "POST", path: "/api/reviews", note: "Submit a review; held for moderation." },
  { method: "POST", path: "/api/enquiry", note: "The Phase 1 order and advice channel." },
  { method: "POST", path: "/api/newsletter", note: "Subscribe to the monthly letter." },
  { method: "GET", path: "/api/instagram", note: "Feed placeholder; see route comment to connect." },
];

const PHASE2 = [
  { method: "GET POST", path: "/api/cart", note: "501 with the planned contract." },
  { method: "GET POST", path: "/api/orders", note: "501; Razorpay, stock and GST invoices." },
];

const cell: React.CSSProperties = {
  padding: "0.5rem 0.9rem",
  borderBottom: "1px solid rgba(246,239,228,0.14)",
  verticalAlign: "top",
};

export default function ApiIndex() {
  return (
    <main style={{ maxWidth: "62rem", margin: "0 auto", padding: "clamp(1.5rem, 5vw, 4rem)" }}>
      <p style={{ color: "#b58a43", letterSpacing: "0.22em", fontSize: "0.72rem", margin: 0 }}>
        JAIISHA
      </p>
      <h1 style={{ fontWeight: 400, fontSize: "clamp(1.5rem, 4vw, 2.2rem)", margin: "0.4rem 0" }}>
        Commerce API
      </h1>
      <p style={{ color: "#cbb8b0", maxWidth: "62ch" }}>
        Serving {PRODUCTS.length} sarees and{" "}
        {PRODUCTS.reduce((n, p) => n + p.variants.length, 0)} stocked colourways from{" "}
        <code style={{ color: "#d9b872" }}>@jaiisha/catalogue</code>, the same package the Astro
        storefront compiles against — so filter semantics cannot drift between the two.
      </p>

      <h2 style={{ fontWeight: 400, fontSize: "1.1rem", marginTop: "2.5rem" }}>Live</h2>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.86rem" }}>
        <tbody>
          {LIVE.map((r) => (
            <tr key={r.path + r.method}>
              <td style={{ ...cell, color: "#d9b872", whiteSpace: "nowrap" }}>{r.method}</td>
              <td style={{ ...cell, whiteSpace: "nowrap" }}>{r.path}</td>
              <td style={{ ...cell, color: "#cbb8b0" }}>{r.note}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 style={{ fontWeight: 400, fontSize: "1.1rem", marginTop: "2.5rem" }}>
        Phase 2 — declared, not built
      </h2>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.86rem" }}>
        <tbody>
          {PHASE2.map((r) => (
            <tr key={r.path}>
              <td style={{ ...cell, color: "#a52c50", whiteSpace: "nowrap" }}>{r.method}</td>
              <td style={{ ...cell, whiteSpace: "nowrap" }}>{r.path}</td>
              <td style={{ ...cell, color: "#cbb8b0" }}>{r.note}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p style={{ color: "#8b7880", fontSize: "0.78rem", marginTop: "2.5rem" }}>
        Phase 1 writes land in JSON files under JAIISHA_DATA_DIR. Not for concurrent instances —
        move to Postgres before scaling out.
      </p>
    </main>
  );
}
