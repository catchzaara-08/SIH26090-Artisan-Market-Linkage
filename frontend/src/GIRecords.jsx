import { useEffect, useMemo, useState } from "react";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

function GIRecords() {
  const [records, setRecords] = useState([]);
  const [search, setSearch] = useState("");
  const [stateFilter, setStateFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchGIRecords();
  }, []);

  const fetchGIRecords = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/gi/`);

      if (!response.ok) {
        throw new Error(`Failed to load GI records (${response.status})`);
      }

      const data = await response.json();

      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.records)
        ? data.records
        : Array.isArray(data?.items)
        ? data.items
        : Array.isArray(data?.data)
        ? data.data
        : [];

      setRecords(list);
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to load GI records.");
    } finally {
      setLoading(false);
    }
  };

  const states = useMemo(() => {
    const values = records
      .map((record) => record?.state)
      .filter(Boolean);

    return ["All", ...Array.from(new Set(values)).sort()];
  }, [records]);

  const statuses = useMemo(() => {
    const values = records
      .map((record) => record?.status)
      .filter(Boolean);

    return ["All", ...Array.from(new Set(values)).sort()];
  }, [records]);

  const filteredRecords = useMemo(() => {
    const query = search.trim().toLowerCase();

    return records.filter((record) => {
      const matchesSearch =
        !query ||
        [
          record?.gi_id,
          record?.name,
          record?.craft,
          record?.state,
          record?.status,
        ]
          .filter(Boolean)
          .some((value) =>
            String(value).toLowerCase().includes(query)
          );

      const matchesState =
        stateFilter === "All" ||
        record?.state === stateFilter;

      const matchesStatus =
        statusFilter === "All" ||
        record?.status === statusFilter;

      return matchesSearch && matchesState && matchesStatus;
    });
  }, [records, search, stateFilter, statusFilter]);

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <div style={styles.eyebrow}>CRAFT REFERENCE DATA</div>

          <h2 style={styles.title}>GI Records</h2>

          <p style={styles.description}>
            Geographical indication records used as the reference layer
            for craft and product verification.
          </p>
        </div>

        <button style={styles.refreshButton} onClick={fetchGIRecords}>
          ↻ Refresh
        </button>
      </div>

      <div style={styles.summaryGrid}>
        <div style={styles.summaryCard}>
          <span style={styles.summaryLabel}>TOTAL GI RECORDS</span>
          <strong style={styles.summaryValue}>
            {records.length}
          </strong>
        </div>

        <div style={styles.summaryCard}>
          <span style={styles.summaryLabel}>VISIBLE RECORDS</span>
          <strong style={styles.summaryValue}>
            {filteredRecords.length}
          </strong>
        </div>

        <div style={styles.summaryCard}>
          <span style={styles.summaryLabel}>STATES</span>
          <strong style={styles.summaryValue}>
            {Math.max(states.length - 1, 0)}
          </strong>
        </div>
      </div>

      <div style={styles.toolbar}>
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search GI, craft, state..."
          style={styles.search}
        />

        <select
          value={stateFilter}
          onChange={(event) =>
            setStateFilter(event.target.value)
          }
          style={styles.select}
        >
          {states.map((state) => (
            <option key={state}>{state}</option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(event.target.value)
          }
          style={styles.select}
        >
          {statuses.map((status) => (
            <option key={status}>{status}</option>
          ))}
        </select>
      </div>

      {loading && (
        <div style={styles.message}>
          Loading GI records...
        </div>
      )}

      {error && (
        <div style={styles.error}>
          {error}
        </div>
      )}

      {!loading && !error && (
        <div style={styles.tableCard}>
          <div style={styles.tableMeta}>
            <span>
              Showing <strong>{filteredRecords.length}</strong> records
            </span>

            <span style={styles.metaRight}>
              Live backend data
            </span>
          </div>

          <div style={styles.tableScroll}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>GI ID</th>
                  <th style={styles.th}>Name</th>
                  <th style={styles.th}>Craft</th>
                  <th style={styles.th}>State</th>
                  <th style={styles.th}>Status</th>
                </tr>
              </thead>

              <tbody>
                {filteredRecords.map((record, index) => (
                  <tr
                    key={
                      record?.gi_id ||
                      `${record?.name}-${index}`
                    }
                  >
                    <td style={styles.tdMono}>
                      {record?.gi_id || "—"}
                    </td>

                    <td style={styles.tdStrong}>
                      {record?.name || "—"}
                    </td>

                    <td style={styles.td}>
                      {record?.craft || "—"}
                    </td>

                    <td style={styles.td}>
                      {record?.state || "—"}
                    </td>

                    <td style={styles.td}>
                      <span style={styles.pill}>
                        {record?.status || "—"}
                      </span>
                    </td>
                  </tr>
                ))}

                {filteredRecords.length === 0 && (
                  <tr>
                    <td
                      colSpan="5"
                      style={styles.emptyCell}
                    >
                      No matching GI records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  page: {
    color: "#1f2f3f",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: "20px",
    marginBottom: "22px",
  },

  eyebrow: {
    fontSize: "9px",
    letterSpacing: "0.17em",
    color: "#8e8a80",
    fontWeight: 700,
    marginBottom: "6px",
  },

  title: {
    margin: 0,
    fontSize: "28px",
    letterSpacing: "-0.04em",
  },

  description: {
    margin: "7px 0 0",
    color: "#817c73",
    fontSize: "12px",
  },

  refreshButton: {
    border: "1px solid #d3cdc2",
    background: "#fbfaf6",
    borderRadius: "7px",
    padding: "9px 13px",
    cursor: "pointer",
    fontSize: "11px",
  },

  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "14px",
    marginBottom: "18px",
  },

  summaryCard: {
    background: "#fbfaf6",
    border: "1px solid #ded8cd",
    borderRadius: "10px",
    padding: "18px",
  },

  summaryLabel: {
    display: "block",
    fontSize: "9px",
    letterSpacing: "0.08em",
    color: "#817b72",
    fontWeight: 700,
  },

  summaryValue: {
    display: "block",
    fontSize: "27px",
    marginTop: "12px",
    letterSpacing: "-0.04em",
  },

  toolbar: {
    display: "flex",
    gap: "9px",
    flexWrap: "wrap",
    marginBottom: "15px",
  },

  search: {
    flex: "1 1 280px",
    border: "1px solid #d7d1c6",
    background: "#fbfaf6",
    borderRadius: "7px",
    padding: "10px 12px",
    fontSize: "11px",
    outline: "none",
  },

  select: {
    border: "1px solid #d7d1c6",
    background: "#fbfaf6",
    borderRadius: "7px",
    padding: "10px 11px",
    fontSize: "11px",
    color: "#44413b",
  },

  tableCard: {
    border: "1px solid #ddd7cd",
    borderRadius: "11px",
    background: "#fbfaf6",
    overflow: "hidden",
  },

  tableMeta: {
    padding: "12px 16px",
    borderBottom: "1px solid #e7e2d8",
    display: "flex",
    justifyContent: "space-between",
    fontSize: "10px",
    color: "#858078",
  },

  metaRight: {
    fontStyle: "italic",
  },

  tableScroll: {
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "700px",
  },

  th: {
    textAlign: "center",
    fontSize: "9px",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "#334b5d",
    fontWeight: 800,
    background: "#f1ede5",
    borderBottom: "1px solid #ddd7cc",
    padding: "12px 14px",
  },

  td: {
    padding: "13px 14px",
    borderBottom: "1px solid #ebe6dd",
    fontSize: "11px",
    color: "#5f5a52",
  },

  tdStrong: {
    padding: "13px 14px",
    borderBottom: "1px solid #ebe6dd",
    fontSize: "11px",
    color: "#1f2f3f",
    fontWeight: 800,
  },

  tdMono: {
    padding: "13px 14px",
    borderBottom: "1px solid #ebe6dd",
    fontSize: "10px",
    color: "#334b5d",
    fontWeight: 700,
    fontFamily:
      "ui-monospace, SFMono-Regular, Menlo, monospace",
  },

  pill: {
    display: "inline-flex",
    padding: "5px 8px",
    borderRadius: "999px",
    background: "#e8eef3",
    color: "#294b63",
    fontSize: "9px",
    fontWeight: 700,
  },

  emptyCell: {
    textAlign: "center",
    padding: "35px",
    color: "#8c867d",
    fontSize: "11px",
  },

  message: {
    background: "#fbfaf6",
    border: "1px solid #ded8cd",
    borderRadius: "10px",
    padding: "25px",
    textAlign: "center",
    fontSize: "11px",
    color: "#807a71",
  },

  error: {
    background: "#f2e7df",
    border: "1px solid #ddcabe",
    borderRadius: "8px",
    padding: "12px",
    color: "#714c3a",
    fontSize: "11px",
  },
};

export default GIRecords;