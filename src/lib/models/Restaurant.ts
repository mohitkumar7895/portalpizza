import { query, execute } from "@/lib/db";
import type { RowDataPacket, ResultSetHeader } from "mysql2/promise";

export interface RestaurantDoc {
  id: number;
  name: string;
  slug: string;
  ownerName: string;
  phone: string;
  email: string;
  status: "active" | "pending" | "inactive" | "suspended";
  paymentStatus: "paid" | "pending" | "failed";
  paymentAmount: number;
  paymentNotes: string;
  assignedTo?: number;
  assignedName?: string;
  assignedRole?: string;
  taskNotes?: string;
  taskStatus?: "pending" | "in_progress" | "completed";
  monthlyFee?: number;
  billingDueDate?: string;
  subscriptionStatus?: "active" | "expired" | "suspended";
  lastPaymentDate?: string;
  adminId?: number;
  adminUsername?: string;
  adminRole?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

function formatDateStr(d: any): string | undefined {
  if (!d) return undefined;
  if (typeof d === "string") return d.slice(0, 10);
  if (d instanceof Date) {
    const yr = d.getFullYear();
    const mo = String(d.getMonth() + 1).padStart(2, "0");
    const da = String(d.getDate()).padStart(2, "0");
    return `${yr}-${mo}-${da}`;
  }
  return String(d).slice(0, 10);
}

function mapRow(r: RowDataPacket): RestaurantDoc {
  return {
    id: r.id,
    name: r.name,
    slug: r.slug,
    ownerName: r.ownerName ?? "",
    phone: r.phone ?? "",
    email: r.email ?? "",
    status: (r.status as RestaurantDoc["status"]) ?? "pending",
    paymentStatus: (r.paymentStatus as RestaurantDoc["paymentStatus"]) ?? "pending",
    paymentAmount: Number(r.paymentAmount ?? 0),
    paymentNotes: r.paymentNotes ?? "",
    assignedTo: r.assignedTo !== undefined && r.assignedTo !== null ? Number(r.assignedTo) : undefined,
    assignedName: r.assignedName ? String(r.assignedName) : undefined,
    assignedRole: r.assignedRole ? String(r.assignedRole) : undefined,
    taskNotes: r.taskNotes ? String(r.taskNotes) : "",
    taskStatus: (r.taskStatus as RestaurantDoc["taskStatus"]) ?? "pending",
    monthlyFee: r.monthlyFee !== undefined && r.monthlyFee !== null ? Number(r.monthlyFee) : 0,
    billingDueDate: formatDateStr(r.billingDueDate),
    subscriptionStatus: (r.subscriptionStatus as RestaurantDoc["subscriptionStatus"]) ?? "active",
    lastPaymentDate: formatDateStr(r.lastPaymentDate),
    adminId: r.adminId !== undefined && r.adminId !== null ? Number(r.adminId) : undefined,
    adminUsername: r.adminUsername ? String(r.adminUsername) : undefined,
    adminRole: r.adminRole ? String(r.adminRole) : undefined,
    createdAt: r.createdAt ? new Date(r.createdAt) : undefined,
    updatedAt: r.updatedAt ? new Date(r.updatedAt) : undefined,
  };
}

export const Restaurant = {
  async findBySlug(slug: string): Promise<RestaurantDoc | null> {
    const s = slug.trim().toLowerCase();
    const rows = await query<RowDataPacket[]>(
      `SELECT * FROM restaurants WHERE slug = ? AND status = 'active' LIMIT 1`,
      [s]
    );
    if (!rows || rows.length === 0) return null;
    return mapRow(rows[0]);
  },

  async findBySlugAny(slug: string): Promise<RestaurantDoc | null> {
    const s = slug.trim().toLowerCase();
    const rows = await query<RowDataPacket[]>(
      `SELECT * FROM restaurants WHERE slug = ? LIMIT 1`,
      [s]
    );
    if (!rows || rows.length === 0) return null;
    return mapRow(rows[0]);
  },

  async findById(id: number | string): Promise<RestaurantDoc | null> {
    const numId = Number(id);
    if (!numId || isNaN(numId)) return null;
    const rows = await query<RowDataPacket[]>(
      `SELECT * FROM restaurants WHERE id = ? LIMIT 1`,
      [numId]
    );
    if (!rows || rows.length === 0) return null;
    return mapRow(rows[0]);
  },

  async findAllActive(): Promise<RestaurantDoc[]> {
    const rows = await query<RowDataPacket[]>(
      `SELECT * FROM restaurants WHERE status = 'active' ORDER BY createdAt DESC`
    );
    return rows.map(mapRow);
  },

  async findAll(): Promise<RestaurantDoc[]> {
    const rows = await query<RowDataPacket[]>(
      `SELECT 
        r.id, r.name, r.slug, r.ownerName, r.phone, r.email, r.status, r.paymentStatus, r.paymentAmount, r.paymentNotes,
        r.assignedTo, r.assignedName, r.assignedRole, r.taskNotes, r.taskStatus,
        r.monthlyFee, r.billingDueDate, r.subscriptionStatus, r.lastPaymentDate, r.createdAt, r.updatedAt,
        a.id AS adminId, a.username AS adminUsername, a.role AS adminRole
      FROM restaurants r
      LEFT JOIN admins a ON a.id = (
        SELECT id FROM admins WHERE admins.restaurantId = r.id ORDER BY id ASC LIMIT 1
      )
      ORDER BY r.createdAt DESC`
    );
    return rows.map(mapRow);
  },

  async slugExists(slug: string): Promise<boolean> {
    const s = slug.trim().toLowerCase();
    const rows = await query<RowDataPacket[]>(
      "SELECT id FROM restaurants WHERE slug = ? LIMIT 1",
      [s]
    );
    return Boolean(rows && rows.length > 0);
  },

  async create(data: {
    name: string;
    slug: string;
    ownerName?: string;
    phone?: string;
    email?: string;
    status?: "active" | "pending" | "inactive" | "suspended";
    paymentStatus?: "paid" | "pending" | "failed";
    paymentAmount?: number;
    paymentNotes?: string;
    assignedTo?: number;
    assignedName?: string;
    assignedRole?: string;
    taskNotes?: string;
    taskStatus?: "pending" | "in_progress" | "completed";
    monthlyFee?: number;
    billingDueDate?: string | null;
    subscriptionStatus?: "active" | "expired" | "suspended";
  }): Promise<RestaurantDoc> {
    const s = data.slug.trim().toLowerCase();
    const status = data.status ?? "pending";
    const paymentStatus = data.paymentStatus ?? "pending";
    const paymentAmount = data.paymentAmount ?? 0;
    const paymentNotes = data.paymentNotes ?? "";
    const assignedTo = data.assignedTo ?? null;
    const assignedName = data.assignedName ?? null;
    const assignedRole = data.assignedRole ?? null;
    const taskNotes = data.taskNotes ?? "";
    const taskStatus = data.taskStatus ?? "pending";
    const monthlyFee = data.monthlyFee ?? 0;
    const billingDueDate = data.billingDueDate ?? null;
    const subscriptionStatus = data.subscriptionStatus ?? "active";

    const result = await execute<ResultSetHeader>(
      `INSERT INTO restaurants 
       (name, slug, ownerName, phone, email, status, paymentStatus, paymentAmount, paymentNotes,
        assignedTo, assignedName, assignedRole, taskNotes, taskStatus, monthlyFee, billingDueDate, subscriptionStatus)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.name.trim(),
        s,
        data.ownerName?.trim() ?? "",
        data.phone?.trim() ?? "",
        data.email?.trim() ?? "",
        status,
        paymentStatus,
        paymentAmount,
        paymentNotes,
        assignedTo,
        assignedName,
        assignedRole,
        taskNotes,
        taskStatus,
        monthlyFee,
        billingDueDate,
        subscriptionStatus,
      ]
    );

    return {
      id: result.insertId,
      name: data.name.trim(),
      slug: s,
      ownerName: data.ownerName?.trim() ?? "",
      phone: data.phone?.trim() ?? "",
      email: data.email?.trim() ?? "",
      status,
      paymentStatus,
      paymentAmount,
      paymentNotes,
      assignedTo: assignedTo ?? undefined,
      assignedName: assignedName ?? undefined,
      assignedRole: assignedRole ?? undefined,
      taskNotes,
      taskStatus,
      monthlyFee,
      billingDueDate: billingDueDate ?? undefined,
      subscriptionStatus,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  },

  async updateStatus(
    id: number | string,
    updates: {
      name?: string;
      ownerName?: string;
      phone?: string;
      email?: string;
      status?: "active" | "pending" | "inactive" | "suspended";
      paymentStatus?: "paid" | "pending" | "failed";
      paymentAmount?: number;
      paymentNotes?: string;
      assignedTo?: number | null;
      assignedName?: string | null;
      assignedRole?: string | null;
      taskNotes?: string;
      taskStatus?: "pending" | "in_progress" | "completed";
      monthlyFee?: number;
      billingDueDate?: string | null;
      subscriptionStatus?: "active" | "expired" | "suspended";
      lastPaymentDate?: string | null;
    }
  ): Promise<boolean> {
    const numId = Number(id);
    if (!numId || isNaN(numId)) return false;

    const fields: string[] = [];
    const values: any[] = [];

    if (updates.name !== undefined) {
      fields.push("name = ?");
      values.push(updates.name.trim());
    }
    if (updates.ownerName !== undefined) {
      fields.push("ownerName = ?");
      values.push(updates.ownerName.trim());
    }
    if (updates.phone !== undefined) {
      fields.push("phone = ?");
      values.push(updates.phone.trim());
    }
    if (updates.email !== undefined) {
      fields.push("email = ?");
      values.push(updates.email.trim());
    }
    if (updates.status !== undefined) {
      fields.push("status = ?");
      values.push(updates.status);
    }
    if (updates.paymentStatus !== undefined) {
      fields.push("paymentStatus = ?");
      values.push(updates.paymentStatus);
    }
    if (updates.paymentAmount !== undefined) {
      fields.push("paymentAmount = ?");
      values.push(updates.paymentAmount);
    }
    if (updates.paymentNotes !== undefined) {
      fields.push("paymentNotes = ?");
      values.push(updates.paymentNotes);
    }
    if (updates.assignedTo !== undefined) {
      fields.push("assignedTo = ?");
      values.push(updates.assignedTo);
    }
    if (updates.assignedName !== undefined) {
      fields.push("assignedName = ?");
      values.push(updates.assignedName);
    }
    if (updates.assignedRole !== undefined) {
      fields.push("assignedRole = ?");
      values.push(updates.assignedRole);
    }
    if (updates.taskNotes !== undefined) {
      fields.push("taskNotes = ?");
      values.push(updates.taskNotes);
    }
    if (updates.taskStatus !== undefined) {
      fields.push("taskStatus = ?");
      values.push(updates.taskStatus);
    }
    if (updates.monthlyFee !== undefined) {
      fields.push("monthlyFee = ?");
      values.push(updates.monthlyFee);
    }
    if (updates.billingDueDate !== undefined) {
      fields.push("billingDueDate = ?");
      values.push(updates.billingDueDate);
    }
    if (updates.subscriptionStatus !== undefined) {
      fields.push("subscriptionStatus = ?");
      values.push(updates.subscriptionStatus);
    }
    if (updates.lastPaymentDate !== undefined) {
      fields.push("lastPaymentDate = ?");
      values.push(updates.lastPaymentDate);
    }

    if (fields.length === 0) return true;

    values.push(numId);
    const sql = `UPDATE restaurants SET ${fields.join(", ")} WHERE id = ?`;
    await execute(sql, values);
    return true;
  },

  async delete(id: number | string): Promise<boolean> {
    const numId = Number(id);
    if (!numId || isNaN(numId)) return false;
    await execute("DELETE FROM restaurants WHERE id = ?", [numId]);
    return true;
  },
};
