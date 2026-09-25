import { useEffect, useState } from "react";

const API_BASE_URL = "http://127.0.0.1:8000";

function Artisans() {
  const [artisans, setArtisans] = useState([]);
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadArtisans();
    loadProducts();
  }, []);

  async function loadArtisans() {
    try {
      setLoading(true);

      const token = localStorage.getItem("admin_token");

      const response = await fetch(
        `${API_BASE_URL}/artisans/`,
        {
          headers: token
            ? { Authorization: `Bearer ${token}` }
            : {},
        }
      );

      if (!response.ok) {
        throw new Error("Unable to load artisan data");
      }

      const data = await response.json();
      setArtisans(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadProducts() {
    try {
      const token = localStorage.getItem("admin_token");

      const response = await fetch(
        `${API_BASE_URL}/admin/products`,
        {
          headers: token
            ? { Authorization: `Bearer ${token}` }
            : {},
        }
      );

      if (!response.ok) return;

      const data = await response.json();
      setProducts(data.products || []);
    } catch {
      // Product count is supplementary; artisan registry remains usable.
    }
  }

  function getProductCount(artisanId) {
    return products.filter(
      (product) => product.artisan_id === artisanId
    ).length;
  }

  const filteredArtisans = artisans.filter((artisan) => {
    const text = search.toLowerCase();

    return (
      artisan.name?.toLowerCase().includes(text) ||
      artisan.artisan_id?.toLowerCase().includes(text) ||
      artisan.craft?.toLowerCase().includes(text) ||
      artisan.region?.toLowerCase().includes(text) ||
      artisan.language?.toLowerCase().includes(text)
    );
  });

  return (
    <div style={styles.page}>
      <section style={styles.summaryGrid}>
        <SummaryCard
          label="ARTISANS"
          value={artisans.length}
          text="Registered artisan profiles"
        />

        <SummaryCard
          label="LANGUAGES"
          value={
            new Set(
              artisans
                .map((artisan) => artisan.language)
                .filter(Boolean)
            ).size
          }
          text="Languages represented"
        />

        <SummaryCard
          label="CRAFTS"
          value={
            new Set(
              artisans
                .map((artisan) => artisan.craft)
                .filter(Boolean)
            ).size
          }
          text="Craft categories"
        />
      </section>

      <section style={styles.panel}>
        <div style={styles.headerRow}>
          <div>
            <h2 style={styles.title}>Artisan Registry</h2>
            <p style={styles.subtitle}>
              Live artisan records from the NEELAM backend
            </p>
          </div>

          <span style={styles.countBadge}>
            {filteredArtisans.length} Records
          </span>
        </div>

        <div style={styles.toolbar}>
          <span style={styles.searchIcon}>⌕</span>

          <input
            style={styles.search}
            placeholder="Search artisan, craft, region or language..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        {loading && (
          <div style={styles.message}>
            Loading artisan records...
          </div>
        )}

        {error && (
          <div style={styles.error}>
            {error}
          </div>
        )}

        {!loading && !error && (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>ARTISAN</th>
                  <th style={styles.th}>ARTISAN ID</th>
                  <th style={styles.th}>LANGUAGE</th>
                  <th style={styles.th}>REGION</th>
                  <th style={styles.th}>CRAFT</th>
                  <th style={styles.th}>PRODUCTS</th>
                  <th style={styles.th}>STATUS</th>
                </tr>
              </thead>

              <tbody>
                {filteredArtisans.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={styles.empty}>
                      No artisan records match your search.
                    </td>
                  </tr>
                ) : (
                  filteredArtisans.map((artisan) => (
                    <tr key={artisan.artisan_id}>
                      <td style={styles.td}>
                        <div style={styles.artisanCell}>
                          <div style={styles.avatar}>
                            {(artisan.name || "A")
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div>
                            <div style={styles.name}>
                              {artisan.name}
                            </div>
                            <div style={styles.subtle}>
                              {artisan.phone || "Contact not provided"}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td style={styles.td}>
                        <span style={styles.idText}>
                          {artisan.artisan_id}
                        </span>
                      </td>

                      <td style={styles.td}>
                        <span style={styles.languagePill}>
                          {artisan.language || "—"}
                        </span>
                      </td>

                      <td style={styles.td}>
                        {artisan.region || "—"}
                      </td>

                      <td style={styles.td}>
                        <span style={styles.craftText}>
                          {artisan.craft || "—"}
                        </span>
                      </td>

                      <td
                        style={{
                          ...styles.td,
                          textAlign: "center",
                        }}
                      >
                        <span style={styles.productCount}>
                          {getProductCount(artisan.artisan_id)}
                        </span>
                      </td>

                      <td
                        style={{
                          ...styles.td,
                          textAlign: "center",
                        }}
                      >
                        <span style={styles.statusPill}>
                          ✓ Registered
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function SummaryCard({ label, value, text }) {
  return (
    <div style={styles.summaryCard}>
      <div style={styles.summaryLabel}>{label}</div>
      <div style={styles.summaryNumber}>{value}</div>
      <div style={styles.summaryText}>{text}</div>
    </div>
  );
}

const styles = {
  page: {
    color: "#1f2f3f",
  },

  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "15px",
    marginBottom: "16px",
  },

  summaryCard: {
    background: "#fffdf8",
    border: "1px solid #e1d8ca",
    borderRadius: "15px",
    padding: "18px 19px",
    boxShadow: "0 3px 12px rgba(31,47,63,0.035)",
  },

  summaryLabel: {
    fontSize: "9px",
    letterSpacing: "1.5px",
    fontWeight: 800,
    color: "#526a7a",
  },

  summaryNumber: {
    fontSize: "28px",
    fontWeight: 800,
    color: "#1f2f3f",
    marginTop: "9px",
  },

  summaryText: {
    fontSize: "10px",
    color: "#667681",
    marginTop: "3px",
  },

  panel: {
    background: "#fffdf8",
    border: "1px solid #e1d8ca",
    borderRadius: "17px",
    padding: "20px",
    boxShadow: "0 3px 12px rgba(31,47,63,0.035)",
  },

  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "16px",
  },

  title: {
    margin: 0,
    fontSize: "18px",
    color: "#1f2f3f",
    fontWeight: 800,
  },

  subtitle: {
    margin: "5px 0 0",
    color: "#667681",
    fontSize: "11px",
  },

  countBadge: {
    padding: "6px 10px",
    background: "#edf4f8",
    border: "1px solid #d4e1e9",
    borderRadius: "999px",
    fontSize: "10px",
    fontWeight: 800,
    color: "#42647d",
  },

  toolbar: {
    display: "flex",
    alignItems: "center",
    marginBottom: "14px",
    border: "1px solid #dcd7ce",
    background: "#fbfaf6",
    borderRadius: "9px",
    padding: "0 11px",
  },

  searchIcon: {
    color: "#6f93b5",
    fontSize: "17px",
    marginRight: "6px",
  },

  search: {
    width: "100%",
    boxSizing: "border-box",
    border: "none",
    background: "transparent",
    padding: "11px 0",
    outline: "none",
    fontSize: "11px",
    color: "#293d4e",
  },

  tableWrapper: {
    overflowX: "auto",
    border: "1px solid #ded9d0",
    borderRadius: "10px",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "950px",
  },

  th: {
    textAlign: "center",
    padding: "12px 10px",
    background: "#eef4f7",
    borderBottom: "1px solid #d7e0e5",
    fontSize: "9px",
    color: "#334b5d",
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: "0.8px",
  },

  td: {
    padding: "12px 10px",
    borderBottom: "1px solid #eeeae4",
    fontSize: "10.5px",
    color: "#344b5b",
    verticalAlign: "middle",
  },

  artisanCell: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },

  avatar: {
    width: "34px",
    height: "34px",
    borderRadius: "9px",
    background: "#dfeaf1",
    color: "#36566e",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    fontWeight: 800,
    flexShrink: 0,
  },

  name: {
    fontWeight: 800,
    color: "#1f2f3f",
    fontSize: "11px",
  },

  subtle: {
    marginTop: "3px",
    fontSize: "8px",
    color: "#81909a",
  },

  languagePill: {
    display: "inline-block",
    padding: "4px 8px",
    borderRadius: "6px",
    background: "#f0eadd",
    color: "#655f56",
    fontSize: "9px",
    fontWeight: 700,
  },

  craftText: {
    fontWeight: 600,
    color: "#3e5869",
  },

  idText: {
    color: "#526a7a",
    fontSize: "9px",
    fontFamily: "monospace",
    fontWeight: 700,
    whiteSpace: "nowrap",
  },

  productCount: {
    display: "inline-flex",
    minWidth: "25px",
    height: "25px",
    padding: "0 6px",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "7px",
    background: "#edf4f8",
    color: "#365a73",
    fontWeight: 800,
    fontSize: "10px",
  },

  statusPill: {
    display: "inline-flex",
    padding: "5px 8px",
    borderRadius: "999px",
    background: "#e9f4eb",
    color: "#327044",
    fontSize: "9px",
    fontWeight: 800,
    whiteSpace: "nowrap",
  },

  message: {
    padding: "50px",
    textAlign: "center",
    color: "#667681",
    fontSize: "12px",
  },

  empty: {
    padding: "40px",
    textAlign: "center",
    color: "#667681",
    fontSize: "11px",
  },

  error: {
    padding: "12px",
    background: "#fff2f0",
    color: "#98483f",
    borderRadius: "9px",
    fontSize: "11px",
  },
};

export default Artisans;
