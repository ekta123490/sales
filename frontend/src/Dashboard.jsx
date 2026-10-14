import "./style.css"


import {
  Wallet,
  Users,
  ShoppingBag,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  Download,
  CircleDollarSign,
  CalendarDays,
} from "lucide-react";

const stats = [
  {
    title: "Total Sales",
    value: "₹2,45,000",
    change: "+12.8%",
    positive: true,
    icon: Wallet,
    color: "blue",
  },
  {
    title: "Total Customers",
    value: "1,284",
    change: "+8.2%",
    positive: true,
    icon: Users,
    color: "purple",
  },
  {
    title: "Total Orders",
    value: "356",
    change: "-2.4%",
    positive: false,
    icon: ShoppingBag,
    color: "orange",
  },
  {
    title: "Net Revenue",
    value: "₹84,200",
    change: "+18.6%",
    positive: true,
    icon: CircleDollarSign,
    color: "green",
  },
];

const sales = [
  {
    id: "#ORD-1001",
    customer: "Rahul Sharma",
    email: "rahul@example.com",
    product: "Laptop",
    date: "14 Oct 2026",
    amount: "₹65,000",
    status: "Completed",
  },
  {
    id: "#ORD-1002",
    customer: "Priya Patel",
    email: "priya@example.com",
    product: "Smartphone",
    date: "13 Oct 2026",
    amount: "₹32,500",
    status: "Pending",
  },
  {
    id: "#ORD-1003",
    customer: "Amit Verma",
    email: "amit@example.com",
    product: "Headphones",
    date: "12 Oct 2026",
    amount: "₹4,200",
    status: "Completed",
  },
  {
    id: "#ORD-1004",
    customer: "Neha Singh",
    email: "neha@example.com",
    product: "Monitor",
    date: "11 Oct 2026",
    amount: "₹18,000",
    status: "Cancelled",
  },
  {
    id: "#ORD-1005",
    customer: "Arjun Mehta",
    email: "arjun@example.com",
    product: "Keyboard",
    date: "10 Oct 2026",
    amount: "₹3,500",
    status: "Completed",
  },
];

const monthlySales = [
  { month: "Jan", sales: 35, revenue: 24 },
  { month: "Feb", sales: 50, revenue: 32 },
  { month: "Mar", sales: 43, revenue: 30 },
  { month: "Apr", sales: 68, revenue: 48 },
  { month: "May", sales: 55, revenue: 38 },
  { month: "Jun", sales: 78, revenue: 56 },
  { month: "Jul", sales: 62, revenue: 45 },
  { month: "Aug", sales: 90, revenue: 65 },
  { month: "Sep", sales: 72, revenue: 51 },
  { month: "Oct", sales: 84, revenue: 61 },
  { month: "Nov", sales: 67, revenue: 46 },
  { month: "Dec", sales: 96, revenue: 72 },
];

