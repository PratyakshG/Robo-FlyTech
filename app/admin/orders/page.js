'use client';
import { useEffect, useState } from 'react';
import { getAdminOrders, updateOrderStatus } from '@/lib/api';
import { AnimatePresence, motion } from 'framer-motion';
import { X, ChevronDown } from 'lucide-react';

const STATUSES = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

const statusColor = (s) => {
  if (s === 'Delivered') return 'badge-green';
  if (s === 'Cancelled') return 'badge-red';
  if (s === 'Shipped')   return 'badge-blue';
  return 'badge-amber';
};

export default function AdminOrdersPage() {
  const [orders, setOrders]     = useState([]);
  const [selected, setSelected] = useState(null);

  const load = () => getAdminOrders().then(r => setOrders(r.data));
  useEffect(() => { load(); }, []);

  useEffect(() => {
    document.body.style.overflow = selected ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [selected]);

  const handleStatus = async (id, status) => {
    await updateOrderStatus(id, status);
    load();
    if (selected?._id === id) setSelected(o => ({ ...o, status }));
  };

  return (
    <div>
      <h1 className="section-title mb-8">Orders</h1>
      <div className="bg-white border border-gray-200 overflow-auto">
        <table className="classic-table">
          <thead>
            <tr>
              {['Order ID', 'Customer', 'Phone', 'Items', 'Total', 'Date', 'Status', 'Update'].map(h => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orders.map(o => (
              <tr key={o._id} className="cursor-pointer" onClick={() => setSelected(o)}>
                <td className="font-mono text-xs text-gray-400">#{o._id.slice(-8).toUpperCase()}</td>
                <td>
                  <p className="font-medium text-gray-800">{o.user?.name}</p>
                  <p className="text-xs text-gray-400">{o.user?.email}</p>
                </td>
                <td className="text-sm text-gray-600">{o.shippingAddress?.phone || '—'}</td>
                <td className="text-sm text-gray-600">{o.items?.length}</td>
                <td className="text-green-700 font-semibold">₹{o.totalPrice?.toLocaleString()}</td>
                <td className="text-gray-400 text-xs">{new Date(o.createdAt).toLocaleDateString()}</td>
                <td><span className={statusColor(o.status)}>{o.status}</span></td>
                <td onClick={e => e.stopPropagation()}>
                  <select
                    className="border border-gray-300 text-xs px-2 py-1 bg-white text-gray-700 outline-none"
                    value={o.status}
                    onChange={e => handleStatus(o._id, e.target.value)}>
                    {STATUSES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && (
          <p className="text-center text-gray-400 py-10 text-sm">No orders yet</p>
        )}
      </div>

      {/* Order detail modal */}
      <AnimatePresence>
        {selected && (
          <>
            <motion.div key="backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelected(null)}
              className="fixed inset-0 bg-black/40 z-50" />
            <motion.div key="drawer"
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-50 overflow-y-auto shadow-2xl">

              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 sticky top-0 bg-white z-10">
                <div>
                  <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400">Order Details</p>
                  <p className="font-black text-sm text-[#0a0a0a]">#{selected._id.slice(-8).toUpperCase()}</p>
                </div>
                <button onClick={() => setSelected(null)} className="p-1.5 text-gray-400 hover:text-[#0a0a0a]">
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 space-y-6">

                {/* Status */}
                <div>
                  <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400 mb-2">Status</p>
                  <div className="flex items-center gap-3">
                    <span className={statusColor(selected.status)}>{selected.status}</span>
                    <select
                      className="border border-gray-200 text-xs px-3 py-1.5 bg-white text-gray-700 outline-none hover:border-[#0a0a0a] transition-colors"
                      value={selected.status}
                      onChange={e => handleStatus(selected._id, e.target.value)}>
                      {STATUSES.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                {/* Customer */}
                <div className="border border-gray-100 p-4">
                  <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400 mb-3">Customer</p>
                  <p className="text-sm font-bold text-[#0a0a0a]">{selected.user?.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{selected.user?.email}</p>
                  {selected.shippingAddress?.phone && (
                    <p className="text-xs text-gray-500 mt-0.5">📞 {selected.shippingAddress.phone}</p>
                  )}
                </div>

                {/* Shipping address */}
                <div className="border border-gray-100 p-4">
                  <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400 mb-3">Shipping Address</p>
                  <p className="text-sm font-bold text-[#0a0a0a]">{selected.shippingAddress?.fullName}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{selected.shippingAddress?.phone}</p>
                  <p className="text-sm text-gray-500">{selected.shippingAddress?.address}</p>
                  <p className="text-sm text-gray-500">{selected.shippingAddress?.city} — {selected.shippingAddress?.pin}, {selected.shippingAddress?.country}</p>
                </div>

                {/* Items */}
                <div>
                  <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400 mb-3">Items ({selected.items?.length})</p>
                  <div className="divide-y divide-gray-100 border border-gray-100">
                    {selected.items?.map((item, i) => (
                      <div key={i} className="flex items-center gap-3 p-3">
                        <img src={item.image || 'https://placehold.co/48x48?text=...'} alt={item.name}
                          className="w-12 h-12 object-cover border border-gray-100 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-[#0a0a0a] truncate">{item.name}</p>
                          <p className="text-xs text-gray-400">Qty: {item.quantity} × ₹{item.price?.toLocaleString()}</p>
                        </div>
                        <p className="text-sm font-black text-[#0a0a0a] shrink-0">
                          ₹{(item.price * item.quantity)?.toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pricing */}
                <div className="border border-gray-100 p-4 space-y-2">
                  <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400 mb-3">Price Breakdown</p>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Items</span><span>₹{selected.itemsPrice?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Shipping</span>
                    <span className={selected.shippingPrice === 0 ? 'text-green-600 font-semibold' : ''}>
                      {selected.shippingPrice === 0 ? 'FREE' : `₹${selected.shippingPrice}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm font-black text-[#0a0a0a] border-t border-gray-200 pt-2 mt-2">
                    <span>Total</span><span>₹{selected.totalPrice?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 pt-1">
                    <span>Payment</span><span className="font-semibold">{selected.paymentMethod}</span>
                  </div>
                </div>

                <p className="text-[10px] text-gray-400 text-center">
                  Placed on {new Date(selected.createdAt).toLocaleString('en-IN')}
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
