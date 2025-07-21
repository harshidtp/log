"use client";

import React, { useState, useEffect } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import ConfirmDialog from "@/app/components/ConfirmDialog.jsx";
import LogoutButton from "../components/LogoutButton";

export default function DashboardPage() {
  // Load customers from localStorage initially
  const [customers, setCustomers] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("customers");
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [profilePic, setProfilePic] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [records, setRecords] = useState(() => {
    if (typeof window !== "undefined") {
      const savedRecords = localStorage.getItem("records");
      return savedRecords ? JSON.parse(savedRecords) : [];
    }
    return [];
  });
  const [editingCustomer, setEditingCustomer] = useState(null);

  // Save customers to localStorage whenever customers state changes
  useEffect(() => {
    localStorage.setItem("customers", JSON.stringify(customers));
  }, [customers]);

  // Save records to localStorage whenever records state changes (optional)
  useEffect(() => {
    localStorage.setItem("records", JSON.stringify(records));
  }, [records]);

  // Add or update customer
  const handleAddOrUpdateCustomer = () => {
    if (!name || !phone) {
      alert("Please enter name and phone");
      return;
    }
    if (editingCustomer) {
      setCustomers(
        customers.map((c) =>
          c.id === editingCustomer.id ? { ...c, name, phone, profilePic } : c
        )
      );
      setEditingCustomer(null);
    } else {
      const newCustomer = { id: Date.now(), name, phone, profilePic };
      setCustomers([...customers, newCustomer]);
    }
    setName("");
    setPhone("");
    setProfilePic(null);
  };

  // Delete customer and their records
  const handleDeleteCustomer = (id) => {
    if (confirm("Delete this customer and all their records?")) {
      setCustomers(customers.filter((c) => c.id !== id));
      setRecords(records.filter((r) => r.customerId !== id));
      if (selectedCustomer?.id === id) setSelectedCustomer(null);
    }
  };

  // Handle profile pic upload and preview
  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePic(URL.createObjectURL(file));
    }
  };
  // Records state is managed in CustomerRecordView

  return (
  
    <div className="min-h-screen bg-gray-100 p-6 relative">
        <LogoutButton className="absolute top-6 right-6"/>
      <h1 className="text-3xl font-bold text-center mb-20">Dashboard - Customers</h1>

      {!selectedCustomer && (
        <div className="flex flex-col md:flex-row gap-6 max-w-6xl mx-auto items-start">
          {/* Add/Edit Customer Form */}
          <div className="basis-1/3 bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-2xl font-semibold mb-8">
              {editingCustomer ? "Edit Customer" : "Add Customer"}
            </h2>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Customer Name"
              className="border p-2 rounded w-full mb-8"
            />
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone Number"
              className="border p-2 rounded w-full mb-8"
            />
            <input
              type="file"
              onChange={handleProfilePicChange}
              className="border p-2 rounded w-full mb-4"
            />
            {profilePic && (
              <img
                src={profilePic}
                alt="Preview"
                className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
              />
            )}
            <button
              onClick={handleAddOrUpdateCustomer}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
            >
              {editingCustomer ? "Update Customer" : "Add Customer"}
            </button>
            {editingCustomer && (
              <button
                onClick={() => {
                  setEditingCustomer(null);
                  setName("");
                  setPhone("");
                  setProfilePic(null);
                }}
                className="mt-2 text-gray-600 underline"
              >
                Cancel Edit
              </button>
            )}
          </div>

          {/* Customer Cards */}
          <div className="basis-2/3 flex flex-wrap gap-4">
            {customers.length === 0 && (
              <p className="text-gray-500">No customers added yet.</p>
            )}
            {customers.map((customer) => (
              <div
                key={customer.id}
                className="w-[48%] bg-white p-4 rounded-lg shadow flex flex-col justify-between"
              >
                <div className="flex items-center gap-4 mb-2">
                  {customer.profilePic ? (
                    <img
                      src={customer.profilePic}
                      alt="Profile"
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center text-gray-600">
                      N/A
                    </div>
                  )}
                  <div>
                    <h3 className="text-xl font-bold">{customer.name}</h3>
                    <p>{customer.phone}</p>
                  </div>
                </div>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => setSelectedCustomer(customer)}
                    className="flex-1 bg-green-600 text-white py-1 rounded hover:bg-green-700"
                  >
                    View Records
                  </button>
                  <button
                    onClick={() => {
                      setEditingCustomer(customer);
                      setName(customer.name);
                      setPhone(customer.phone);
                      setProfilePic(customer.profilePic);
                    }}
                    className="flex-1 bg-yellow-500 text-white py-1 rounded hover:bg-yellow-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteCustomer(customer.id)}
                    className="flex-1 bg-red-600 text-white py-1 rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Customer Records View */}
      {selectedCustomer && (
        <CustomerRecordView
          customer={selectedCustomer}
          onBack={() => setSelectedCustomer(null)}
          records={records.filter((r) => r.customerId === selectedCustomer.id)}
          onAddRecord={(r) =>
            setRecords((prev) => [...prev, { ...r, id: Date.now(), customerId: selectedCustomer.id }])
          }
          onAddMultipleRecords={(newRecords) => {
            const recordsWithIds = newRecords.map((r) => ({
              ...r,
              id: Date.now() + Math.random(),
              customerId: selectedCustomer.id,
            }));
            setRecords((prev) => [...prev, ...recordsWithIds]);
          }}
          onUpdateRecord={(updated) =>
            setRecords((prev) => prev.map((r) => (r.id === updated.id ? updated : r)))
          }
          onDeleteRecord={(id) => setRecords((prev) => prev.filter((r) => r.id !== id))}
        />
      )}
    

    </div>
  );
}


function CustomerRecordView({
  customer,
  onBack,
  records,
  onAddRecord,
  onAddMultipleRecords,
  onUpdateRecord,
  onDeleteRecord,
}) {
  // Multiple records state
  const [rows, setRows] = useState([
    { date: "", vehicle: "", place: "", amount: "", description: "" },
  ]);

  const [editingRecord, setEditingRecord] = useState(null);
  const [editFields, setEditFields] = useState({
    date: "",
    vehicle: "",
    place: "",
    amount: "",
    description: "",
  });

  // Date filters and applied filters
  const [filterFromDate, setFilterFromDate] = useState("");
  const [filterToDate, setFilterToDate] = useState("");
  const [appliedFilterFrom, setAppliedFilterFrom] = useState("");
  const [appliedFilterTo, setAppliedFilterTo] = useState("");

  // Currency selector
  const [currency, setCurrency] = useState("$");

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState(null);

  // --- Confirm dialog handlers ---
  const handleDeleteClick = (rec) => {
    setRecordToDelete(rec);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (recordToDelete) {
      onDeleteRecord(recordToDelete.id);
    }
    setDeleteConfirmOpen(false);
    setRecordToDelete(null);
  };

  const cancelDelete = () => {
    setDeleteConfirmOpen(false);
    setRecordToDelete(null);
  };

  // --- Filter application ---
  const applyDateFilter = () => {
    setAppliedFilterFrom(filterFromDate);
    setAppliedFilterTo(filterToDate);
  };

  const clearDateFilter = () => {
    setFilterFromDate("");
    setFilterToDate("");
    setAppliedFilterFrom("");
    setAppliedFilterTo("");
  };

  // --- Filtered records according to applied date filters ---
  const filteredRecords = records.filter((r) => {
    if (!appliedFilterFrom && !appliedFilterTo) return true;
    const recDate = new Date(r.date);
    if (appliedFilterFrom && recDate < new Date(appliedFilterFrom)) return false;
    if (appliedFilterTo && recDate > new Date(appliedFilterTo)) return false;
    return true;
  });

  // --- Total amount calculation ---
  const totalAmount = filteredRecords.reduce(
    (sum, r) => sum + parseFloat(r.amount || 0),
    0
  );

  // --- PDF download ---
  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(`${customer.name}'s Records`, 14, 22);

    const tableColumn = [
      "Date",
      "Vehicle No",
      "Place",
      `Amount (${currency})`,
      "Description",
    ];

    const tableRows = filteredRecords.map((rec) => [
      rec.date,
      rec.vehicle,
      rec.place,
      rec.amount,
      rec.description,
    ]);

    tableRows.push(["", "", "Total", totalAmount.toFixed(2), ""]);

    autoTable(doc, {
      startY: 30,
      head: [tableColumn],
      body: tableRows,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [22, 160, 133] },
      footStyles: { fillColor: [22, 160, 133] },
    });

    doc.save(`${customer.name.replace(/\s+/g, "_")}_records.pdf`);
  };

  // --- Handlers for multiple rows input ---
  const handleRowChange = (index, field, value) => {
    const updatedRows = [...rows];
    updatedRows[index][field] = value;
    setRows(updatedRows);
  };

  const addRow = () => {
    setRows([
      ...rows,
      { date: "", vehicle: "", place: "", amount: "", description: "" },
    ]);
  };

  const removeRow = (index) => {
    const updatedRows = rows.filter((_, i) => i !== index);
    setRows(updatedRows.length > 0 ? updatedRows : [
      { date: "", vehicle: "", place: "", amount: "", description: "" },
    ]);
  };

  const handleSaveRows = () => {
    // Optional: Validate rows before submitting (e.g., date and amount required)
    const validRows = rows.filter(
      (r) => r.date && r.amount && !isNaN(parseFloat(r.amount))
    );
    if (validRows.length === 0) {
      alert("Please fill in valid date and amount in at least one row.");
      return;
    }
    onAddMultipleRecords(validRows);
    setRows([{ date: "", vehicle: "", place: "", amount: "", description: "" }]);
  };

  // --- Editing handlers ---
  const startEditing = (record) => {
    setEditingRecord(record);
    setEditFields({ ...record });
  };

  const cancelEditing = () => {
    setEditingRecord(null);
    setEditFields({
      date: "",
      vehicle: "",
      place: "",
      amount: "",
      description: "",
    });
  };

  const saveEditing = () => {
    onUpdateRecord(editingRecord.id, editFields);
    cancelEditing();
  };

  // --- Render ---
  return (
    <div className="max-w-7xl mx-auto bg-white rounded-xl p-8 shadow-md">
      <button onClick={onBack} className="text-blue-600 underline mb-6">
        ← Back to Customers
      </button>
      <h2 className="text-2xl font-bold mb-6">{customer.name}'s Records</h2>

      {/* Filter and Currency Section */}
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <label className="font-semibold">Filter From:</label>
        <input
          type="date"
          value={filterFromDate}
          onChange={(e) => setFilterFromDate(e.target.value)}
          className="border p-2 rounded"
        />

        <label className="font-semibold">To:</label>
        <input
          type="date"
          value={filterToDate}
          onChange={(e) => setFilterToDate(e.target.value)}
          className="border p-2 rounded"
        />

        <button
          onClick={applyDateFilter}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Result
        </button>
        <button
          onClick={clearDateFilter}
          className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
        >
          Clear
        </button>

        <label className="font-semibold ml-auto">Currency:</label>
        <select
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="$">USD ($)</option>
          <option value="€">EUR (€)</option>
          <option value="£">GBP (£)</option>
          <option value="₹">INR (₹)</option>
          <option value="¥">JPY (¥)</option>
          {/* Add more currencies if needed */}
        </select>
      </div>

      {/* Multiple Records Add Section */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-2">Add Multiple Records</h3>
        {rows.map((row, index) => (
          <div
            key={index}
            className="flex flex-wrap gap-3 items-center mb-3 border rounded p-3"
          >
            <input
              type="date"
              value={row.date}
              onChange={(e) => handleRowChange(index, "date", e.target.value)}
              className="border p-2 rounded w-32"
              placeholder="Date"
            />
            <input
              type="text"
              value={row.vehicle}
              onChange={(e) => handleRowChange(index, "vehicle", e.target.value)}
              className="border p-2 rounded w-28"
              placeholder="Vehicle No"
            />
            <input
              type="text"
              value={row.place}
              onChange={(e) => handleRowChange(index, "place", e.target.value)}
              className="border p-2 rounded w-28"
              placeholder="Place"
            />
            <input
              type="number"
              value={row.amount}
              onChange={(e) => handleRowChange(index, "amount", e.target.value)}
              className="border p-2 rounded w-24"
              placeholder={`Amount (${currency})`}
              min="0"
              step="0.01"
            />
            <input
              type="text"
              value={row.description}
              onChange={(e) =>
                handleRowChange(index, "description", e.target.value)
              }
              className="border p-2 rounded flex-grow"
              placeholder="Description"
            />
            <button
              onClick={() => removeRow(index)}
              className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
              title="Remove Row"
            >
              &times;
            </button>
          </div>
        ))}
        <div className="flex gap-3">
          <button
            onClick={addRow}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Add Row
          </button>
          <button
            onClick={handleSaveRows}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Save Records
          </button>
        </div>
      </div>

      {/* Records Table */}
      <div className="overflow-x-auto max-h-[300px] mb-6 border rounded">
        <table className="w-full table-auto border-collapse text-sm">
          <thead className="bg-teal-500 text-white sticky top-0">
            <tr>
              <th className="border px-3 py-2">Date</th>
              <th className="border px-3 py-2">Vehicle No</th>
              <th className="border px-3 py-2">Place</th>
              <th className="border px-3 py-2">Amount ({currency})</th>
              <th className="border px-3 py-2">Description</th>
              <th className="border px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecords.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center p-4 text-gray-500">
                  No records found.
                </td>
              </tr>
            )}
            {filteredRecords.map((record) =>
              editingRecord && editingRecord.id === record.id ? (
                <tr key={record.id}>
                  <td className="border px-2 py-1">
                    <input
                      type="date"
                      value={editFields.date}
                      onChange={(e) =>
                        setEditFields({ ...editFields, date: e.target.value })
                      }
                      className="border rounded p-1 w-full"
                    />
                  </td>
                  <td className="border px-2 py-1">
                    <input
                      type="text"
                      value={editFields.vehicle}
                      onChange={(e) =>
                        setEditFields({ ...editFields, vehicle: e.target.value })
                      }
                      className="border rounded p-1 w-full"
                    />
                  </td>
                  <td className="border px-2 py-1">
                    <input
                      type="text"
                      value={editFields.place}
                      onChange={(e) =>
                        setEditFields({ ...editFields, place: e.target.value })
                      }
                      className="border rounded p-1 w-full"
                    />
                  </td>
                  <td className="border px-2 py-1">
                    <input
                      type="number"
                      value={editFields.amount}
                      onChange={(e) =>
                        setEditFields({ ...editFields, amount: e.target.value })
                      }
                      className="border rounded p-1 w-full"
                      min="0"
                      step="0.01"
                    />
                  </td>
                  <td className="border px-2 py-1">
                    <input
                      type="text"
                      value={editFields.description}
                      onChange={(e) =>
                        setEditFields({ ...editFields, description: e.target.value })
                      }
                      className="border rounded p-1 w-full"
                    />
                  </td>
                  <td className="border px-2 py-1 text-center">
                    <button
                      onClick={saveEditing}
                      className="bg-green-600 text-white px-3 py-1 rounded mr-2 hover:bg-green-700"
                    >
                      Save
                    </button>
                    <button
                      onClick={cancelEditing}
                      className="bg-gray-400 px-3 py-1 rounded hover:bg-gray-500"
                    >
                      Cancel
                    </button>
                  </td>
                </tr>
              ) : (
                <tr key={record.id}>
                  <td className="border px-3 py-2">{record.date}</td>
                  <td className="border px-3 py-2">{record.vehicle}</td>
                  <td className="border px-3 py-2">{record.place}</td>
                  <td className="border px-3 py-2">{record.amount}</td>
                  <td className="border px-3 py-2">{record.description}</td>
                  <td className="border px-3 py-2 text-center space-x-2">
                    <button
                      onClick={() => startEditing(record)}
                      className="bg-yellow-400 px-3 py-1 rounded hover:bg-yellow-500"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClick(record)}
                      className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              )
            )}
          </tbody>
          <tfoot>
            <tr className="bg-gray-100 font-semibold">
              <td colSpan="3" className="border px-3 py-2 text-right">
                Total Amount:
              </td>
              <td className="border px-3 py-2">{totalAmount.toFixed(2)}</td>
              <td colSpan="2" className="border px-3 py-2"></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Download PDF Button */}
      <button
        onClick={handleDownloadPDF}
        className="bg-teal-600 text-white px-6 py-2 rounded hover:bg-teal-700"
      >
        Download PDF
      </button>

      {/* Delete Confirmation Dialog */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full text-center shadow-lg">
            <p className="mb-4 font-semibold text-lg">
              Confirm Deletion
            </p>
            <p className="mb-6">
              Are you sure you want to delete this record? This action cannot be
              undone.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={confirmDelete}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Yes, Delete
              </button>
              <button
                onClick={cancelDelete}
                className="bg-gray-400 px-4 py-2 rounded hover:bg-gray-500"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export  {CustomerRecordView};

