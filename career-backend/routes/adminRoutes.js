// // routes/admin.js
// const express = require("express");
// const router = express.Router();
// const db = require("../db"); // your db connection (pg Pool or Client)

// Fetch all table names
// router.get("/tables", async (req, res) => {
//     try {
//       const tablesResult = await db.query(`
//         SELECT table_name
//         FROM information_schema.tables
//         WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
//       `);
  
//       const tables = tablesResult.rows.map(row => row.table_name);
  
//       const tableData = {};
  
//       for (const table of tables) {
//         const columnsResult = await db.query(`
//           SELECT column_name, data_type
//           FROM information_schema.columns
//           WHERE table_name = $1
//         `, [table]);
  
//         const dataResult = await db.query(`SELECT * FROM "${table}"`);
  
//         tableData[table] = {
//           columns: columnsResult.rows,
//           data: dataResult.rows,
//         };
//       }
  
//       res.json(tableData);
//     } catch (error) {
//       console.error("Error fetching table info:", error);
//       res.status(500).json({ error: "Failed to fetch table info" });
//     }
//   });
// module.exports = router;


const express = require("express");
const router = express.Router();
const db = require("../db"); // your configured db connection

// Get all table names with column and row data
router.get("/tables", async (req, res) => {
  try {
    const tablesResult = await db.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    `);

    const tables = tablesResult.rows.map(row => row.table_name);
    const tableData = {};

    for (const table of tables) {
      const columnsResult = await db.query(`
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_name = $1
      `, [table]);

      const dataResult = await db.query(`SELECT * FROM "${table}"`);

      tableData[table] = {
        columns: columnsResult.rows,
        data: dataResult.rows,
      };
    }

    res.json(tableData);
  } catch (error) {
    console.error("Error fetching table info:", error);
    res.status(500).json({ error: "Failed to fetch table info" });
  }
});

// Add new record
router.post("/table/:tableName", async (req, res) => {
  const { tableName } = req.params;
  const data = req.body;
  const columns = Object.keys(data);
  const values = Object.values(data);

  const query = `
    INSERT INTO "${tableName}" (${columns.map(c => `"${c}"`).join(", ")})
    VALUES (${columns.map((_, i) => `$${i + 1}`).join(", ")})
    RETURNING *
  `;

  try {
    const result = await db.query(query, values);
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Insert error:", error);
    res.status(500).json({ error: "Insert failed" });
  }
});

// Update record
router.put("/table/:tableName/:id", async (req, res) => {
  const { tableName, id } = req.params;
  const data = req.body;
  const columns = Object.keys(data);
  const values = Object.values(data);

  const query = `
    UPDATE "${tableName}"
    SET ${columns.map((c, i) => `"${c}" = $${i + 1}`).join(", ")}
    WHERE id = $${columns.length + 1}
    RETURNING *
  `;

  try {
    const result = await db.query(query, [...values, id]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ error: "Update failed" });
  }
});

// Delete record
router.delete("/table/:tableName/:id", async (req, res) => {
  const { tableName, id } = req.params;

  try {
    await db.query(`DELETE FROM "${tableName}" WHERE id = $1`, [id]);
    res.json({ message: "Deleted successfully" });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ error: "Delete failed" });
  }
});

module.exports = router;
