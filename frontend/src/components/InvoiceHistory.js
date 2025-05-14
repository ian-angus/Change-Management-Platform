import React from "react";
import { FaDownload, FaEye, FaCheckCircle, FaClock } from "react-icons/fa";

const invoices = [
  {
    id: "INV-2024-001",
    date: "Feb 1, 2024",
    amount: "$49.00",
    status: "paid",
    plan: "Professional",
    period: "Feb 1 - Feb 28, 2024",
  },
  {
    id: "INV-2024-002",
    date: "Jan 1, 2024",
    amount: "$49.00",
    status: "paid",
    plan: "Professional",
    period: "Jan 1 - Jan 31, 2024",
  },
  {
    id: "INV-2024-003",
    date: "Dec 1, 2023",
    amount: "$49.00",
    status: "paid",
    plan: "Professional",
    period: "Dec 1 - Dec 31, 2023",
  },
];

export default function InvoiceHistory() {
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h4 className="text-sm font-medium text-gray-500">Total Spent</h4>
          <p className="text-2xl font-bold text-gray-900 mt-1">$147.00</p>
          <p className="text-sm text-gray-500 mt-1">Last 3 months</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h4 className="text-sm font-medium text-gray-500">Next Billing Date</h4>
          <p className="text-2xl font-bold text-gray-900 mt-1">Mar 1, 2024</p>
          <p className="text-sm text-gray-500 mt-1">Professional Plan</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h4 className="text-sm font-medium text-gray-500">Payment Method</h4>
          <p className="text-2xl font-bold text-gray-900 mt-1">Visa •••• 4242</p>
          <p className="text-sm text-gray-500 mt-1">Expires 12/24</p>
        </div>
      </div>

      {/* Invoice List */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Invoice History</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {invoices.map((invoice) => (
            <div key={invoice.id} className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-gray-900">{invoice.id}</h4>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        invoice.status === "paid"
                          ? "bg-green-50 text-green-700"
                          : "bg-yellow-50 text-yellow-700"
                      }`}
                    >
                      {invoice.status === "paid" ? (
                        <FaCheckCircle className="w-3 h-3" />
                      ) : (
                        <FaClock className="w-3 h-3" />
                      )}
                      {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">{invoice.period}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{invoice.amount}</p>
                    <p className="text-sm text-gray-500">{invoice.plan}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                      title="View Invoice"
                    >
                      <FaEye className="w-5 h-5" />
                    </button>
                    <button
                      className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                      title="Download Invoice"
                    >
                      <FaDownload className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Information */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Visa •••• 4242</p>
              <p className="text-sm text-gray-500">Expires 12/24</p>
            </div>
            <button className="text-blue-700 hover:text-blue-800 font-medium">
              Update Payment Method
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Billing Address</p>
              <p className="text-sm text-gray-500">123 Business St, Suite 100, City, State 12345</p>
            </div>
            <button className="text-blue-700 hover:text-blue-800 font-medium">
              Update Address
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 