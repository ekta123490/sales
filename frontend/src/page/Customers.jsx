import "../style.css";
import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Search,
  Plus,
  Users,
  Download,
  CalendarDays,
  Pencil,
  Trash2,
  X,
  RefreshCw,
  Building2,
  Mail,
  Phone,
  IndianRupee,
  Filter,
} from "lucide-react";

const initialForm = {
  customer_name: "",
  company: "",
  email: "",
  phone: "",
  value: "0",
  status: "New",
  notes: "",
  owner: "",
};

const statuses = ["New", "Active", "Inactive", "Qualified", "Lost"];

const currency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

function getCustomerDate(customer) {
  const date = customer.created_at
    ? new Date(customer.created_at)
    : null;

  return date && !Number.isNaN(date.getTime()) ? date : null;
}

function getInitials(name = "") {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
}

function getStatusClass(status = "") {
  return status.toLowerCase().replace(/\s+/g, "-");
}

export default function Customers() {
  const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");
  const RECORDS_URL = `${API_URL}/api/records`;


  const [customers, setCustomers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0)
  
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [form, setForm] = useState(initialForm);

  const fetchCustomers = useCallback(async () => {
  setLoading(true);
  setError("");

  try {
    const response = await axios.get(RECORDS_URL, {
      params: {
        page: currentPage,
        limit: pageSize,
        search: search.trim(),
        status: statusFilter,
        dateFrom,
        dateTo,
      },
    });

    const data = response.data;

    setCustomers(
      Array.isArray(data.records) ? data.records : []
    );
    setTotalRecords(data.pagination?.totalRecords ?? 0);
    setTotalPages(data.pagination?.totalPages ?? 0);
  } catch (err) {
    setError(
      err.response?.data?.error ||
        err.response?.data?.message ||
        "Unable to load customers."
    );
  } finally {
    setLoading(false);
  }
}, [
  RECORDS_URL,
  currentPage,
  pageSize,
  search,
  statusFilter,
  dateFrom,
  dateTo,
]);

useEffect(() => {
  fetchCustomers();
}, [fetchCustomers]);

// The backend now handles search and filtering.
const filteredCustomers = customers;

const totalValue = filteredCustomers.reduce(
  (sum, customer) => sum + (Number(customer.value) || 0),
  0
);

const activeCount = filteredCustomers.filter(
  (customer) =>
    String(customer.status || "").toLowerCase() === "active"
).length;

  function openAddModal() {
    setEditingCustomer(null);
    setForm({ ...initialForm });
    setError("");
    setSuccess("");
    setModalOpen(true);
  }

  function openEditModal(customer) {
    setEditingCustomer(customer);
    setForm({
      customer_name: customer.customer_name || "",
      company: customer.company || "",
      email: customer.email || "",
      phone: customer.phone || "",
      value: String(customer.value ?? 0),
      status: customer.status || "New",
      notes: customer.notes || "",
      owner: customer.owner || "",
    });
    setError("");
    setSuccess("");
    setModalOpen(true);
  }

  function handleFormChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
  event.preventDefault();

  if (!form.customer_name.trim()) {
    setError("Customer name is required.");
    return;
  }

  if (
    form.value.trim() === "" ||
    !Number.isFinite(Number(form.value)) ||
    Number(form.value) < 0
  ) {
    setError("Enter a valid, non-negative customer value.");
    return;
  }

  setSaving(true);
  setError("");
  setSuccess("");

  const payload = {
    ...form,
    customer_name: form.customer_name.trim(),
    company: form.company.trim() || null,
    email: form.email.trim() || null,
    phone: form.phone.trim() || null,
    value: Number(form.value),
    notes: form.notes.trim() || null,
    owner: form.owner.trim() || null,
  };

  try {
    if (editingCustomer) {
      await axios.put(
        `${RECORDS_URL}/${editingCustomer.id}`,
        payload
      );

      setSuccess("Record updated successfully.");
    } else {
      await axios.post(RECORDS_URL, payload);

      setSuccess("Record added successfully.");
    }

    setModalOpen(false);
setEditingCustomer(null);
setForm({ ...initialForm });

if (!editingCustomer && currentPage !== 1) {
  setCurrentPage(1);
} else {
  await fetchCustomers();
}
  } catch (err) {
    setError(
      err.response?.data?.error ||
        err.response?.data?.message ||
        "Unable to save record. Please try again."
    );
  } finally {
    setSaving(false);
  }
}
  async function handleDelete(customer) {
  if (
    !window.confirm(
      `Delete ${customer.customer_name}? This action cannot be undone.`
    )
  ) {
    return;
  }

  setError("");
  setSuccess("");

  try {
    await axios.delete(`${RECORDS_URL}/${customer.id}`);

    setSuccess("Record deleted successfully.");

    setCustomers((previous) =>
      previous.filter((item) => item.id !== customer.id)
    );
  } catch (err) {
    setError(
      err.response?.data?.error ||
        err.response?.data?.message ||
        "Unable to delete record."
    );
  }
}



  function clearFilters() {
  setSearch("");
  setStatusFilter("All");
  setDateFrom("");
  setDateTo("");
  setCurrentPage(1);
}

  function exportCSV() {
    const columns = [
      ["Customer Name", "customer_name"],
      ["Company", "company"],
      ["Email", "email"],
      ["Phone", "phone"],
      ["Value", "value"],
      ["Status", "status"],
      ["Owner", "owner"],
      ["Created At", "created_at"],
    ];

    const escapeCSV = (value) =>
      `"${String(value ?? "").replace(/"/g, '""')}"`;

    const csv = [
      columns.map(([label]) => escapeCSV(label)).join(","),
      ...filteredCustomers.map((customer) =>
        columns
          .map(([, key]) => escapeCSV(customer[key]))
          .join(",")
      ),
    ].join("\r\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "customers.csv";
    link.click();

    URL.revokeObjectURL(url);
  }

  return (
    <div className="customers-page">
      <div className="customers-heading">
        <div>
          
          <h1>Customers Records</h1>
          <p>
            Manage all customers records across organization.
          </p>
        </div>

        <div className="customers-heading-actions">
  <button
    type="button"
    className="customers-primary-btn"
    onClick={openAddModal}
  >
    <Plus size={18} />
    Add Customer
  </button>
</div>
      </div>

      {error && !modalOpen && (
        <div className="customers-alert error" role="alert">
          <span>{error}</span>
          <button
            type="button"
            aria-label="Dismiss error"
            onClick={() => setError("")}
          >
            <X size={17} />
          </button>
        </div>
      )}

      {success && (
        <div className="customers-alert success" role="status">
          <span>{success}</span>
          <button
            type="button"
            aria-label="Dismiss message"
            onClick={() => setSuccess("")}
          >
            <X size={17} />
          </button>
        </div>
      )}

      

      <section className="customers-panel">
        <div className="customers-panel-heading">
          <div>
            <h2>Customer Directory</h2>
            <p>
              Search, filter, and manage your customer records.
            </p>
          </div>

          <button
            type="button"
            className="customers-refresh-btn"
            onClick={fetchCustomers}
            disabled={loading}
            aria-label="Refresh customers"
            title="Refresh customers"
          >
            <RefreshCw
              size={17}
              className={loading ? "customers-spinning" : ""}
            />
          </button>
        </div>

        <div className="customers-filters">
          <div className="customers-search">
            <Search size={19} />
            <input
              type="search"
              placeholder="Search name, company, email, phone..."
              value={search}
              onChange={(event) => {
  setSearch(event.target.value);
  setCurrentPage(1);
}}
              aria-label="Search customers"
            />
            {search && (
              <button
                type="button"
                onClick={() => {
  setSearch("");
  setCurrentPage(1);
}}
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="customers-filter-control">
            <Filter size={17} />
            <select
              value={statusFilter}
              onChange={(event) => {
  setStatusFilter(event.target.value);
  setCurrentPage(1);
}}
              aria-label="Filter by customer status"
            >
              <option value="All">All statuses</option>
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          <label className="customers-date-control">
            <CalendarDays size={17} />
            <span className="sr-only">Created from</span>
            <input
              type="date"
              value={dateFrom}
              max={dateTo || undefined}
              onChange={(event) => {
  setDateFrom(event.target.value); // use setDateTo for the other input
  setCurrentPage(1);
}}
              aria-label="Created from date"
              title="Created from date"
            />
          </label>

          <label className="customers-date-control">
            <CalendarDays size={17} />
            <span className="sr-only">Created to</span>
            <input
              type="date"
              value={dateTo}
              min={dateFrom || undefined}
              onChange={(event) => {
  setDateTo(event.target.value);
  setCurrentPage(1);
}}
              aria-label="Created to date"
              title="Created to date"
            />
          </label>

          <button
            type="button"
            className="customers-clear-btn"
            onClick={clearFilters}
          >
            Clear
          </button>
        </div>

        <div className="customers-results-info">
  <span>
    Showing{" "}
    <strong>
      {totalRecords === 0
        ? 0
        : (currentPage - 1) * pageSize + 1}
    </strong>
    {"–"}
    <strong>
      {Math.min(currentPage * pageSize, totalRecords)}
    </strong>
    {" "}of <strong>{totalRecords}</strong> customers
  </span>
</div>

        <div className="customers-table-wrapper">
          <table className="customers-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Contact</th>
                <th>Company</th>
                <th>Value</th>
                <th>Status</th>
                <th>Owner</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="customers-empty">
                    <RefreshCw
                      size={22}
                      className="customers-spinning"
                    />
                    <span>Loading customers...</span>
                  </td>
                </tr>
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan="8" className="customers-empty">
                    <Users size={30} />
                    <strong>No customers found</strong>
                    <span>
                      Try changing your filters or add a new customer.
                    </span>
                    <button
                      type="button"
                      className="customers-primary-btn"
                      onClick={openAddModal}
                    >
                      <Plus size={17} />
                      Add Customer
                    </button>
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <tr key={customer.id}>
                    <td>
                      <div className="customers-person">
                        <div className="customers-avatar">
                          {getInitials(customer.customer_name)}
                        </div>
                        <div className="customers-person-details">
                          <strong>{customer.customer_name}</strong>
                          <span>#{customer.id}</span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div className="customers-contact">
                        {customer.email && (
                          <span>
                            <Mail size={14} />
                            {customer.email}
                          </span>
                        )}
                        {customer.phone && (
                          <span>
                            <Phone size={14} />
                            {customer.phone}
                          </span>
                        )}
                        {!customer.email && !customer.phone && (
                          <span className="customers-muted">—</span>
                        )}
                      </div>
                    </td>

                    <td>
                      <span className="customers-company">
                        {customer.company ? (
                          <>
                            <Building2 size={15} />
                            {customer.company}
                          </>
                        ) : (
                          "—"
                        )}
                      </span>
                    </td>

                    <td className="customers-value">
                      {currency(customer.value)}
                    </td>

                    <td>
                      <span
                        className={`customers-status ${getStatusClass(
                          customer.status
                        )}`}
                      >
                        <span />
                        {customer.status || "New"}
                      </span>
                    </td>

                    <td>{customer.owner || "—"}</td>

                    <td>
                      {getCustomerDate(customer)
                        ? getCustomerDate(customer).toLocaleDateString(
                            "en-IN",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            }
                          )
                        : "—"}
                    </td>

                    <td>
                      <div className="customers-row-actions">
                        <button
                          type="button"
                          onClick={() => openEditModal(customer)}
                          aria-label={`Edit ${customer.customer_name}`}
                          title="Edit customer"
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          type="button"
                          className="delete"
                          onClick={() => handleDelete(customer)}
                          aria-label={`Delete ${customer.customer_name}`}
                          title="Delete customer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div
  className="customers-pagination"
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "16px",
    width: "100%",
    boxSizing: "border-box",
    padding: "16px 20px",
    background: "#ffffff",
    borderTop: "1px solid #e2e8f0",
  }}
>
  <div
    className="customers-page-size"
    style={{
      display: "flex",
      alignItems: "center",
      gap: "10px",
      color: "#64748b",
      fontSize: "13px",
    }}
  >
    <label htmlFor="page-size">Rows per page</label>

    <select
      id="page-size"
      value={pageSize}
      style={{
        height: "36px",
        padding: "0 10px",
        border: "1px solid #d1d5db",
        borderRadius: "7px",
        background: "#ffffff",
        color: "#334155",
        cursor: "pointer",
      }}
      onChange={(event) => {
        setPageSize(Number(event.target.value));
        setCurrentPage(1);
      }}
    >
      <option value={10}>10</option>
      <option value={25}>25</option>
      <option value={50}>50</option>
      <option value={100}>100</option>
    </select>
  </div>

  <div
    className="customers-page-buttons"
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-end",
      flexWrap: "wrap",
      gap: "8px",
    }}
  >
    {[
      {
        label: "First",
        disabled: loading || currentPage <= 1,
        onClick: () => setCurrentPage(1),
      },
      {
        label: "Previous",
        disabled: loading || currentPage <= 1,
        onClick: () =>
          setCurrentPage((page) => Math.max(1, page - 1)),
      },
    ].map((button) => (
      <button
        key={button.label}
        type="button"
        disabled={button.disabled}
        onClick={button.onClick}
        style={{
          minWidth: "72px",
          height: "36px",
          padding: "0 12px",
          border: "1px solid #d1d5db",
          borderRadius: "7px",
          background: "#ffffff",
          color: "#334155",
          fontSize: "13px",
          cursor: button.disabled ? "not-allowed" : "pointer",
          opacity: button.disabled ? 0.45 : 1,
        }}
      >
        {button.label}
      </button>
    ))}

    <span
      style={{
        color: "#475569",
        fontSize: "13px",
        whiteSpace: "nowrap",
        padding: "0 6px",
      }}
    >
      Page {totalPages === 0 ? 0 : currentPage} of {totalPages}
    </span>

    {[
      {
        label: "Next",
        disabled:
          loading || totalPages === 0 || currentPage >= totalPages,
        onClick: () =>
          setCurrentPage((page) => Math.min(totalPages, page + 1)),
      },
      {
        label: "Last",
        disabled:
          loading || totalPages === 0 || currentPage >= totalPages,
        onClick: () => setCurrentPage(totalPages),
      },
    ].map((button) => (
      <button
        key={button.label}
        type="button"
        disabled={button.disabled}
        onClick={button.onClick}
        style={{
          minWidth: "72px",
          height: "36px",
          padding: "0 12px",
          border: "1px solid #d1d5db",
          borderRadius: "7px",
          background: "#ffffff",
          color: "#334155",
          fontSize: "13px",
          cursor: button.disabled ? "not-allowed" : "pointer",
          opacity: button.disabled ? 0.45 : 1,
        }}
      >
        {button.label}
      </button>
    ))}
  </div>
