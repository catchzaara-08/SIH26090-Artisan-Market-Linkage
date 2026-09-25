import { useEffect, useMemo, useState } from "react";

const API_BASE_URL = "http://127.0.0.1:8000";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("All");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/payments/`
      );

      if (!response.ok) {
        throw new Error(
          "Unable to load order data"
        );
      }

      const data = await response.json();

      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const filteredOrders = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesSearch =
        !query ||
        String(
          order.razorpay_order_id || ""
        )
          .toLowerCase()
          .includes(query) ||
        String(order.product_id || "")
          .toLowerCase()
          .includes(query) ||
        String(order.artisan_id || "")
          .toLowerCase()
          .includes(query) ||
        String(order.status || "")
          .toLowerCase()
          .includes(query);

      const matchesStatus =
        statusFilter === "All" ||
        order.status === statusFilter;

      return (
        matchesSearch &&
        matchesStatus
      );
    });
  }, [
    orders,
    search,
    statusFilter,
  ]);

  const statuses = [
    "All",
    ...Array.from(
      new Set(
        orders
          .map((order) => order.status)
          .filter(Boolean)
      )
    ),
  ];

  const totalAmount = filteredOrders.reduce(
    (sum, order) =>
      sum + Number(order.amount || 0),
    0
  );

  const verifiedOrders =
    orders.filter(
      (order) =>
        order.status === "verified"
    ).length;

  return (
    <div>

      {/* SUMMARY */}

      <section style={styles.summaryGrid}>

        <SummaryCard
          label="ORDERS"
          value={orders.length}
          text="Payment/order records"
        />

        <SummaryCard
          label="VERIFIED"
          value={verifiedOrders}
          text="Verified payments"
        />

        <SummaryCard
          label="ORDER VALUE"
          value={`₹${totalAmount.toLocaleString(
            "en-IN"
          )}`}
          text="Current filtered value"
        />

      </section>


      {error && (
        <div style={styles.error}>
          {error}
        </div>
      )}


      {/* ORDER TABLE */}

      <section style={styles.panel}>

        <div style={styles.headerRow}>

          <div>
            <div style={styles.eyebrow}>
              OWNER / ORDER MANAGEMENT
            </div>

            <h2 style={styles.title}>
              Orders
            </h2>

            <p style={styles.subtitle}>
              Monitor orders and payment status
              across the platform.
            </p>
          </div>

          <span style={styles.countBadge}>
            {filteredOrders.length} Records
          </span>

        </div>


        {/* FILTERS */}

        <div style={styles.toolbar}>

          <input
            style={styles.search}
            placeholder="Search order ID, product ID or artisan ID..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />

          <select
            style={styles.select}
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value
              )
            }
          >
            {statuses.map((status) => (
              <option
                key={status}
                value={status}
              >
                {status === "All"
                  ? "All statuses"
                  : status}
              </option>
            ))}
          </select>

        </div>


        {loading ? (

          <div style={styles.message}>
            Loading orders...
          </div>

        ) : (

          <div style={styles.tableWrapper}>

            <table style={styles.table}>

              <thead>

                <tr>

                  <th style={styles.th}>
                    Order ID
                  </th>

                  <th style={styles.th}>
                    Product ID
                  </th>

                  <th style={styles.th}>
                    Artisan ID
                  </th>

                  <th style={styles.th}>
                    Quantity
                  </th>

                  <th style={styles.th}>
                    Amount
                  </th>

                  <th style={styles.th}>
                    Currency
                  </th>

                  <th style={styles.th}>
                    Status
                  </th>

                </tr>

              </thead>


              <tbody>

                {filteredOrders.length === 0 ? (

                  <tr>

                    <td
                      colSpan="7"
                      style={styles.noResults}
                    >
                      No order records found.
                    </td>

                  </tr>

                ) : (

                  filteredOrders.map(
                    (order) => (

                      <tr
                        key={
                          order.razorpay_order_id
                        }
                      >

                        <td style={styles.td}>

                          <div style={styles.orderId}>
                            {
                              order.razorpay_order_id
                            }
                          </div>

                          {order.razorpay_payment_id && (
                            <div
                              style={
                                styles.paymentId
                              }
                            >
                              Payment:{" "}
                              {
                                order.razorpay_payment_id
                              }
                            </div>
                          )}

                        </td>


                        <td style={styles.td}>
                          <span
                            style={
                              styles.idPill
                            }
                          >
                            {order.product_id}
                          </span>
                        </td>


                        <td style={styles.td}>
                          <span
                            style={
                              styles.idPill
                            }
                          >
                            {order.artisan_id}
                          </span>
                        </td>


                        <td
                          style={{
                            ...styles.td,
                            fontWeight: 700,
                          }}
                        >
                          {order.quantity}
                        </td>


                        <td
                          style={{
                            ...styles.td,
                            fontWeight: 700,
                          }}
                        >
                          ₹
                          {Number(
                            order.amount || 0
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </td>


                        <td style={styles.td}>
                          {order.currency || "INR"}
                        </td>


                        <td style={styles.td}>

                          <StatusBadge
                            status={
                              order.status
                            }
                          />

                        </td>

                      </tr>

                    )
                  )

                )}

              </tbody>

            </table>

          </div>

        )}


        <div style={styles.footer}>

          <span>
            Showing{" "}
            <strong>
              {filteredOrders.length}
            </strong>{" "}
            of{" "}
            <strong>
              {orders.length}
            </strong>{" "}
            orders
          </span>

          <span>
            Live payment/order data
          </span>

        </div>

      </section>

    </div>
  );
}


function SummaryCard({
  label,
  value,
  text,
}) {
  return (
    <div style={styles.summaryCard}>

      <div style={styles.summaryLabel}>
        {label}
      </div>

      <div style={styles.summaryNumber}>
        {value}
      </div>

      <div style={styles.summaryText}>
        {text}
      </div>

    </div>
  );
}


function StatusBadge({
  status,
}) {
  const verified =
    status === "verified";

  return (
    <span
      style={
        verified
          ? styles.verified
          : styles.status
      }
    >
      {verified
        ? "✓ Verified"
        : status || "Unknown"}
    </span>
  );
}


const styles = {

  summaryGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(3, minmax(0, 1fr))",
    gap: "15px",
    marginBottom: "16px",
  },

  summaryCard: {
    background: "#ffffff",
    border: "1px solid #e4e0d8",
    borderRadius: "15px",
    padding: "19px",
  },

  summaryLabel: {
    fontSize: "9px",
    letterSpacing: "1.5px",
    color: "#99928a",
    fontWeight: 700,
  },

  summaryNumber: {
    fontSize: "27px",
    fontWeight: 700,
    marginTop: "10px",
  },

  summaryText: {
    fontSize: "10px",
    color: "#8d877f",
    marginTop: "3px",
  },

  panel: {
    background: "#ffffff",
    border: "1px solid #e4e0d8",
    borderRadius: "17px",
    padding: "20px",
  },

  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "18px",
  },

  eyebrow: {
    fontSize: "9px",
    letterSpacing: "1.5px",
    color: "#9b948c",
    fontWeight: 700,
  },

  title: {
    margin: "6px 0 4px",
    fontSize: "18px",
  },

  subtitle: {
    margin: 0,
    color: "#97918a",
    fontSize: "10px",
  },

  countBadge: {
    padding: "6px 9px",
    borderRadius: "999px",
    background: "#f2f0eb",
    color: "#6d675f",
    fontSize: "10px",
    fontWeight: 700,
  },

  toolbar: {
    display: "flex",
    gap: "9px",
    marginBottom: "15px",
  },

  search: {
    flex: 1,
    border: "1px solid #dfdbd3",
    background: "#faf9f6",
    padding: "11px",
    borderRadius: "8px",
    outline: "none",
    fontSize: "10px",
  },

  select: {
    border: "1px solid #dfdbd3",
    background: "#faf9f6",
    borderRadius: "8px",
    padding: "0 11px",
    minWidth: "140px",
    fontSize: "10px",
    outline: "none",
    color: "#655f58",
  },

  tableWrapper: {
    border: "1px solid #e7e3dc",
    borderRadius: "10px",
    overflow: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "900px",
  },

  th: {
    textAlign: "left",
    padding: "12px",
    background: "#faf9f7",
    borderBottom: "1px solid #e5e1da",
    color: "#77716a",
    fontSize: "9px",
    textTransform: "uppercase",
    letterSpacing: "0.7px",
    whiteSpace: "nowrap",
  },

  td: {
    padding: "14px 12px",
    borderBottom: "1px solid #eeeae4",
    color: "#4d4841",
    fontSize: "10px",
    verticalAlign: "top",
  },

  orderId: {
    color: "#37332e",
    fontWeight: 700,
    fontSize: "10px",
  },

  paymentId: {
    color: "#a29a92",
    fontSize: "8px",
    marginTop: "4px",
  },

  idPill: {
    padding: "4px 7px",
    borderRadius: "6px",
    background: "#f2f0eb",
    color: "#69635c",
    fontSize: "9px",
  },

  verified: {
    display: "inline-flex",
    padding: "5px 8px",
    borderRadius: "999px",
    background: "#e9f4eb",
    color: "#327044",
    fontSize: "9px",
    fontWeight: 700,
  },

  status: {
    display: "inline-flex",
    padding: "5px 8px",
    borderRadius: "999px",
    background: "#f1eee9",
    color: "#6d675f",
    fontSize: "9px",
    fontWeight: 700,
  },

  footer: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "11px",
    color: "#9b948c",
    fontSize: "9px",
  },

  noResults: {
    padding: "38px",
    textAlign: "center",
    color: "#97918a",
    fontSize: "11px",
  },

  message: {
    padding: "50px",
    textAlign: "center",
    color: "#97918a",
    fontSize: "11px",
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
};

export default Orders;