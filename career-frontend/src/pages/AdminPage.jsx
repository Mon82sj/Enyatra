import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Container, Row, Col, Card, Table, Button, Modal, Form, Spinner,
} from "react-bootstrap";
import { Pencil, Trash2, Plus } from "lucide-react";

const AdminDashboard = () => {
  const [tables, setTables] = useState({});
  const [selectedTable, setSelectedTable] = useState(null);
  const [formData, setFormData] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/admin/tables");
      setTables(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching tables:", err);
    }
  };

  const handleAdd = (table) => {
    setSelectedTable(table);
    setFormData({});
    setEditMode(false);
    setShowModal(true);
  };

  const handleEdit = (table, row) => {
    setSelectedTable(table);
    setFormData(row);
    setEditMode(true);
    setEditId(row.id);
    setShowModal(true);
  };

  const handleDelete = async (table, id) => {
    if (!window.confirm("Delete this record?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/admin/table/${table}/${id}`);
      fetchTables();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const handleSubmit = async () => {
    try {
      const url = editMode
        ? `http://localhost:5000/api/admin/table/${selectedTable}/${editId}`
        : `http://localhost:5000/api/admin/table/${selectedTable}`;

      const method = editMode ? axios.put : axios.post;

      await method(url, formData);
      setShowModal(false);
      fetchTables();
    } catch (err) {
      console.error("Save failed:", err);
    }
  };

  return (
    <Container className="py-4">
      <h2 className="mb-4 text-info fw-bold">Admin Dashboard</h2>
      {loading ? (
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : (
        Object.entries(tables).map(([table, { columns, data }]) => (
          <Card key={table} className="mb-4 shadow-sm">
            <Card.Header className="bg-info text-white d-flex justify-content-between">
              <strong>{table.toUpperCase()}</strong>
              <Button size="sm" variant="light" onClick={() => handleAdd(table)}>
                <Plus size={18} /> Add
              </Button>
            </Card.Header>
            <Card.Body>
              <Table bordered hover responsive>
                <thead>
                  <tr>
                    {columns.map((col) => (
                      <th key={col.column_name}>{col.column_name}</th>
                    ))}
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((row) => (
                    <tr key={row.id}>
                      {columns.map((col) => (
                        <td key={col.column_name}>
                        {typeof row[col.column_name] === 'object' && row[col.column_name] !== null
                          ? JSON.stringify(row[col.column_name])
                          : row[col.column_name]}
                      </td>
                      
                      ))}
                      <td>
                        <Button
                          size="sm"
                          variant="outline-primary"
                          className="me-2"
                          onClick={() => handleEdit(table, row)}
                        >
                          <Pencil size={16} />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline-danger"
                          onClick={() => handleDelete(table, row.id)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        ))
      )}

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{editMode ? "Edit Record" : "Add New Record"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            {tables[selectedTable]?.columns.map((col) => (
              <Form.Group className="mb-3" key={col.column_name}>
                <Form.Label>{col.column_name}</Form.Label>
                <Form.Control
                  type="text"
                  value={formData[col.column_name] || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, [col.column_name]: e.target.value })
                  }
                />
              </Form.Group>
            ))}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            {editMode ? "Update" : "Create"}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AdminDashboard;
