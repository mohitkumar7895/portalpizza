import { query, execute } from "@/lib/db";
import type { RowDataPacket, ResultSetHeader } from "mysql2/promise";

export interface SuperAdminDoc {
  id: number;
  username: string;
  passwordHash: string;
  name: string;
  email?: string;
  phone?: string;
  role?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

function mapRow(r: RowDataPacket): SuperAdminDoc {
  return {
    id: r.id,
    username: r.username,
    passwordHash: r.passwordHash,
    name: r.name ?? "Super Administrator",
    email: r.email ?? "",
    phone: r.phone ?? "",
    role: r.role ?? "superadmin",
    createdAt: r.createdAt ? new Date(r.createdAt) : undefined,
    updatedAt: r.updatedAt ? new Date(r.updatedAt) : undefined,
  };
}

export const SuperAdmin = {
  async findByUsername(username: string): Promise<SuperAdminDoc | null> {
    const u = username.trim();
    const rows = await query<RowDataPacket[]>(
      "SELECT * FROM super_admins WHERE username = ? LIMIT 1",
      [u]
    );
    if (!rows || rows.length === 0) return null;
    return mapRow(rows[0]);
  },

  async findById(id: number | string): Promise<SuperAdminDoc | null> {
    const numId = Number(id);
    if (!numId || isNaN(numId)) return null;
    const rows = await query<RowDataPacket[]>(
      "SELECT * FROM super_admins WHERE id = ? LIMIT 1",
      [numId]
    );
    if (!rows || rows.length === 0) return null;
    return mapRow(rows[0]);
  },

  async findAll(): Promise<SuperAdminDoc[]> {
    const rows = await query<RowDataPacket[]>(
      "SELECT * FROM super_admins ORDER BY id ASC"
    );
    return rows.map(mapRow);
  },

  async create(data: {
    username: string;
    passwordHash: string;
    name: string;
    email?: string;
    phone?: string;
    role?: string;
  }): Promise<SuperAdminDoc> {
    const role = data.role?.trim() || "superadmin";
    let insertId: number;

    try {
      const result = await execute<ResultSetHeader>(
        "INSERT INTO super_admins (username, passwordHash, name, email, phone, role) VALUES (?, ?, ?, ?, ?, ?)",
        [
          data.username.trim(),
          data.passwordHash,
          data.name.trim(),
          data.email?.trim() ?? "",
          data.phone?.trim() ?? "",
          role,
        ]
      );
      insertId = result.insertId;
    } catch (e: any) {
      // If role/email/phone columns don't exist yet in the database, insert minimal fields
      if (e?.code === "ER_BAD_FIELD_ERROR" || e?.errno === 1054) {
        const result = await execute<ResultSetHeader>(
          "INSERT INTO super_admins (username, passwordHash, name) VALUES (?, ?, ?)",
          [
            data.username.trim(),
            data.passwordHash,
            data.name.trim(),
          ]
        );
        insertId = result.insertId;
      } else {
        throw e;
      }
    }

    return {
      id: insertId,
      username: data.username.trim(),
      passwordHash: data.passwordHash,
      name: data.name.trim(),
      email: data.email?.trim() ?? "",
      phone: data.phone?.trim() ?? "",
      role,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  },

  async updatePassword(id: number | string, passwordHash: string): Promise<boolean> {
    const numId = Number(id);
    if (!numId || isNaN(numId)) return false;
    await execute("UPDATE super_admins SET passwordHash = ?, updatedAt = NOW() WHERE id = ?", [
      passwordHash,
      numId,
    ]);
    return true;
  },

  async updateProfile(
    id: number | string,
    data: { name?: string; email?: string; phone?: string; role?: string }
  ): Promise<boolean> {
    const numId = Number(id);
    if (!numId || isNaN(numId)) return false;

    const fields: string[] = [];
    const values: any[] = [];

    if (data.name !== undefined) {
      fields.push("name = ?");
      values.push(data.name.trim());
    }
    if (data.email !== undefined) {
      fields.push("email = ?");
      values.push(data.email.trim());
    }
    if (data.phone !== undefined) {
      fields.push("phone = ?");
      values.push(data.phone.trim());
    }
    if (data.role !== undefined) {
      fields.push("role = ?");
      values.push(data.role.trim());
    }

    if (fields.length === 0) return true;

    values.push(numId);
    try {
      await execute(
        `UPDATE super_admins SET ${fields.join(", ")}, updatedAt = NOW() WHERE id = ?`,
        values
      );
    } catch (e: any) {
      if (e?.code === "ER_BAD_FIELD_ERROR" || e?.errno === 1054) {
        // Fallback to name only if other columns don't exist
        if (data.name !== undefined) {
          await execute("UPDATE super_admins SET name = ?, updatedAt = NOW() WHERE id = ?", [
            data.name.trim(),
            numId,
          ]);
        }
      } else {
        throw e;
      }
    }
    return true;
  },
};
