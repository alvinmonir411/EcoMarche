"use client";

import { useEffect, useState } from "react";
import Container from "@/components/ui/Container";
import AdminSidebar from "@/components/layout/AdminSidebar";
import Button from "@/components/ui/Button";
import { adminApi } from "@/services/api";
import { toast } from "react-hot-toast";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "USER",
    phone: "",
    isActive: true,
  });

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.getUsers();
      if (res.success) {
        const data = res.data;
        setUsers(Array.isArray(data) ? data : (data?.users || data?.data || []));
      } else {
        const errMsg = Array.isArray(res.error) ? res.error.join(", ") : res.error;
        setError(errMsg || "Failed to load users.");
      }
    } catch (err) {
      setError("An error occurred while fetching users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openAddModal = () => {
    setEditingUser(null);
    setForm({
      name: "",
      email: "",
      password: "",
      role: "USER",
      phone: "",
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (user: any) => {
    setEditingUser(user);
    setForm({
      name: user.name || "",
      email: user.email || "",
      password: "", // Keep blank unless updating
      role: user.role || "USER",
      phone: user.phone || "",
      isActive: user.isActive !== undefined ? user.isActive : true,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (editingUser) {
        // Edit User
        const payload: any = {
          name: form.name,
          email: form.email,
          role: form.role,
          phone: form.phone || null,
          isActive: form.isActive,
        };
        if (form.password.trim()) {
          payload.password = form.password;
        }

        const res = await adminApi.updateUser(editingUser.id, payload);
        if (res.success) {
          toast.success("User updated successfully!");
          setIsModalOpen(false);
          fetchUsers();
        } else {
          const errMsg = Array.isArray(res.error) ? res.error.join(", ") : (res.error || "Failed to update user.");
          toast.error(errMsg);
        }
      } else {
        // Add User
        if (!form.password.trim()) {
          toast.error("Password is required for new users.");
          setSaving(false);
          return;
        }

        const res = await adminApi.createUser({
          ...form,
          phone: form.phone || null,
        });

        if (res.success) {
          toast.success("User created successfully!");
          setIsModalOpen(false);
          fetchUsers();
        } else {
          const errMsg = Array.isArray(res.error) ? res.error.join(", ") : (res.error || "Failed to create user.");
          toast.error(errMsg);
        }
      }
    } catch (err) {
      toast.error("An error occurred while saving the user.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this user? This action cannot be undone.")) return;

    try {
      const res = await adminApi.deleteUser(id);
      if (res.success) {
        toast.success("User deleted successfully!");
        setUsers((prev) => prev.filter((user) => user.id !== id));
      } else {
        const errMsg = Array.isArray(res.error) ? res.error.join(", ") : (res.error || "Failed to delete user.");
        toast.error(errMsg);
      }
    } catch (err) {
      toast.error("An error occurred while deleting the user.");
    }
  };

  const toggleUserStatus = async (user: any) => {
    const action = user.isActive ? "deactivate" : "activate";
    if (!confirm(`Are you sure you want to ${action} this user?`)) return;

    try {
      const res = await adminApi.updateUser(user.id, { isActive: !user.isActive });
      if (res.success) {
        toast.success(`User ${user.isActive ? "deactivated" : "activated"} successfully!`);
        setUsers((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, isActive: !user.isActive } : u))
        );
      } else {
        const errMsg = Array.isArray(res.error) ? res.error.join(", ") : (res.error || `Failed to ${action} user.`);
        toast.error(errMsg);
      }
    } catch (err) {
      toast.error("An error occurred while updating status.");
    }
  };

  const filteredUsers = Array.isArray(users)
    ? users.filter(
        (user) =>
          user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  if (loading) {
    return (
      <div className="py-20 min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="py-20 bg-accent/5 min-h-screen">
      <Container>
        <div className="flex flex-col lg:flex-row gap-12">
          <AdminSidebar />

          <main className="flex-1">
            <header className="mb-12 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div>
                <h1 className="text-4xl font-bold text-secondary mb-2">User Management</h1>
                <p className="text-gray-500">Monitor and manage your customer and admin accounts.</p>
              </div>
              <Button onClick={openAddModal} className="flex items-center gap-2 self-start sm:self-auto">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                Add User
              </Button>
            </header>

            {error && (
              <div className="mb-8 p-6 bg-red-50 border border-red-100 rounded-3xl text-red-600 font-bold">
                {error}
              </div>
            )}

            <div className="bg-white rounded-[32px] shadow-sm border border-accent/20 overflow-hidden">
              <div className="p-8 border-b border-accent/10">
                <div className="relative w-full sm:w-96">
                  <input
                    type="text"
                    placeholder="Search users by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-6 py-4 bg-accent/5 border border-accent/20 rounded-2xl outline-none focus:ring-2 focus:ring-primary transition-all text-sm"
                  />
                  <svg
                    className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-accent/5 text-gray-400 font-bold uppercase text-[10px] tracking-widest">
                    <tr>
                      <th className="px-8 py-5">User Info</th>
                      <th className="px-8 py-5">Role</th>
                      <th className="px-8 py-5 text-center">Status</th>
                      <th className="px-8 py-5 text-center">Orders</th>
                      <th className="px-8 py-5">Joined</th>
                      <th className="px-8 py-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-accent/10">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-accent/5 transition-colors group">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center font-bold text-primary">
                              {user.name?.charAt(0) || "U"}
                            </div>
                            <div>
                              <span className="font-bold text-secondary group-hover:text-primary transition-colors">
                                {user.name}
                              </span>
                              <p className="text-xs text-gray-400">{user.email}</p>
                              {user.phone && <p className="text-[10px] text-gray-400 font-mono mt-0.5">{user.phone}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <span
                            className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                              user.role === "ADMIN"
                                ? "bg-secondary text-white"
                                : user.role === "VENDOR"
                                  ? "bg-primary text-white"
                                  : "bg-accent/20 text-secondary"
                            }`}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-center">
                          <button
                            onClick={() => toggleUserStatus(user)}
                            className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest hover:opacity-85 ${
                              user.isActive
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-rose-100 text-rose-700"
                            }`}
                          >
                            {user.isActive ? "Active" : "Blocked"}
                          </button>
                        </td>
                        <td className="px-8 py-6 text-center font-bold text-secondary">
                          {user.ordersCount || 0}
                        </td>
                        <td className="px-8 py-6 text-gray-400 font-medium">
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                        </td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex justify-end gap-4">
                            <button
                              onClick={() => openEditModal(user)}
                              className="text-xs font-bold text-primary uppercase tracking-widest hover:underline"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(user.id)}
                              className="text-xs font-bold text-red-500 uppercase tracking-widest hover:underline"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredUsers.length === 0 && (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-8 py-10 text-center text-gray-400 font-bold tracking-widest uppercase"
                        >
                          No users found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </main>
        </div>
      </Container>

      {/* Add/Edit User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] border border-accent/20 w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-accent/10 flex justify-between items-center bg-accent/5">
              <h2 className="text-2xl font-bold text-secondary">
                {editingUser ? "Edit User Account" : "Create User Account"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-secondary transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="John Doe"
                  className="w-full px-5 py-3 border border-accent/20 bg-accent/5 rounded-xl outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="john@example.com"
                  className="w-full px-5 py-3 border border-accent/20 bg-accent/5 rounded-xl outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                  placeholder="+8801700000000"
                  className="w-full px-5 py-3 border border-accent/20 bg-accent/5 rounded-xl outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                  Password {editingUser && <span className="text-gray-400 normal-case font-normal">(leave blank to keep current)</span>}
                </label>
                <input
                  type="password"
                  required={!editingUser}
                  value={form.password}
                  onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                  placeholder={editingUser ? "••••••••" : "Min 6 characters"}
                  className="w-full px-5 py-3 border border-accent/20 bg-accent/5 rounded-xl outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                    Account Role
                  </label>
                  <select
                    value={form.role}
                    onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value }))}
                    className="w-full px-5 py-3 border border-accent/20 bg-accent/5 rounded-xl outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
                  >
                    <option value="USER">USER</option>
                    <option value="ADMIN">ADMIN</option>
                    <option value="VENDOR">VENDOR</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                    Account Status
                  </label>
                  <select
                    value={form.isActive ? "true" : "false"}
                    onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.value === "true" }))}
                    className="w-full px-5 py-3 border border-accent/20 bg-accent/5 rounded-xl outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
                  >
                    <option value="true">Active</option>
                    <option value="false">Blocked</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-accent/10 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-3 border border-accent/20 rounded-xl text-sm font-bold text-gray-500 hover:bg-accent/5 transition-all"
                >
                  Cancel
                </button>
                <Button type="submit" disabled={saving}>
                  {saving ? "Saving..." : editingUser ? "Save Changes" : "Create User"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
