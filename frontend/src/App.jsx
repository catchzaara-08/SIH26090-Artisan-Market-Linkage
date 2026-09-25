import { useEffect, useMemo, useState } from "react";
import Artisans from "./Artisans";
import NEELAMVerification from "./NEELAMVerification";
import GIRecords from "./GIRecords";
import Orders from "./Orders";

const API_BASE_URL = "http://127.0.0.1:8000";

function App() {
  const [token, setToken] = useState(
    localStorage.getItem("admin_token") || ""
  );
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [dashboard, setDashboard] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activePage, setActivePage] = useState("Overview");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  async function login(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Admin login failed");
      }

      localStorage.setItem("admin_token", data.access_token);
      setToken(data.access_token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadDashboard(authToken) {
    setLoading(true);
    setError("");

    try {
      const headers = {
        Authorization: `Bearer ${authToken}`,
      };

      const dashboardResponse = await fetch(
        `${API_BASE_URL}/admin/dashboard`,
        { headers }
      );

      if (dashboardResponse.status === 401) {
        logout();
        throw new Error("Admin session expired. Please log in again.");
      }

      if (!dashboardResponse.ok) {
        throw new Error("Failed to load dashboard data");
      }

      const dashboardData = await dashboardResponse.json();

      const productsResponse = await fetch(
        `${API_BASE_URL}/admin/products`,
        { headers }
      );

      if (!productsResponse.ok) {
        throw new Error("Failed to load products");
      }

      const productsData = await productsResponse.json();

      setDashboard(dashboardData);
      setProducts(productsData.products || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (token) {
      loadDashboard(token);
    }
  }, [token]);

  function logout() {
    localStorage.removeItem("admin_token");
    setToken("");
    setDashboard(null);
    setProducts([]);
    setUsername("");
    setPassword("");
  }

  if (!token) {
    return (
      <div style={styles.loginPage}>
        <div style={styles.loginCard}>
          <div style={styles.loginEyebrow}>RÉ-BIRTH</div>

          <div style={styles.loginLogoWrap}>
            <img
              src="/neelam-logo.jpeg"
              alt="NEELAM"
              style={styles.loginLogo}
            />
          </div>

          <p style={styles.loginSubtitle}>
            Owner / Admin Portal
          </p>

          <div style={styles.loginRule} />

          <form onSubmit={login}>
            <label style={styles.label}>USERNAME</label>

            <input
              style={styles.input}
              type="text"
              placeholder="Enter admin username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              required
            />

            <label style={styles.label}>PASSWORD</label>

            <input
              style={styles.input}
              type="password"
              placeholder="Enter admin password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />

            {error && <div style={styles.errorBox}>{error}</div>}

            <button
              style={styles.loginButton}
              type="submit"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In →"}
            </button>
          </form>

          <div style={styles.loginFooter}>
            Protecting Craft · Preserving Identity · Building Trust
          </div>
        </div>
      </div>
    );
  }

  const stats = dashboard?.summary || {};

  const pageDescriptions = {
    Overview: "A live view of the artisan ecosystem.",
    Products: "Registered craft products and marketplace data.",
    Orders: "Payments and transaction records linked to products.",
    "NEELAM & Verification": "Review and approve NEELAM product identities.",
    NEELAM: "Product identity, provenance and verification records.",
    Artisans: "Registered artisans and their craft profiles.",
    "GI Records": "Geographical Indication records and verification data.",
    Stories: "Craft stories and product narratives.",
  };

  const navGroups = [
    {
      label: "WORKSPACE",
      items: [
        { name: "Overview", icon: "⌂" },
        { name: "Products", icon: "▦" },
        { name: "Orders", icon: "↗" },
      ],
    },
    {
      label: "TRUST & IDENTITY",
      items: [
        { name: "NEELAM & Verification", icon: "◆" },
        { name: "GI Records", icon: "✓" },
      ],
    },
    {
      label: "ECOSYSTEM",
      items: [
        { name: "Artisans", icon: "♙" },
        { name: "Stories", icon: "◉" },
      ],
    },
  ];

  return (
    <div style={styles.app}>
      <aside
        style={{
          ...styles.sidebar,
          width: sidebarCollapsed ? "76px" : "244px",
        }}
      >
        <div
          style={{
            ...styles.sidebarBrand,
            justifyContent: sidebarCollapsed
              ? "center"
              : "flex-start",
          }}
        >
          <div style={styles.brandLogo}>
            <img
              src="/neelam-logo.jpeg"
              alt="NEELAM"
              style={styles.brandLogoImage}
            />
          </div>

          {!sidebarCollapsed && (
            <div>
              <div style={styles.brandName}>NEELAM</div>
              <div style={styles.brandSubtitle}>
                Owner Portal
              </div>
            </div>
          )}
        </div>

        <button
          style={styles.collapseButton}
          onClick={() =>
            setSidebarCollapsed(!sidebarCollapsed)
          }
        >
          {sidebarCollapsed ? "→" : "←"}
        </button>

        <div style={styles.navArea}>
          {navGroups.map((group) => (
            <div key={group.label} style={styles.navGroup}>
              {!sidebarCollapsed && (
                <div style={styles.sideLabel}>
                  {group.label}
                </div>
              )}

              {group.items.map((item) => (
                <button
                  key={item.name}
                  title={
                    sidebarCollapsed
                      ? item.name
                      : undefined
                  }
                  onClick={() =>
                    setActivePage(item.name)
                  }
                  style={{
                    ...styles.navButton,
                    justifyContent: sidebarCollapsed
                      ? "center"
                      : "flex-start",
                    ...(activePage === item.name
                      ? styles.navButtonActive
                      : {}),
                  }}
                >
                  <span style={styles.navIcon}>
                    {item.icon}
                  </span>

                  {!sidebarCollapsed && (
                    <span>{item.name}</span>
                  )}
                </button>
              ))}
            </div>
          ))}
        </div>

        <div style={styles.sidebarBottom}>
          {!sidebarCollapsed && (
            <div style={styles.sidebarStatus}>
              <span style={styles.onlineDot} />
              <span>System Online</span>
            </div>
          )}

          <button
            style={styles.logoutButton}
            onClick={logout}
            title="Log out"
          >
            {sidebarCollapsed ? "↪" : "Log out"}
          </button>
        </div>
      </aside>

      <main style={styles.main}>
        <header style={styles.header}>
          <div>
            <div style={styles.eyebrow}>
              RÉ-BIRTH / OWNER PORTAL
            </div>

            <h1 style={styles.pageTitle}>
              {activePage}
            </h1>

            <p style={styles.pageSubtitle}>
              {pageDescriptions[activePage]}
            </p>
          </div>

          <div style={styles.adminBadge}>
            <div style={styles.avatar}>A</div>

            <div>
              <div style={styles.adminName}>
                Admin
              </div>

              <div style={styles.adminRole}>
                Administrator · Online
              </div>
            </div>
          </div>
        </header>

        {error && (
          <div style={styles.errorBox}>{error}</div>
        )}

        {loading && !dashboard ? (
          <div style={styles.loading}>
            <div style={styles.loadingDot} />
            Loading platform data...
          </div>
        ) : (
          <div style={styles.pageContent}>
            <style>{`
              main h1,
              main h2,
              main h3 {
                color: #1f2f3f !important;
                opacity: 1 !important;
              }

              main th {
                color: #334b5d !important;
                font-weight: 800 !important;
                text-align: center !important;
              }

              main td {
                opacity: 1 !important;
              }

              main p,
              main span,
              main div {
                opacity: 1;
              }
            `}</style>
            {activePage === "Overview" && (
              <OverviewPage
                stats={stats}
                products={products}
              />
            )}

            {activePage === "Products" && (
              <ProductsPage products={products} />
            )}

            {activePage === "Orders" && <Orders />}

            {activePage === "NEELAM & Verification" && (
              <NEELAMVerification />
            )}

            {activePage === "NEELAM" && <NEELAMVerification />}

            {activePage === "GI Records" && (
              <GIRecords />
            )}

            {activePage === "Artisans" && (
              <Artisans />
            )}

            {activePage === "Stories" && (
              <StoriesPage products={products} />
            )}
          </div>
        )}
      </main>
    </div>
  );
}

/* ============================================================
   OVERVIEW
============================================================ */

function OverviewPage({ stats, products }) {
  const regionCounts = useMemo(() => {
    const counts = {};

    products.forEach((product) => {
      const region = product.region || "Unknown";
      counts[region] = (counts[region] || 0) + 1;
    });

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1]);
  }, [products]);

  const verified =
    stats.neelam_verified ?? 0;

  const pending =
    stats.neelam_pending ?? 0;

  const totalNeelam =
    stats.total_neelam_records ?? 0;

  const verificationPercent =
    totalNeelam > 0
      ? Math.round((verified / totalNeelam) * 100)
      : 0;

  return (
    <>
      <section style={styles.statsGrid}>
        <StatCard
          title="Registered Products"
          value={stats.total_products ?? 0}
          icon="▦"
        />

        <StatCard
          title="Registered Artisans"
          value={stats.total_artisans ?? 0}
          icon="♙"
        />

        <StatCard
          title="NEELAM Verified"
          value={verified}
          icon="✓"
        />

        <StatCard
          title="GI Records"
          value={stats.total_gi_records ?? 0}
          icon="◆"
        />
      </section>

      <section style={styles.visualGrid}>
        <div style={styles.panel}>
          <div style={styles.panelHeader}>
            <div>
              <h2 style={styles.panelTitle}>
                NEELAM Verification
              </h2>

              <p style={styles.panelSubtitle}>
                Current product identity status
              </p>
            </div>

            <span
              style={
                pending > 0
                  ? styles.pendingBadge
                  : styles.verifiedBadge
              }
            >
              {pending > 0
                ? `${pending} Pending`
                : "Verified"}
            </span>
          </div>

          <div style={styles.verificationLayout}>
            <div
              style={{
                ...styles.ring,
                background: `conic-gradient(
                  #6f93b5 0deg ${verificationPercent * 3.6}deg,
                  #dce9f4 ${verificationPercent * 3.6}deg 360deg
                )`,
              }}
            >
              <div style={styles.ringInner}>
                <strong>{verificationPercent}%</strong>
                <span>verified</span>
              </div>
            </div>

            <div style={styles.verificationStats}>
              <div style={styles.verificationStatCard}>
                <strong>{verified}</strong>
                <span>Verified</span>
              </div>

              <div style={styles.verificationStatCard}>
                <strong>{pending}</strong>
                <span>Pending</span>
              </div>
            </div>
          </div>
        </div>

        <div style={styles.panel}>
          <div style={styles.panelHeader}>
            <div>
              <h2 style={styles.panelTitle}>
                Products by Region
              </h2>

              <p style={styles.panelSubtitle}>
                Registered craft distribution
              </p>
            </div>
          </div>

          <div style={styles.barChart}>
            {regionCounts.length === 0 ? (
              <div style={styles.emptyState}>
                No regional data available.
              </div>
            ) : (
              regionCounts.map(([region, count]) => {
                const max =
                  regionCounts[0]?.[1] || 1;

                const width =
                  (count / max) * 100;

                return (
                  <div
                    key={region}
                    style={styles.barRow}
                  >
                    <div style={styles.barLabel}>
                      {region}
                    </div>

                    <div style={styles.barTrack}>
                      <div
                        style={{
                          ...styles.barFill,
                          width: `${width}%`,
                        }}
                      />
                    </div>

                    <div style={styles.barValue}>
                      {count}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>

      <section style={styles.panel}>
        <div style={styles.panelHeader}>
          <div>
            <h2 style={styles.panelTitle}>
              Product Registry
            </h2>

            <p style={styles.panelSubtitle}>
              Live registered products
            </p>
          </div>

          <span style={styles.countBadge}>
            {products.length} Products
          </span>
        </div>

        <div style={styles.dataTableWrapper}>
          <table style={styles.dataTable}>
            <thead>
              <tr>
                <th style={styles.dataTh}>Product</th>
                <th style={styles.dataTh}>Craft</th>
                <th style={styles.dataTh}>Region</th>
                <th style={styles.dataTh}>Price</th>
                <th style={styles.dataTh}>GI</th>
              </tr>
            </thead>

            <tbody>
              {products.map((product) => (
                <tr key={product.product_id}>
                  <td style={styles.dataTd}>
                    <div style={styles.tableProductName}>
                      {product.name}
                    </div>

                    <div style={styles.tableProductId}>
                      {product.product_id}
                    </div>
                  </td>

                  <td style={styles.dataTd}>
                    {product.craft}
                  </td>

                  <td style={styles.dataTd}>
                    <span style={styles.regionPill}>
                      {product.region}
                    </span>
                  </td>

                  <td style={styles.dataTd}>
                    ₹
                    {Number(
                      product.price
                    ).toLocaleString("en-IN")}
                  </td>

                  <td style={styles.dataTd}>
                    <span style={styles.giPill}>
                      {product.gi_status ||
                        "Not specified"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

/* ============================================================
   PRODUCTS
============================================================ */

function ProductsPage({ products }) {
  const [searchTerm, setSearchTerm] =
    useState("");

  const [neelamStatuses, setNeelamStatuses] =
    useState({});

  useEffect(() => {
    async function loadNeelamStatuses() {
      try {
        const token =
          localStorage.getItem("admin_token");

        const response = await fetch(
          "http://127.0.0.1:8000/admin/neelam",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) return;

        const data = await response.json();
        const statusMap = {};

        (data.records || []).forEach((record) => {
          statusMap[record.product_id] =
            record.provenance_valid === true
              ? "Verified"
              : "Pending";
        });

        setNeelamStatuses(statusMap);
      } catch {
        // Keep the registry usable if the status endpoint is unavailable.
      }
    }

    loadNeelamStatuses();
  }, [products]);

  const [regionFilter, setRegionFilter] =
    useState("All");

  const [giFilter, setGiFilter] =
    useState("All");

  const [sortField, setSortField] =
    useState("name");

  const [sortDirection, setSortDirection] =
    useState("asc");

  const regions = useMemo(
    () => [
      "All",
      ...Array.from(
        new Set(
          products
            .map((p) => p.region)
            .filter(Boolean)
        )
      ),
    ],
    [products]
  );

  const giStatuses = Array.from(
    new Set(
      products
        .map((p) => p.gi_status)
        .filter(Boolean)
    )
  );

  const filteredProducts = useMemo(() => {
    const result = products.filter((product) => {
      const term =
        searchTerm.toLowerCase();

      const matchesSearch =
        product.name
          ?.toLowerCase()
          .includes(term) ||
        product.product_id
          ?.toLowerCase()
          .includes(term) ||
        product.craft
          ?.toLowerCase()
          .includes(term) ||
        product.material
          ?.toLowerCase()
          .includes(term);

      const matchesRegion =
        regionFilter === "All" ||
        product.region === regionFilter;

      const matchesGI =
        giFilter === "All" ||
        product.gi_status === giFilter;

      return (
        matchesSearch &&
        matchesRegion &&
        matchesGI
      );
    });

    result.sort((a, b) => {
      let first = a[sortField];
      let second = b[sortField];

      if (sortField === "price") {
        first = Number(first);
        second = Number(second);
      } else {
        first = String(
          first ?? ""
        ).toLowerCase();

        second = String(
          second ?? ""
        ).toLowerCase();
      }

      if (first < second)
        return sortDirection === "asc"
          ? -1
          : 1;

      if (first > second)
        return sortDirection === "asc"
          ? 1
          : -1;

      return 0;
    });

    return result;
  }, [
    products,
    searchTerm,
    regionFilter,
    giFilter,
    sortField,
    sortDirection,
  ]);

  function changeSort(field) {
    if (sortField === field) {
      setSortDirection(
        sortDirection === "asc"
          ? "desc"
          : "asc"
      );
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  }

  function exportCSV() {
    const headers = [
      "Product ID",
      "Product",
      "Artisan ID",
      "Craft",
      "Material",
      "Region",
      "Price",
      "GI Status",
      "NEELAM Status",
      "Image URL",
    ];

    const rows = filteredProducts.map(
      (product) => [
        product.product_id,
        product.name,
        product.artisan_id,
        product.craft,
        product.material,
        product.region,
        product.price,
        product.gi_status,
        neelamStatuses[product.product_id] || "Pending",
        product.image_url || "",
      ]
    );

    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map(
            (value) =>
              `"${String(
                value ?? ""
              ).replaceAll('"', '""')}"`
          )
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;
    link.download = "neelam-products.csv";
    link.click();

    URL.revokeObjectURL(url);
  }

  return (
    <>
      <section style={styles.productTopGrid}>
        <ProductMetric
          label="PRODUCTS"
          value={products.length}
          text="Registered products"
        />

        <ProductMetric
          label="REGIONS"
          value={regions.length - 1}
          text="Regions represented"
        />

        <ProductMetric
          label="VISIBLE"
          value={filteredProducts.length}
          text="Records in current view"
        />
      </section>

      <section style={styles.panel}>
        <div style={styles.panelHeader}>
          <div>
            <h2 style={styles.panelTitle}>
              Product Registry
            </h2>

            <p style={styles.panelSubtitle}>
              Spreadsheet-style operational data
            </p>
          </div>

          <button
            style={styles.exportButton}
            onClick={exportCSV}
          >
            ↓ Export CSV
          </button>
        </div>

        <div style={styles.toolbar}>
          <div style={styles.searchBox}>
            <span style={styles.searchIcon}>
              ⌕
            </span>

            <input
              style={styles.searchInput}
              placeholder="Search product, ID, craft or material..."
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(e.target.value)
              }
            />
          </div>

          <select
            style={styles.select}
            value={regionFilter}
            onChange={(e) =>
              setRegionFilter(e.target.value)
            }
          >
            {regions.map((region) => (
              <option
                key={region}
                value={region}
              >
                {region === "All"
                  ? "All regions"
                  : region}
              </option>
            ))}
          </select>

          <select
            style={styles.select}
            value={giFilter}
            onChange={(e) =>
              setGiFilter(e.target.value)
            }
          >
            <option value="All">
              All GI statuses
            </option>

            {giStatuses.map((status) => (
              <option
                key={status}
                value={status}
              >
                {status}
              </option>
            ))}
          </select>
        </div>

        <div style={styles.dataTableWrapper}>
          <table style={styles.dataTable}>
            <thead>
              <tr>
                <th style={styles.dataTh}>IMAGE</th>

                <SortableHeader
                  label="PRODUCT"
                  field="name"
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={changeSort}
                />

                <th style={styles.dataTh}>PRODUCT ID</th>

                <SortableHeader
                  label="CRAFT"
                  field="craft"
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={changeSort}
                />

                <SortableHeader
                  label="MATERIAL"
                  field="material"
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={changeSort}
                />

                <SortableHeader
                  label="REGION"
                  field="region"
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={changeSort}
                />

                <th style={styles.dataTh}>
                  GI STATUS
                </th>

                <th style={styles.dataTh}>
                  NEELAM TAG
                </th>

                <SortableHeader
                  label="PRICE"
                  field="price"
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={changeSort}
                />
              </tr>
            </thead>

            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td
                    colSpan="9"
                    style={styles.noResults}
                  >
                    No products match your filters.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const neelamStatus =
                    neelamStatuses[product.product_id] ||
                    "Pending";

                  return (
                    <tr
                      key={product.product_id}
                      style={styles.dataRow}
                    >
                      <td
                        style={{
                          ...styles.dataTd,
                          textAlign: "center",
                        }}
                      >
                        <button
                          type="button"
                          title="Open product image"
                          aria-label={`Open image for ${product.name}`}
                          style={styles.productImageButton}
                          onClick={() =>
                            product.image_url &&
                            window.open(
                              product.image_url,
                              "_blank",
                              "noopener,noreferrer"
                            )
                          }
                        >
                          {product.image_url ? (
                            <img
                              src={product.image_url}
                              alt={product.name}
                              style={styles.productImageThumb}
                              onError={(e) => {
                                e.currentTarget.style.display =
                                  "none";
                                e.currentTarget.parentElement
                                  .querySelector(
                                    ".image-fallback"
                                  )
                                  .style.display = "flex";
                              }}
                            />
                          ) : null}

                          <span
                            className="image-fallback"
                            style={{
                              ...styles.imageFallback,
                              display: product.image_url
                                ? "none"
                                : "flex",
                            }}
                          >
                            ◇
                          </span>
                        </button>
                      </td>

                      <td style={styles.dataTd}>
                        <div style={styles.tableProductName}>
                          {product.name}
                        </div>
                      </td>

                      <td style={styles.dataTd}>
                        <span style={styles.productIdCell}>
                          {product.product_id}
                        </span>
                      </td>

                      <td style={styles.dataTd}>
                        {product.craft}
                      </td>

                      <td style={styles.dataTd}>
                        {product.material}
                      </td>

                      <td style={styles.dataTd}>
                        <span style={styles.regionPill}>
                          {product.region}
                        </span>
                      </td>

                      <td style={styles.dataTd}>
                        <span style={styles.giPill}>
                          {product.gi_status ||
                            "Not specified"}
                        </span>
                      </td>

                      <td
                        style={{
                          ...styles.dataTd,
                          textAlign: "center",
                        }}
                      >
                        <span
                          style={
                            neelamStatus === "Verified"
                              ? styles.verifiedBadge
                              : styles.pendingBadge
                          }
                        >
                          {neelamStatus === "Verified"
                            ? "✓ Verified"
                            : "Pending"}
                        </span>
                      </td>

                      <td
                        style={{
                          ...styles.dataTd,
                          fontWeight: 800,
                          whiteSpace: "nowrap",
                        }}
                      >
                        ₹
                        {Number(
                          product.price
                        ).toLocaleString("en-IN")}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div style={styles.tableFooter}>
          <span>
            Showing{" "}
            <strong>
              {filteredProducts.length}
            </strong>{" "}
            of{" "}
            <strong>{products.length}</strong>{" "}
            products
          </span>

          <span>
            Live data · NEELAM backend
          </span>
        </div>
      </section>
    </>
  );
}

/* ============================================================
   STORIES
============================================================ */

function StoriesPage({ products }) {
  return (
    <section style={styles.panel}>
      <div style={styles.panelHeader}>
        <div>
          <h2 style={styles.panelTitle}>
            Craft Stories
          </h2>

          <p style={styles.panelSubtitle}>
            Product narratives connected to the
            registered craft ecosystem.
          </p>
        </div>
      </div>

      <div style={styles.dataTableWrapper}>
        <table style={styles.dataTable}>
          <thead>
            <tr>
              <th style={styles.dataTh}>Name</th>
              <th style={styles.dataTh}>Product ID</th>
              <th style={styles.dataTh}>View</th>
              <th style={styles.dataTh}>Edit</th>
            </tr>
          </thead>

          <tbody>
            {products.map((product) => (
              <tr key={product.product_id}>
                <td style={styles.dataTd}>
                  <div style={styles.tableProductName}>
                    {product.name}
                  </div>

                  <div style={styles.tableProductId}>
                    {product.craft}
                  </div>
                </td>

                <td style={styles.dataTd}>
                  {product.product_id}
                </td>

                <td style={styles.dataTd}>
                  <button
                    style={styles.tableActionIcon}
                    title="View story"
                    aria-label={`View story for ${product.name}`}
                  >
                    ◉
                  </button>
                </td>

                <td style={styles.dataTd}>
                  <button
                    style={styles.tableActionIcon}
                    title="Edit story"
                    aria-label={`Edit story for ${product.name}`}
                  >
                    ✎
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

/* ============================================================
   SMALL COMPONENTS
============================================================ */

function ProductMetric({ label, value, text }) {
  return (
    <div style={styles.productSummaryCard}>
      <span style={styles.summaryAccent}>
        {label}
      </span>

      <div style={styles.productSummaryNumber}>
        {value}
      </div>

      <div style={styles.productSummaryLabel}>
        {text}
      </div>
    </div>
  );
}

function SortableHeader({
  label,
  field,
  sortField,
  sortDirection,
  onSort,
}) {
  const active = field === sortField;

  return (
    <th
      style={{
        ...styles.dataTh,
        cursor: "pointer",
      }}
      onClick={() => onSort(field)}
    >
      {label}

      <span
        style={
          active
            ? styles.sortActive
            : styles.sortInactive
        }
      >
        {active
          ? sortDirection === "asc"
            ? " ↑"
            : " ↓"
          : " ↕"}
      </span>
    </th>
  );
}

function StatCard({ title, value, icon }) {
  return (
    <div style={styles.statCard}>
      <div style={styles.statTop}>
        <div style={styles.statIcon}>
          {icon}
        </div>

        <span style={styles.statArrow}>
          →
        </span>
      </div>

      <div style={styles.statValue}>
        {value}
      </div>

      <div style={styles.statTitle}>
        {title}
      </div>
    </div>
  );
}

/* ============================================================
   STYLES
============================================================ */

const styles = {
  /* LOGIN */

  loginPage: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background:
      "radial-gradient(circle at 15% 10%, #ffffff 0%, transparent 32%), #f4eee2",
    fontFamily:
      "'Segoe UI', Arial, sans-serif",
    color: "#1e3348",
  },

  loginCard: {
    width: "390px",
    background: "#fffdf8",
    border: "1px solid #dfd5c4",
    borderRadius: "24px",
    padding: "42px",
    boxShadow:
      "0 28px 80px rgba(31,47,63,0.13)",
  },

  loginEyebrow: {
    color: "#6f93b5",
    fontSize: "10px",
    fontWeight: 800,
    letterSpacing: "2.5px",
  },

  loginTitle: {
    margin: "9px 0 0",
    color: "#1f2f3f",
    fontSize: "32px",
    letterSpacing: "4px",
    fontWeight: 800,
  },

  loginLogoWrap: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    margin: "12px 0 5px",
  },

  loginLogo: {
    width: "190px",
    maxWidth: "75%",
    height: "auto",
    objectFit: "contain",
    display: "block",
  },

  loginSubtitle: {
    color: "#78818a",
    margin: "7px 0 24px",
    fontSize: "13px",
  },

  loginRule: {
    height: "1px",
    background: "#e5dccd",
    marginBottom: "20px",
  },

  label: {
    display: "block",
    color: "#53606c",
    fontSize: "10px",
    fontWeight: 800,
    letterSpacing: "1px",
    marginTop: "16px",
    marginBottom: "7px",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    border: "1px solid #d8d2c7",
    background: "#fbfaf6",
    padding: "13px 14px",
    borderRadius: "10px",
    outline: "none",
    fontSize: "13px",
    color: "#24394d",
  },

  loginButton: {
    width: "100%",
    marginTop: "23px",
    padding: "14px",
    background: "#1f2f3f",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    fontWeight: 700,
    cursor: "pointer",
  },

  loginFooter: {
    textAlign: "center",
    marginTop: "22px",
    color: "#9b968d",
    fontSize: "10px",
  },

  errorBox: {
    padding: "11px 13px",
    background: "#fff2ef",
    border: "1px solid #eccbc4",
    color: "#984b42",
    borderRadius: "9px",
    marginTop: "14px",
    fontSize: "11px",
  },

  /* APP */

  app: {
    minHeight: "100vh",
    display: "flex",
    background: "#f5efe4",
    color: "#25384a",
    fontFamily:
      "'Segoe UI', Arial, sans-serif",
  },

  sidebar: {
    minHeight: "100vh",
    background: "#dce9f4",
    color: "#1f2f3f",
    padding: "20px 12px",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    flexShrink: 0,
    position: "relative",
    transition: "width 0.2s ease",
    borderRight: "1px solid #c8d9e7",
  },

  sidebarBrand: {
    display: "flex",
    alignItems: "center",
    gap: "11px",
    padding: "4px 7px",
    marginBottom: "34px",
  },

  brandLogo: {
    width: "40px",
    height: "40px",
    borderRadius: "11px",
    background: "#fffdf8",
    border: "1px solid #c8d9e7",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    flexShrink: 0,
  },

  brandLogoImage: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
    display: "block",
  },

  brandName: {
    fontSize: "15px",
    letterSpacing: "2px",
    fontWeight: 800,
  },

  brandSubtitle: {
    fontSize: "9px",
    color: "#718394",
    marginTop: "2px",
  },

  collapseButton: {
    position: "absolute",
    right: "-13px",
    top: "24px",
    width: "27px",
    height: "27px",
    borderRadius: "50%",
    border: "1px solid #c4d4e1",
    background: "#fffdf8",
    color: "#1f2f3f",
    cursor: "pointer",
    zIndex: 5,
  },

  navArea: {
    overflowY: "auto",
  },

  navGroup: {
    marginBottom: "23px",
  },

  sideLabel: {
    fontSize: "8px",
    letterSpacing: "1.7px",
    color: "#71889c",
    fontWeight: 800,
    padding: "0 10px",
    marginBottom: "7px",
  },

  navButton: {
    border: "none",
    background: "transparent",
    color: "#526a7d",
    textAlign: "left",
    padding: "10px 10px",
    borderRadius: "9px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "11px",
    fontSize: "12px",
    width: "100%",
    marginBottom: "2px",
  },

  navButtonActive: {
    background: "#fffdf8",
    color: "#1f2f3f",
    boxShadow:
      "0 2px 8px rgba(31,47,63,0.08)",
    fontWeight: 700,
  },

  navIcon: {
    width: "20px",
    textAlign: "center",
    fontSize: "13px",
  },

  sidebarBottom: {
    marginTop: "auto",
  },

  sidebarStatus: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "9px 10px",
    color: "#6f8090",
    fontSize: "9px",
    marginBottom: "8px",
  },

  onlineDot: {
    width: "7px",
    height: "7px",
    borderRadius: "50%",
    background: "#568a68",
  },

  logoutButton: {
    width: "100%",
    padding: "9px",
    borderRadius: "8px",
    background: "transparent",
    color: "#52697b",
    border: "1px solid #bfd1df",
    cursor: "pointer",
    fontSize: "11px",
  },

  /* MAIN */

  pageContent: {
    color: "#1f2f3f",
  },

  main: {
    flex: 1,
    minWidth: 0,
    maxWidth: "1500px",
    margin: "0 auto",
    padding: "30px 38px 50px",
    overflowX: "hidden",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "27px",
  },

  eyebrow: {
    fontSize: "9px",
    letterSpacing: "2px",
    color: "#6f93b5",
    fontWeight: 800,
  },

  pageTitle: {
    fontSize: "32px",
    margin: "7px 0 4px",
    color: "#1f2f3f",
    fontWeight: 800,
    letterSpacing: "-0.8px",
  },

  pageSubtitle: {
    margin: 0,
    color: "#7b817f",
    fontSize: "12px",
  },

  adminBadge: {
    display: "flex",
    alignItems: "center",
    gap: "9px",
    padding: "8px 11px",
    background: "#fffdf8",
    border: "1px solid #ded5c7",
    borderRadius: "12px",
    boxShadow:
      "0 3px 12px rgba(31,47,63,0.04)",
  },

  avatar: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    background: "#1f2f3f",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: "12px",
  },

  adminName: {
    fontSize: "11px",
    fontWeight: 800,
    color: "#26394b",
  },

  adminRole: {
    fontSize: "9px",
    color: "#899096",
    marginTop: "2px",
  },

  /* STATS */

  statsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(4, minmax(0, 1fr))",
    gap: "13px",
    marginBottom: "14px",
  },

  statCard: {
    background: "#fffdf8",
    border: "1px solid #e1d8ca",
    borderRadius: "14px",
    padding: "17px",
    minHeight: "122px",
    boxShadow:
      "0 3px 12px rgba(31,47,63,0.035)",
  },

  statTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  statIcon: {
    width: "32px",
    height: "32px",
    borderRadius: "9px",
    background: "#e6f0f7",
    color: "#527a9d",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "12px",
  },

  statArrow: {
    color: "#a5aaa9",
    fontSize: "14px",
  },

  statValue: {
    fontSize: "29px",
    color: "#1f2f3f",
    fontWeight: 800,
    marginTop: "19px",
  },

  statTitle: {
    marginTop: "2px",
    color: "#858b8c",
    fontSize: "10px",
  },

  /* PANELS */

  panel: {
    background: "#fffdf8",
    border: "1px solid #e1d8ca",
    borderRadius: "15px",
    padding: "19px",
    marginBottom: "14px",
    boxShadow:
      "0 3px 12px rgba(31,47,63,0.035)",
  },

  panelHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "15px",
  },

  panelTitle: {
    margin: 0,
    fontSize: "15px",
    fontWeight: 800,
    color: "#24394d",
  },

  panelSubtitle: {
    margin: "4px 0 0",
    fontSize: "10px",
    color: "#8c918f",
  },

  visualGrid: {
    display: "grid",
    gridTemplateColumns: "0.9fr 1.1fr",
    gap: "14px",
    alignItems: "start",
  },

  verificationLayout: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "24px",
    padding: "10px 5px 4px",
  },

  ring: {
    width: "116px",
    height: "116px",
    borderRadius: "50%",
    background:
      "conic-gradient(#6f93b5 0deg, #6f93b5 270deg, #dce9f4 270deg)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  ringInner: {
    width: "84px",
    height: "84px",
    borderRadius: "50%",
    background: "#fffdf8",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    color: "#1f2f3f",
  },

  verificationStats: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(82px, 1fr))",
    gap: "9px",
  },

  verificationStatCard: {
    minWidth: "82px",
    padding: "12px 10px",
    background: "#f7f4ee",
    border: "1px solid #e6ded2",
    borderRadius: "10px",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    gap: "3px",
  },

  barChart: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    paddingTop: "3px",
  },

  barRow: {
    display: "grid",
    gridTemplateColumns:
      "120px 1fr 22px",
    gap: "9px",
    alignItems: "center",
  },

  barLabel: {
    fontSize: "10px",
    color: "#65727b",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },

  barTrack: {
    height: "9px",
    background: "#e8e3da",
    borderRadius: "99px",
    overflow: "hidden",
  },

  barFill: {
    height: "100%",
    background: "#6f93b5",
    borderRadius: "99px",
  },

  barValue: {
    fontSize: "10px",
    fontWeight: 800,
    color: "#34495b",
    textAlign: "right",
  },

  /* BADGES */

  verifiedBadge: {
    display: "inline-flex",
    padding: "5px 8px",
    borderRadius: "999px",
    background: "#e8f2ea",
    color: "#3d7350",
    fontSize: "9px",
    fontWeight: 800,
  },

  pendingBadge: {
    display: "inline-flex",
    padding: "5px 8px",
    borderRadius: "999px",
    background: "#f8edd9",
    color: "#946b29",
    fontSize: "9px",
    fontWeight: 800,
  },

  neutralBadge: {
    display: "inline-flex",
    padding: "5px 8px",
    borderRadius: "999px",
    background: "#e9f0f5",
    color: "#54728c",
    fontSize: "9px",
    fontWeight: 700,
  },

  countBadge: {
    padding: "5px 8px",
    background: "#e7eff5",
    borderRadius: "999px",
    color: "#55758f",
    fontSize: "9px",
    fontWeight: 800,
  },

  /* TABLE */

  dataTableWrapper: {
    overflowX: "auto",
    border: "1px solid #e4ddd2",
    borderRadius: "9px",
  },

  dataTable: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "850px",
  },

  dataTh: {
    textAlign: "center",
    padding: "11px 12px",
    background: "#f1f5f7",
    borderBottom: "1px solid #dce3e7",
    fontSize: "8px",
    color: "#1f2f3f",
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: "0.8px",
    whiteSpace: "nowrap",
    userSelect: "none",
  },

  dataTd: {
    padding: "12px",
    borderBottom: "1px solid #eee9e0",
    fontSize: "10px",
    color: "#52606a",
    whiteSpace: "nowrap",
  },

  dataRow: {
    transition: "background 0.15s ease",
  },

  tableProductName: {
    fontWeight: 800,
    color: "#293e50",
  },

  tableProductId: {
    fontSize: "8px",
    color: "#9b9f9f",
    marginTop: "3px",
    letterSpacing: "0.2px",
  },

  regionPill: {
    padding: "4px 7px",
    borderRadius: "6px",
    background: "#eaf1f5",
    color: "#58748a",
    fontSize: "9px",
  },

  giPill: {
    padding: "4px 7px",
    borderRadius: "6px",
    background: "#f0eadd",
    color: "#746b5d",
    fontSize: "8px",
  },

  tableFooter: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "11px",
    fontSize: "9px",
    color: "#969994",
  },

  /* PRODUCTS */

  productTopGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(3, minmax(0, 1fr))",
    gap: "13px",
    marginBottom: "14px",
  },

  productSummaryCard: {
    background: "#fffdf8",
    border: "1px solid #e1d8ca",
    borderRadius: "13px",
    padding: "16px 18px",
    boxShadow:
      "0 3px 12px rgba(31,47,63,0.035)",
  },

  summaryAccent: {
    fontSize: "8px",
    letterSpacing: "1.6px",
    color: "#6f93b5",
    fontWeight: 800,
  },

  productSummaryNumber: {
    fontSize: "27px",
    color: "#1f2f3f",
    fontWeight: 800,
    marginTop: "8px",
  },

  productSummaryLabel: {
    fontSize: "9px",
    color: "#8b908e",
    marginTop: "2px",
  },

  toolbar: {
    display: "flex",
    gap: "8px",
    marginBottom: "13px",
    flexWrap: "wrap",
  },

  searchBox: {
    flex: 1,
    minWidth: "260px",
    display: "flex",
    alignItems: "center",
    border: "1px solid #dcd7ce",
    background: "#fbfaf6",
    borderRadius: "8px",
    padding: "0 10px",
  },

  searchIcon: {
    color: "#89959c",
    fontSize: "15px",
    marginRight: "6px",
  },

  searchInput: {
    width: "100%",
    border: "none",
    background: "transparent",
    outline: "none",
    padding: "10px 0",
    fontSize: "10px",
    color: "#293d4e",
  },

  select: {
    border: "1px solid #dcd7ce",
    background: "#fbfaf6",
    borderRadius: "8px",
    padding: "0 10px",
    fontSize: "9px",
    color: "#62717a",
    minWidth: "125px",
    outline: "none",
  },

  exportButton: {
    border: "none",
    background: "#1f2f3f",
    color: "#fff",
    padding: "9px 12px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "9px",
    fontWeight: 800,
  },

  sortActive: {
    color: "#1f2f3f",
    fontWeight: 900,
  },

  sortInactive: {
    color: "#aeb5b8",
  },

  noResults: {
    padding: "38px",
    textAlign: "center",
    color: "#999d9b",
    fontSize: "11px",
  },

  tableAction: {
    border: "1px solid #c9d8e2",
    background: "#edf4f8",
    color: "#52718b",
    borderRadius: "6px",
    padding: "5px 9px",
    fontSize: "9px",
    cursor: "pointer",
  },

  productImageButton: {
    width: "48px",
    height: "48px",
    border: "1px solid #d9e1e6",
    background: "#f4f7f8",
    borderRadius: "8px",
    padding: "3px",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  productImageThumb: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    borderRadius: "5px",
    display: "block",
  },

  imageFallback: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    color: "#6f93b5",
    fontSize: "18px",
    fontWeight: 800,
  },

  productIdCell: {
    fontFamily: "monospace",
    fontSize: "9px",
    color: "#526a7a",
    fontWeight: 700,
    whiteSpace: "nowrap",
  },

  tableActionIcon: {
    width: "30px",
    height: "30px",
    border: "1px solid #c9d8e2",
    background: "#edf4f8",
    color: "#304f68",
    borderRadius: "7px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
    fontWeight: 800,
    cursor: "pointer",
  },

  /* MISC */

  loading: {
    padding: "80px",
    textAlign: "center",
    color: "#7f898d",
    fontSize: "12px",
  },

  loadingDot: {
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    background: "#6f93b5",
    margin: "0 auto 12px",
  },

  emptyState: {
    padding: "20px",
    color: "#999d9b",
    fontSize: "10px",
  },
};

export default App;