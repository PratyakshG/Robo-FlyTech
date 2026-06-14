'use client';
import { useEffect, useState } from 'react';
import { getAdminOrders, updateOrderStatus, updateOrderShipping } from '@/lib/api';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Eye, Package, Truck, ShieldCheck, User, MapPin, CreditCard, Tag, AlertCircle, Search } from 'lucide-react';

const STATUSES = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

const statusColor = (s) => {
  if (s === 'Delivered') return 'badge-green';
  if (s === 'Cancelled') return 'badge-red';
  if (s === 'Shipped')   return 'badge-blue';
  return 'badge-amber';
};

export default function AdminOrdersPage() {
  const [orders, setOrders]     = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selected, setSelected] = useState(null);
  const [editingShipping, setEditingShipping] = useState(false);
  const [shippingInput, setShippingInput] = useState('');
  const [editingInlineShipping, setEditingInlineShipping] = useState(null);
  const [inlineShippingInput, setInlineShippingInput] = useState('');

  const load = () => getAdminOrders().then(r => {
    setOrders(r.data);
    setFilteredOrders(r.data);
  });
  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredOrders(orders);
      return;
    }
    const query = searchQuery.toLowerCase();
    const filtered = orders.filter(o => 
      o._id.toLowerCase().includes(query) ||
      o.user?.name?.toLowerCase().includes(query) ||
      o.user?.email?.toLowerCase().includes(query) ||
      (o.shippingAddress?.phone && o.shippingAddress.phone.includes(query)) ||
      o.status.toLowerCase().includes(query)
    );
    setFilteredOrders(filtered);
  }, [searchQuery, orders]);

  useEffect(() => {
    document.body.style.overflow = selected ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [selected]);

  const handleStatus = async (id, status) => {
    await updateOrderStatus(id, status);
    load();
    if (selected?._id === id) setSelected(o => ({ ...o, status }));
  };

  const handleUpdateShipping = async () => {
    if (!selected) return;
    try {
      const { data } = await updateOrderShipping(selected._id, Number(shippingInput));
      setSelected(data);
      load();
      setEditingShipping(false);
      setShippingInput('');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update shipping charges');
    }
  };

  const handleInlineUpdateShipping = async (orderId) => {
    try {
      await updateOrderShipping(orderId, Number(inlineShippingInput));
      load();
      setEditingInlineShipping(null);
      setInlineShippingInput('');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update shipping charges');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8 gap-4">
        <h1 className="section-title">Orders</h1>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search orders..."
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
              {['Order ID', 'Customer', 'Items', 'Total', 'Shipping', 'Payment', 'Date', 'Status', 'Update', ''].map(h => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map(o => (
              <tr key={o._id}>
                <td className="font-mono text-xs text-gray-400">#{o._id.slice(-8).toUpperCase()}</td>
                <td>
                  <p className="font-medium text-gray-800">{o.user?.name}</p>
                  <p className="text-xs text-gray-400">{o.user?.email}</p>
                </td>
                <td className="text-sm text-gray-600">{o.items?.length} item{o.items?.length !== 1 ? 's' : ''}</td>
                <td className="text-green-700 font-semibold">₹{o.totalPrice?.toLocaleString()}</td>
                <td>
                  {editingInlineShipping === o._id ? (
                    <div className="flex items-center gap-1">
                      <input type="number" min="0" step="1" placeholder="0"
                        value={inlineShippingInput}
                        onChange={e => setInlineShippingInput(e.target.value)}
                        className="w-16 border border-gray-200 px-2 py-1 text-xs text-center outline-none focus:border-[#0a0a0a]" />
                      <button onClick={() => handleInlineUpdateShipping(o._id)}
                        className="text-xs font-bold bg-[#0a0a0a] text-white px-2 py-1 hover:bg-[#dc2626]">
                        Save
                      </button>
                      <button onClick={() => { setEditingInlineShipping(null); setInlineShippingInput(''); }}
                        className="text-xs text-gray-400 hover:text-gray-600">×</button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className={`text-sm ${o.shippingPrice === 0 ? 'text-green-600 font-semibold' : 'text-gray-700'}`}>
                        {o.shippingPrice === 0 ? 'FREE' : `₹${o.shippingPrice}`}
                      </span>
                      {o.shippingChargesPending && (
                        <button onClick={() => { setEditingInlineShipping(o._id); setInlineShippingInput(o.shippingPrice || ''); }}
                          className="text-xs font-bold text-amber-600 border border-amber-300 px-2 py-0.5 hover:bg-amber-50">
                          Update
                        </button>
                      )}
                    </div>
                  )}
                </td>
                <td className="text-xs text-gray-500">{o.paymentMethod}</td>
                <td className="text-gray-400 text-xs">{new Date(o.createdAt).toLocaleDateString('en-IN')}</td>
                <td><span className={statusColor(o.status)}>{o.status}</span></td>
                <td>
                  <select
                    className="border border-gray-300 text-xs px-2 py-1 bg-white text-gray-700 outline-none"
                    value={o.status}
                    onChange={e => handleStatus(o._id, e.target.value)}>
                    {STATUSES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </td>
                <td>
                  <button onClick={() => setSelected(o)}
                    className="flex items-center gap-1.5 text-xs font-bold text-[#0a0a0a] border border-gray-200 px-3 py-1.5 hover:bg-[#0a0a0a] hover:text-white hover:border-[#0a0a0a] transition-colors whitespace-nowrap">
                    <Eye size={12} /> View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredOrders.length === 0 && orders.length > 0 && (
          <p className="text-center text-gray-400 py-10 text-sm">No orders found matching "{searchQuery}"</p>
        )}
        {orders.length === 0 && (
          <p className="text-center text-gray-400 py-10 text-sm">No orders yet</p>
        )}
      </div>

      {/* Order detail drawer */}
      <AnimatePresence>
        {selected && (
          <>
            <motion.div key="backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelected(null)}
              className="fixed inset-0 bg-black/40 z-50" />
            <motion.div key="drawer"
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed inset-x-0 bottom-0 z-50 bg-white shadow-2xl flex flex-col md:inset-y-0 md:inset-x-auto md:right-0 md:w-full md:max-w-lg"
              style={{ height: '70%', borderRadius: '16px 16px 0 0' }}>
              <div className="flex justify-center pt-3 pb-1 md:hidden shrink-0">
                <div className="w-10 h-1 bg-gray-200 rounded-full" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white z-10 shrink-0">
                <div>
                  <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400">Order Details</p>
                  <p className="font-black text-sm text-[#0a0a0a]">#{selected._id.slice(-8).toUpperCase()}</p>
                </div>
                <button onClick={() => setSelected(null)} className="p-1.5 text-gray-400 hover:text-[#0a0a0a]">
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-5">

                {/* Status + Update */}
                <div className="border border-gray-100 p-4">
                  <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400 mb-3 flex items-center gap-2">
                    <Package size={12} /> Order Status
                  </p>
                  <div className="flex items-center gap-3">
                    <span className={statusColor(selected.status)}>{selected.status}</span>
                    <select
                      className="border border-gray-200 text-xs px-3 py-1.5 bg-white text-gray-700 outline-none hover:border-[#0a0a0a] transition-colors"
                      value={selected.status}
                      onChange={e => handleStatus(selected._id, e.target.value)}>
                      {STATUSES.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-2">
                    Placed on {new Date(selected.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>

                {/* Customer info */}
                <div className="border border-gray-100 p-4">
                  <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400 mb-3 flex items-center gap-2">
                    <User size={12} /> Customer
                  </p>
                  <p className="text-sm font-bold text-[#0a0a0a]">{selected.user?.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{selected.user?.email}</p>
                  {selected.shippingAddress?.phone && (
                    <p className="text-xs text-gray-500 mt-0.5">📞 {selected.shippingAddress.phone}</p>
                  )}
                </div>

                {/* Shipping address */}
                <div className="border border-gray-100 p-4">
                  <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400 mb-3 flex items-center gap-2">
                    <MapPin size={12} /> Delivery Address
                  </p>
                  <p className="text-sm font-bold text-[#0a0a0a]">{selected.shippingAddress?.fullName}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{selected.shippingAddress?.phone}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{selected.shippingAddress?.address}</p>
                  <p className="text-xs text-gray-500">{selected.shippingAddress?.city} — {selected.shippingAddress?.pin}, {selected.shippingAddress?.country}</p>
                </div>

                {/* Items */}
                <div>
                  <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400 mb-3 flex items-center gap-2">
                    <Tag size={12} /> Order Items ({selected.items?.length})
                  </p>
                  <div className="divide-y divide-gray-100 border border-gray-100">
                    {selected.items?.map((item, i) => (
                      <div key={i} 
                        className="flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50 transition-colors group"
                        onClick={() => {
                          if (item.product?._id) {
                            window.open(`/products/${item.product._id}`, '_blank');
                          } else if (typeof item.product === 'string') {
                            window.open(`/products/${item.product}`, '_blank');
                          }
                        }}>
                        <img src={item.image || 'https://placehold.co/48x48?text=...'}
                          alt={item.name} className="w-12 h-12 object-cover border border-gray-100 shrink-0 group-hover:border-[#0a0a0a] transition-colors" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-[#0a0a0a] truncate group-hover:text-[#dc2626] transition-colors">{item.name}</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            Qty: {item.quantity} × ₹{item.price?.toLocaleString()}
                          </p>
                        </div>
                        <p className="text-sm font-black text-[#0a0a0a] shrink-0">
                          ₹{(item.price * item.quantity)?.toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Payment + Price breakdown */}
                <div className="border border-gray-100 p-4 space-y-2">
                  <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400 mb-3 flex items-center gap-2">
                    <CreditCard size={12} /> Payment & Summary
                  </p>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Payment Method</span>
                    <span className="font-semibold text-[#0a0a0a]">{selected.paymentMethod}</span>
                  </div>
                  <div className="border-t border-dashed border-gray-100 my-2" />
                  {selected.originalItemsPrice > selected.itemsPrice && (
                    <div className="flex justify-between text-sm text-gray-400">
                      <span>MRP Total</span>
                      <span className="line-through">₹{selected.originalItemsPrice?.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Items Total</span>
                    <span>₹{selected.itemsPrice?.toLocaleString()}</span>
                  </div>
                  {selected.originalItemsPrice > selected.itemsPrice && (
                    <div className="flex justify-between text-sm text-green-600 font-semibold">
                      <span>Offer Discount</span>
                      <span>- ₹{(selected.originalItemsPrice - selected.itemsPrice).toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Delivery</span>
                    <div className="flex items-center gap-2">
                      {editingShipping ? (
                        <>
                          <input type="number" min="0" step="1" placeholder="0"
                            value={shippingInput}
                            onChange={e => setShippingInput(e.target.value)}
                            className="w-20 border border-gray-200 px-2 py-1 text-sm text-right outline-none focus:border-[#0a0a0a]" />
                          <button onClick={handleUpdateShipping}
                            className="text-xs font-bold bg-[#0a0a0a] text-white px-2 py-1 hover:bg-[#dc2626]">
                            Save
                          </button>
                          <button onClick={() => { setEditingShipping(false); setShippingInput(''); }}
                            className="text-xs text-gray-400 hover:text-gray-600">Cancel</button>
                        </>
                      ) : (
                        <>
                          <span className={selected.shippingPrice === 0 ? 'text-green-600 font-semibold' : ''}>
                            {selected.shippingPrice === 0 ? 'FREE' : `₹${selected.shippingPrice}`}
                          </span>
                          {selected.shippingChargesPending && (
                            <button onClick={() => { setEditingShipping(true); setShippingInput(selected.shippingPrice || ''); }}
                              className="text-xs font-bold text-[#dc2626] hover:text-red-700">
                              Update
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                  {selected.discount > 0 && (
                    <div className="flex justify-between text-sm text-green-600 font-semibold">
                      <span>Coupon {selected.couponCode ? `(${selected.couponCode})` : ''}</span>
                      <span>- ₹{selected.discount?.toLocaleString()}</span>
                    </div>
                  )}
                  {selected.shippingChargesPending && (
                    <div className="bg-amber-50 border border-amber-200 p-3 -mx-4 mb-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-amber-800 mb-1">
                        <AlertCircle size={12} className="text-amber-600" />
                        <span>Delivery Charges Pending</span>
                      </div>
                      <p className="text-[10px] text-amber-700 leading-relaxed">
                        Delivery charges will be calculated within 1-2 hours. Update manually or wait for automatic calculation.
                      </p>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-black text-[#0a0a0a] border-t border-gray-200 pt-2 mt-1">
                    <span>Grand Total</span>
                    <span>₹{selected.totalPrice?.toLocaleString()}</span>
                  </div>
                  {(() => {
                    // Derive offer discount from items if originalItemsPrice not stored (old orders)
                    const itemsOffer = selected.items?.reduce((s, item) => {
                      const mrp = item.originalPrice || item.price;
                      return s + (mrp - item.price) * item.quantity;
                    }, 0) || 0;
                    const offerSave = selected.originalItemsPrice > selected.itemsPrice
                      ? selected.originalItemsPrice - selected.itemsPrice
                      : itemsOffer;
                    const deliverySave = selected.shippingPrice === 0 ? 99 : 0;
                    const couponSave = selected.discount || 0;
                    const totalSave = offerSave + deliverySave + couponSave;
                    return totalSave > 0 ? (
                      <p className="text-[11px] text-green-600 font-semibold bg-green-50 px-3 py-2 mt-1">
                        🎉 Customer saved ₹{totalSave.toLocaleString()} on this order
                      </p>
                    ) : null;
                  })()}
                </div>

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
