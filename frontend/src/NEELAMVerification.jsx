import { useEffect, useMemo, useState } from "react";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

function NEELAMVerification() {
  const [records, setRecords] = useState([]);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadRecords();
  }, []);

  async function loadRecords(selectProductId = null) {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("admin_token");

      const response = await fetch(`${API_BASE_URL}/admin/neelam`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        throw new Error("Admin session expired. Please log in again.");
      }

      if (!response.ok) {
        throw new Error("Unable to load NEELAM tag records.");
      }

      const data = await response.json();
      const nextRecords = data.records || [];

      setRecords(nextRecords);

      if (nextRecords.length > 0) {
        const nextSelected =
          nextRecords.find(
            (record) => record.product_id === selectProductId
          ) || nextRecords[0];

        await selectRecord(nextSelected, nextRecords);
      } else {
        setSelected(null);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function selectRecord(record) {
    setMessage("");
    setError("");

    try {
      const token = localStorage.getItem("admin_token");

      const response = await fetch(
        `${API_BASE_URL}/admin/neelam/${record.product_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Unable to load tag details.");
      }

      const data = await response.json();

      setSelected({
        ...record,
        detail: data,
      });
    } catch (err) {
      setError(err.message);
    }
  }

  async function approveTag(productId) {
    const confirmed = window.confirm(
      "Approve this NEELAM tag for the selected product?"
    );

    if (!confirmed) return;

    try {
      setApproving(true);
      setError("");
      setMessage("");

      const token = localStorage.getItem("admin_token");

      const response = await fetch(
        `${API_BASE_URL}/admin/neelam/${productId}/approve`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Unable to approve NEELAM tag."
        );
      }

      setMessage("NEELAM tag approved successfully.");
      await loadRecords(productId);
    } catch (err) {
      setError(err.message);
    } finally {
      setApproving(false);
    }
  }

  const filteredRecords = useMemo(() => {
    const query = search.trim().toLowerCase();

    return records.filter((record) => {
      const matchesSearch =
        !query ||
        record.product_id?.toLowerCase().includes(query) ||
        record.neelam_id?.toLowerCase().includes(query) ||
        record.product?.toLowerCase().includes(query) ||
        record.artisan?.toLowerCase().includes(query) ||
        record.artisan_id?.toLowerCase().includes(query) ||
        record.craft?.toLowerCase().includes(query) ||
        record.region?.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "All" ||
        record.tag_status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [records, search, statusFilter]);

  const approvedCount = records.filter(
    (record) => record.tag_status === "Approved"
  ).length;

  const pendingCount = records.filter(
    (record) => record.tag_status === "Pending Review"
  ).length;

  const verifiedCount = records.filter((record) => {
    const value =
      record.provenance_valid ??
      record.detail?.neelam?.provenance_valid;
    return value === true;
  }).length;

  if (loading) {
    return (
      <div style={styles.loading}>
        Loading NEELAM verification records...
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <section style={styles.summaryGrid}>
        <SummaryCard
          label="NEELAM RECORDS"
          value={records.length}
          text="Registered product identities"
        />
        <SummaryCard
          label="VERIFIED"
          value={verifiedCount}
          text="Valid provenance chains"
        />
        <SummaryCard
          label="PENDING REVIEW"
          value={pendingCount}
          text={`${approvedCount} approved NEELAM tags`}
        />
      </section>

      {error && <div style={styles.error}>{error}</div>}
      {message && <div style={styles.success}>{message}</div>}

      <section style={styles.workspace}>
        <div style={styles.registryPanel}>
          <div style={styles.panelHeader}>
            <div>
              <div style={styles.eyebrow}>
                NEELAM / IDENTITY & VERIFICATION
              </div>
              <h2 style={styles.title}>NEELAM Registry</h2>
              <p style={styles.subtitle}>
                Review product identity, provenance and approval status.
              </p>
            </div>

            <span style={styles.countBadge}>
              {filteredRecords.length} Records
            </span>
          </div>

          <div style={styles.toolbar}>
            <input
              style={styles.search}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search product, artisan, ID..."
            />

            <select
              style={styles.select}
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="All">All statuses</option>
              <option value="Pending Review">Pending Review</option>
              <option value="Approved">Approved</option>
            </select>
          </div>

          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Product</th>
                  <th style={styles.th}>Artisan ID</th>
                  <th style={styles.th}>Region</th>
                  <th style={styles.th}>Status</th>
                </tr>
              </thead>

              <tbody>
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={styles.emptyCell}>
                      No matching NEELAM records.
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((record) => {
                    const active =
                      selected?.product_id === record.product_id;

                    return (
                      <tr
                        key={record.product_id}
                        onClick={() => selectRecord(record)}
                        style={{
                          ...styles.row,
                          ...(active ? styles.rowActive : {}),
                        }}
                      >
                        <td style={styles.td}>
                          <div style={styles.productName}>
                            {record.product}
                          </div>
                          <div style={styles.productId}>
                            {record.product_id}
                          </div>
                        </td>

                        <td style={styles.td}>
                          <div style={styles.idText}>
                            {record.artisan_id}
                          </div>
                          <div style={styles.artisanName}>
                            {record.artisan}
                          </div>
                        </td>

                        <td style={styles.td}>{record.region}</td>

                        <td style={styles.td}>
                          <StatusBadge status={record.tag_status} />
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
              Showing <strong>{filteredRecords.length}</strong> of{" "}
              <strong>{records.length}</strong>
            </span>
            <span>Live NEELAM data</span>
          </div>
        </div>

        <div style={styles.reviewPanel}>
          {!selected ? (
            <div style={styles.emptyReview}>
              Select a product from the registry to review its NEELAM
              identity.
            </div>
          ) : (
            <ReviewPanel
              record={selected}
              onApprove={approveTag}
              approving={approving}
            />
          )}
        </div>
      </section>
    </div>
  );
}

function ReviewPanel({ record, onApprove, approving }) {
  const detail = record.detail || {};
  const product = detail.product || record;
  const artisan = detail.artisan || {};
  const gi = detail.gi || {};
  const neelam = detail.neelam || {};

  const provenanceValid =
    neelam.provenance_valid ??
    record.provenance_valid ??
    false;

  const eventsVerified =
    neelam.events_verified ??
    record.events_verified ??
    0;

  const isApproved = record.tag_status === "Approved";

  return (
    <>
      <div style={styles.reviewHeader}>
        <div>
          <div style={styles.eyebrow}>
            NEELAM DIGITAL IDENTITY
          </div>
          <h2 style={styles.reviewTitle}>
            {product.name || record.product}
          </h2>
          <div style={styles.reviewId}>
            {record.neelam_id}
          </div>
        </div>

        <StatusBadge
          status={isApproved ? "Approved" : "Pending Review"}
          large
        />
      </div>

      <div style={styles.block}>
        <div style={styles.blockTitle}>PRODUCT IDENTITY</div>

        <div style={styles.detailGrid}>
          <Detail label="Product ID" value={product.product_id} />
          <Detail label="NEELAM ID" value={record.neelam_id} />
          <Detail
            label="Craft"
            value={product.craft || record.craft}
          />
          <Detail
            label="Material"
            value={product.material || record.material}
          />
          <Detail
            label="Region"
            value={product.region || record.region}
          />
          <Detail
            label="Price"
            value={
              product.price
                ? `₹${Number(product.price).toLocaleString("en-IN")}`
                : "Not available"
            }
          />
        </div>
      </div>

      <div style={styles.block}>
        <div style={styles.blockTitle}>ARTISAN</div>

        <div style={styles.artisanBox}>
          <div>
            <div style={styles.artisanMain}>
              {artisan.name || record.artisan}
            </div>
            <div style={styles.artisanSub}>
              {artisan.artisan_id || record.artisan_id}
            </div>
          </div>

          <div>
            <div style={styles.artisanLabel}>LANGUAGE</div>
            <div style={styles.artisanValue}>
              {artisan.language || "Not available"}
            </div>
          </div>

          <div>
            <div style={styles.artisanLabel}>REGION</div>
            <div style={styles.artisanValue}>
              {artisan.region || record.region}
            </div>
          </div>
        </div>
      </div>

      <div style={styles.block}>
        <div style={styles.blockTitle}>GI INFORMATION</div>

        <div style={styles.infoStrip}>
          <span>GI status</span>
          <strong>
            {gi.status || record.gi_status || "Not available"}
          </strong>
        </div>
      </div>

      <div style={styles.block}>
        <div style={styles.blockTitle}>PROVENANCE CHECK</div>

        <div style={styles.provenanceGrid}>
          <div style={styles.provenanceCard}>
            <div
              style={{
                ...styles.provenanceValue,
                color: provenanceValid ? "#327044" : "#9b6a17",
              }}
            >
              {provenanceValid ? "VALID" : "PENDING"}
            </div>
            <div style={styles.provenanceLabel}>
              Hash-chain status
            </div>
          </div>

          <div style={styles.provenanceCard}>
            <div style={styles.provenanceValue}>
              {eventsVerified}
            </div>
            <div style={styles.provenanceLabel}>
              Events verified
            </div>
          </div>
        </div>
      </div>

      <div style={styles.identityMessage}>
        <div style={styles.messageIcon}>◆</div>
        <div>
          <div style={styles.messageTitle}>
            NEELAM Digital Identity
          </div>
          <div style={styles.messageText}>
            This record connects the product with its artisan, craft,
            origin, GI information and provenance history.
          </div>
        </div>
      </div>

      <div style={styles.approvalArea}>
        <div>
          <div style={styles.approvalTitle}>NEELAM TAG</div>
          <div style={styles.approvalText}>
            {isApproved
              ? "This tag has been approved and the approval has been recorded in the provenance history."
              : "Review the product, artisan, GI information and provenance before approving the tag."}
          </div>
        </div>

        {!isApproved && (
          <button
            style={styles.approveButton}
            onClick={() => onApprove(record.product_id)}
            disabled={approving}
          >
            {approving
              ? "Approving..."
              : "✓ Approve NEELAM Tag"}
          </button>
        )}
      </div>
    </>
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

function StatusBadge({ status, large = false, compact = false }) {
  const approved = status === "Approved" || status === "Verified";

  return (
    <span
      style={
        approved
          ? large
            ? styles.verifiedLarge
            : compact
            ? styles.verifiedBadgeCompact
            : styles.verifiedBadge
          : large
          ? styles.pendingLarge
          : styles.pendingBadge
      }
    >
      {status === "Verified"
        ? "✓ Verified"
        : approved
        ? "✓ Approved"
        : "Pending Review"}
    </span>
  );
}

function Detail({ label, value }) {
  return (
    <div style={styles.detailBox}>
      <div style={styles.detailLabel}>{label}</div>
      <div style={styles.detailValue}>
        {value || "Not available"}
      </div>
    </div>
  );
}

const styles = {
  page: {
    color: "#1f2f3f",
  },

  loading: {
    padding: "60px",
    textAlign: "center",
    color: "#8c867e",
    fontSize: "12px",
  },

  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "15px",
    marginBottom: "16px",
  },

  summaryCard: {
    background: "#ffffff",
    border: "1px solid #e4e0d8",
    borderRadius: "15px",
    padding: "18px 19px",
  },

  summaryLabel: {
    fontSize: "9px",
    letterSpacing: "1.5px",
    color: "#334b5d",
    fontWeight: 800,
  },

  summaryNumber: {
    fontSize: "28px",
    fontWeight: 800,
    marginTop: "10px",
    color: "#172b3a",
  },

  summaryText: {
    fontSize: "10px",
    color: "#667681",
    marginTop: "3px",
  },

  error: {
    padding: "12px",
    marginBottom: "15px",
    borderRadius: "9px",
    background: "#fff2f0",
    border: "1px solid #efc8c2",
    color: "#98483f",
    fontSize: "11px",
  },

  success: {
    padding: "12px",
    marginBottom: "15px",
    borderRadius: "9px",
    background: "#eef7ef",
    border: "1px solid #cce3ce",
    color: "#397247",
    fontSize: "11px",
  },

  workspace: {
    display: "grid",
    gridTemplateColumns: "1.15fr 1fr",
    gap: "15px",
    alignItems: "start",
  },

  registryPanel: {
    background: "#ffffff",
    border: "1px solid #e4e0d8",
    borderRadius: "17px",
    padding: "20px",
    minWidth: 0,
  },

  reviewPanel: {
    background: "#ffffff",
    border: "1px solid #e4e0d8",
    borderRadius: "17px",
    padding: "20px",
    minWidth: 0,
  },

  panelHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "17px",
  },

  eyebrow: {
    fontSize: "9px",
    letterSpacing: "1.5px",
    color: "#5c7486",
    fontWeight: 800,
  },

  title: {
    margin: "6px 0 4px",
    fontSize: "18px",
    fontWeight: 800,
    color: "#172b3a",
  },

  subtitle: {
    margin: 0,
    color: "#5f6f7d",
    fontSize: "10px",
  },

  countBadge: {
    padding: "6px 9px",
    borderRadius: "999px",
    background: "#f2f0eb",
    color: "#334b5d",
    fontSize: "10px",
    fontWeight: 800,
  },

  toolbar: {
    display: "flex",
    gap: "9px",
    marginBottom: "14px",
  },

  search: {
    flex: 1,
    minWidth: 0,
    border: "1px solid #dfdbd3",
    background: "#faf9f6",
    padding: "11px",
    borderRadius: "8px",
    outline: "none",
    fontSize: "10px",
    color: "#334b5d",
  },

  select: {
    border: "1px solid #dfdbd3",
    background: "#faf9f6",
    borderRadius: "8px",
    padding: "0 10px",
    fontSize: "10px",
    color: "#334b5d",
    outline: "none",
  },

  tableWrapper: {
    border: "1px solid #e7e3dc",
    borderRadius: "10px",
    overflow: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "720px",
  },

  th: {
    textAlign: "center",
    padding: "11px",
    background: "#f1ede5",
    borderBottom: "1px solid #e5e1da",
    fontSize: "9px",
    color: "#334b5d",
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: "0.7px",
    whiteSpace: "nowrap",
  },

  td: {
    padding: "12px 11px",
    borderBottom: "1px solid #eeeae4",
    fontSize: "10px",
    color: "#334b5d",
    verticalAlign: "top",
  },

  row: {
    cursor: "pointer",
    background: "#ffffff",
  },

  rowActive: {
    background: "#f6f3ed",
  },

  productName: {
    fontWeight: 700,
    color: "#292621",
  },

  productId: {
    marginTop: "3px",
    fontSize: "8px",
    color: "#71808b",
  },

  artisanName: {
    marginTop: "3px",
    color: "#596d7a",
    fontSize: "9px",
  },

  idText: {
    fontSize: "9px",
    color: "#526a7a",
  },

  tableFooter: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "11px",
    color: "#526a7a",
    fontSize: "9px",
  },

  emptyCell: {
    padding: "38px",
    textAlign: "center",
    color: "#667681",
    fontSize: "10px",
  },

  verifiedBadge: {
    display: "inline-flex",
    padding: "5px 8px",
    background: "#e9f4eb",
    color: "#327044",
    borderRadius: "999px",
    fontSize: "9px",
    fontWeight: 700,
    whiteSpace: "nowrap",
  },

  verifiedBadgeCompact: {
    display: "inline-flex",
    padding: "5px 8px",
    background: "#e9f4eb",
    color: "#327044",
    borderRadius: "999px",
    fontSize: "9px",
    fontWeight: 700,
    whiteSpace: "nowrap",
  },

  pendingBadge: {
    display: "inline-flex",
    padding: "5px 8px",
    background: "#fff3dc",
    color: "#9b6a17",
    borderRadius: "999px",
    fontSize: "9px",
    fontWeight: 700,
    whiteSpace: "nowrap",
  },

  verifiedLarge: {
    display: "inline-flex",
    padding: "7px 10px",
    background: "#e9f4eb",
    color: "#327044",
    borderRadius: "999px",
    fontSize: "10px",
    fontWeight: 700,
    whiteSpace: "nowrap",
  },

  pendingLarge: {
    display: "inline-flex",
    padding: "7px 10px",
    background: "#fff3dc",
    color: "#9b6a17",
    borderRadius: "999px",
    fontSize: "10px",
    fontWeight: 700,
    whiteSpace: "nowrap",
  },

  reviewHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: "15px",
    alignItems: "flex-start",
    paddingBottom: "17px",
    borderBottom: "1px solid #ece8e1",
    marginBottom: "18px",
  },

  reviewTitle: {
    fontSize: "20px",
    margin: "6px 0 4px",
    lineHeight: 1.2,
    color: "#172b3a",
  },

  reviewId: {
    color: "#526a7a",
    fontSize: "9px",
    fontWeight: 600,
  },

  block: {
    paddingBottom: "16px",
    marginBottom: "16px",
    borderBottom: "1px solid #eeeae4",
  },

  blockTitle: {
    fontSize: "9px",
    color: "#334b5d",
    letterSpacing: "1.2px",
    fontWeight: 800,
    marginBottom: "10px",
  },

  detailGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "8px",
  },

  detailBox: {
    background: "#faf9f7",
    border: "1px solid #eeeae3",
    borderRadius: "8px",
    padding: "10px",
  },

  detailLabel: {
    color: "#526a7a",
    fontSize: "8px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    fontWeight: 800,
  },

  detailValue: {
    color: "#334b5d",
    fontSize: "10px",
    fontWeight: 600,
    marginTop: "4px",
  },

  artisanBox: {
    display: "grid",
    gridTemplateColumns: "1.4fr 1fr 1fr",
    gap: "10px",
    background: "#faf9f7",
    border: "1px solid #eeeae3",
    borderRadius: "9px",
    padding: "12px",
    alignItems: "center",
  },

  artisanMain: {
    fontSize: "11px",
    fontWeight: 700,
    color: "#334b5d",
  },

  artisanSub: {
    marginTop: "3px",
    color: "#667681",
    fontSize: "9px",
  },

  artisanLabel: {
    color: "#526a7a",
    fontSize: "8px",
    letterSpacing: "0.8px",
    fontWeight: 800,
  },

  artisanValue: {
    color: "#334b5d",
    fontSize: "10px",
    marginTop: "4px",
  },

  infoStrip: {
    display: "flex",
    justifyContent: "space-between",
    background: "#faf9f7",
    borderRadius: "9px",
    border: "1px solid #eeeae3",
    padding: "11px 12px",
    fontSize: "10px",
    color: "#526a7a",
  },

  provenanceGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "8px",
  },

  provenanceCard: {
    background: "#faf9f7",
    border: "1px solid #eeeae3",
    borderRadius: "9px",
    padding: "12px",
  },

  provenanceValue: {
    fontSize: "16px",
    fontWeight: 800,
    color: "#172b3a",
  },

  provenanceLabel: {
    marginTop: "3px",
    fontSize: "9px",
    color: "#61727e",
  },

  identityMessage: {
    display: "flex",
    gap: "12px",
    marginBottom: "16px",
    padding: "14px",
    borderRadius: "10px",
    background: "#f3f0e9",
  },

  messageIcon: {
    width: "31px",
    height: "31px",
    borderRadius: "9px",
    background: "#22201d",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  messageTitle: {
    fontWeight: 800,
    fontSize: "11px",
    color: "#172b3a",
  },

  messageText: {
    fontSize: "9px",
    lineHeight: "1.5",
    color: "#566975",
    marginTop: "3px",
  },

  approvalArea: {
    background: "#f4f1e9",
    borderRadius: "11px",
    padding: "14px",
  },

  approvalTitle: {
    fontSize: "9px",
    letterSpacing: "1px",
    fontWeight: 800,
    color: "#334b5d",
  },

  approvalText: {
    fontSize: "9px",
    lineHeight: 1.55,
    color: "#566975",
    marginTop: "4px",
  },

  approveButton: {
    width: "100%",
    marginTop: "13px",
    padding: "12px",
    border: "none",
    borderRadius: "8px",
    background: "#1b1b1b",
    color: "#ffffff",
    fontWeight: 700,
    fontSize: "11px",
    cursor: "pointer",
  },

  emptyReview: {
    padding: "80px 20px",
    textAlign: "center",
    color: "#667681",
    fontSize: "11px",
  },
};

export default NEELAMVerification;
