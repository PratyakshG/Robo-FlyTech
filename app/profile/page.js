'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/store/Navbar';
import Footer from '@/components/store/Footer';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/Toast';
import { getProfile, updateProfile, changePassword, getMyOrders, getAddresses, addAddress, deleteAddress } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { User, MapPin, Lock, ShoppingBag, Save, Eye, EyeOff, Package, LogOut, Settings, Heart, X } from 'lucide-react';

const TABS = [
  { id: 'orders',   label: 'Orders',    icon: ShoppingBag },
  { id: 'address',  label: 'Addresses', icon: MapPin },
  { id: 'settings', label: 'Settings',  icon: Settings },
];

const statusStyle = (s) => {
  if (s === 'Delivered') return 'bg-gray-100 text-gray-600';
  if (s === 'Shipped')   return 'bg-[#dc2626] text-white';
  if (s === 'Cancelled') return 'bg-gray-100 text-gray-500';
  return 'bg-gray-100 text-gray-600';
};

export default function ProfilePage() {
  const { user, login, logout } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const [tab, setTab] = useState('orders');
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });

  const [profileForm, setProfileForm] = useState({ name: '', email: '', phone: '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  const EMPTY_ADDR = { fullName: '', phone: '', address: '', city: '', pin: '', country: 'India' };
  const [addresses, setAddresses] = useState([]);
  const [addrModal, setAddrModal] = useState(false);
  const [addrForm, setAddrForm] = useState(EMPTY_ADDR);
  const [addrLoading, setAddrLoading] = useState(false);

  useEffect(() => {
    document.body.style.overflow = addrModal ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [addrModal]);

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    getProfile().then(r => {
      setProfile(r.data);
      setProfileForm({ name: r.data.name || '', email: r.data.email || '', phone: r.data.phone || '' });
    });
    getAddresses().then(r => setAddresses(r.data || [])).catch(() => {});
    getMyOrders().then(r => setOrders(r.data));
  }, []);

  const handleProfileSave = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const { data } = await updateProfile(profileForm);
      login({ ...user, ...data });
      showToast('Profile updated');
    } catch (err) { showToast(err.response?.data?.message || 'Update failed', 'error'); }
    finally { setLoading(false); }
  };

  const handleAddressSave = async (e) => {
    e.preventDefault(); setAddrLoading(true);
    try {
      const res = await addAddress(addrForm);
      setAddresses(res.data || []);
      showToast('Address saved');
      setAddrModal(false);
      setAddrForm(EMPTY_ADDR);
    } catch (err) { showToast('Failed to save address', 'error'); }
    finally { setAddrLoading(false); }
  };

  const removeAddress = async (id) => {
    const res = await deleteAddress(id);
    setAddresses(res.data || []);
    showToast('Address removed');
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword)
      return showToast('Passwords do not match', 'error');
    if (passwordForm.newPassword.length < 6)
      return showToast('Password must be at least 6 characters', 'error');
    setLoading(true);
    try {
      await changePassword({ currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword });
      showToast('Password changed');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) { showToast(err.response?.data?.message || 'Failed', 'error'); }
    finally { setLoading(false); }
  };

  if (!profile) return (
    <>
      <Navbar />
      <div className="min-h-[60vh] flex items-center justify-center">
        <motion.p animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.5 }}
          className="text-gray-400 text-sm">Loading...</motion.p>
      </div>
    </>
  );

  return (
    <>
      <Navbar />
      <main className="bg-white min-h-screen">
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-6 md:py-10">

          {/* Header */}
          <div className="mb-6 border-b border-gray-200 pb-6">
            <p className="text-[11px] font-semibold tracking-widest uppercase text-gray-400 mb-2">
              [ ACCOUNT / <span className="text-[#dc2626]">MY PROFILE</span> ]
            </p>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-black text-[2rem] md:text-[3rem] tracking-[-0.04em] leading-none text-[#0a0a0a]">
                  {profile.name}
                </h1>
                <p className="text-xs text-gray-400 mt-1">{profile.email} · Since {new Date(profile.createdAt).getFullYear()}</p>
              </div>
              <button onClick={() => { logout(); router.push('/'); }}
                className="flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-[#dc2626] transition-colors">
                <LogOut size={14} /> <span className="hidden sm:inline">Sign out</span>
              </button>
            </div>
          </div>

          {/* Mobile tab bar */}
          <div className="flex md:hidden border border-gray-200 mb-6 overflow-x-auto">
            {TABS.map(t => {
              const Icon = t.icon;
              return (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className={`flex-1 flex flex-col items-center gap-1 py-3 px-2 text-[10px] font-bold tracking-widest uppercase transition-colors whitespace-nowrap ${
                    tab === t.id ? 'bg-[#0a0a0a] text-white' : 'text-gray-500 hover:bg-gray-50'
                  }`}>
                  <Icon size={15} />
                  {t.label}
                </button>
              );
            })}
          </div>

          <div className="flex gap-8">

            {/* Desktop sidebar */}
            <aside className="hidden md:block w-56 shrink-0">
              <div className="border border-gray-200 sticky top-24">
                {TABS.map(t => {
                  const Icon = t.icon;
                  return (
                    <button key={t.id} onClick={() => setTab(t.id)}
                      className={`w-full flex items-center justify-between px-5 py-4 text-sm border-b border-gray-100 last:border-0 transition-colors ${
                        tab === t.id ? 'bg-[#0a0a0a] text-white font-semibold' : 'text-gray-600 hover:bg-gray-50'
                      }`}>
                      <span className="flex items-center gap-3">
                        <Icon size={15} className={tab === t.id ? 'text-white' : 'text-gray-400'} />
                        {t.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </aside>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <AnimatePresence mode="wait">

                {/* Orders */}
                {tab === 'orders' && (
                  <motion.div key="orders"
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                    <h2 className="font-black text-lg tracking-tight text-[#0a0a0a] mb-4">Orders</h2>

                    {orders.length === 0 ? (
                      <div className="border border-gray-200 p-12 text-center">
                        <Package size={32} className="text-gray-300 mx-auto mb-3" />
                        <p className="font-bold text-gray-500 mb-1">No orders yet</p>
                        <p className="text-sm text-gray-400 mb-4">Start shopping to see your orders here</p>
                        <a href="/products" className="btn-primary inline-flex items-center gap-2 px-6 py-2.5">
                          <ShoppingBag size={14} /> Shop Now
                        </a>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {orders.map((order, i) => (
                          <motion.div key={order._id}
                            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.04 }}
                            className="border border-gray-200 p-4 hover:border-gray-400 transition-colors">
                            <div className="flex items-start justify-between gap-3 flex-wrap">
                              <div>
                                <p className="font-mono text-xs font-bold text-[#0a0a0a]">
                                  #{order._id.slice(-8).toUpperCase()}
                                </p>
                                <p className="text-xs text-gray-400 mt-0.5">
                                  {new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                </p>
                              </div>
                              <span className={`text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 ${statusStyle(order.status)}`}>
                                {order.status}
                              </span>
                            </div>
                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                              <p className="text-xs text-gray-500">{order.items?.length} item{order.items?.length !== 1 ? 's' : ''} · {order.paymentMethod}</p>
                              <p className="text-sm font-black text-[#0a0a0a]">₹{order.totalPrice?.toLocaleString()}</p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Addresses */}
                {tab === 'address' && (
                  <motion.div key="address"
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="font-black text-lg tracking-tight text-[#0a0a0a]">Saved addresses</h2>
                      <button onClick={() => { setAddrForm(EMPTY_ADDR); setAddrModal(true); }}
                        className="btn-primary flex items-center gap-2 px-4 py-2 text-xs">
                        + Add
                      </button>
                    </div>

                    {addresses.length === 0 ? (
                      <div className="border border-gray-200 p-12 text-center">
                        <MapPin size={32} className="text-gray-300 mx-auto mb-3" />
                        <p className="font-bold text-gray-500 mb-1">No saved addresses</p>
                        <p className="text-sm text-gray-400 mb-4">Add an address to speed up checkout</p>
                        <button onClick={() => { setAddrForm(EMPTY_ADDR); setAddrModal(true); }}
                          className="btn-primary px-6 py-2.5 text-xs">Add Address</button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {addresses.map(addr => (
                          <div key={addr._id} className="border border-gray-200 p-4 hover:border-[#0a0a0a] transition-colors">
                            <p className="font-bold text-sm text-[#0a0a0a]">{addr.fullName}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{addr.phone}</p>
                            <p className="text-sm text-gray-500 mt-1">{addr.address}</p>
                            <p className="text-sm text-gray-500">{addr.city} — {addr.pin}, {addr.country}</p>
                            <button onClick={() => removeAddress(addr._id)}
                              className="mt-3 text-xs text-[#dc2626] hover:text-red-700 font-semibold transition-colors">Remove</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Settings */}
                {tab === 'settings' && (
                  <motion.div key="settings"
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}
                    className="space-y-5">
                    <h2 className="font-black text-lg tracking-tight text-[#0a0a0a]">Settings</h2>

                    {/* Profile info */}
                    <div className="border border-gray-200 p-5">
                      <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-gray-400 mb-4">Personal Information</p>
                      <form onSubmit={handleProfileSave} className="space-y-4">
                        {[
                          { key: 'name',  label: 'Full Name', type: 'text' },
                          { key: 'email', label: 'Email',     type: 'email' },
                          { key: 'phone', label: 'Phone',     type: 'tel', placeholder: '+91 98765 43210' },
                        ].map(f => (
                          <div key={f.key}>
                            <label className="block text-[10px] font-bold tracking-[0.15em] uppercase text-gray-400 mb-1.5">{f.label}</label>
                            <input className="input-field" type={f.type} placeholder={f.placeholder || ''}
                              value={profileForm[f.key]}
                              onChange={e => setProfileForm({ ...profileForm, [f.key]: e.target.value })}
                              required={f.key !== 'phone'} />
                          </div>
                        ))}
                        <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2 px-6 py-2.5">
                          <Save size={14} /> {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                      </form>
                    </div>

                    {/* Change password */}
                    <div className="border border-gray-200 p-5">
                      <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-gray-400 mb-4">Change Password</p>
                      <form onSubmit={handlePasswordSave} className="space-y-4">
                        {[
                          { key: 'currentPassword', label: 'Current Password', pw: 'current' },
                          { key: 'newPassword',     label: 'New Password',     pw: 'new' },
                          { key: 'confirmPassword', label: 'Confirm Password', pw: 'confirm' },
                        ].map(f => (
                          <div key={f.key}>
                            <label className="block text-[10px] font-bold tracking-[0.15em] uppercase text-gray-400 mb-1.5">{f.label}</label>
                            <div className="relative">
                              <input className="input-field pr-10" type={showPw[f.pw] ? 'text' : 'password'}
                                placeholder="••••••••"
                                value={passwordForm[f.key]}
                                onChange={e => setPasswordForm({ ...passwordForm, [f.key]: e.target.value })} required />
                              <button type="button" onClick={() => setShowPw(p => ({ ...p, [f.pw]: !p[f.pw] }))}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                {showPw[f.pw] ? <EyeOff size={14} /> : <Eye size={14} />}
                              </button>
                            </div>
                          </div>
                        ))}
                        <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2 px-6 py-2.5">
                          <Lock size={14} /> {loading ? 'Updating...' : 'Update Password'}
                        </button>
                      </form>
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>

      {/* Address Modal */}
      <AnimatePresence>
        {addrModal && (
          <>
            <motion.div key="addr-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setAddrModal(false)} className="fixed inset-0 bg-black/40 z-50" />
            <motion.div key="addr-modal"
              initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }} transition={{ duration: 0.2 }}
              className="fixed inset-x-0 bottom-0 md:inset-0 md:flex md:items-center md:justify-center z-50 p-0 md:p-4">
              <div className="bg-white w-full md:max-w-md md:border md:border-gray-200 shadow-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white">
                  <h2 className="font-black text-base tracking-tight">Add Address</h2>
                  <button onClick={() => setAddrModal(false)} className="p-1 text-gray-400 hover:text-gray-700">
                    <X size={18} />
                  </button>
                </div>
                <form onSubmit={handleAddressSave} className="p-5 space-y-3">
                  {[
                    { key: 'fullName', label: 'Full Name',      type: 'text', span: true },
                    { key: 'phone',    label: 'Phone',           type: 'tel',  span: true },
                    { key: 'address',  label: 'Street Address',  type: 'text', span: true },
                    { key: 'city',     label: 'City',            type: 'text', span: false },
                    { key: 'pin',      label: 'PIN Code',        type: 'text', span: false },
                    { key: 'country',  label: 'Country',         type: 'text', span: true },
                  ].map(f => (
                    <div key={f.key} className={f.span ? '' : 'inline-block w-[calc(50%-6px)] mr-3 last:mr-0'}>
                      <label className="block text-[10px] font-bold tracking-[0.15em] uppercase text-gray-400 mb-1.5">{f.label}</label>
                      <input className="input-field" type={f.type} placeholder={f.label} required={f.key !== 'country'}
                        value={addrForm[f.key]}
                        onChange={e => setAddrForm(a => ({ ...a, [f.key]: e.target.value }))} />
                    </div>
                  ))}
                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setAddrModal(false)} className="btn-outline flex-1 py-3">Cancel</button>
                    <button type="submit" disabled={addrLoading} className="btn-primary flex-1 py-3 flex items-center justify-center gap-2">
                      <Save size={14} /> {addrLoading ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <Footer />
    </>
  );
}
