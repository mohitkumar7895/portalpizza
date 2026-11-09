"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  createCategory,
  deleteCategory,
  fetchCategories,
  updateCategory,
} from "@/services/categories";
import { uploadImage } from "@/services/products";
import type { CategoryDTO } from "@/types";
import { Upload, ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function AdminCategoriesPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [list, setList] = useState<CategoryDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [image, setImage] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setList(await fetchCategories());
    } catch {
      setMsg("Failed to load categories.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const reset = () => {
    setEditingId(null);
    setName("");
    setSortOrder("0");
    setImage("");
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    if (!name.trim()) {
      setMsg("Name is required.");
      return;
    }
    const so = Number(sortOrder);
    try {
      if (editingId) {
        await updateCategory(editingId, {
          name: name.trim(),
          sortOrder: Number.isNaN(so) ? 0 : so,
          image: image.trim(),
        });
        setMsg("Category updated.");
      } else {
        await createCategory({
          name: name.trim(),
          sortOrder: Number.isNaN(so) ? 0 : so,
          image: image.trim(),
        });
        setMsg("Category created.");
      }
      reset();
      load();
    } catch {
      setMsg("Save failed — duplicate name or unauthorized.");
    }
  };

  const startEdit = (c: CategoryDTO) => {
    setEditingId(c._id);
    setName(c.name);
    setSortOrder(String(c.sortOrder));
    setImage(c.image);
  };

  const onDelete = async (c: CategoryDTO) => {
    if (
      !confirm(
        `Delete category "${c.name}"?\n\nAll products in this category will be permanently deleted.`
      )
    ) {
      return;
    }
    try {
      const { productsDeleted } = await deleteCategory(c._id);
      setMsg(
        productsDeleted > 0
          ? `Category deleted. ${productsDeleted} product(s) removed.`
          : "Category deleted."
      );
      load();
    } catch {
      setMsg("Delete failed.");
    }
  };

  const onFile = async (f: File | null) => {
    if (!f) return;
    setUploading(true);
    setMsg(null);
    try {
      setImage(await uploadImage(f));
    } catch {
      setMsg("Image upload failed — check internet or try a different file.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 shadow-xs hover:bg-neutral-50 transition"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Dashboard</span>
            </Link>
          </div>
          <h1 className="text-2xl font-bold mt-3">Categories</h1>
          <p className="text-sm text-neutral-600">
            Create and organize menu categories for your store. Names will match what you pick on products.
          </p>
        </div>
      </div>
      {msg && (
        <div className="rounded-xl bg-amber-50 px-4 py-3 text-sm">{msg}</div>
      )}

      <form
        onSubmit={onSubmit}
        className="grid gap-4 rounded-2xl border border-neutral-200 bg-white p-4 sm:p-6 shadow-sm md:grid-cols-2"
      >
        <label className="text-xs font-bold uppercase text-neutral-500">
          Name
          <input
            required
            className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        {editingId ? (
          <label className="text-xs font-bold uppercase text-neutral-500">
            Sort order
            <input
              type="number"
              className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            />
          </label>
        ) : (
          <div className="flex items-end pb-1 text-sm text-neutral-600">
            <p>
              Sort: <span className="font-semibold text-neutral-800">last</span> (new
              categories go to the bottom)
            </p>
          </div>
        )}
        <label className="md:col-span-2 text-xs font-bold uppercase text-neutral-500">
          Thumbnail URL
          <input
            className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
            value={image}
            onChange={(e) => setImage(e.target.value)}
          />
        </label>

        {/* File Upload Area */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => !uploading && fileInputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              if (!uploading) fileInputRef.current?.click();
            }
          }}
          className={`md:col-span-2 cursor-pointer rounded-xl border-2 border-dashed border-[#e60000]/35 bg-linear-to-br from-[#fff8f5] to-[#fdf6e8] p-3 text-center transition hover:border-[#e60000]/60 hover:shadow-sm ${uploading ? "pointer-events-none opacity-60" : ""}`}
        >
          <Upload className="mx-auto h-8 w-8 text-[#e60000]" aria-hidden />
          <p className="mt-2 text-sm font-semibold text-neutral-900">Upload image</p>
          <p className="mt-0.5 text-xs text-neutral-600">
            Click or drag PNG/JPG
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="sr-only"
            tabIndex={-1}
            onChange={(e) => onFile(e.target.files?.[0] ?? null)}
            disabled={uploading}
          />
          <p className="mt-1.5 text-xs text-neutral-500">
            {uploading ? "Uploading…" : "Square (1:1)"}
          </p>
        </div>
        <div className="flex gap-2 md:col-span-2">
          <button
            type="submit"
            className="rounded-full bg-[#e60000] px-6 py-2.5 text-sm font-bold text-white"
          >
            {editingId ? "Update" : "Add category"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={reset}
              className="rounded-full border px-6 py-2.5 text-sm font-semibold"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Mobile Card List (< md) */}
      <div className="space-y-3 md:hidden">
        {loading ? (
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 text-center text-sm text-neutral-500">
            Loading categories…
          </div>
        ) : list.length === 0 ? (
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 text-center text-sm text-neutral-500">
            No categories yet. Add your first category above!
          </div>
        ) : (
          list.map((c) => (
            <div
              key={c._id}
              className="rounded-2xl border border-neutral-200 bg-white p-3.5 shadow-xs flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100">
                  <Image
                    src={c.image || "/placeholder-food.svg"}
                    alt={c.name}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-neutral-900 truncate">{c.name}</h3>
                  <p className="text-xs text-neutral-500">Order: {c.sortOrder}</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    startEdit(c);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="rounded-lg bg-neutral-100 px-3 py-1.5 text-xs font-bold text-neutral-800 hover:bg-neutral-200 transition cursor-pointer"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(c)}
                  className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-100 transition cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Table (md:block) */}
      <div className="hidden md:block overflow-x-auto rounded-2xl border border-neutral-200 bg-white scrollbar-hide">
        <table className="w-full text-left text-sm">
          <thead className="bg-neutral-50 text-xs uppercase text-neutral-500">
            <tr>
              <th className="px-4 py-3">Image</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Sort Order</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center">
                  Loading…
                </td>
              </tr>
            ) : (
              list.map((c) => (
                <tr key={c._id} className="border-t border-neutral-100">
                  <td className="px-4 py-2">
                    <div className="relative h-10 w-10 overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100">
                      <Image
                        src={c.image || "/placeholder-food.svg"}
                        alt={c.name}
                        fill
                        className="object-cover"
                        sizes="40px"
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium">{c.name}</td>
                  <td className="px-4 py-3 tabular-nums">{c.sortOrder}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      className="mr-2 text-[#e60000] hover:underline cursor-pointer"
                      onClick={() => startEdit(c)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="text-red-600 hover:underline cursor-pointer"
                      onClick={() => onDelete(c)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
