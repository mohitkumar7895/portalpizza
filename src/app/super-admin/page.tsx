"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  Store,
  CheckCircle2,
  Clock,
  Ban,
  Search,
  ExternalLink,
  MessageCircle,
  Trash2,
  LogOut,
  RefreshCw,
  Loader2,
  Check,
  X,
  CreditCard,
  User,
  Phone,
  Calendar,
  ArrowLeft,
  KeyRound,
  Plus,
  UserPlus,
  Eye,
  EyeOff,
  Sun,
  Moon,
  AlertCircle,
  Lock,
  LayoutDashboard,
  Shield,
  Menu,
  Copy,
  CheckCheck,
  DollarSign,
  Users,
  ChevronRight,
  TrendingUp,
  UserCheck,
  ClipboardList,
  Edit3,
  Briefcase,
  Headphones,
  CalendarClock,
  AlertTriangle,
} from "lucide-react";
import { http } from "@/services/http";

interface RestaurantItem {
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
  createdAt?: string;
  updatedAt?: string;
}

interface StaffMember {
  id: number;
  username: string;
  name: string;
  email: string;
  phone: string;
  role: "superadmin" | "operator" | "support";
  assignedStoresCount: number;
  createdAt?: string;
}

interface SummaryData {
  total: number;
  active: number;
  pending: number;
  suspended: number;
  paidCount: number;
  pendingPaymentCount: number;
  totalRevenue: number;
}

type NavSection =
  | "overview"
  | "my-tasks"
  | "restaurants"
  | "unassigned"
  | "pending"
  | "active"
  | "suspended"
  | "payments"
  | "staff-directory";

