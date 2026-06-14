'use client';
import { useEffect, useState } from 'react';
import { getCustomers, getCustomerDetails } from '@/lib/api';
import { AnimatePresence, motion } from 'framer-motion';
import { Eye, X, User, Mail, Phone, MapPin, Package, ShoppingBag, TrendingUp, Calendar, Search } from 'lucide-react';

const statusColor = (s) => {
  if (s === 'Delivered') return 'bg-green-100 text-green-700';
  if (s === 'Cancelled') return 'bg-red-100 text-red-700';
  if (s === 'Shipped') return 'bg-blue-100 text-blue-700';
  if (s === 'Processing') return 'bg-amber-100 text-amber-700';
  return 'bg-gray-100 text-gray-700';
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerDetails, setCustomerDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { 
    getCustomers().then(r => {
      setCustomers(r.data);
      setFilteredCustomers(r.data);
    }); 
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredCustomers(customers);
      return;
    }
    const query = searchQuery.toLowerCase();
    const filtered = customers.filter(c => 
      c.name.toLowerCase().includes(query) ||
      c.email.toLowerCase().includes(query) ||
      (c.phone && c.phone.includes(query))
    );
    setFilteredCustomers(filtered);
  }, [searchQuery, customers]);

  useEffect(() => {
    document.body.style.overflow = selectedCustomer ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [selectedCustomer]);

  const handleViewDetails = async (customer) => {
    setSelectedCustomer(customer);
    setLoading(true);
    try {
      const { data } = await getCustomerDetails(customer._id);
      setCustomerDetails(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const closeModal = () => {
    setSelectedCustomer(null);
    setCustomerDetails(null);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8 gap-4">
        <h1 className="section-title">Customers</h1>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search customers..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="border border-gray-200 pl-10 pr-4 py-2 text-sm outline-none focus:border-[#0a0a0a] transition-colors w-64"
          />
        </div>
      </div>
      <div className="bg-white border border-gray-200 overflow-auto">
        <table className="classic-table">
          <thead>
            <tr>
              {['Name', 'Email', 'Phone', 'Role', 'Joined', ''].map(h => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.map(c => (
              <tr key={c._id}>
                <td className="font-medium text-gray-800">{c.name}</td>
                <td className="text-gray-500">{c.email}</td>
                <td className="text-gray-500 text-sm">{c.phone || '—'}</td>
                <td><span className={c.role === 'admin' ? 'badge-blue' : 'badge-green'}>{c.role}</span></td>
                <td className="text-gray-400 text-xs">{new Date(c.createdAt).toLocaleDateString()}</td>
                <td>
                  <button onClick={() => handleViewDetails(c)}
                    className="flex items-center gap-1.5 text-xs font-bold text-[#0a0a0a] border border-gray-200 px-3 py-1.5 hover:bg-[#0a0a0a] hover:text-white hover:border-[#0a0a0a] transition-colors whitespace-nowrap">
                    <Eye size={12} /> Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredCustomers.length === 0 && customers.length > 0 && (
          <p className="text-center text-gray-400 py-10 text-sm">No customers found matching "{searchQuery}"</p>
        )}
        {customers.length === 0 && (
          <p className="text-center text-gray-400 py-10 text-sm">No customers yet</p>
        )}
      </div>

      {/* Customer Details Modal */}
      <AnimatePresence>
        {selectedCustomer && (
          <>
            <motion.div key="backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={closeModal}
              className="fixed inset-0 bg-black/40 z-50" />
            <motion.div key="drawer"
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed inset-x-0 bottom-0 z-50 bg-white shadow-2xl flex flex-col md:inset-y-0 md:inset-x-auto md:right-0 md:w-full md:max-w-2xl"
              style={{ height: '85%', borderRadius: '16px 16px 0 0' }}>
              <div className="flex justify-center pt-3 pb-1 md:hidden shrink-0">
                <div className="w-10 h-1 bg-gray-200 rounded-full" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white z-10 shrink-0">
                <div>
                  <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400">Customer Details</p>
                  <p className="font-black text-base text-[#0a0a0a]">{selectedCustomer.name}</p>
                </div>
                <button onClick={closeModal} className="p-1.5 text-gray-400 hover:text-[#0a0a0a]">
                  <X size={18} />
                </button>
              </div>

              {loading ? (
                <div className="flex-1 flex items-center justify-center overflow-y-auto">
                  <div className="w-8 h-8 border-2 border-[#0a0a0a] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : customerDetails ? (
                <div className="flex-1 overflow-y-auto p-6 space-y-5">

                  {/* Personal Info */}
                  <div className="border border-gray-100 p-4">
                    <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400 mb-3 flex items-center gap-2">
                      <User size={12} /> Personal Information
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <User size={14} className="text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-400">Name</p>
                          <p className="text-sm font-semibold text-[#0a0a0a]">{customerDetails.user.name}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Mail size={14} className="text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-400">Email</p>
                          <p className="text-sm font-semibold text-[#0a0a0a]">{customerDetails.user.email}</p>
                        </div>
                      </div>
                      {customerDetails.user.phone && (
                        <div className="flex items-start gap-2">
                          <Phone size={14} className="text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-xs text-gray-400">Phone</p>
                            <p className="text-sm font-semibold text-[#0a0a0a]">{customerDetails.user.phone}</p>
                          </div>
                        </div>
                      )}
                      <div className="flex items-start gap-2">
                        <Calendar size={14} className="text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-400">Customer Since</p>
                          <p className="text-sm font-semibold text-[#0a0a0a]">
                            {new Date(customerDetails.user.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Statistics */}
                  <div className="border border-gray-100 p-4">
                    <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400 mb-3 flex items-center gap-2">
                      <Package size={12} /> Order Statistics
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gray-50 p-3">
                        <p className="text-xs text-gray-500 mb-1">Total Orders</p>
                        <p className="text-2xl font-black text-[#0a0a0a]">{customerDetails.orderStats.total}</p>
                      </div>
                      <div className="bg-green-50 p-3">
                        <p className="text-xs text-green-600 mb-1">Total Spent</p>
                        <p className="text-2xl font-black text-green-700">₹{customerDetails.orderStats.totalSpent.toLocaleString()}</p>
                      </div>
                      <div className="bg-amber-50 p-3">
                        <p className="text-xs text-amber-600 mb-1">Pending</p>
                        <p className="text-xl font-black text-amber-700">{customerDetails.orderStats.pending}</p>
                      </div>
                      <div className="bg-blue-50 p-3">
                        <p className="text-xs text-blue-600 mb-1">Processing</p>
                        <p className="text-xl font-black text-blue-700">{customerDetails.orderStats.processing}</p>
                      </div>
                      <div className="bg-purple-50 p-3">
                        <p className="text-xs text-purple-600 mb-1">Shipped</p>
                        <p className="text-xl font-black text-purple-700">{customerDetails.orderStats.shipped}</p>
                      </div>
                      <div className="bg-green-50 p-3">
                        <p className="text-xs text-green-600 mb-1">Delivered</p>
                        <p className="text-xl font-black text-green-700">{customerDetails.orderStats.delivered}</p>
                      </div>
                      {customerDetails.orderStats.cancelled > 0 && (
                        <div className="bg-red-50 p-3 col-span-2">
                          <p className="text-xs text-red-600 mb-1">Cancelled</p>
                          <p className="text-xl font-black text-red-700">{customerDetails.orderStats.cancelled}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Saved Addresses */}
                  <div className="border border-gray-100 p-4">
                    <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400 mb-3 flex items-center gap-2">
                      <MapPin size={12} /> Saved Addresses ({customerDetails.addresses.length})
                    </p>
                    {customerDetails.addresses.length === 0 ? (
                      <p className="text-sm text-gray-400 text-center py-4">No saved addresses</p>
                    ) : (
                      <div className="space-y-3">
                        {customerDetails.addresses.map((addr, i) => (
                          <div key={addr._id} className="bg-gray-50 p-3">
                            <p className="text-sm font-bold text-[#0a0a0a]">{addr.fullName}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{addr.phone}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {addr.address}{addr.landmark ? `, ${addr.landmark}` : ''}
                            </p>
                            <p className="text-xs text-gray-500">
                              {addr.city}, {addr.state} — {addr.pin}, {addr.country}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Recent Orders */}
                  <div className="border border-gray-100 p-4">
                    <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400 mb-3 flex items-center gap-2">
                      <ShoppingBag size={12} /> Recent Orders
                    </p>
                    {customerDetails.orders.length === 0 ? (
                      <p className="text-sm text-gray-400 text-center py-4">No orders yet</p>
                    ) : (
                      <div className="space-y-2">
                        {customerDetails.orders.slice(0, 5).map(order => (
                          <div key={order._id} className="bg-gray-50 p-3">
                            <div className="flex items-center justify-between mb-1">
                              <p className="font-mono text-xs font-bold text-[#0a0a0a]">
                                #{order._id.slice(-8).toUpperCase()}
                              </p>
                              <span className={`text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 ${statusColor(order.status)}`}>
                                {order.status}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <p className="text-xs text-gray-500">
                                {order.items?.length} item{order.items?.length !== 1 ? 's' : ''} · {order.paymentMethod}
                              </p>
                              <p className="text-sm font-black text-[#0a0a0a]">₹{order.totalPrice?.toLocaleString()}</p>
                            </div>
                            <p className="text-[10px] text-gray-400 mt-1">
                              {new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </p>
                          </div>
                        ))}
                        {customerDetails.orders.length > 5 && (
                          <p className="text-xs text-center text-gray-400 pt-2">
                            + {customerDetails.orders.length - 5} more orders
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-gray-400 text-sm">Failed to load customer details</p>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