</div>
      </section>

      <footer className="customers-footer">
        <span>Customer Management · NEXUS Business Suite</span>
        <span>{new Date().getFullYear()}</span>
      </footer>

      {modalOpen && (
        <div
          className="customers-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !saving) {
              setModalOpen(false);
            }
          }}
        >
          <section
            className="customers-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="customer-modal-title"
            
          >
            <div className="customers-modal-heading">
              <div>
                <span className="customers-eyebrow">
                  CUSTOMER DETAILS
                </span>
                <h2 id="customer-modal-title">
                  {editingCustomer ? "Edit Customer" : "Add Customer"}
                </h2>
                <p>Enter the customer's information below.</p>
              </div>

              <button
                type="button"
                className="customers-modal-close"
                onClick={() => setModalOpen(false)}
                disabled={saving}
                aria-label="Close dialog"
              >
                <X size={20} />
              </button>
            </div>

            {error && (
              <div className="customers-alert error" role="alert">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="customers-form-grid">
                <label>
                  Customer Name *
                  <input
                    name="customer_name"
                    value={form.customer_name}
                    onChange={handleFormChange}
                    placeholder="Enter customer name"
                    minLength={1}
                    maxLength={150}
                    required
                  />
                </label>

                <label>
                  Company
                  <input
                    name="company"
                    value={form.company}
                    onChange={handleFormChange}
                    placeholder="Company name"
                    maxLength={150}
                  />
                </label>

                <label>
                  Email Address
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleFormChange}
                    placeholder="name@example.com"
                    maxLength={255}
                  />
                </label>

                <label>
                  Phone Number
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleFormChange}
                    placeholder="Enter phone number"
                    maxLength={30}
                  />
                </label>

                <label>
                  Customer Value (₹)
                  <input
                    type="number"
                    name="value"
                    value={form.value}
                    onChange={handleFormChange}
                    min="0"
                    step="0.01"
                    required
                  />
                </label>

                <label>
                  Status
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleFormChange}
                  >
                    {statuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="customers-full-width">
                  Owner
                  <input
                    name="owner"
                    value={form.owner}
                    onChange={handleFormChange}
                    placeholder="Assigned sales representative"
                    maxLength={150}
                  />
                </label>

                <label className="customers-full-width">
                  Notes
                  <textarea
                    name="notes"
                    value={form.notes}
                    onChange={handleFormChange}
                    placeholder="Add notes about this customer..."
                    rows={3}
                    maxLength={3000}
                  />
                </label>
              </div>

              <div className="customers-modal-actions">
                <button
                  type="button"
                  className="customers-secondary-btn"
                  onClick={() => setModalOpen(false)}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="customers-primary-btn"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingCustomer
                    ? "Save Changes"
                    : "Create Customer"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