export default function SuperAdminDashboard() {
  const [restaurants, setRestaurants] = useState<RestaurantItem[]>([]);
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [summary, setSummary] = useState<SummaryData>({
    total: 0,
    active: 0,
    pending: 0,
    suspended: 0,
    paidCount: 0,
    pendingPaymentCount: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [activeSection, setActiveSection] = useState<NavSection>("overview");
  const [filterTab, setFilterTab] = useState<"all" | "pending" | "active" | "suspended">("all");
  const [paymentFilter, setPaymentFilter] = useState<"all" | "paid" | "pending">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [adminName, setAdminName] = useState("Super Admin");
  const [userRole, setUserRole] = useState<"superadmin" | "operator" | "support">("superadmin");
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  // --- Modal States ---
  // 1. Super Admin Change Password
  const [isChangePassOpen, setIsChangePassOpen] = useState(false);
  const [currPass, setCurrPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [passSubmitting, setPassSubmitting] = useState(false);
  const [passError, setPassError] = useState<string | null>(null);

  // 2. Reset Partner Password
  const [resetPartnerTarget, setResetPartnerTarget] = useState<RestaurantItem | null>(null);
  const [partnerNewPass, setPartnerNewPass] = useState("");
  const [partnerConfirmPass, setPartnerConfirmPass] = useState("");
  const [resetSubmitting, setResetSubmitting] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);

  // 3. Create Partner
  const [isCreatePartnerOpen, setIsCreatePartnerOpen] = useState(false);
  const [newStoreName, setNewStoreName] = useState("");
  const [newStoreSlug, setNewStoreSlug] = useState("");
  const [modalSlugAvailable, setModalSlugAvailable] = useState<boolean | null>(null);
  const [modalCheckingSlug, setModalCheckingSlug] = useState(false);

  // 4. Register Staff / Admin
  const [isRegisterAdminOpen, setIsRegisterAdminOpen] = useState(false);
  const [regUsername, setRegUsername] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regRole, setRegRole] = useState("operator");
  const [regSubmitting, setRegSubmitting] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);

  // 5. Task Assignment Modal (for Super Admin)
  const [assignTarget, setAssignTarget] = useState<RestaurantItem | null>(null);
  const [assignStaffId, setAssignStaffId] = useState<number | "">("");
  const [assignNotes, setAssignNotes] = useState("");
  const [assignStatus, setAssignStatus] = useState<"pending" | "in_progress" | "completed">("pending");
  const [assignSubmitting, setAssignSubmitting] = useState(false);

  // 6. Monthly Billing & Validity Modal (for Super Admin)
  const [billingTarget, setBillingTarget] = useState<RestaurantItem | null>(null);
  const [billFee, setBillFee] = useState("0");
  const [billDueDate, setBillDueDate] = useState("");
  const [billDay, setBillDay] = useState<number>(new Date().getDate());
  const [billMonth, setBillMonth] = useState<number>(new Date().getMonth() + 1);
  const [billYear, setBillYear] = useState<number>(new Date().getFullYear());
  const [billPaymentStatus, setBillPaymentStatus] = useState<"paid" | "pending">("paid");
  const [billSubStatus, setBillSubStatus] = useState<"active" | "expired" | "suspended">("active");
  const [billNotes, setBillNotes] = useState("");
  const [billingSubmitting, setBillingSubmitting] = useState(false);

  // 7. Edit Store Details Modal (for Operator)
  const [editStoreTarget, setEditStoreTarget] = useState<RestaurantItem | null>(null);
  const [editName, setEditName] = useState("");
  const [editOwner, setEditOwner] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editTaskNotes, setEditTaskNotes] = useState("");
  const [editTaskStatus, setEditTaskStatus] = useState<"pending" | "in_progress" | "completed">("pending");
  const [editSubmitting, setEditSubmitting] = useState(false);

  const [showPasswordMap, setShowPasswordMap] = useState<Record<string, boolean>>({});

  const toggleShowPassword = (key: string) => {
    setShowPasswordMap((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const [impersonatingId, setImpersonatingId] = useState<number | null>(null);

  const handleStoreNameChange = (val: string) => {
    setNewStoreName(val);
    const gen = val
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    setNewStoreSlug(gen);
  };

  useEffect(() => {
    if (!newStoreSlug || newStoreSlug.length < 2) {
      setModalSlugAvailable(null);
      return;
    }
    setModalCheckingSlug(true);
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/partner/check-slug?slug=${encodeURIComponent(newStoreSlug)}`);
        const data = await res.json();
        setModalSlugAvailable(data.available);
      } catch {
        setModalSlugAvailable(null);
      } finally {
        setModalCheckingSlug(false);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [newStoreSlug]);

  const [newStoreOwner, setNewStoreOwner] = useState("");
  const [newStorePhone, setNewStorePhone] = useState("");
  const [newStoreEmail, setNewStoreEmail] = useState("");
  const [newStoreUsername, setNewStoreUsername] = useState("");
  const [newStorePassword, setNewStorePassword] = useState("");
  const [newStoreRole, setNewStoreRole] = useState("admin");
  const [newStoreStatus, setNewStoreStatus] = useState<"active" | "pending">("active");
  const [newStorePaymentStatus, setNewStorePaymentStatus] = useState<"paid" | "pending">("paid");
  const [newStoreAmount, setNewStoreAmount] = useState("0");
  const [newStoreMonthlyFee, setNewStoreMonthlyFee] = useState("1500");
  const [newStoreDueDate, setNewStoreDueDate] = useState("");
  const [newStoreNotes, setNewStoreNotes] = useState("");
  const [createPartnerSubmitting, setCreatePartnerSubmitting] = useState(false);
  const [createPartnerError, setCreatePartnerError] = useState<string | null>(null);

  const router = useRouter();

  // Load theme and check session
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("platform_theme") as "dark" | "light" | null;
      if (saved) setTheme(saved);
    }
    loadData();
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("platform_theme", next);
  };

  const isDark = theme === "dark";

  // Check auth session & load data
  const loadData = async () => {
    setLoading(true);
    try {
      const meRes = await http.get<{
        authenticated: boolean;
        user?: { id: number; name: string; role: "superadmin" | "operator" | "support" };
      }>("/api/super-admin/me");

      if (!meRes.data.authenticated) {
        router.push("/super-admin/login");
        return;
      }
      if (meRes.data.user) {
        setAdminName(meRes.data.user.name || "Administrator");
        const currentRole = meRes.data.user.role || "superadmin";
        setUserRole(currentRole);
        setCurrentUserId(meRes.data.user.id);
        // If user is operator, restrict strictly to "my-tasks"
        if (currentRole === "operator" || currentRole === "support") {
          setActiveSection("my-tasks");
        }
      }

      const [res, staffRes] = await Promise.all([
        http.get<{ ok: boolean; restaurants: RestaurantItem[]; summary: SummaryData }>(
          "/api/super-admin/restaurants"
        ),
        http.get<{ ok: boolean; staff: StaffMember[] }>("/api/super-admin/staff").catch(() => ({
          data: { ok: false, staff: [] },
        })),
      ]);

      if (res.data.ok) {
        setRestaurants(res.data.restaurants);
        setSummary(res.data.summary);
      }
      if (staffRes.data.ok) {
        setStaffList(staffRes.data.staff);
      }
    } catch {
      router.push("/super-admin/login");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await http.post("/api/super-admin/logout");
      router.push("/super-admin/login");
    } catch {
      router.push("/super-admin/login");
    }
  };

  const updateRestaurant = async (
    id: number,
    updates: Record<string, any>,
    message: string
  ) => {
    setUpdatingId(id);
    setActionSuccessMsg(null);
    try {
      const res = await http.patch<{ ok: boolean; restaurant: RestaurantItem }>(
        "/api/super-admin/restaurants",
        { id, ...updates }
      );
      if (res.data.ok) {
        setActionSuccessMsg(message);
        setTimeout(() => setActionSuccessMsg(null), 3500);
        await loadData();
      }
    } catch (err: any) {
      alert(err?.response?.data?.error || "Failed to update restaurant status");
    } finally {
      setUpdatingId(null);
    }
  };

  // Super Admin: Assign Staff handler
  const handleOpenAssignModal = (r: RestaurantItem) => {
    setAssignTarget(r);
    setAssignStaffId(r.assignedTo || "");
    setAssignNotes(r.taskNotes || "");
    setAssignStatus(r.taskStatus || "pending");
  };

  const handleSaveAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignTarget) return;

    setAssignSubmitting(true);
    try {
      let assignedName: string | null = null;
      let assignedRole: string | null = null;
      let assignedToVal: number | null = null;

      if (assignStaffId) {
        const staff = staffList.find((s) => s.id === Number(assignStaffId));
        if (staff) {
          assignedToVal = staff.id;
          assignedName = staff.name || staff.username;
          assignedRole = staff.role;
        }
      }

      await updateRestaurant(
        assignTarget.id,
        {
          assignedTo: assignedToVal,
          assignedName,
          assignedRole,
          taskNotes: assignNotes.trim(),
          taskStatus: assignStatus,
        },
        assignedName
          ? `Store '${assignTarget.name}' assigned to ${assignedName} (${assignedRole})!`
          : `Assignment removed from '${assignTarget.name}'.`
      );
      setAssignTarget(null);
    } finally {
      setAssignSubmitting(false);
    }
  };

  const MONTHS_LIST = [
    { value: 1, name: "01 - January" },
    { value: 2, name: "02 - February" },
    { value: 3, name: "03 - March" },
    { value: 4, name: "04 - April" },
    { value: 5, name: "05 - May" },
    { value: 6, name: "06 - June" },
    { value: 7, name: "07 - July" },
    { value: 8, name: "08 - August" },
    { value: 9, name: "09 - September" },
    { value: 10, name: "10 - October" },
    { value: 11, name: "11 - November" },
    { value: 12, name: "12 - December" },
  ];

  const updateDateFromDmy = (d: number, m: number, y: number) => {
    setBillDay(d);
    setBillMonth(m);
    setBillYear(y);
    const iso = `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    setBillDueDate(iso);
  };

  const setDateFromIso = (isoStr: string) => {
    setBillDueDate(isoStr);
    const parsed = new Date(isoStr);
    if (!isNaN(parsed.getTime())) {
      setBillYear(parsed.getFullYear());
      setBillMonth(parsed.getMonth() + 1);
      setBillDay(parsed.getDate());
    }
  };

  // Super Admin: Manage Monthly Billing & Validity handler
  const handleOpenBillingModal = (r: RestaurantItem) => {
    setBillingTarget(r);
    setBillFee(String(r.monthlyFee || "1500"));

    let targetDate = new Date();
    if (r.billingDueDate) {
      const parsed = new Date(r.billingDueDate.slice(0, 10));
      if (!isNaN(parsed.getTime())) {
        targetDate = parsed;
      }
    } else {
      // Default to 30 days from today
      targetDate.setDate(targetDate.getDate() + 30);
    }

    const y = targetDate.getFullYear();
    const m = targetDate.getMonth() + 1;
    const d = targetDate.getDate();

    setBillYear(y);
    setBillMonth(m);
    setBillDay(d);

    const iso = `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    setBillDueDate(iso);
    setBillPaymentStatus(r.paymentStatus === "paid" ? "paid" : "pending");
    setBillSubStatus(r.subscriptionStatus || "active");
    setBillNotes(r.paymentNotes || "");
  };

  const handleSaveBilling = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!billingTarget) return;

    setBillingSubmitting(true);
    try {
      await updateRestaurant(
        billingTarget.id,
        {
          monthlyFee: Number(billFee) || 0,
          billingDueDate: billDueDate || null,
          paymentStatus: billPaymentStatus,
          subscriptionStatus: billSubStatus,
          paymentNotes: billNotes.trim(),
          lastPaymentDate: billPaymentStatus === "paid" ? new Date().toISOString().slice(0, 10) : billingTarget.lastPaymentDate,
        },
        `Monthly billing & validity updated for '${billingTarget.name}'!`
      );
      setBillingTarget(null);
    } finally {
      setBillingSubmitting(false);
    }
  };

  // 1-Click Renew Monthly Subscription (+30 Days)
  const handleQuickRenew30Days = async (r: RestaurantItem) => {
    const baseDate =
      r.billingDueDate && new Date(r.billingDueDate) > new Date()
        ? new Date(r.billingDueDate)
        : new Date();
    baseDate.setDate(baseDate.getDate() + 30);
    const newDueDate = baseDate.toISOString().slice(0, 10);
    const today = new Date().toISOString().slice(0, 10);

    await updateRestaurant(
      r.id,
      {
        paymentStatus: "paid",
        subscriptionStatus: "active",
        billingDueDate: newDueDate,
        lastPaymentDate: today,
        paymentNotes: `Monthly fee (₹${r.monthlyFee || 1500}) renewed on ${today} for 30 days until ${newDueDate}`,
      },
      `Payment Received! '${r.name}' validity renewed for 30 days until ${newDueDate}. Service is active.`
    );
  };

  // 1-Click Block Service / Mark Unpaid
  const handleQuickBlockService = async (r: RestaurantItem) => {
    if (
      !confirm(
        `Are you sure you want to SUSPEND SERVICE for '${r.name}'? Partner login will be immediately blocked until payment is received.`
      )
    ) {
      return;
    }
    await updateRestaurant(
      r.id,
      {
        paymentStatus: "pending",
        subscriptionStatus: "expired",
        paymentNotes: `Service suspended: Payment pending / subscription expired marked by Super Admin on ${new Date().toISOString().slice(0, 10)}`,
      },
      `Service Suspended! '${r.name}' is now marked Unpaid/Expired. Partner login blocked.`
    );
  };

  // WhatsApp Monthly Billing Reminder
  const openBillingReminderWhatsApp = (r: RestaurantItem) => {
    if (!r.phone) {
      alert("This store has no phone number on record.");
      return;
    }
    const cleanPhone = r.phone.replace(/[^0-9]/g, "");
    const fee = r.monthlyFee || 1500;
    const dueDateStr = r.billingDueDate
      ? new Date(r.billingDueDate).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "Immediate";
    const text = encodeURIComponent(
      `Hello ${r.ownerName || "Partner"}!\n\nThis is a friendly subscription reminder regarding your restaurant "${r.name}" on PizzaHub Platform.\n\n• Monthly Fee: ₹${fee}/month\n• Valid Till Date: ${dueDateStr}\n\nPlease submit your monthly subscription payment to ensure uninterrupted online orders and admin dashboard access.\n\nThank you,\nPizzaHub Super Admin`
    );
    window.open(`https://api.whatsapp.com/send?phone=${cleanPhone}&text=${text}`, "_blank");
  };

  // Billing Date Display Helpers
  const formatBillingDate = (dateStr?: string) => {
    if (!dateStr) return "Not Set";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getDaysRemaining = (dateStr?: string) => {
    if (!dateStr) return null;
    const due = new Date(`${dateStr.slice(0, 10)}T23:59:59`);
    const now = new Date();
    const diffMs = due.getTime() - now.getTime();
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  };

  // Operator / Staff: Edit Store Details handler
  const handleOpenEditStoreModal = (r: RestaurantItem) => {
    setEditStoreTarget(r);
    setEditName(r.name || "");
    setEditOwner(r.ownerName || "");
    setEditPhone(r.phone || "");
    setEditEmail(r.email || "");
    setEditTaskNotes(r.taskNotes || "");
    setEditTaskStatus(r.taskStatus || "pending");
  };

  const handleSaveStoreDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editStoreTarget) return;

    setEditSubmitting(true);
    try {
      await updateRestaurant(
        editStoreTarget.id,
        {
          name: editName.trim(),
          ownerName: editOwner.trim(),
          phone: editPhone.trim(),
          email: editEmail.trim(),
          taskNotes: editTaskNotes.trim(),
          taskStatus: editTaskStatus,
        },
        `Store details updated for '${editName}'!`
      );
      setEditStoreTarget(null);
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleImpersonatePartner = async (restaurantId: number) => {
    setImpersonatingId(restaurantId);
    try {
      const res = await http.post<{ ok: boolean; restaurantSlug?: string; error?: string }>(
        "/api/super-admin/impersonate-partner",
        { restaurantId }
      );
      if (res.data?.ok) {
        window.open("/admin", "_blank");
      } else {
        alert(res.data?.error || "Failed to access partner dashboard");
      }
    } catch (err: any) {
      alert(err?.message || "Failed to access partner dashboard");
    } finally {
      setImpersonatingId(null);
    }
  };

  const handleDelete = async (r: RestaurantItem) => {
    if (!confirm(`Are you sure you want to permanently delete '${r.name}' (/${r.slug})?`)) {
      return;
    }
    setUpdatingId(r.id);
    try {
      const res = await http.delete(`/api/super-admin/restaurants?id=${r.id}`);
      if (res.data.ok) {
        setActionSuccessMsg(`Restaurant '${r.name}' has been deleted.`);
        setTimeout(() => setActionSuccessMsg(null), 3000);
        await loadData();
      }
    } catch (err: any) {
      alert(err?.response?.data?.error || "Failed to delete restaurant");
    } finally {
      setUpdatingId(null);
    }
  };

  const openWhatsApp = (r: RestaurantItem) => {
    if (!r.phone) return;
    const cleanPhone = r.phone.replace(/[^0-9]/g, "");
    const text = encodeURIComponent(
      `Hello ${r.ownerName || "Partner"}! This is ${adminName} (${userRole.toUpperCase()}) regarding your restaurant "${r.name}" on PizzaHub Platform. Let's complete your store verification & details.`
    );
    window.open(`https://api.whatsapp.com/send?phone=${cleanPhone}&text=${text}`, "_blank");
  };

  const handleCopySlug = (slug: string) => {
    const fullUrl = `${window.location.origin}/${slug}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  const handleChangeSuperAdminPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError(null);
    if (newPass.length < 6) {
      setPassError("New password must be at least 6 characters.");
      return;
    }
    if (newPass !== confirmPass) {
      setPassError("Passwords do not match.");
      return;
    }
    setPassSubmitting(true);
    try {
      const res = await http.post<{ ok: boolean; message?: string }>(
        "/api/super-admin/change-password",
        { currentPassword: currPass, newPassword: newPass }
      );
      if (res.data.ok) {
        setActionSuccessMsg("Password updated successfully!");
        setIsChangePassOpen(false);
        setCurrPass("");
        setNewPass("");
        setConfirmPass("");
        setTimeout(() => setActionSuccessMsg(null), 4000);
      }
    } catch (err: any) {
      setPassError(err?.response?.data?.error || "Failed to change password");
    } finally {
      setPassSubmitting(false);
    }
  };

  const handleResetPartnerPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetPartnerTarget) return;
    setResetError(null);
    if (partnerNewPass.length < 6) {
      setResetError("Password must be at least 6 characters.");
      return;
    }
    if (partnerNewPass !== partnerConfirmPass) {
      setResetError("Passwords do not match.");
      return;
    }
    setResetSubmitting(true);
    try {
      const res = await http.post<{ ok: boolean; message?: string }>(
        "/api/super-admin/reset-partner-password",
        {
          restaurantId: resetPartnerTarget.id,
          newPassword: partnerNewPass,
        }
      );
      if (res.data.ok) {
        setActionSuccessMsg(
          res.data.message || `Password reset for ${resetPartnerTarget.name}!`
        );
        setResetPartnerTarget(null);
        setPartnerNewPass("");
        setPartnerConfirmPass("");
        setTimeout(() => setActionSuccessMsg(null), 4000);
      }
    } catch (err: any) {
      setResetError(err?.response?.data?.error || "Failed to reset partner password");
    } finally {
      setResetSubmitting(false);
    }
  };

  const handleCreatePartner = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatePartnerError(null);

    if (!newStoreName.trim()) {
      setCreatePartnerError("Restaurant name is required.");
      return;
    }
    if (!newStoreUsername.trim()) {
      setCreatePartnerError("Admin login username is required.");
      return;
    }
    if (newStorePassword.length < 6) {
      setCreatePartnerError("Password must be at least 6 characters.");
      return;
    }

    setCreatePartnerSubmitting(true);
    try {
      const res = await http.post<{ ok: boolean; message?: string }>(
        "/api/super-admin/create-partner",
        {
          name: newStoreName.trim(),
          slug: newStoreSlug.trim(),
          ownerName: newStoreOwner.trim(),
          phone: newStorePhone.trim(),
          email: newStoreEmail.trim(),
          username: newStoreUsername.trim(),
          password: newStorePassword,
          role: newStoreRole,
          status: newStoreStatus,
          paymentStatus: newStorePaymentStatus,
          paymentAmount: Number(newStoreAmount) || 0,
          paymentNotes: newStoreNotes.trim(),
        }
      );

      if (res.data.ok) {
        setActionSuccessMsg(
          res.data.message || `Partner '${newStoreName}' created successfully!`
        );
        setIsCreatePartnerOpen(false);
        setNewStoreName("");
        setNewStoreSlug("");
        setNewStoreOwner("");
        setNewStorePhone("");
        setNewStoreEmail("");
        setNewStoreUsername("");
        setNewStorePassword("");
        setNewStoreRole("admin");
        setNewStoreAmount("0");
        setNewStoreNotes("");
        await loadData();
        setTimeout(() => setActionSuccessMsg(null), 4000);
      }
    } catch (err: any) {
      setCreatePartnerError(err?.response?.data?.error || "Failed to create partner");
    } finally {
      setCreatePartnerSubmitting(false);
    }
  };

  const handleRegisterAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);
    if (!regUsername.trim()) {
      setRegError("Username is required.");
      return;
    }
    if (regPassword.length < 6) {
      setRegError("Password must be at least 6 characters.");
      return;
    }

    setRegSubmitting(true);
    try {
      const res = await http.post<{ ok: boolean; message?: string }>(
        "/api/super-admin/register-admin",
        {
          username: regUsername.trim(),
          password: regPassword,
          name: regName.trim(),
          email: regEmail.trim(),
          phone: regPhone.trim(),
          role: regRole,
        }
      );

      if (res.data.ok) {
        setActionSuccessMsg(
          res.data.message || `Staff member '${regName || regUsername}' registered as ${regRole}!`
        );
        setIsRegisterAdminOpen(false);
        setRegUsername("");
        setRegPassword("");
        setRegName("");
        setRegEmail("");
        setRegPhone("");
        setRegRole("operator");
        await loadData();
        setTimeout(() => setActionSuccessMsg(null), 4000);
      }
    } catch (err: any) {
      setRegError(err?.response?.data?.error || "Failed to register staff user");
    } finally {
      setRegSubmitting(false);
    }
  };

  // Today / Validity check helper
  const isStoreExpired = (r: RestaurantItem) => {
    if (r.paymentStatus !== "paid") return true;
    if (
      r.subscriptionStatus === "expired" ||
      r.subscriptionStatus === "suspended" ||
      r.status === "suspended"
    ) {
      return true;
    }
    if (r.billingDueDate) {
      return new Date(`${r.billingDueDate.slice(0, 10)}T23:59:59`) < new Date();
    }
    return false;
  };

  // Monthly Subscriptions & MRR stats
  const billingStats = useMemo(() => {
    let totalMRR = 0;
    let collectedMRR = 0;
    let paidCount = 0;
    let unpaidCount = 0;

    restaurants.forEach((r) => {
      const fee = Number(r.monthlyFee) || 0;
      totalMRR += fee;
      const expired = isStoreExpired(r);
      if (!expired && r.paymentStatus === "paid") {
        collectedMRR += fee;
        paidCount++;
      } else {
        unpaidCount++;
      }
    });

    return { totalMRR, collectedMRR, paidCount, unpaidCount };
  }, [restaurants]);

  // Counts
  const myAssignedCount = useMemo(() => {
    if (!currentUserId) return 0;
    return restaurants.filter((r) => r.assignedTo === currentUserId).length;
  }, [restaurants, currentUserId]);

  const unassignedCount = useMemo(() => {
    return restaurants.filter((r) => !r.assignedTo).length;
  }, [restaurants]);

  // Is current user strictly an operator or support?
  const isOperator = userRole === "operator";
  const isSuperAdmin = userRole === "superadmin";

  // Sidebar navigation tailored by role
  const navItems = useMemo(() => {
    if (isOperator) {
      // OPERATOR ONLY SEES THEIR ASSIGNED STORES
      return [
        {
          id: "my-tasks" as NavSection,
          label: "My Assigned Stores",
          icon: ClipboardList,
          badge: myAssignedCount.toString(),
          badgeColor: "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 font-bold",
        },
      ];
    }

    // SUPER ADMIN SEES MASTER MANAGEMENT TABS
    return [
      {
        id: "overview" as NavSection,
        label: "Overview Dashboard",
        icon: LayoutDashboard,
        badge: null,
        badgeColor: "",
      },
      {
        id: "restaurants" as NavSection,
        label: "All Partners",
        icon: Store,
        badge: summary.total.toString(),
        badgeColor: isDark ? "bg-neutral-800 text-neutral-300" : "bg-neutral-200 text-neutral-700",
      },
      {
        id: "payments" as NavSection,
        label: "Monthly Billing & Validity",
        icon: CreditCard,
        badge: `${billingStats.paidCount}/${restaurants.length} Paid`,
        badgeColor: isDark ? "bg-purple-950 text-purple-300 border border-purple-800/60" : "bg-purple-100 text-purple-700",
      },
      {
        id: "unassigned" as NavSection,
        label: "Store Assignments (Operations)",
        icon: UserCheck,
        badge: unassignedCount > 0 ? `${unassignedCount} unassigned` : null,
        badgeColor: "bg-rose-500/20 text-rose-400 border border-rose-500/30",
      },
      {
        id: "pending" as NavSection,
        label: "Pending Approvals",
        icon: Clock,
        badge: summary.pending > 0 ? summary.pending.toString() : null,
        badgeColor: "bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse",
      },
      {
        id: "active" as NavSection,
        label: "Active Stores",
        icon: CheckCircle2,
        badge: summary.active.toString(),
        badgeColor: isDark ? "bg-emerald-950 text-emerald-400 border border-emerald-800/60" : "bg-emerald-100 text-emerald-700",
      },
      {
        id: "staff-directory" as NavSection,
        label: "Team & Staff Directory",
        icon: Users,
        badge: staffList.length.toString(),
        badgeColor: isDark ? "bg-purple-950 text-purple-300 border border-purple-800/60" : "bg-purple-100 text-purple-700",
      },
      {
        id: "suspended" as NavSection,
        label: "Suspended Stores",
        icon: Ban,
        badge: summary.suspended > 0 ? summary.suspended.toString() : null,
        badgeColor: "bg-red-500/20 text-red-400 border border-red-500/30",
      },
    ];
  }, [isOperator, myAssignedCount, summary, unassignedCount, staffList.length, billingStats, restaurants.length, isDark]);

  // Filtered restaurants strictly respecting role isolation
  const filteredList = useMemo(() => {
    return restaurants.filter((r) => {
      // 1. STRICT OPERATOR RESTRICTION: CAN ONLY EVER SEE ASSIGNED STORES
      if (isOperator) {
        if (r.assignedTo !== currentUserId) return false;
      } else {
        // Super Admin section filters
        if (activeSection === "my-tasks" && r.assignedTo !== currentUserId) return false;
        if (activeSection === "unassigned" && r.assignedTo) return false;
        if (activeSection === "pending" && r.status !== "pending") return false;
        if (activeSection === "active" && r.status !== "active") return false;
        if (activeSection === "suspended" && r.status !== "suspended" && r.status !== "inactive") return false;

        if (activeSection === "overview" || activeSection === "restaurants") {
          if (filterTab === "pending" && r.status !== "pending") return false;
          if (filterTab === "active" && r.status !== "active") return false;
          if (filterTab === "suspended" && r.status !== "suspended" && r.status !== "inactive") return false;
        }

        if (activeSection === "payments") {
          const expired = isStoreExpired(r);
          const isPaid = r.paymentStatus === "paid" && !expired;
          if (paymentFilter === "paid" && !isPaid) return false;
          if (paymentFilter === "pending" && isPaid) return false;
        }
      }

      // Search Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = r.name.toLowerCase().includes(q);
        const matchSlug = r.slug.toLowerCase().includes(q);
        const matchOwner = (r.ownerName || "").toLowerCase().includes(q);
        const matchPhone = (r.phone || "").includes(q);
        const matchAssigned = (r.assignedName || "").toLowerCase().includes(q);
        const matchTask = (r.taskNotes || "").toLowerCase().includes(q);
        return matchName || matchSlug || matchOwner || matchPhone || matchAssigned || matchTask;
      }
      return true;
    });
  }, [restaurants, isOperator, currentUserId, activeSection, filterTab, paymentFilter, searchQuery]);

  return (
    <div
      className={`min-h-screen font-sans transition-colors duration-300 flex flex-col md:flex-row ${
        isDark
          ? "bg-[#090b11] text-neutral-100 selection:bg-purple-600 selection:text-white"
          : "bg-slate-50 text-neutral-900 selection:bg-purple-500 selection:text-white"
      }`}
    >
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden"
        />
      )}

      {/* ======================================================== */}
      {/* SIDEBAR NAVIGATION                                       */}
      {/* ======================================================== */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 flex flex-col border-r transition-all duration-300 md:static md:translate-x-0 ${
          sidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full md:translate-x-0"
        } ${
          isDark
            ? "bg-[#0d101a] border-neutral-800/80 text-neutral-200"
            : "bg-white border-neutral-200/90 text-neutral-700 shadow-sm"
        }`}
      >
        {/* Brand Header */}
        <div className={`p-5 border-b ${isDark ? "border-neutral-800/80" : "border-neutral-100"}`}>
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className={`inline-flex items-center gap-1.5 text-xs font-bold transition rounded-lg px-2 py-1 ${
                isDark
                  ? "text-neutral-400 hover:text-white hover:bg-neutral-800/60"
                  : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100"
              }`}
              title="Return to Platform Home"
            >
              <ArrowLeft className="h-3.5 w-3.5 text-purple-500" />
              <span>Platform Home</span>
            </Link>

            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1 rounded-lg md:hidden text-neutral-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-linear-to-tr from-purple-600 via-indigo-600 to-pink-600 text-white shadow-lg shadow-purple-600/30 shrink-0">
              {isOperator ? (
                <Briefcase className="h-5 w-5" />
              ) : userRole === "support" ? (
                <Headphones className="h-5 w-5" />
              ) : (
                <ShieldCheck className="h-6 w-6" />
              )}
              <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-[#0d101a]"></span>
              </span>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className={`font-black text-base tracking-tight truncate ${isDark ? "text-white" : "text-neutral-900"}`}>
                  PizzaHub
                </h1>
                <span
                  className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded border ${
                    isOperator
                      ? "bg-indigo-500/20 text-indigo-400 border-indigo-500/30"
                      : "bg-purple-500/20 text-purple-400 border-purple-500/30"
                  }`}
                >
                  {userRole}
                </span>
              </div>
              <p className={`text-[11px] font-medium truncate ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
                {isOperator ? "Operator Workspace" : "Super Admin Master Console"}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-hide">
          {/* Main Navigation */}
          <div>
            <p className={`px-3 text-[10px] font-bold uppercase tracking-wider mb-2 ${isDark ? "text-neutral-500" : "text-neutral-400"}`}>
              {isOperator ? "My Assigned Work" : "Management Queues"}
            </p>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setActiveSection(item.id);
                      if (item.id === "pending") setFilterTab("pending");
                      if (item.id === "active") setFilterTab("active");
                      if (item.id === "suspended") setFilterTab("suspended");
                      if (item.id === "overview" || item.id === "restaurants") setFilterTab("all");
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? isDark
                          ? "bg-linear-to-r from-purple-600/20 to-indigo-600/10 text-white border-l-4 border-purple-500 font-bold shadow-xs"
                          : "bg-purple-50 text-purple-900 border-l-4 border-purple-600 font-bold shadow-xs"
                        : isDark
                        ? "text-neutral-400 hover:text-white hover:bg-neutral-900/80"
                        : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <item.icon
                        className={`h-4 w-4 shrink-0 transition-colors ${
                          isActive
                            ? "text-purple-500"
                            : isDark
                            ? "text-neutral-400 group-hover:text-neutral-200"
                            : "text-neutral-500"
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full shrink-0 ${
                          item.badgeColor
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Quick Direct Actions - ONLY FOR SUPER ADMIN */}
          {isSuperAdmin && (
            <div>
              <p className={`px-3 text-[10px] font-bold uppercase tracking-wider mb-2 ${isDark ? "text-neutral-500" : "text-neutral-400"}`}>
                Master Controls
              </p>
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => {
                    setCreatePartnerError(null);
                    setIsCreatePartnerOpen(true);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer text-left ${
                    isDark
                      ? "bg-purple-950/40 text-purple-300 border border-purple-900/50 hover:bg-purple-900/50 hover:text-white"
                      : "bg-purple-50 text-purple-700 border border-purple-200/80 hover:bg-purple-100"
                  }`}
                >
                  <Plus className="h-4 w-4 text-purple-500 shrink-0" />
                  <span className="truncate">Deploy Partner Store</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setRegError(null);
                    setIsRegisterAdminOpen(true);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium transition cursor-pointer text-left ${
                    isDark
                      ? "text-neutral-400 hover:text-white hover:bg-neutral-900/80"
                      : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
                  }`}
                >
                  <UserPlus className="h-4 w-4 text-indigo-400 shrink-0" />
                  <span className="truncate">Add Operator / Staff</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPassError(null);
                    setIsChangePassOpen(true);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium transition cursor-pointer text-left ${
                    isDark
                      ? "text-neutral-400 hover:text-white hover:bg-neutral-900/80"
                      : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
                  }`}
                >
                  <KeyRound className="h-4 w-4 text-amber-500 shrink-0" />
                  <span className="truncate">Change Master Password</span>
                </button>
              </div>
            </div>
          )}

          {/* Quick Metrics Widget - ONLY FOR SUPER ADMIN */}
          {isSuperAdmin && (
            <div
              className={`p-3.5 rounded-2xl border text-xs space-y-2.5 ${
                isDark
                  ? "bg-linear-to-b from-[#111626] to-[#0a0d17] border-neutral-800"
                  : "bg-linear-to-b from-slate-50 to-white border-neutral-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
                  Total Revenue
                </span>
                <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-0.5">
                  <TrendingUp className="h-3 w-3" />
                  Live
                </span>
              </div>

              <p className={`text-xl font-black font-mono tracking-tight ${isDark ? "text-emerald-400" : "text-emerald-600"}`}>
                ₹{summary.totalRevenue.toLocaleString("en-IN")}
              </p>

              <div>
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className={isDark ? "text-neutral-400" : "text-neutral-500"}>Paid Partners</span>
                  <span className="font-mono font-bold">
                    {summary.paidCount} / {summary.total}
                  </span>
                </div>
                <div className={`h-1.5 w-full rounded-full overflow-hidden ${isDark ? "bg-neutral-800" : "bg-neutral-200"}`}>
                  <div
                    className="h-full bg-linear-to-r from-purple-500 to-emerald-500 rounded-full transition-all duration-500"
                    style={{
                      width: summary.total > 0 ? `${(summary.paidCount / summary.total) * 100}%` : "0%",
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Footer */}
        <div
          className={`p-3.5 border-t flex flex-col gap-2 ${
            isDark ? "border-neutral-800/80 bg-[#0b0e17]" : "border-neutral-100 bg-slate-50"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-8 w-8 rounded-full bg-linear-to-tr from-purple-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm uppercase">
                {adminName.slice(0, 2)}
              </div>
              <div className="min-w-0">
                <p className={`text-xs font-bold truncate ${isDark ? "text-white" : "text-neutral-900"}`}>
                  {adminName}
                </p>
                <p className="text-[10px] text-purple-400 font-medium truncate capitalize">
                  {userRole} Account
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={toggleTheme}
              title={`Switch to ${isDark ? "Light" : "Dark"} mode`}
              className={`p-1.5 rounded-xl border transition cursor-pointer ${
                isDark
                  ? "border-neutral-800 bg-neutral-900 text-amber-300 hover:bg-neutral-800"
                  : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-100 shadow-xs"
              }`}
            >
              {isDark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5 text-neutral-700" />}
            </button>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className={`w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-bold transition cursor-pointer ${
              isDark
                ? "border-red-900/40 bg-red-950/20 text-red-400 hover:bg-red-900/30 hover:text-red-300"
                : "border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
            }`}
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out Session</span>
          </button>
        </div>
      </aside>

      {/* ======================================================== */}
      {/* MAIN CONTENT AREA                                        */}
      {/* ======================================================== */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Sticky Header */}
        <header
          className={`sticky top-0 z-30 border-b backdrop-blur-xl px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4 transition-colors ${
            isDark
              ? "border-neutral-800/80 bg-[#090b11]/90"
              : "border-neutral-200/80 bg-white/90 shadow-xs"
          }`}
        >
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className={`p-2 rounded-xl border md:hidden cursor-pointer ${
                isDark
                  ? "border-neutral-800 bg-neutral-900 text-neutral-300 hover:text-white"
                  : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-100"
              }`}
            >
              <Menu className="h-5 w-5" />
            </button>

            <div>
              <div className="flex items-center gap-1.5 text-xs text-purple-500 font-semibold">
                <span>{isOperator ? "Operator Console" : "Master Console"}</span>
                <ChevronRight className="h-3 w-3 text-neutral-500" />
                <span className="capitalize">{activeSection.replace("-", " ")}</span>
              </div>
              <h2 className={`font-black text-lg sm:text-xl tracking-tight leading-tight ${isDark ? "text-white" : "text-neutral-900"}`}>
                {isOperator && "My Assigned Partner Stores"}
                {!isOperator && activeSection === "overview" && "Executive Dashboard"}
                {!isOperator && activeSection === "my-tasks" && "My Assigned Stores"}
                {!isOperator && activeSection === "restaurants" && "All Partner Restaurants"}
                {!isOperator && activeSection === "unassigned" && "Stores Awaiting Staff Assignment"}
                {!isOperator && activeSection === "pending" && "Pending Store Approvals"}
                {!isOperator && activeSection === "active" && "Live Active Stores"}
                {!isOperator && activeSection === "staff-directory" && "Team & Staff Directory"}
                {!isOperator && activeSection === "suspended" && "Suspended Accounts"}
                {!isOperator && activeSection === "payments" && "Monthly Billing & Subscriptions"}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={loadData}
              disabled={loading}
              title="Refresh Data"
              className={`p-2 rounded-xl border transition cursor-pointer ${
                isDark
                  ? "border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800"
                  : "border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-100 shadow-xs"
              }`}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin text-purple-500" : ""}`} />
            </button>

            {isSuperAdmin && (
              <button
                type="button"
                onClick={() => {
                  setCreatePartnerError(null);
                  setIsCreatePartnerOpen(true);
                }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-linear-to-r from-purple-600 to-indigo-600 px-3.5 py-2 text-xs font-bold text-white shadow-md shadow-purple-600/25 hover:opacity-95 transition cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Add Partner</span>
              </button>
            )}
          </div>
        </header>

        {/* Main Body */}
        <main className="flex-1 p-4 sm:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {/* Action Success Alert */}
          {actionSuccessMsg && (
            <div
              className={`rounded-2xl border p-4 text-xs font-bold flex items-center justify-between shadow-xl animate-in fade-in ${
                isDark
                  ? "border-emerald-800/80 bg-emerald-950/80 text-emerald-300"
                  : "border-emerald-300 bg-emerald-50 text-emerald-900"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="h-6 w-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Check className="h-3.5 w-3.5" />
                </div>
                <span>{actionSuccessMsg}</span>
              </div>
              <button
                type="button"
                onClick={() => setActionSuccessMsg(null)}
                className="text-neutral-400 hover:text-white cursor-pointer p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* ====================================================== */}
          {/* KPI CARDS - ONLY FOR SUPER ADMIN                       */}
          {/* ====================================================== */}
          {isSuperAdmin && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {/* Card 1: Monthly Subscriptions MRR */}
              <div
                onClick={() => setActiveSection("payments")}
                className={`rounded-3xl border p-5 shadow-lg relative overflow-hidden transition-all duration-200 cursor-pointer group hover:-translate-y-0.5 ${
                  isDark
                    ? "border-purple-900/60 bg-linear-to-b from-[#181326] to-[#0f0d1b] hover:border-purple-500/60"
                    : "border-purple-200 bg-purple-50/50 hover:border-purple-300 shadow-neutral-100"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? "text-purple-300" : "text-purple-600"}`}>
                    Monthly Subscriptions (MRR)
                  </span>
                  <div className="h-9 w-9 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
                    <DollarSign className="h-4 w-4" />
                  </div>
                </div>
                <p className={`text-3xl font-black font-mono mt-3 ${isDark ? "text-white" : "text-neutral-900"}`}>
                  ₹{billingStats.totalMRR.toLocaleString("en-IN")}
                </p>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-purple-900/40 text-[11px]">
                  <span className={isDark ? "text-neutral-400" : "text-neutral-500"}>
                    {billingStats.paidCount} Paid • {billingStats.unpaidCount} Suspended
                  </span>
                  <span className="text-purple-400 font-semibold group-hover:underline">Manage Billing →</span>
                </div>
              </div>

              {/* Card 2: Pending Approval */}
              <div
                onClick={() => {
                  setActiveSection("pending");
                  setFilterTab("pending");
                }}
                className={`rounded-3xl border p-5 shadow-lg relative overflow-hidden transition-all duration-200 cursor-pointer group hover:-translate-y-0.5 ${
                  isDark
                    ? "border-amber-900/60 bg-linear-to-b from-[#1b1712] to-[#13110d] hover:border-amber-500/60"
                    : "border-amber-200 bg-amber-50/60 hover:border-amber-400"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-500 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping" />
                    Pending Review
                  </span>
                  <div className="h-9 w-9 rounded-2xl bg-amber-500/20 text-amber-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Clock className="h-4 w-4" />
                  </div>
                </div>
                <p className="text-3xl font-black text-amber-500 font-mono mt-3">{summary.pending}</p>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-amber-900/30 text-[11px]">
                  <span className="text-amber-600/80">Requires verification</span>
                  <span className="text-amber-500 font-semibold group-hover:underline">Review →</span>
                </div>
              </div>

              {/* Card 3: Unassigned Stores */}
              <div
                onClick={() => setActiveSection("unassigned")}
                className={`rounded-3xl border p-5 shadow-lg relative overflow-hidden transition-all duration-200 cursor-pointer group hover:-translate-y-0.5 ${
                  isDark
                    ? "border-rose-950/70 bg-linear-to-b from-[#1a0f13] to-[#120a0d] hover:border-rose-500/50"
                    : "border-rose-200 bg-rose-50/50 hover:border-rose-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">
                    Unassigned Stores
                  </span>
                  <div className="h-9 w-9 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <UserCheck className="h-4 w-4" />
                  </div>
                </div>
                <p className="text-3xl font-black text-rose-400 font-mono mt-3">{unassignedCount}</p>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-rose-950/60 text-[11px]">
                  <span className={isDark ? "text-neutral-400" : "text-neutral-500"}>Need staff assignment</span>
                  <span className="text-rose-400 font-semibold group-hover:underline">Assign →</span>
                </div>
              </div>

              {/* Card 4: Total Partners */}
              <div
                onClick={() => {
                  setActiveSection("restaurants");
                  setFilterTab("all");
                }}
                className={`rounded-3xl border p-5 shadow-lg relative overflow-hidden transition-all duration-200 cursor-pointer group hover:-translate-y-0.5 ${
                  isDark
                    ? "border-neutral-800 bg-[#101320] hover:border-purple-500/50"
                    : "border-neutral-200/90 bg-white hover:border-purple-300 shadow-neutral-100"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
                    Total Partners
                  </span>
                  <div className="h-9 w-9 rounded-2xl bg-purple-500/15 text-purple-500 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
                    <Store className="h-4 w-4" />
                  </div>
                </div>
                <p className={`text-3xl font-black font-mono mt-3 ${isDark ? "text-white" : "text-neutral-900"}`}>
                  {summary.total}
                </p>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-neutral-800/40 text-[11px]">
                  <span className={isDark ? "text-neutral-500" : "text-neutral-400"}>All registered stores</span>
                  <span className="text-purple-400 font-semibold group-hover:underline">View all →</span>
                </div>
              </div>
            </div>
          )}

          {/* ====================================================== */}
          {/* SECTION: STAFF DIRECTORY VIEW (SUPER ADMIN ONLY)       */}
          {/* ====================================================== */}
          {isSuperAdmin && activeSection === "staff-directory" ? (
            <div
              className={`rounded-3xl border p-6 shadow-2xl space-y-6 ${
                isDark ? "border-neutral-800 bg-[#0f121d]" : "border-neutral-200 bg-white"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5 border-neutral-800/60">
                <div>
                  <h3 className={`font-black text-lg ${isDark ? "text-white" : "text-neutral-900"}`}>
                    Platform Staff & Roles Directory
                  </h3>
                  <p className={`text-xs mt-1 ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
                    Operators can only view and update details for stores assigned to them by Super Admin.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setRegError(null);
                    setIsRegisterAdminOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition cursor-pointer shadow-md shadow-indigo-600/30 self-start sm:self-auto"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>Register New Staff</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {staffList.map((s) => {
                  const isCurrent = s.id === currentUserId;
                  return (
                    <div
                      key={s.id}
                      className={`rounded-2xl border p-5 space-y-3 transition-all ${
                        isDark ? "border-neutral-800 bg-[#121626]" : "border-neutral-200 bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-sm uppercase">
                            {s.name ? s.name.slice(0, 2) : s.username.slice(0, 2)}
                          </div>
                          <div>
                            <h4 className={`font-bold text-sm leading-tight ${isDark ? "text-white" : "text-neutral-900"}`}>
                              {s.name || s.username}
                              {isCurrent && <span className="ml-1 text-[10px] text-purple-400 font-normal">(You)</span>}
                            </h4>
                            <p className="text-[11px] text-neutral-400 font-mono">@{s.username}</p>
                          </div>
                        </div>

                        <span
                          className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border ${
                            s.role === "operator"
                              ? "bg-indigo-500/20 text-indigo-400 border-indigo-500/30"
                              : s.role === "support"
                              ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/30"
                              : "bg-purple-500/20 text-purple-400 border-purple-500/30"
                          }`}
                        >
                          {s.role}
                        </span>
                      </div>

                      <div className={`p-3 rounded-xl border text-xs space-y-1.5 ${
                        isDark ? "bg-[#090b11] border-neutral-800/80" : "bg-white border-neutral-200"
                      }`}>
                        <div className="flex items-center justify-between">
                          <span className={isDark ? "text-neutral-400" : "text-neutral-500"}>Assigned Stores:</span>
                          <span className="font-mono font-bold text-purple-400">{s.assignedStoresCount}</span>
                        </div>
                        {s.phone && (
                          <div className="flex items-center justify-between">
                            <span className={isDark ? "text-neutral-400" : "text-neutral-500"}>Phone:</span>
                            <span className="font-mono">{s.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : isSuperAdmin && activeSection === "payments" ? (
            /* ====================================================== */
            /* SECTION: DEDICATED MONTHLY BILLING & SUBSCRIPTIONS     */
            /* ====================================================== */
            <div
              className={`rounded-3xl border p-5 sm:p-7 shadow-2xl space-y-6 transition-all ${
                isDark ? "border-neutral-800 bg-[#0f121d]" : "border-neutral-200/90 bg-white"
              }`}
            >
              {/* Header & Controls */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-neutral-800/60">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
                      <CreditCard className="h-4 w-4" />
                    </div>
                    <h3 className={`font-black text-lg sm:text-xl tracking-tight ${isDark ? "text-white" : "text-neutral-900"}`}>
                      Monthly Billing & Subscriptions Command Center
                    </h3>
                  </div>
                  <p className={`text-xs mt-1 max-w-3xl ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
                    Set monthly subscription fees (₹) and validity dates (day/month/year) for each store.
                    Stores with active payments stay live. Expired or unpaid stores are immediately suspended with partner login blocked.
                  </p>
                </div>

                {/* Filter Tabs */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentFilter("all")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      paymentFilter === "all"
                        ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                        : isDark
                        ? "bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white"
                        : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                    }`}
                  >
                    All Stores ({restaurants.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentFilter("paid")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                      paymentFilter === "paid"
                        ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                        : isDark
                        ? "bg-neutral-900 border border-neutral-800 text-emerald-400 hover:bg-neutral-800"
                        : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                    }`}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Payment Received ({billingStats.paidCount})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentFilter("pending")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                      paymentFilter === "pending"
                        ? "bg-red-600 text-white shadow-md shadow-red-600/30"
                        : isDark
                        ? "bg-neutral-900 border border-neutral-800 text-red-400 hover:bg-neutral-800"
                        : "bg-red-50 text-red-700 hover:bg-red-100"
                    }`}
                  >
                    <AlertTriangle className="h-3.5 w-3.5" />
                    <span>Service Suspended / Unpaid ({billingStats.unpaidCount})</span>
                  </button>
                </div>
              </div>

              {/* Top MRR & Billing KPI Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div
                  className={`p-4 rounded-2xl border ${
                    isDark ? "bg-[#141224] border-purple-900/50" : "bg-purple-50/60 border-purple-200"
                  }`}
                >
                  <span className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? "text-purple-300" : "text-purple-700"}`}>
                    Monthly Expected (MRR)
                  </span>
                  <p className={`text-2xl font-black font-mono mt-1 ${isDark ? "text-white" : "text-neutral-900"}`}>
                    ₹{billingStats.totalMRR.toLocaleString("en-IN")}
                    <span className="text-xs font-normal text-neutral-400 ml-1">/month</span>
                  </p>
                  <p className="text-[11px] text-neutral-400 mt-1">Across {restaurants.length} total partner stores</p>
                </div>

                <div
                  className={`p-4 rounded-2xl border ${
                    isDark ? "bg-[#0f1f1a] border-emerald-900/50" : "bg-emerald-50/60 border-emerald-200"
                  }`}
                >
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Payment Received (Service Active)
                  </span>
                  <p className="text-2xl font-black font-mono mt-1 text-emerald-400">
                    {billingStats.paidCount} Stores
                  </p>
                  <p className="text-[11px] text-emerald-500/80 mt-1 font-mono">
                    ₹{billingStats.collectedMRR.toLocaleString("en-IN")} active revenue
                  </p>
                </div>

                <div
                  className={`p-4 rounded-2xl border ${
                    isDark ? "bg-[#230f14] border-red-900/50" : "bg-red-50/60 border-red-200"
                  }`}
                >
                  <span className="text-[11px] font-bold uppercase tracking-wider text-red-400 flex items-center gap-1">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Service Suspended (Payment Due)
                  </span>
                  <p className="text-2xl font-black font-mono mt-1 text-red-400">
                    {billingStats.unpaidCount} Stores
                  </p>
                  <p className="text-[11px] text-red-500/80 mt-1">
                    Login is automatically blocked for these stores
                  </p>
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative w-full max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search store name, slug, owner, phone…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full rounded-xl border pl-9 pr-8 py-2 text-xs outline-none transition focus:border-purple-500 ${
                    isDark
                      ? "border-neutral-800 bg-[#0a0d16] text-white placeholder-neutral-500"
                      : "border-neutral-200 bg-slate-50 text-neutral-900 placeholder-neutral-400"
                  }`}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Subscriptions List */}
              {filteredList.length === 0 ? (
                <div
                  className={`rounded-2xl border border-dashed p-12 text-center ${
                    isDark ? "border-neutral-800 text-neutral-500" : "border-neutral-300 text-neutral-400"
                  }`}
                >
                  <CreditCard className="h-10 w-10 mx-auto mb-3 opacity-40" />
                  <p className="text-sm font-bold">No partner subscriptions match your filter.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredList.map((r) => {
                    const expired = isStoreExpired(r);
                    const daysLeft = getDaysRemaining(r.billingDueDate);
                    const isUpdating = updatingId === r.id;

                    return (
                      <div
                        key={r.id}
                        className={`rounded-2xl border p-4 sm:p-5 transition-all duration-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
                          expired
                            ? isDark
                              ? "border-red-900/60 bg-linear-to-r from-red-950/25 via-[#130d14] to-[#0d101a]"
                              : "border-red-200 bg-red-50/50"
                            : isDark
                            ? "border-neutral-800/90 bg-[#0d101a]"
                            : "border-neutral-200 bg-white shadow-xs"
                        }`}
                      >
                        {/* Store Info */}
                        <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                          <div
                            className={`h-12 w-12 rounded-2xl flex items-center justify-center font-black text-lg shrink-0 ${
                              expired
                                ? "bg-red-500/20 text-red-400 border border-red-500/40"
                                : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                            }`}
                          >
                            {r.name ? r.name.charAt(0).toUpperCase() : "P"}
                          </div>

                          <div className="space-y-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className={`font-black text-base leading-tight truncate ${isDark ? "text-white" : "text-neutral-900"}`}>
                                {r.name}
                              </h4>
                              {expired ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 border border-red-500/30 px-2.5 py-0.5 text-[10px] font-bold text-red-400">
                                  <Ban className="h-3 w-3" />
                                  SERVICE SUSPENDED (Login Blocked)
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400">
                                  <CheckCircle2 className="h-3 w-3" />
                                  SERVICE ACTIVE (Live Access)
                                </span>
                              )}
                            </div>

                            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
                              <span className="font-mono text-[11px] px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20 font-bold">
                                ID: #{r.id}
                              </span>

                              <Link
                                href={`/${r.slug}`}
                                target="_blank"
                                className="font-mono text-purple-400 font-semibold hover:underline flex items-center gap-1 text-[11px]"
                              >
                                <span>/{r.slug}</span>
                                <ExternalLink className="h-2.5 w-2.5 opacity-70" />
                              </Link>

                              {r.ownerName && (
                                <span className={`flex items-center gap-1 ${isDark ? "text-neutral-300" : "text-neutral-700"}`}>
                                  <User className="h-3 w-3 text-neutral-400" />
                                  <span>{r.ownerName}</span>
                                </span>
                              )}

                              {r.phone && (
                                <span className={`flex items-center gap-1 font-mono ${isDark ? "text-neutral-300" : "text-neutral-700"}`}>
                                  <Phone className="h-3 w-3 text-neutral-400" />
                                  <span>{r.phone}</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Middle: Billing & Validity Pill Box */}
                        <div
                          className={`p-3 rounded-2xl border text-xs flex flex-wrap items-center gap-4 sm:gap-6 ${
                            isDark ? "bg-[#090b11] border-neutral-800" : "bg-neutral-50 border-neutral-200"
                          }`}
                        >
                          <div>
                            <span className={`block text-[10px] font-bold uppercase ${isDark ? "text-neutral-500" : "text-neutral-400"}`}>
                              Monthly Plan
                            </span>
                            <span className="font-mono font-black text-sm text-purple-400">
                              ₹{r.monthlyFee || 0}
                              <span className="text-[10px] font-normal text-neutral-400">/mo</span>
                            </span>
                          </div>

                          <div>
                            <span className={`block text-[10px] font-bold uppercase ${isDark ? "text-neutral-500" : "text-neutral-400"}`}>
                              Valid Till (Expiry)
                            </span>
                            <span className="font-mono font-bold text-xs text-neutral-200">
                              {formatBillingDate(r.billingDueDate)}
                            </span>
                            <div className="mt-0.5">
                              {daysLeft === null ? (
                                <span className="text-[10px] text-neutral-500">Date not set</span>
                              ) : daysLeft < 0 ? (
                                <span className="text-[10px] font-bold text-red-400">
                                  ⚠️ Expired {Math.abs(daysLeft)} days ago
                                </span>
                              ) : daysLeft === 0 ? (
                                <span className="text-[10px] font-bold text-amber-400">
                                  ⏳ Expires Today
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold text-emerald-400">
                                  ✓ {daysLeft} days remaining
                                </span>
                              )}
                            </div>
                          </div>

                          <div>
                            <span className={`block text-[10px] font-bold uppercase ${isDark ? "text-neutral-500" : "text-neutral-400"}`}>
                              Payment Status
                            </span>
                            {r.paymentStatus === "paid" && !expired ? (
                              <span className="inline-flex items-center gap-1 font-bold text-emerald-400 text-xs">
                                <Check className="h-3.5 w-3.5" />
                                Received
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 font-bold text-red-400 text-xs">
                                <X className="h-3.5 w-3.5" />
                                Payment Due
                              </span>
                            )}
                            {r.lastPaymentDate && (
                              <span className="block text-[10px] text-neutral-500 font-mono">
                                Last: {formatBillingDate(r.lastPaymentDate)}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Right: Actions */}
                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                          {/* 1-Click Renew (+30 Days) */}
                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() => handleQuickRenew30Days(r)}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold transition shadow-md shadow-emerald-600/25 cursor-pointer disabled:opacity-50"
                            title="1-Click: Mark Payment Received & extend validity for 30 days"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>Mark Paid (+30 Days)</span>
                          </button>

                          {/* 1-Click Suspend Service (Stop Service) */}
                          {!expired && (
                            <button
                              type="button"
                              disabled={isUpdating}
                              onClick={() => handleQuickBlockService(r)}
                              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-red-500/40 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold transition cursor-pointer disabled:opacity-50"
                              title="Stop service & block partner login immediately"
                            >
                              <Ban className="h-3.5 w-3.5" />
                              <span>Suspend Service</span>
                            </button>
                          )}

                          {/* Edit Monthly Fee & Expiry Date Modal Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenBillingModal(r)}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-600/20 border border-purple-500/40 text-purple-300 hover:bg-purple-600/30 text-xs font-bold transition cursor-pointer"
                            title="Set custom per-month fee amount and exact due date"
                          >
                            <CalendarClock className="h-3.5 w-3.5 text-purple-400" />
                            <span>Set Plan & Date</span>
                          </button>

                          {/* WhatsApp Reminder */}
                          {r.phone && (
                            <button
                              type="button"
                              onClick={() => openBillingReminderWhatsApp(r)}
                              className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition cursor-pointer"
                              title="Send WhatsApp payment reminder to store owner"
                            >
                              <MessageCircle className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            /* ====================================================== */
            /* RESTAURANT LIST & CARDS                                */
            /* ====================================================== */
            <div
              className={`rounded-3xl border p-5 sm:p-6 shadow-2xl space-y-6 transition-all ${
                isDark ? "border-neutral-800 bg-[#0f121d]" : "border-neutral-200/90 bg-white"
              }`}
            >
              {/* Search & Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className={`font-black text-base ${isDark ? "text-white" : "text-neutral-900"}`}>
                    {isOperator ? "My Assigned Partner Stores" : "Partner Restaurants & Stores"}
                  </h3>
                  <p className={`text-xs mt-0.5 ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
                    {isOperator
                      ? "Stores assigned to you. You can review and fill in their store details."
                      : "Manage partner stores, storefront URLs, and staff assignments."}
                  </p>
                </div>

                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <input
                    type="text"
                    placeholder="Search store, owner, phone…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full rounded-xl border pl-9 pr-8 py-2 text-xs outline-none transition focus:border-purple-500 ${
                      isDark
                        ? "border-neutral-800 bg-[#0a0d16] text-white placeholder-neutral-500"
                        : "border-neutral-200 bg-slate-50 text-neutral-900 placeholder-neutral-400"
                    }`}
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* List Cards */}
              {loading ? (
                <div className="py-24 text-center text-neutral-500 flex flex-col items-center justify-center gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                  <p className="text-xs font-semibold">Loading partner stores & subscriptions…</p>
                </div>
              ) : filteredList.length === 0 ? (
                <div
                  className={`rounded-2xl border border-dashed p-12 text-center ${
                    isDark ? "border-neutral-800 text-neutral-500" : "border-neutral-300 text-neutral-400"
                  }`}
                >
                  <Store className="h-10 w-10 mx-auto mb-3 opacity-40" />
                  <p className="text-sm font-bold">No restaurants found in this queue.</p>
                  {isOperator && (
                    <p className="text-xs mt-1 text-indigo-400">
                      Super Admin has not assigned any restaurants to you yet. Assigned stores will appear here.
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredList.map((r) => {
                    const isPending = r.status === "pending";
                    const isUpdating = updatingId === r.id;
                    const initial = r.name ? r.name.charAt(0).toUpperCase() : "P";
                    const isAssignedToMe = r.assignedTo === currentUserId;
                    const expired = isStoreExpired(r);

                    return (
                      <div
                        key={r.id}
                        className={`rounded-2xl border p-4 sm:p-5 transition-all duration-200 flex flex-col gap-4 ${
                          expired
                            ? isDark
                              ? "border-red-900/60 bg-linear-to-r from-red-950/25 to-[#0d101a]"
                              : "border-red-200 bg-red-50/40"
                            : isAssignedToMe
                            ? isDark
                              ? "border-indigo-800/80 bg-linear-to-r from-[#12162d] to-[#0f121d]"
                              : "border-indigo-300 bg-indigo-50/40"
                            : isDark
                            ? "border-neutral-800/90 bg-[#0d101a]"
                            : "border-neutral-200 bg-white"
                        }`}
                      >
                        {/* Top: Info & Actions */}
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          {/* Left: Avatar & Details */}
                          <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                            <div
                              className={`h-12 w-12 rounded-2xl flex items-center justify-center font-black text-lg shrink-0 shadow-sm ${
                                expired
                                  ? "bg-red-500/20 text-red-400 border border-red-500/30"
                                  : isAssignedToMe
                                  ? "bg-indigo-600 text-white shadow-indigo-600/30"
                                  : "bg-purple-600 text-white shadow-purple-600/25"
                              }`}
                            >
                              {initial}
                            </div>

                            <div className="space-y-1.5 min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className={`font-black text-base sm:text-lg leading-tight truncate ${isDark ? "text-white" : "text-neutral-900"}`}>
                                  {r.name}
                                </h3>

                                {/* Status Badge */}
                                {expired ? (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 border border-red-500/30 px-2.5 py-0.5 text-[10px] font-bold text-red-400">
                                    <AlertTriangle className="h-3 w-3" />
                                    SUSPENDED
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400">
                                    <CheckCircle2 className="h-3 w-3" />
                                    ACTIVE & LIVE
                                  </span>
                                )}

                                {/* Assigned Pill */}
                                {r.assignedName && (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                                    <User className="h-3 w-3" />
                                    <span>Assigned: {r.assignedName}</span>
                                  </span>
                                )}
                              </div>

                              {/* Details */}
                              <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
                                <span className="font-mono text-[11px] px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20 font-bold">
                                  ID: #{r.id}
                                </span>

                                <div className="inline-flex items-center gap-1 bg-purple-950/30 px-2 py-0.5 rounded-md border border-purple-800/40">
                                  <Link
                                    href={`/${r.slug}`}
                                    target="_blank"
                                    className="font-mono text-purple-400 font-semibold hover:underline flex items-center gap-1 text-[11px]"
                                  >
                                    <span>/{r.slug}</span>
                                    <ExternalLink className="h-2.5 w-2.5 opacity-70" />
                                  </Link>
                                  <button
                                    type="button"
                                    onClick={() => handleCopySlug(r.slug)}
                                    title="Copy full URL"
                                    className="text-neutral-400 hover:text-white cursor-pointer ml-1"
                                  >
                                    {copiedSlug === r.slug ? (
                                      <CheckCheck className="h-3 w-3 text-emerald-400" />
                                    ) : (
                                      <Copy className="h-3 w-3" />
                                    )}
                                  </button>
                                </div>

                                {r.ownerName && (
                                  <span className={`flex items-center gap-1 ${isDark ? "text-neutral-300" : "text-neutral-700"}`}>
                                    <User className="h-3 w-3 text-neutral-400" />
                                    <span>Owner: {r.ownerName}</span>
                                  </span>
                                )}

                                {r.phone && (
                                  <span className={`flex items-center gap-1 font-mono ${isDark ? "text-neutral-300" : "text-neutral-700"}`}>
                                    <Phone className="h-3 w-3 text-neutral-400" />
                                    <span>{r.phone}</span>
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Right: Action Buttons */}
                          <div className="flex flex-wrap items-center gap-2 pt-3 lg:pt-0 shrink-0">
                            {/* Operator: Edit Store Details Button */}
                            {isOperator && (
                              <button
                                type="button"
                                onClick={() => handleOpenEditStoreModal(r)}
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                              >
                                <Edit3 className="h-3.5 w-3.5" />
                                <span>Fill / Edit Details</span>
                              </button>
                            )}

                            {/* Super Admin: Assign Staff Button */}
                            {isSuperAdmin && (
                              <button
                                type="button"
                                onClick={() => handleOpenAssignModal(r)}
                                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white text-xs font-bold transition cursor-pointer"
                                title="Assign staff member"
                              >
                                <UserCheck className="h-3.5 w-3.5 text-indigo-400" />
                                <span>{r.assignedTo ? "Re-assign" : "Assign Staff"}</span>
                              </button>
                            )}

                            {/* WhatsApp Button */}
                            {r.phone && (
                              <button
                                type="button"
                                onClick={() => openWhatsApp(r)}
                                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-bold text-emerald-500 hover:bg-emerald-500/20 transition cursor-pointer"
                                title="Contact partner on WhatsApp"
                              >
                                <MessageCircle className="h-3.5 w-3.5" />
                                <span>WhatsApp</span>
                              </button>
                            )}

                            {/* Super Admin: Access Partner Dashboard directly */}
                            {isSuperAdmin && (
                              <button
                                type="button"
                                disabled={impersonatingId === r.id}
                                onClick={() => handleImpersonatePartner(r.id)}
                                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-50"
                                title="Directly enter this partner's store admin panel"
                              >
                                {impersonatingId === r.id ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <ShieldCheck className="h-3.5 w-3.5" />
                                )}
                                <span>Dashboard</span>
                              </button>
                            )}

                            {/* Super Admin: Reset Password Button */}
                            {isSuperAdmin && (
                              <button
                                type="button"
                                onClick={() => {
                                  setResetError(null);
                                  setPartnerNewPass("");
                                  setPartnerConfirmPass("");
                                  setResetPartnerTarget(r);
                                }}
                                className={`p-2 rounded-xl border text-xs font-bold transition cursor-pointer ${
                                  isDark
                                    ? "bg-purple-950/60 border-purple-800/70 text-purple-300 hover:bg-purple-900/50 hover:text-white"
                                    : "bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100"
                                }`}
                                title="Reset partner password"
                              >
                                <KeyRound className="h-3.5 w-3.5" />
                              </button>
                            )}

                            {/* Super Admin: Delete Action */}
                            {isSuperAdmin && r.id !== 1 && (
                              <button
                                type="button"
                                disabled={isUpdating}
                                onClick={() => handleDelete(r)}
                                className={`p-2 rounded-xl border transition cursor-pointer ${
                                  isDark
                                    ? "bg-neutral-900 border-neutral-800 text-neutral-500 hover:text-red-400 hover:bg-neutral-800"
                                    : "bg-white border-neutral-200 text-neutral-400 hover:text-red-600 hover:bg-neutral-100"
                                }`}
                                title="Delete Partner"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Task Notes / Remarks Preview */}
                        {(r.taskNotes || r.assignedName) && (
                          <div
                            className={`rounded-xl border p-3 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 ${
                              isDark ? "bg-[#090b11]/80 border-neutral-800" : "bg-slate-100/80 border-neutral-200"
                            }`}
                          >
                            <div className="flex items-start gap-2 min-w-0">
                              <ClipboardList className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
                              <div className="min-w-0">
                                <span className="font-bold text-[11px] uppercase tracking-wider text-indigo-400 block">
                                  Task Instructions & Remarks:
                                </span>
                                <p className={`truncate sm:whitespace-normal ${isDark ? "text-neutral-300" : "text-neutral-700"}`}>
                                  {r.taskNotes || "No specific instructions. Please complete store details."}
                                </p>
                              </div>
                            </div>

                            <span
                              className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border self-start sm:self-auto shrink-0 ${
                                r.taskStatus === "completed"
                                  ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                                  : r.taskStatus === "in_progress"
                                  ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                                  : "bg-amber-500/20 text-amber-400 border-amber-500/30"
                              }`}
                            >
                              Status: {r.taskStatus || "pending"}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* ======================================================== */}
      {/* MODAL: MONTHLY BILLING & VALIDITY (SUPER ADMIN ONLY)     */}
      {/* ======================================================== */}
      {billingTarget && (
        <div className="fixed inset-0 z-50 overflow-y-auto p-3 sm:p-6 bg-black/85 backdrop-blur-md flex min-h-full items-center justify-center animate-in fade-in">
          <div
            className={`relative w-full max-w-lg sm:max-w-xl rounded-3xl border shadow-2xl my-auto p-4 sm:p-7 flex flex-col max-h-[92vh] ${
              isDark ? "border-neutral-800 bg-[#0f1118]" : "border-neutral-200 bg-white"
            }`}
          >
            <div className={`flex items-center justify-between pb-3.5 border-b shrink-0 ${isDark ? "border-neutral-800" : "border-neutral-100"}`}>
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="h-10 w-10 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30 shrink-0">
                  <CalendarClock className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h3 className={`font-bold text-sm sm:text-base leading-tight truncate ${isDark ? "text-white" : "text-neutral-900"}`}>
                    Monthly Billing & Subscription Validity
                  </h3>
                  <p className="text-[11px] text-purple-400 font-mono truncate">
                    {billingTarget.name} (/{billingTarget.slug})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setBillingTarget(null)}
                className={`p-2 rounded-xl cursor-pointer shrink-0 ml-2 ${isDark ? "text-neutral-400 hover:text-white hover:bg-neutral-800" : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100"}`}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveBilling} className="mt-4 space-y-4 text-xs overflow-y-auto pr-1">
              {/* 1. Monthly Fee Input with Quick Amount Chips */}
              <div className={`p-4 rounded-2xl border ${isDark ? "bg-[#141220] border-purple-900/40" : "bg-purple-50/50 border-purple-200"}`}>
                <div className="flex items-center justify-between mb-1.5">
                  <label className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${isDark ? "text-purple-300" : "text-purple-700"}`}>
                    <DollarSign className="h-3.5 w-3.5" />
                    <span>1. Monthly Subscription Fee (₹)</span>
                  </label>
                  <span className="text-[10px] text-neutral-400">Expected monthly charge</span>
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-black text-sm text-purple-400">₹</span>
                  <input
                    type="number"
                    required
                    min={0}
                    value={billFee}
                    onChange={(e) => setBillFee(e.target.value)}
                    placeholder="e.g. 1500"
                    className={`w-full rounded-xl border pl-8 pr-3.5 py-2.5 text-sm font-black font-mono outline-none focus:border-purple-500 ${
                      isDark ? "border-neutral-800 bg-neutral-900 text-white" : "border-neutral-200 bg-white text-neutral-900"
                    }`}
                  />
                </div>
                {/* Fast fee chips */}
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  <span className={`text-[10px] font-bold uppercase mr-1 ${isDark ? "text-neutral-500" : "text-neutral-400"}`}>Quick Fee:</span>
                  {["999", "1499", "1999", "2499", "2999", "4999"].map((feeOption) => (
                    <button
                      key={feeOption}
                      type="button"
                      onClick={() => setBillFee(feeOption)}
                      className={`px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-bold transition cursor-pointer ${
                        billFee === feeOption
                          ? "bg-purple-600 text-white shadow-xs"
                          : isDark
                          ? "bg-neutral-800/80 text-neutral-300 hover:bg-neutral-700"
                          : "bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-100"
                      }`}
                    >
                      ₹{Number(feeOption).toLocaleString("en-IN")}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Date Setup: Day, Month, Year */}
              <div className={`p-4 rounded-2xl border ${isDark ? "bg-[#101424] border-indigo-900/40" : "bg-indigo-50/50 border-indigo-200"}`}>
                <div className="flex items-center justify-between mb-2">
                  <label className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${isDark ? "text-indigo-300" : "text-indigo-700"}`}>
                    <Calendar className="h-3.5 w-3.5" />
                    <span>2. Validity & Expiry Date (Active Until)</span>
                  </label>
                  <span className="text-[10px] text-neutral-400">Select Day, Month, Year</span>
                </div>

                {/* 3 Dropdowns: Day, Month, Year */}
                <div className="grid grid-cols-3 gap-2">
                  {/* Day */}
                  <div>
                    <label className={`block text-[10px] font-bold uppercase mb-1 ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
                      Day
                    </label>
                    <select
                      value={billDay}
                      onChange={(e) => updateDateFromDmy(Number(e.target.value), billMonth, billYear)}
                      className={`w-full rounded-xl border px-2.5 py-2 text-xs font-mono font-bold outline-none focus:border-indigo-500 cursor-pointer ${
                        isDark ? "border-neutral-800 bg-neutral-900 text-white" : "border-neutral-200 bg-white text-neutral-900"
                      }`}
                    >
                      {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                        <option key={d} value={d}>
                          {String(d).padStart(2, "0")}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Month */}
                  <div>
                    <label className={`block text-[10px] font-bold uppercase mb-1 ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
                      Month
                    </label>
                    <select
                      value={billMonth}
                      onChange={(e) => updateDateFromDmy(billDay, Number(e.target.value), billYear)}
                      className={`w-full rounded-xl border px-2 py-2 text-xs font-bold outline-none focus:border-indigo-500 cursor-pointer ${
                        isDark ? "border-neutral-800 bg-neutral-900 text-white" : "border-neutral-200 bg-white text-neutral-900"
                      }`}
                    >
                      {MONTHS_LIST.map((m) => (
                        <option key={m.value} value={m.value}>
                          {m.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Year */}
                  <div>
                    <label className={`block text-[10px] font-bold uppercase mb-1 ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
                      Year
                    </label>
                    <select
                      value={billYear}
                      onChange={(e) => updateDateFromDmy(billDay, billMonth, Number(e.target.value))}
                      className={`w-full rounded-xl border px-2 py-2 text-xs font-mono font-bold outline-none focus:border-indigo-500 cursor-pointer ${
                        isDark ? "border-neutral-800 bg-neutral-900 text-white" : "border-neutral-200 bg-white text-neutral-900"
                      }`}
                    >
                      {[2025, 2026, 2027, 2028, 2029, 2030].map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Direct Calendar Picker option */}
                <div className="mt-2.5 flex items-center justify-between gap-2 pt-2 border-t border-neutral-800/40 text-[11px]">
                  <span className={isDark ? "text-neutral-400" : "text-neutral-500"}>Or select directly from calendar:</span>
                  <input
                    type="date"
                    required
                    value={billDueDate}
                    onChange={(e) => setDateFromIso(e.target.value)}
                    className={`rounded-lg border px-2 py-1 text-xs font-mono outline-none focus:border-indigo-500 cursor-pointer ${
                      isDark ? "border-neutral-800 bg-neutral-900 text-white" : "border-neutral-200 bg-white text-neutral-900"
                    }`}
                  />
                </div>

                {/* Quick Presets */}
                <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-2 border-t border-neutral-800/40">
                  <span className={`text-[10px] font-bold uppercase ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
                    Quick Presets:
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const d = new Date();
                      d.setDate(d.getDate() + 30);
                      setDateFromIso(d.toISOString().slice(0, 10));
                      setBillPaymentStatus("paid");
                      setBillSubStatus("active");
                    }}
                    className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold hover:bg-emerald-500/25 cursor-pointer"
                  >
                    +30 Days (1 Month)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const d = new Date();
                      d.setDate(d.getDate() + 60);
                      setDateFromIso(d.toISOString().slice(0, 10));
                      setBillPaymentStatus("paid");
                      setBillSubStatus("active");
                    }}
                    className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold hover:bg-emerald-500/25 cursor-pointer"
                  >
                    +60 Days (2 Months)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const now = new Date();
                      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                      setDateFromIso(lastDay.toISOString().slice(0, 10));
                      setBillPaymentStatus("paid");
                      setBillSubStatus("active");
                    }}
                    className="px-2.5 py-1 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 text-[10px] font-bold hover:bg-indigo-500/25 cursor-pointer"
                  >
                    End of Month
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const d = new Date();
                      d.setDate(d.getDate() + 365);
                      setDateFromIso(d.toISOString().slice(0, 10));
                      setBillPaymentStatus("paid");
                      setBillSubStatus("active");
                    }}
                    className="px-2.5 py-1 rounded-lg bg-purple-500/15 border border-purple-500/30 text-purple-400 text-[10px] font-bold hover:bg-purple-500/25 cursor-pointer"
                  >
                    +1 Year (365 Days)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setBillPaymentStatus("pending");
                      setBillSubStatus("expired");
                    }}
                    className="px-2.5 py-1 rounded-lg bg-red-500/15 border border-red-500/30 text-red-400 text-[10px] font-bold hover:bg-red-500/25 cursor-pointer"
                  >
                    🔴 Suspend Service
                  </button>
                </div>
              </div>

              {/* 3. Payment Status */}
              <div className="space-y-1.5">
                <label className={`block text-[11px] font-bold uppercase tracking-wider ${isDark ? "text-neutral-400" : "text-neutral-600"}`}>
                  3. Payment & Service Status
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div
                    onClick={() => {
                      setBillPaymentStatus("paid");
                      setBillSubStatus("active");
                    }}
                    className={`p-3 rounded-2xl border cursor-pointer transition flex items-center gap-2.5 ${
                      billPaymentStatus === "paid"
                        ? "border-emerald-500 bg-emerald-500/15 text-emerald-400 font-bold shadow-md shadow-emerald-500/10"
                        : isDark
                        ? "border-neutral-800 bg-neutral-900/60 text-neutral-400 hover:border-neutral-700"
                        : "border-neutral-200 bg-slate-50 text-neutral-600 hover:border-neutral-300"
                    }`}
                  >
                    <div className={`h-5 w-5 rounded-full flex items-center justify-center border ${
                      billPaymentStatus === "paid" ? "border-emerald-500 bg-emerald-500 text-white" : "border-neutral-500"
                    }`}>
                      {billPaymentStatus === "paid" && <Check className="h-3 w-3" />}
                    </div>
                    <div>
                      <p className="text-xs font-bold">🟢 Payment Received (Paid)</p>
                      <p className="text-[10px] opacity-80">Store & Partner Login Active</p>
                    </div>
                  </div>

                  <div
                    onClick={() => {
                      setBillPaymentStatus("pending");
                      setBillSubStatus("expired");
                    }}
                    className={`p-3 rounded-2xl border cursor-pointer transition flex items-center gap-2.5 ${
                      billPaymentStatus === "pending"
                        ? "border-red-500 bg-red-500/15 text-red-400 font-bold shadow-md shadow-red-500/10"
                        : isDark
                        ? "border-neutral-800 bg-neutral-900/60 text-neutral-400 hover:border-neutral-700"
                        : "border-neutral-200 bg-slate-50 text-neutral-600 hover:border-neutral-300"
                    }`}
                  >
                    <div className={`h-5 w-5 rounded-full flex items-center justify-center border ${
                      billPaymentStatus === "pending" ? "border-red-500 bg-red-500 text-white" : "border-neutral-500"
                    }`}>
                      {billPaymentStatus === "pending" && <X className="h-3 w-3" />}
                    </div>
                    <div>
                      <p className="text-xs font-bold">🔴 Payment Due / Unpaid</p>
                      <p className="text-[10px] opacity-80">Store Suspended (Login Blocked)</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. Live Result / Preview Box */}
              <div
                className={`p-3.5 rounded-2xl border text-xs space-y-1.5 ${
                  billPaymentStatus === "paid"
                    ? isDark
                      ? "bg-emerald-950/20 border-emerald-800/40 text-emerald-300"
                      : "bg-emerald-50 border-emerald-200 text-emerald-900"
                    : isDark
                    ? "bg-red-950/20 border-red-800/40 text-red-300"
                    : "bg-red-50 border-red-200 text-red-900"
                }`}
              >
                <div className="flex items-center gap-2 font-bold">
                  {billPaymentStatus === "paid" ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-red-400" />
                  )}
                  <span>Validity & Status Summary:</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  {billPaymentStatus === "paid" ? (
                    <>
                      Store will remain <span className="underline font-bold text-emerald-400">ACTIVE</span> until{" "}
                      <strong>{formatBillingDate(billDueDate)}</strong> (
                      {getDaysRemaining(billDueDate) !== null && getDaysRemaining(billDueDate)! >= 0
                        ? `${getDaysRemaining(billDueDate)} days remaining`
                        : "Date expired"}). Partner can access admin dashboard without disruption.
                    </>
                  ) : (
                    <>
                      Store will be <span className="underline font-bold text-red-400">SUSPENDED</span> immediately.
                      Partner admin login will be blocked with a payment renewal notice until dues are marked paid.
                    </>
                  )}
                </p>
              </div>

              {/* 5. Payment Notes (Optional) */}
              <div>
                <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1 ${isDark ? "text-neutral-400" : "text-neutral-600"}`}>
                  Payment Notes / Reference (e.g. UPI Ref / Cash / Bank Transfer)
                </label>
                <input
                  type="text"
                  placeholder="e.g. UPI Ref: 3948293921 GooglePay / Cash received"
                  value={billNotes}
                  onChange={(e) => setBillNotes(e.target.value)}
                  className={`w-full rounded-xl border px-3.5 py-2.5 text-xs outline-none focus:border-purple-500 ${
                    isDark ? "border-neutral-800 bg-neutral-900 text-white" : "border-neutral-200 bg-neutral-50 text-neutral-900"
                  }`}
                />
              </div>

              {/* Save & Cancel Buttons */}
              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 pt-3 border-t border-neutral-800/60 shrink-0">
                <button
                  type="button"
                  onClick={() => setBillingTarget(null)}
                  className={`w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer text-center ${
                    isDark ? "text-neutral-400 hover:text-white hover:bg-neutral-800" : "text-neutral-600 hover:bg-neutral-100"
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={billingSubmitting}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 transition disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                >
                  {billingSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>Save Plan & Validity</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: OPERATOR EDIT STORE DETAILS & TASK                */}
      {/* ======================================================== */}
      {editStoreTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div
            className={`relative w-full max-w-lg rounded-3xl border p-6 sm:p-7 shadow-2xl ${
              isDark ? "border-neutral-800 bg-[#0f1118]" : "border-neutral-200 bg-white"
            }`}
          >
            <div className={`flex items-center justify-between pb-4 border-b ${isDark ? "border-neutral-800" : "border-neutral-100"}`}>
              <div className="flex items-center gap-2.5">
                <div className="h-10 w-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                  <Edit3 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className={`font-bold text-base ${isDark ? "text-white" : "text-neutral-900"}`}>
                    Fill & Update Store Details
                  </h3>
                  <p className="text-[11px] text-purple-400 font-mono">
                    /{editStoreTarget.slug}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditStoreTarget(null)}
                className={`p-1.5 rounded-xl cursor-pointer ${isDark ? "text-neutral-400 hover:text-white hover:bg-neutral-800" : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100"}`}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveStoreDetails} className="mt-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1 ${isDark ? "text-neutral-400" : "text-neutral-600"}`}>
                    Restaurant Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className={`w-full rounded-xl border px-3.5 py-2.5 text-xs outline-none focus:border-indigo-500 ${
                      isDark ? "border-neutral-800 bg-neutral-900 text-white" : "border-neutral-200 bg-neutral-50 text-neutral-900"
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1 ${isDark ? "text-neutral-400" : "text-neutral-600"}`}>
                    Owner Name
                  </label>
                  <input
                    type="text"
                    value={editOwner}
                    onChange={(e) => setEditOwner(e.target.value)}
                    className={`w-full rounded-xl border px-3.5 py-2.5 text-xs outline-none focus:border-indigo-500 ${
                      isDark ? "border-neutral-800 bg-neutral-900 text-white" : "border-neutral-200 bg-neutral-50 text-neutral-900"
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1 ${isDark ? "text-neutral-400" : "text-neutral-600"}`}>
                    Phone / WhatsApp Number
                  </label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className={`w-full rounded-xl border px-3.5 py-2.5 text-xs outline-none focus:border-indigo-500 ${
                      isDark ? "border-neutral-800 bg-neutral-900 text-white" : "border-neutral-200 bg-neutral-50 text-neutral-900"
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1 ${isDark ? "text-neutral-400" : "text-neutral-600"}`}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className={`w-full rounded-xl border px-3.5 py-2.5 text-xs outline-none focus:border-indigo-500 ${
                      isDark ? "border-neutral-800 bg-neutral-900 text-white" : "border-neutral-200 bg-neutral-50 text-neutral-900"
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1 ${isDark ? "text-neutral-400" : "text-neutral-600"}`}>
                  Task Status
                </label>
                <select
                  value={editTaskStatus}
                  onChange={(e) => setEditTaskStatus(e.target.value as any)}
                  className={`w-full rounded-xl border px-3.5 py-2.5 text-xs outline-none focus:border-indigo-500 cursor-pointer ${
                    isDark ? "border-neutral-800 bg-neutral-900 text-white" : "border-neutral-200 bg-neutral-50 text-neutral-900"
                  }`}
                >
                  <option value="pending">Pending (Not Started)</option>
                  <option value="in_progress">In Progress (Verification Ongoing)</option>
                  <option value="completed">Completed (Details Verified & Active)</option>
                </select>
              </div>

              <div>
                <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1 ${isDark ? "text-neutral-400" : "text-neutral-600"}`}>
                  Work Remarks & Updates
                </label>
                <textarea
                  rows={3}
                  value={editTaskNotes}
                  onChange={(e) => setEditTaskNotes(e.target.value)}
                  placeholder="e.g. Spoke with owner on phone. Verified menu items and operating hours."
                  className={`w-full rounded-xl border px-3.5 py-2.5 text-xs outline-none focus:border-indigo-500 ${
                    isDark ? "border-neutral-800 bg-neutral-900 text-white" : "border-neutral-200 bg-neutral-50 text-neutral-900"
                  }`}
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-neutral-800/60">
                <button
                  type="button"
                  onClick={() => setEditStoreTarget(null)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                    isDark ? "text-neutral-400 hover:text-white hover:bg-neutral-800" : "text-neutral-600 hover:bg-neutral-100"
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editSubmitting}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                >
                  {editSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>Save Details</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: ASSIGN STAFF & TASK REMARKS (SUPER ADMIN ONLY)    */}
      {/* ======================================================== */}
      {assignTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div
            className={`relative w-full max-w-lg rounded-3xl border p-6 sm:p-7 shadow-2xl ${
              isDark ? "border-neutral-800 bg-[#0f1118]" : "border-neutral-200 bg-white"
            }`}
          >
            <div className={`flex items-center justify-between pb-4 border-b ${isDark ? "border-neutral-800" : "border-neutral-100"}`}>
              <div className="flex items-center gap-2.5">
                <div className="h-10 w-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                  <ClipboardList className="h-5 w-5" />
                </div>
                <div>
                  <h3 className={`font-bold text-base ${isDark ? "text-white" : "text-neutral-900"}`}>
                    Assign Partner Store & Task
                  </h3>
                  <p className="text-[11px] text-purple-400 font-mono">
                    {assignTarget.name} (/{assignTarget.slug})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAssignTarget(null)}
                className={`p-1.5 rounded-xl cursor-pointer ${isDark ? "text-neutral-400 hover:text-white hover:bg-neutral-800" : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100"}`}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAssignment} className="mt-5 space-y-4 text-xs">
              <div>
                <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1 ${isDark ? "text-neutral-400" : "text-neutral-600"}`}>
                  Assign To Staff Member (Operator / Support)
                </label>
                <select
                  value={assignStaffId}
                  onChange={(e) => setAssignStaffId(e.target.value ? Number(e.target.value) : "")}
                  className={`w-full rounded-xl border px-3.5 py-2.5 text-xs outline-none focus:border-indigo-500 cursor-pointer ${
                    isDark ? "border-neutral-800 bg-neutral-900 text-white" : "border-neutral-200 bg-neutral-50 text-neutral-900"
                  }`}
                >
                  <option value="">-- Unassigned (No Staff Assigned) --</option>
                  {staffList
                    .filter((s) => s.role === "operator" || s.role === "support")
                    .map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name || s.username} ({s.role.toUpperCase()}) - {s.assignedStoresCount} assigned stores
                      </option>
                    ))}
                </select>
                {staffList.filter((s) => s.role === "operator" || s.role === "support").length === 0 && (
                  <p className="text-[11px] mt-1.5 text-amber-400 font-medium">
                    ⚠️ No operator staff found. Please register an Operator user in the &apos;Staff Directory&apos; tab first.
                  </p>
                )}
                <p className={`text-[11px] mt-1 ${isDark ? "text-neutral-500" : "text-neutral-400"}`}>
                  Super Admin assigns stores to operators. Operators can only see and edit their assigned stores. Super Admin cannot be assigned to stores.
                </p>
              </div>

              <div>
                <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1 ${isDark ? "text-neutral-400" : "text-neutral-600"}`}>
                  Task Status
                </label>
                <select
                  value={assignStatus}
                  onChange={(e) => setAssignStatus(e.target.value as any)}
                  className={`w-full rounded-xl border px-3.5 py-2.5 text-xs outline-none focus:border-indigo-500 cursor-pointer ${
                    isDark ? "border-neutral-800 bg-neutral-900 text-white" : "border-neutral-200 bg-neutral-50 text-neutral-900"
                  }`}
                >
                  <option value="pending">Pending (Awaiting Action)</option>
                  <option value="in_progress">In Progress (Under Review)</option>
                  <option value="completed">Completed (Verified & Ready)</option>
                </select>
              </div>

              <div>
                <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1 ${isDark ? "text-neutral-400" : "text-neutral-600"}`}>
                  Task Instructions / Remarks
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Call owner, verify menu items, and confirm payment on WhatsApp."
                  value={assignNotes}
                  onChange={(e) => setAssignNotes(e.target.value)}
                  className={`w-full rounded-xl border px-3.5 py-2.5 text-xs outline-none focus:border-indigo-500 ${
                    isDark
                      ? "border-neutral-800 bg-neutral-900 text-white placeholder-neutral-500"
                      : "border-neutral-200 bg-neutral-50 text-neutral-900 placeholder-neutral-400"
                  }`}
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-neutral-800/60">
                <button
                  type="button"
                  onClick={() => setAssignTarget(null)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                    isDark ? "text-neutral-400 hover:text-white hover:bg-neutral-800" : "text-neutral-600 hover:bg-neutral-100"
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={assignSubmitting}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                >
                  {assignSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>Save Assignment</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: CHANGE SUPER ADMIN PASSWORD                       */}
      {/* ======================================================== */}
      {isChangePassOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div
            className={`relative w-full max-w-md rounded-3xl border p-6 sm:p-7 shadow-2xl ${
              isDark ? "border-neutral-800 bg-[#0f1118]" : "border-neutral-200 bg-white"
            }`}
          >
            <div className={`flex items-center justify-between pb-4 border-b ${isDark ? "border-neutral-800" : "border-neutral-100"}`}>
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-purple-500/20 text-purple-500 flex items-center justify-center border border-purple-500/30">
                  <KeyRound className="h-4 w-4" />
                </div>
                <div>
                  <h3 className={`font-bold text-base ${isDark ? "text-white" : "text-neutral-900"}`}>Change Password</h3>
                  <p className={`text-[11px] ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>{adminName} ({userRole})</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsChangePassOpen(false)}
                className={`p-1.5 rounded-xl cursor-pointer ${isDark ? "text-neutral-400 hover:text-white hover:bg-neutral-800" : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100"}`}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {passError && (
              <div className="mt-4 rounded-xl bg-red-500/10 p-3 text-xs text-red-500 border border-red-500/20">
                {passError}
              </div>
            )}

            <form onSubmit={handleChangeSuperAdminPassword} className="mt-5 space-y-4">
              <div>
                <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1 ${isDark ? "text-neutral-400" : "text-neutral-600"}`}>
                  Current Password
                </label>
                <input
                  type="password"
                  placeholder="Enter current password"
                  value={currPass}
                  onChange={(e) => setCurrPass(e.target.value)}
                  className={`w-full rounded-xl border px-3.5 py-2.5 text-xs outline-none focus:border-purple-500 ${
                    isDark
                      ? "border-neutral-800 bg-neutral-900 text-white placeholder-neutral-500"
                      : "border-neutral-200 bg-neutral-50 text-neutral-900 placeholder-neutral-400"
                  }`}
                />
              </div>

              <div>
                <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1 ${isDark ? "text-neutral-400" : "text-neutral-600"}`}>
                  New Password <span className="text-purple-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPasswordMap["superAdmin"] ? "text" : "password"}
                    required
                    minLength={6}
                    placeholder="Minimum 6 characters"
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    className={`w-full rounded-xl border px-3.5 py-2.5 pr-10 text-xs outline-none focus:border-purple-500 ${
                      isDark
                        ? "border-neutral-800 bg-neutral-900 text-white placeholder-neutral-500"
                        : "border-neutral-200 bg-neutral-50 text-neutral-900 placeholder-neutral-400"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => toggleShowPassword("superAdmin")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
                  >
                    {showPasswordMap["superAdmin"] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1 ${isDark ? "text-neutral-400" : "text-neutral-600"}`}>
                  Confirm New Password <span className="text-purple-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="Re-enter new password"
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  className={`w-full rounded-xl border px-3.5 py-2.5 text-xs outline-none focus:border-purple-500 ${
                    isDark
                      ? "border-neutral-800 bg-neutral-900 text-white placeholder-neutral-500"
                      : "border-neutral-200 bg-neutral-50 text-neutral-900 placeholder-neutral-400"
                  }`}
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setIsChangePassOpen(false)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                    isDark ? "text-neutral-400 hover:text-white hover:bg-neutral-800" : "text-neutral-600 hover:bg-neutral-100"
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={passSubmitting}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-600/30 transition disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                >
                  {passSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>Save Password</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: RESET PARTNER PASSWORD                            */}
      {/* ======================================================== */}
      {resetPartnerTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div
            className={`relative w-full max-w-md rounded-3xl border p-6 sm:p-7 shadow-2xl ${
              isDark ? "border-neutral-800 bg-[#0f1118]" : "border-neutral-200 bg-white"
            }`}
          >
            <div className={`flex items-center justify-between pb-4 border-b ${isDark ? "border-neutral-800" : "border-neutral-100"}`}>
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center border border-amber-500/30">
                  <KeyRound className="h-4 w-4" />
                </div>
                <div>
                  <h3 className={`font-bold text-base ${isDark ? "text-white" : "text-neutral-900"}`}>Reset Partner Password</h3>
                  <p className="text-[11px] text-purple-500 font-mono">
                    {resetPartnerTarget.name} (/{resetPartnerTarget.slug})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setResetPartnerTarget(null)}
                className={`p-1.5 rounded-xl cursor-pointer ${isDark ? "text-neutral-400 hover:text-white hover:bg-neutral-800" : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100"}`}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {resetError && (
              <div className="mt-4 rounded-xl bg-red-500/10 p-3 text-xs text-red-500 border border-red-500/20">
                {resetError}
              </div>
            )}

            <form onSubmit={handleResetPartnerPassword} className="mt-4 space-y-4">
              <div>
                <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1 ${isDark ? "text-neutral-400" : "text-neutral-600"}`}>
                  New Password <span className="text-purple-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPasswordMap["partnerReset"] ? "text" : "password"}
                    required
                    minLength={6}
                    placeholder="Enter new partner password (min 6 chars)"
                    value={partnerNewPass}
                    onChange={(e) => setPartnerNewPass(e.target.value)}
                    className={`w-full rounded-xl border px-3.5 py-2.5 pr-10 text-xs outline-none focus:border-purple-500 ${
                      isDark
                        ? "border-neutral-800 bg-neutral-900 text-white placeholder-neutral-500"
                        : "border-neutral-200 bg-neutral-50 text-neutral-900 placeholder-neutral-400"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => toggleShowPassword("partnerReset")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
                  >
                    {showPasswordMap["partnerReset"] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1 ${isDark ? "text-neutral-400" : "text-neutral-600"}`}>
                  Confirm New Password <span className="text-purple-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="Re-enter new password"
                  value={partnerConfirmPass}
                  onChange={(e) => setPartnerConfirmPass(e.target.value)}
                  className={`w-full rounded-xl border px-3.5 py-2.5 text-xs outline-none focus:border-purple-500 ${
                    isDark
                      ? "border-neutral-800 bg-neutral-900 text-white placeholder-neutral-500"
                      : "border-neutral-200 bg-neutral-50 text-neutral-900 placeholder-neutral-400"
                  }`}
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setResetPartnerTarget(null)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                    isDark ? "text-neutral-400 hover:text-white hover:bg-neutral-800" : "text-neutral-600 hover:bg-neutral-100"
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resetSubmitting}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-600/30 transition disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                >
                  {resetSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>Update Password</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: CREATE NEW PARTNER                                */}
      {/* ======================================================== */}
      {isCreatePartnerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div
            className={`relative w-full max-w-xl rounded-3xl border p-6 sm:p-8 shadow-2xl my-8 ${
              isDark ? "border-neutral-800 bg-[#0f1118]" : "border-neutral-200 bg-white"
            }`}
          >
            <div className={`flex items-center justify-between pb-4 border-b ${isDark ? "border-neutral-800" : "border-neutral-100"}`}>
              <div className="flex items-center gap-2.5">
                <div className="h-10 w-10 rounded-2xl bg-purple-500/20 text-purple-500 flex items-center justify-center border border-purple-500/30">
                  <Store className="h-5 w-5" />
                </div>
                <div>
                  <h3 className={`font-bold text-base ${isDark ? "text-white" : "text-neutral-900"}`}>Create New Partner Restaurant</h3>
                  <p className={`text-[11px] ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
                    Instantly deploy storefront, role-based admin & settings
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCreatePartnerOpen(false)}
                className={`p-1.5 rounded-xl cursor-pointer ${isDark ? "text-neutral-400 hover:text-white hover:bg-neutral-800" : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100"}`}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {createPartnerError && (
              <div className="mt-4 rounded-xl bg-red-500/10 p-3 text-xs text-red-500 border border-red-500/20">
                {createPartnerError}
              </div>
            )}

            <form onSubmit={handleCreatePartner} className="mt-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1 ${isDark ? "text-neutral-400" : "text-neutral-600"}`}>
                    Store / Brand Name <span className="text-purple-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Royal Pizza Hub"
                    value={newStoreName}
                    onChange={(e) => handleStoreNameChange(e.target.value)}
                    className={`w-full rounded-xl border px-3.5 py-2.5 text-xs outline-none focus:border-purple-500 ${
                      isDark
                        ? "border-neutral-800 bg-neutral-900 text-white placeholder-neutral-500"
                        : "border-neutral-200 bg-neutral-50 text-neutral-900 placeholder-neutral-400"
                    }`}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1 ${isDark ? "text-neutral-400" : "text-neutral-600"}`}>
                      Store URL Slug <span className="text-purple-500">*</span>
                    </label>
                    <span className="text-[10px] text-amber-500 font-bold flex items-center gap-1">
                      <Lock className="h-3 w-3" />
                      Auto-generated
                    </span>
                  </div>
                  <div
                    className={`flex items-center rounded-xl border px-3 py-2 text-xs overflow-hidden ${
                      isDark ? "border-neutral-800 bg-neutral-950/80" : "border-neutral-200 bg-neutral-100"
                    }`}
                  >
                    <span className="text-neutral-400 font-mono">/</span>
                    <input
                      type="text"
                      required
                      readOnly
                      tabIndex={-1}
                      placeholder="auto-generated-from-name"
                      value={newStoreSlug}
                      className="w-full bg-transparent font-mono outline-none text-purple-400 font-bold ml-1 cursor-not-allowed select-all"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1 ${isDark ? "text-neutral-400" : "text-neutral-600"}`}>
                    Owner Name
                  </label>
                  <input
                    type="text"
                    placeholder="Store Owner Name"
                    value={newStoreOwner}
                    onChange={(e) => setNewStoreOwner(e.target.value)}
                    className={`w-full rounded-xl border px-3.5 py-2.5 text-xs outline-none focus:border-purple-500 ${
                      isDark ? "border-neutral-800 bg-neutral-900 text-white" : "border-neutral-200 bg-neutral-50 text-neutral-900"
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1 ${isDark ? "text-neutral-400" : "text-neutral-600"}`}>
                    Phone / WhatsApp
                  </label>
                  <input
                    type="text"
                    placeholder="Phone number"
                    value={newStorePhone}
                    onChange={(e) => setNewStorePhone(e.target.value)}
                    className={`w-full rounded-xl border px-3.5 py-2.5 text-xs outline-none focus:border-purple-500 ${
                      isDark ? "border-neutral-800 bg-neutral-900 text-white" : "border-neutral-200 bg-neutral-50 text-neutral-900"
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1 ${isDark ? "text-neutral-400" : "text-neutral-600"}`}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="owner@example.com"
                    value={newStoreEmail}
                    onChange={(e) => setNewStoreEmail(e.target.value)}
                    className={`w-full rounded-xl border px-3.5 py-2.5 text-xs outline-none focus:border-purple-500 ${
                      isDark ? "border-neutral-800 bg-neutral-900 text-white" : "border-neutral-200 bg-neutral-50 text-neutral-900"
                    }`}
                  />
                </div>
              </div>

              <div className={`border-t pt-4 ${isDark ? "border-neutral-800" : "border-neutral-100"}`}>
                <p className="text-[11px] font-bold uppercase tracking-wider text-purple-500 mb-3 flex items-center gap-1.5">
                  <Shield className="h-3.5 w-3.5" />
                  Partner Admin Login Credentials
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1 ${isDark ? "text-neutral-400" : "text-neutral-600"}`}>
                      Admin Username <span className="text-purple-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. storeadmin"
                      value={newStoreUsername}
                      onChange={(e) => setNewStoreUsername(e.target.value)}
                      className={`w-full rounded-xl border px-3.5 py-2.5 text-xs outline-none focus:border-purple-500 font-mono ${
                        isDark ? "border-neutral-800 bg-neutral-900 text-white" : "border-neutral-200 bg-neutral-50 text-neutral-900"
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1 ${isDark ? "text-neutral-400" : "text-neutral-600"}`}>
                      Admin Password <span className="text-purple-500">*</span>
                    </label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      placeholder="••••••••••••"
                      value={newStorePassword}
                      onChange={(e) => setNewStorePassword(e.target.value)}
                      className={`w-full rounded-xl border px-3.5 py-2.5 text-xs outline-none focus:border-purple-500 ${
                        isDark ? "border-neutral-800 bg-neutral-900 text-white" : "border-neutral-200 bg-neutral-50 text-neutral-900"
                      }`}
                    />
                  </div>
                </div>
              </div>

              <div className={`flex items-center justify-end gap-2.5 pt-4 border-t ${isDark ? "border-neutral-800" : "border-neutral-100"}`}>
                <button
                  type="button"
                  onClick={() => setIsCreatePartnerOpen(false)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                    isDark ? "text-neutral-400 hover:text-white hover:bg-neutral-800" : "text-neutral-600 hover:bg-neutral-100"
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createPartnerSubmitting || modalSlugAvailable === false || !newStoreSlug}
                  className="px-6 py-2.5 rounded-xl bg-linear-to-r from-purple-600 to-indigo-600 hover:opacity-95 text-white text-xs font-bold shadow-lg shadow-purple-600/30 transition disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                >
                  {createPartnerSubmitting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Creating Store…</span>
                    </>
                  ) : (
                    <span>Create & Launch Store</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: REGISTER STAFF MEMBER                             */}
      {/* ======================================================== */}
      {isRegisterAdminOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div
            className={`relative w-full max-w-md rounded-3xl border p-6 sm:p-7 shadow-2xl ${
              isDark ? "border-neutral-800 bg-[#0f1118]" : "border-neutral-200 bg-white"
            }`}
          >
            <div className={`flex items-center justify-between pb-4 border-b ${isDark ? "border-neutral-800" : "border-neutral-100"}`}>
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-indigo-500/20 text-indigo-500 flex items-center justify-center border border-indigo-500/30">
                  <UserPlus className="h-4 w-4" />
                </div>
                <div>
                  <h3 className={`font-bold text-base ${isDark ? "text-white" : "text-neutral-900"}`}>
                    Register Staff / Team Member
                  </h3>
                  <p className={`text-[11px] ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
                    Create Operator or Support executive account
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsRegisterAdminOpen(false)}
                className={`p-1.5 rounded-xl cursor-pointer ${isDark ? "text-neutral-400 hover:text-white hover:bg-neutral-800" : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100"}`}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {regError && (
              <div className="mt-4 rounded-xl bg-red-500/10 p-3 text-xs text-red-500 border border-red-500/20">
                {regError}
              </div>
            )}

            <form onSubmit={handleRegisterAdmin} className="mt-5 space-y-4 text-xs">
              <div>
                <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1 ${isDark ? "text-neutral-400" : "text-neutral-600"}`}>
                  Role Selection <span className="text-purple-500">*</span>
                </label>
                <select
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value)}
                  className={`w-full rounded-xl border px-3.5 py-2.5 text-xs outline-none focus:border-indigo-500 font-bold cursor-pointer ${
                    isDark ? "border-neutral-800 bg-neutral-900 text-white" : "border-neutral-200 bg-neutral-50 text-neutral-900"
                  }`}
                >
                  <option value="operator">Operator (Only views & edits assigned stores)</option>
                  <option value="support">Support Executive (Partner Assistance)</option>
                  <option value="superadmin">Super Admin (Full Master Control)</option>
                </select>
              </div>

              <div>
                <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1 ${isDark ? "text-neutral-400" : "text-neutral-600"}`}>
                  Username <span className="text-purple-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. rahul_op"
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                  className={`w-full rounded-xl border px-3.5 py-2.5 text-xs outline-none focus:border-indigo-500 ${
                    isDark ? "border-neutral-800 bg-neutral-900 text-white" : "border-neutral-200 bg-neutral-50 text-neutral-900"
                  }`}
                />
              </div>

              <div>
                <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1 ${isDark ? "text-neutral-400" : "text-neutral-600"}`}>
                  Password <span className="text-purple-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="••••••••••••"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className={`w-full rounded-xl border px-3.5 py-2.5 text-xs outline-none focus:border-indigo-500 ${
                    isDark ? "border-neutral-800 bg-neutral-900 text-white" : "border-neutral-200 bg-neutral-50 text-neutral-900"
                  }`}
                />
              </div>

              <div>
                <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1 ${isDark ? "text-neutral-400" : "text-neutral-600"}`}>
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rahul Sharma"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className={`w-full rounded-xl border px-3.5 py-2.5 text-xs outline-none focus:border-indigo-500 ${
                    isDark ? "border-neutral-800 bg-neutral-900 text-white" : "border-neutral-200 bg-neutral-50 text-neutral-900"
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1 ${isDark ? "text-neutral-400" : "text-neutral-600"}`}>
                    Phone
                  </label>
                  <input
                    type="text"
                    placeholder="Phone number"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    className={`w-full rounded-xl border px-3.5 py-2.5 text-xs outline-none focus:border-indigo-500 ${
                      isDark ? "border-neutral-800 bg-neutral-900 text-white" : "border-neutral-200 bg-neutral-50 text-neutral-900"
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1 ${isDark ? "text-neutral-400" : "text-neutral-600"}`}>
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="Email address"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className={`w-full rounded-xl border px-3.5 py-2.5 text-xs outline-none focus:border-indigo-500 ${
                      isDark ? "border-neutral-800 bg-neutral-900 text-white" : "border-neutral-200 bg-neutral-50 text-neutral-900"
                    }`}
                  />
                </div>
              </div>

              <div className={`flex items-center justify-end gap-2.5 pt-3 border-t ${isDark ? "border-neutral-800" : "border-neutral-100"}`}>
                <button
                  type="button"
                  onClick={() => setIsRegisterAdminOpen(false)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                    isDark ? "text-neutral-400 hover:text-white hover:bg-neutral-800" : "text-neutral-600 hover:bg-neutral-100"
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={regSubmitting}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                >
                  {regSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>Register Staff</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
