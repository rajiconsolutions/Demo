import { db } from "../db/index.db.js";

export const GetPatientList = async (req, res) => {
  const connection = await db.getConnection();

  try {
    const query = `SELECT * FROM patient`;

    const [data] = await connection.query(query);
    return res.json(data);
  } catch (error) {
    console.error("Error fetching patients:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  } finally {
    connection.release();
  }
};

export const GetPatient = async (req, res) => {
  const { id } = req.params;
  const connection = await db.getConnection();

  try {
    const query = `SELECT * FROM patient WHERE PatID = ?`;

    const [data] = await connection.query(query, [id]);
    return res.json(data);
  } catch (error) {
    console.error("Error fetching patients:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  } finally {
    connection.release();
  }
};

export const AddPatient = async (req, res) => {
  const { data } = req.body;
  const connection = await db.getConnection();
  console.log(data);
  if (data === undefined || data === null || !data) {
    return res.json({
      success: false,
      message: "Data is missing",
    });
  }

  try {
    const keys = Object.keys(data).map((k) => `\`${k}\``); // wrap all keys with backticks
    const values = Object.values(data);

    const placeholders = keys.map(() => "?").join(", ");
    const columns = keys.join(", ");

    await connection.execute(
      `INSERT INTO patient (${columns}) VALUES (${placeholders})`,
      values
    );

    // Notify all connected clients about account change
    global._io.emit("patient:created");

    return res.json({ success: true, message: "Patient create successfully" });
  } catch (error) {
    console.error("Error posting patients:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  } finally {
    connection.release();
  }
};

export const UpdatePatient = async (req, res) => {
  const { id } = req.params; // assuming patient id is passed in URL
  const { data } = req.body;
  const connection = await db.getConnection();

  if (!id) {
    return res
      .status(400)
      .json({ success: false, message: "Patient ID is missing" });
  }
  if (!data || Object.keys(data).length === 0) {
    return res
      .status(400)
      .json({ success: false, message: "No data provided for update" });
  }

  try {
    const keys = Object.keys(data);
    const values = Object.values(data);

    const setClause = keys.map((key) => `${key} = ?`).join(", ");

    await connection.execute(
      `UPDATE patient SET ${setClause} WHERE PatID = ?`,
      [...values, id]
    );

    global._io.emit("patient:updated", { id });

    return res.json({ success: true, message: "Patient updated successfully" });
  } catch (error) {
    console.error("Error updating patient:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  } finally {
    connection.release();
  }
};

export const DeletePatient = async (req, res) => {
  const { id } = req.params;
  const connection = await db.getConnection();

  if (!id) {
    return res
      .status(400)
      .json({ success: false, message: "Patient ID is missing" });
  }

  try {
    await connection.execute(`DELETE FROM patient WHERE PatID = ?`, [id]);

    global._io.emit("patient:deleted", { id });

    return res.json({ success: true, message: "Patient deleted successfully" });
  } catch (error) {
    console.error("Error deleting patient:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  } finally {
    connection.release();
  }
};
