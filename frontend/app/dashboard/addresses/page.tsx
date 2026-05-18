"use client";

import { useState, useEffect } from "react";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import DashboardSidebar from "@/components/layout/DashboardSidebar";
import { addressApi } from "@/services/api";

interface Address {
  id: string;
  fullName: string;
  phone: string;
  division: string;
  district: string;
  upazila: string;
  addressLine: string;
  postalCode: string;
  isDefault: boolean;
}

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    division: "",
    district: "",
    upazila: "",
    addressLine: "",
    postalCode: "",
    isDefault: false
  });

  const fetchAddresses = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await addressApi.getAll();
      if (res.success) {
        setAddresses(Array.isArray(res.data) ? res.data : []);
      } else {
      const errMsg = Array.isArray(res.error) ? res.error.join(", ") : res.error;
      setError(errMsg || "Failed to load addresses.");
      }
    } catch (err) {
      setError("An error occurred while fetching addresses.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const openModal = (address: Address | null = null) => {
    if (address) {
      setEditingAddress(address);
      setFormData({
        fullName: address.fullName || "",
        phone: address.phone || "",
        division: address.division || "",
        district: address.district || "",
        upazila: address.upazila || "",
        addressLine: address.addressLine || "",
        postalCode: address.postalCode || "",
        isDefault: address.isDefault || false
      });
    } else {
      setEditingAddress(null);
      setFormData({
        fullName: "",
        phone: "",
        division: "",
        district: "",
        upazila: "",
        addressLine: "",
        postalCode: "",
        isDefault: false
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingAddress(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      let res;
      if (editingAddress) {
        res = await addressApi.update(editingAddress.id, formData);
      } else {
        res = await addressApi.add(formData);
      }

      if (res.success) {
        await fetchAddresses();
        closeModal();
      } else {
        alert(res.error || "Failed to save address.");
      }
    } catch (err) {
      alert("An error occurred while saving address.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this address?")) return;
    
    try {
      const res = await addressApi.delete(id);
      if (res.success) {
        setAddresses(prev => prev.filter(a => a.id !== id));
      } else {
        alert(res.error || "Failed to delete address.");
      }
    } catch (err) {
      alert("An error occurred while deleting address.");
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      const res = await addressApi.setDefault(id);
      if (res.success) {
        await fetchAddresses();
      } else {
        alert(res.error || "Failed to set default address.");
      }
    } catch (err) {
      alert("An error occurred while setting default address.");
    }
  };

  return (
    <div className="py-20 bg-accent/5 min-h-screen">
      <Container>
        <div className="flex flex-col lg:flex-row gap-12">
          <DashboardSidebar />
          
          <main className="flex-1">
            <header className="mb-12 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-4xl font-bold text-secondary mb-2">My Addresses</h1>
                <p className="text-gray-500">Manage your saved addresses for a faster checkout.</p>
              </div>
              <Button size="lg" className="shadow-lg shadow-primary/20" onClick={() => openModal()}>
                + Add New Address
              </Button>
            </header>

            {loading ? (
              <div className="py-20 text-center">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Loading addresses...</p>
              </div>
            ) : error ? (
              <div className="p-8 bg-red-50 border border-red-100 rounded-[32px] text-red-600 font-bold text-center">
                {error}
                <button onClick={fetchAddresses} className="block mx-auto mt-4 text-sm underline">Try Again</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {addresses.map((addr) => (
                  <div key={addr.id} className={`bg-white p-8 rounded-[32px] shadow-sm border transition-all relative group ${
                    addr.isDefault ? 'border-primary ring-1 ring-primary/20 shadow-xl shadow-primary/5' : 'border-accent/20 hover:border-primary/30'
                  }`}>
                    {addr.isDefault && (
                      <span className="absolute top-6 right-8 bg-primary text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                        DEFAULT
                      </span>
                    )}
                    
                    <div className="mb-8">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center text-primary">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          </svg>
                        </div>
                        <h3 className="font-bold text-xl text-secondary">{addr.fullName}</h3>
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-gray-600 font-medium">{addr.phone}</p>
                        <p className="text-gray-500 text-sm leading-relaxed">{addr.addressLine}</p>
                        <p className="text-gray-500 text-sm">
                          {addr.upazila}, {addr.district}, {addr.division} - {addr.postalCode}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-4 pt-6 border-t border-accent/10">
                      <button 
                        onClick={() => openModal(addr)}
                        className="text-xs font-bold text-secondary uppercase tracking-widest bg-accent/10 px-4 py-2 rounded-lg hover:bg-primary hover:text-white transition-all"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(addr.id)}
                        className="text-xs font-bold text-red-400 uppercase tracking-widest hover:text-red-600 transition-all"
                      >
                        Delete
                      </button>
                      {!addr.isDefault && (
                        <button 
                          onClick={() => handleSetDefault(addr.id)}
                          className="text-xs font-bold text-primary uppercase tracking-widest ml-auto hover:underline"
                        >
                          Set Default
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {addresses.length === 0 && (
                   <div className="md:col-span-2 py-20 bg-white rounded-[32px] border-2 border-dashed border-accent/20 flex flex-col items-center justify-center">
                     <div className="w-20 h-20 bg-accent/5 rounded-full flex items-center justify-center text-gray-300 mb-6">
                       <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
                     </div>
                     <h3 className="text-xl font-bold text-secondary mb-2">No addresses found</h3>
                     <p className="text-gray-400 text-sm mb-8 text-center max-w-xs">You haven't saved any addresses yet. Add one to speed up your checkout process.</p>
                     <Button onClick={() => openModal()}>Add First Address</Button>
                   </div>
                )}

                {addresses.length > 0 && (
                  <button 
                    onClick={() => openModal()}
                    className="bg-accent/5 border-2 border-dashed border-accent/30 rounded-[32px] p-8 flex flex-col items-center justify-center group hover:bg-white hover:border-primary/50 transition-all min-h-[250px]"
                  >
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-gray-400 group-hover:text-primary group-hover:shadow-lg transition-all mb-4">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                    </div>
                    <span className="text-sm font-bold text-gray-400 uppercase tracking-widest group-hover:text-primary">Add Another Address</span>
                  </button>
                )}
              </div>
            )}
          </main>
        </div>
      </Container>

      {/* Address Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-secondary/40 backdrop-blur-sm" onClick={closeModal}></div>
          <div className="relative bg-white w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <header className="p-8 border-b border-accent/10 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-secondary">
                {editingAddress ? "Edit Address" : "Add New Address"}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-secondary transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </header>
            
            <form onSubmit={handleSubmit} className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <Input 
                  label="Full Name" 
                  name="fullName" 
                  value={formData.fullName} 
                  onChange={handleChange} 
                  placeholder="e.g. John Doe" 
                  required 
                />
                <Input 
                  label="Phone Number" 
                  name="phone" 
                  value={formData.phone} 
                  onChange={handleChange} 
                  placeholder="e.g. 017XXXXXXXX" 
                  required 
                />
                <Input 
                  label="Division" 
                  name="division" 
                  value={formData.division} 
                  onChange={handleChange} 
                  placeholder="e.g. Dhaka" 
                  required 
                />
                <Input 
                  label="District" 
                  name="district" 
                  value={formData.district} 
                  onChange={handleChange} 
                  placeholder="e.g. Dhaka" 
                  required 
                />
                <Input 
                  label="Upazila" 
                  name="upazila" 
                  value={formData.upazila} 
                  onChange={handleChange} 
                  placeholder="e.g. Dhanmondi" 
                  required 
                />
                <Input 
                  label="Postal Code" 
                  name="postalCode" 
                  value={formData.postalCode} 
                  onChange={handleChange} 
                  placeholder="e.g. 1205" 
                  required 
                />
              </div>
              
              <Input 
                label="Address Line" 
                name="addressLine" 
                value={formData.addressLine} 
                onChange={handleChange} 
                placeholder="House #, Road #, Area..." 
                required 
              />
              
              <div className="flex items-center gap-3 mb-8">
                <input 
                  type="checkbox" 
                  id="isDefault" 
                  name="isDefault" 
                  checked={formData.isDefault} 
                  onChange={handleChange}
                  className="w-5 h-5 accent-primary rounded-lg"
                />
                <label htmlFor="isDefault" className="text-sm font-bold text-secondary uppercase tracking-widest cursor-pointer">
                  Set as default address
                </label>
              </div>
              
              <div className="flex gap-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="lg" 
                  className="flex-1" 
                  onClick={closeModal}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  size="lg" 
                  className="flex-1 shadow-lg shadow-primary/20" 
                  disabled={formLoading}
                >
                  {formLoading ? "Saving..." : editingAddress ? "Update Address" : "Save Address"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
