"use client";

import { useEffect, useState } from "react";
import Container from "@/components/ui/Container";
import AdminSidebar from "@/components/layout/AdminSidebar";
import { adminApi } from "@/services/api";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
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
    fetchUsers();
  }, []);

  const filteredUsers = Array.isArray(users) ? users.filter(user => 
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

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
            <header className="mb-12">
              <h1 className="text-4xl font-bold text-secondary mb-2">User Management</h1>
              <p className="text-gray-500">Monitor and manage your customer and admin accounts.</p>
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
                    <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  </div>
               </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-accent/5 text-gray-400 font-bold uppercase text-[10px] tracking-widest">
                    <tr>
                      <th className="px-8 py-5">User Info</th>
                      <th className="px-8 py-5">Role</th>
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
                               {user.name?.charAt(0) || 'U'}
                             </div>
                             <div>
                               <span className="font-bold text-secondary group-hover:text-primary transition-colors">{user.name}</span>
                               <p className="text-xs text-gray-400">{user.email}</p>
                             </div>
                           </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                            user.role === 'ADMIN' ? 'bg-secondary text-white' : 'bg-accent/20 text-secondary'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-center font-bold text-secondary">{user.ordersCount || 0}</td>
                        <td className="px-8 py-6 text-gray-400 font-medium">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex justify-end gap-3">
                            <button className="text-xs font-bold text-primary uppercase tracking-widest hover:underline">Edit</button>
                            <button className="text-xs font-bold text-red-400 uppercase tracking-widest hover:underline">Block</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredUsers.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-8 py-10 text-center text-gray-400 font-bold tracking-widest uppercase">
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
    </div>
  );
}