export default function Dashboard() {
  return (
    <div className="dashboard-page">
      {/* Page Heading */}
      <div className="page-heading">
        <div>
          <h1>Dashboard Overview</h1>
          <p>
            Welcome back! Here's what's happening with your business.
          </p>
        </div>

        <button
          className="primary-btn"
          onClick={() => window.print()}
        >
          <Download size={17} />
          Export / Print
        </button>
      </div>

      {/* Summary Cards */}
      <section className="stats-grid">
        {stats.map((item) => {
          const Icon = item.icon;
          const ChangeIcon = item.positive
            ? TrendingUp
            : TrendingDown;

          return (
            <article className="stat-card" key={item.title}>
              <div className="stat-top">
                <div className={`stat-icon ${item.color}`}>
                  <Icon size={23} />
                </div>

                <span
                  className={`stat-change ${
                    item.positive ? "positive" : "negative"
                  }`}
                >
                  <ChangeIcon size={15} />
                  {item.change}
                </span>
              </div>

              <p className="stat-title">{item.title}</p>
              <h2>{item.value}</h2>

              <span className="stat-caption">
                Compared with last month
              </span>
            </article>
          );
        })}
      </section>

      {/* Charts and Performance */}
      <section className="content-grid">
        <article className="panel sales-panel">
          <div className="panel-header">
            <div>
              <h2>Sales Overview</h2>
              <p>Monthly sales performance</p>
            </div>

            <select
              aria-label="Select sales period"
              defaultValue="year"
            >
              <option value="week">This week</option>
              <option value="month">This month</option>
              <option value="year">This year</option>
            </select>
          </div>

          <div className="chart-legend">
            <span>
              <i className="legend-dot navy" />
              Sales
            </span>
            <span>
              <i className="legend-dot light-blue" />
              Revenue
            </span>
          </div>

          <div className="chart">
            <div className="y-labels">
              <span>₹3L</span>
              <span>₹2L</span>
              <span>₹1L</span>
              <span>₹0</span>
            </div>

            <div className="chart-plot">
              {monthlySales.map((item) => (
                <div className="bar-group" key={item.month}>
                  <div className="bar-pair">
                    <div
                      className="bar navy-bar"
                      style={{ height: `${item.sales}%` }}
                      title={`${item.month} sales`}
                    />

                    <div
                      className="bar blue-bar"
                      style={{ height: `${item.revenue}%` }}
                      title={`${item.month} revenue`}
                    />
                  </div>

                  <span className="bar-label">
                    {item.month}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </article>

        <article className="panel performance-panel">
          <div className="panel-header">
            <div>
              <h2>Performance</h2>
              <p>Your business at a glance</p>
            </div>
          </div>

          <div className="performance-total">
            <span>Total revenue</span>
            <h2>₹8,42,500</h2>

            <span className="stat-change positive">
              <ArrowUpRight size={15} />
              18.6%
            </span>
          </div>

          <div className="progress-item">
            <div>
              <span>Sales target</span>
              <strong>78%</strong>
            </div>
            <div className="progress-track">
              <div
                className="progress-fill navy-fill"
                style={{ width: "78%" }}
              />
            </div>
          </div>

          <div className="progress-item">
            <div>
              <span>Customer growth</span>
              <strong>65%</strong>
            </div>
            <div className="progress-track">
              <div
                className="progress-fill purple-fill"
                style={{ width: "65%" }}
              />
            </div>
          </div>

          <div className="progress-item">
            <div>
              <span>Order completion</span>
              <strong>92%</strong>
            </div>
            <div className="progress-track">
              <div
                className="progress-fill green-fill"
                style={{ width: "92%" }}
              />
            </div>
          </div>

          <div className="performance-note">
            <TrendingUp size={18} />
            <p>Your business is performing well this month.</p>
          </div>
        </article>
      </section>

      {/* Recent Sales Table */}
      <section className="panel recent-sales">
        <div className="panel-header">
          <div>
            <h2>Recent Sales</h2>
            <p>Track your latest transactions</p>
          </div>

          <a href="/dashboard/sales" className="view-all">
            View all sales →
          </a>
        </div>

        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Product</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {sales.map((sale) => (
                <tr key={sale.id}>
                  <td className="order-id">{sale.id}</td>

                  <td>
                    <div className="customer-cell">
                      <div className="customer-avatar">
                        {sale.customer.charAt(0)}
                      </div>
                      <div>
                        <strong>{sale.customer}</strong>
                        <span>{sale.email}</span>
                      </div>
                    </div>
                  </td>

                  <td>{sale.product}</td>
                  <td>{sale.date}</td>
                  <td className="amount">{sale.amount}</td>

                  <td>
                    <span
                      className={`status ${sale.status.toLowerCase()}`}
                    >
                      {sale.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Footer */}
      <footer className="dashboard-footer">
        <span>© 2026 NEXUS Business Suite</span>
        <span>
          <CalendarDays size={14} />
          Business Dashboard
        </span>
      </footer>
    </div>
  );
}
