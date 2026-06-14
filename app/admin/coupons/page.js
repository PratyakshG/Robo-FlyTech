'use client';
import { useState, useEffect } from 'react';
import { getCoupons, createCoupon, updateCoupon, deleteCoupon } from '@/lib/api';
import { Tag, Plus, Edit2, Trash2, X, Check, Calendar, TrendingUp, Users, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [filteredCoupons, setFilteredCoupons] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const emptyForm = {
    code: '', type: 'percentage', value: 0, minOrderAmount: 0,
    maxDiscount: '', usageLimit: '', isActive: true,
    startDate: '', endDate: '', description: ''
  };
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await getCoupons();
      setCoupons(res.data || []);
      setFilteredCoupons(res.data || []);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredCoupons(coupons);
      return;
    }
    const query = searchQuery.toLowerCase();
    const filtered = coupons.filter(c => 
      c.code.toLowerCase().includes(query) ||
      (c.description && c.description.toLowerCase().includes(query))
    );
    setFilteredCoupons(filtered);
  }, [searchQuery, coupons]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const payload = {
      ...form,
      code: form.code.toUpperCase().trim(),
      maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : null,
      usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
      startDate: form.startDate || new Date().toISOString(),
      endDate: form.endDate || null,
    };

    try {
      if (editingId) {
        await updateCoupon(editingId, payload);
      } else {
        await createCoupon(payload);
      }
      fetchCoupons();
      setShowModal(false);
      setForm(emptyForm);
      setEditingId(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save coupon');
    }
  };

  const handleEdit = (coupon) => {
    setForm({
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      minOrderAmount: coupon.minOrderAmount,
      maxDiscount: coupon.maxDiscount || '',
      usageLimit: coupon.usageLimit || '',
      isActive: coupon.isActive,
      startDate: coupon.startDate ? new Date(coupon.startDate).toISOString().split('T')[0] : '',
      endDate: coupon.endDate ? new Date(coupon.endDate).toISOString().split('T')[0] : '',
      description: coupon.description || '',
    });
    setEditingId(coupon._id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this coupon?')) return;
    try {
      await deleteCoupon(id);
      fetchCoupons();
    } catch (err) {
      console.error(err);
    }
  };

  const getCouponStatus = (coupon) => {
    if (!coupon.isActive) return { label: 'Inactive', color: 'text-gray-400' };
    const now = new Date();
    if (coupon.endDate && now > new Date(coupon.endDate)) return { label: 'Expired', color: 'text-red-500' };
    if (now < new Date(coupon.startDate)) return { label: 'Scheduled', color: 'text-blue-500' };
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) return { label: 'Limit Reached', color: 'text-orange-500' };
    return { label: 'Active', color: 'text-green-600' };
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-[#0a0a0a]">Coupon Codes</h1>
          <p className="text-sm text-gray-500 mt-1">Manage discount coupons for customers</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search coupons..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="border border-gray-200 pl-10 pr-4 py-2 text-sm outline-none focus:border-[#0a0a0a] transition-colors w-64"
            />
          </div>
          <button onClick={() => { setForm(emptyForm); setEditingId(null); setShowModal(true); setError(''); }}
            className="flex items-center gap-2 bg-[#0a0a0a] text-white px-5 py-2.5 text-sm font-semibold hover:bg-[#dc2626] whitespace-nowrap">
            <Plus size={16} /> New Coupon
          </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="skeleton h-24 w-full" />)}
        </div>
      ) : filteredCoupons.length === 0 && coupons.length > 0 ? (
        <div className="text-center py-16 border border-dashed border-gray-300">
          <Tag size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-400 text-sm">No coupons found matching "{searchQuery}"</p>
        </div>
      ) : coupons.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-gray-300">
          <Tag size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-400 text-sm">No coupons created yet</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredCoupons.map((coupon) => {
            const status = getCouponStatus(coupon);
            return (
              <motion.div key={coupon._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="border border-gray-200 bg-white hover:border-gray-300 transition-colors">
                <div className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="bg-[#dc2626] text-white text-xs font-black tracking-widest uppercase px-3 py-1.5">
                          {coupon.code}
                        </div>
                        <span className={`text-xs font-bold ${status.color}`}>{status.label}</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        {coupon.type === 'percentage' ? `${coupon.value}% OFF` : `₹${coupon.value} OFF`}
                        {coupon.maxDiscount && coupon.type === 'percentage' && ` (max ₹${coupon.maxDiscount})`}
                        {coupon.minOrderAmount > 0 && ` on orders above ₹${coupon.minOrderAmount}`}
                      </p>
                      {coupon.description && (
                        <p className="text-xs text-gray-500 mb-3">{coupon.description}</p>
                      )}
                      <div className="flex flex-wrap gap-4 text-xs text-gray-400">
                        {coupon.usageLimit && (
                          <div className="flex items-center gap-1.5">
                            <Users size={12} />
                            <span>{coupon.usedCount}/{coupon.usageLimit} used</span>
                          </div>
                        )}
                        {coupon.endDate && (
                          <div className="flex items-center gap-1.5">
                            <Calendar size={12} />
                            <span>Expires {new Date(coupon.endDate).toLocaleDateString()}</span>
                          </div>
                        )}
                        {!coupon.usageLimit && !coupon.endDate && (
                          <div className="flex items-center gap-1.5">
                            <TrendingUp size={12} />
                            <span>{coupon.usedCount} times used</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button onClick={() => handleEdit(coupon)}
                        className="p-2 text-gray-400 hover:text-[#0a0a0a] transition-colors">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(coupon._id)}
                        className="p-2 text-gray-400 hover:text-[#dc2626] transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white w-full max-w-2xl my-8">
              <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h2 className="text-lg font-black text-[#0a0a0a]">{editingId ? 'Edit Coupon' : 'New Coupon'}</h2>
                <button onClick={() => { setShowModal(false); setError(''); }} className="p-1 hover:bg-gray-100">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">Coupon Code *</label>
                    <input type="text" placeholder="SUMMER2024" required
                      className="w-full border border-gray-200 px-4 py-2.5 text-sm uppercase tracking-wider font-bold outline-none focus:border-[#0a0a0a]"
                      value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">Discount Type *</label>
                    <select className="w-full border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-[#0a0a0a]"
                      value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                      <option value="percentage">Percentage</option>
                      <option value="flat">Flat Amount</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">
                      {form.type === 'percentage' ? 'Percentage Value *' : 'Amount (₹) *'}
                    </label>
                    <input type="number" placeholder={form.type === 'percentage' ? '10' : '200'} required min="0"
                      className="w-full border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-[#0a0a0a]"
                      value={form.value} onChange={e => setForm({ ...form, value: Number(e.target.value) })} />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">Min Order Amount (₹)</label>
                    <input type="number" placeholder="500" min="0"
                      className="w-full border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-[#0a0a0a]"
                      value={form.minOrderAmount} onChange={e => setForm({ ...form, minOrderAmount: Number(e.target.value) })} />
                  </div>

                  {form.type === 'percentage' && (
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">Max Discount (₹)</label>
                      <input type="number" placeholder="1000" min="0"
                        className="w-full border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-[#0a0a0a]"
                        value={form.maxDiscount} onChange={e => setForm({ ...form, maxDiscount: e.target.value })} />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">Usage Limit</label>
                    <input type="number" placeholder="Unlimited" min="1"
                      className="w-full border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-[#0a0a0a]"
                      value={form.usageLimit} onChange={e => setForm({ ...form, usageLimit: e.target.value })} />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">Start Date</label>
                    <input type="date"
                      className="w-full border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-[#0a0a0a]"
                      value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">End Date</label>
                    <input type="date"
                      className="w-full border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-[#0a0a0a]"
                      value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">Description</label>
                    <textarea placeholder="Brief description of this coupon..." rows="2"
                      className="w-full border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-[#0a0a0a] resize-none"
                      value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                  </div>

                  <div className="md:col-span-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={form.isActive} 
                        onChange={e => setForm({ ...form, isActive: e.target.checked })}
                        className="w-4 h-4" />
                      <span className="text-sm font-semibold text-gray-700">Active</span>
                    </label>
                  </div>
                </div>

                {error && <p className="text-[#dc2626] text-xs mb-4 bg-red-50 px-3 py-2">{error}</p>}

                <div className="flex gap-3">
                  <button type="submit"
                    className="flex items-center gap-2 bg-[#0a0a0a] text-white px-6 py-2.5 text-sm font-bold hover:bg-[#dc2626]">
                    <Check size={14} /> {editingId ? 'Update' : 'Create'} Coupon
                  </button>
                  <button type="button" onClick={() => { setShowModal(false); setError(''); }}
                    className="px-6 py-2.5 text-sm font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50">
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
