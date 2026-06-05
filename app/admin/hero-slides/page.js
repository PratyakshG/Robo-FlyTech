'use client';
import { useEffect, useState, useRef } from 'react';
import { getAdminHeroSlides, createHeroSlide, updateHeroSlide, deleteHeroSlide, uploadImages } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Pencil, Trash2, X, Save, ImageIcon, GripVertical, Eye, EyeOff, CheckCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/components/Toast';

const EMPTY_EDIT = { image: '', label: '', tag: '', active: true, order: 0 };

export default function AdminHeroSlidesPage() {
  const [slides, setSlides]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [editModal, setEditModal] = useState(null);   // slide being edited
  const [form, setForm]           = useState(EMPTY_EDIT);
  const [saving, setSaving]       = useState(false);
  const [deleteId, setDeleteId]   = useState(null);

  // bulk upload state
  const [previews, setPreviews]   = useState([]);     // [{ file, localUrl, status: 'pending'|'uploading'|'done'|'error', url }]
  const [bulkOpen, setBulkOpen]   = useState(false);
  const [bulkSaving, setBulkSaving] = useState(false);
  const fileInputRef = useRef();
  const { showToast } = useToast();

  const load = async () => {
    setLoading(true);
    const r = await getAdminHeroSlides();
    setSlides(r.data || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  // ── Bulk upload ──────────────────────────────────────────────
  const handleFilePick = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const items = files.map(file => ({ file, localUrl: URL.createObjectURL(file), status: 'pending', url: '' }));
    setPreviews(items);
    setBulkOpen(true);
    e.target.value = '';
  };

  const removePreview = (idx) => setPreviews(p => p.filter((_, i) => i !== idx));

  const handleBulkSave = async () => {
    if (!previews.length) return;
    setBulkSaving(true);
    try {
      // upload all files at once
      const files = previews.map(p => p.file);
      setPreviews(p => p.map(x => ({ ...x, status: 'uploading' })));
      const r = await uploadImages(files);
      const urls = r.data.urls || [];
      setPreviews(p => p.map((x, i) => ({ ...x, status: urls[i] ? 'done' : 'error', url: urls[i] || '' })));

      // create a slide for each uploaded URL
      await Promise.all(
        urls.map((url, i) =>
          createHeroSlide({ image: url, label: '', tag: '', active: true, order: slides.length + i })
        )
      );
      showToast(`${urls.length} slide${urls.length > 1 ? 's' : ''} added`);
      setBulkOpen(false);
      setPreviews([]);
      load();
    } catch {
      showToast('Upload failed', 'error');
      setPreviews(p => p.map(x => x.status === 'uploading' ? { ...x, status: 'error' } : x));
    } finally {
      setBulkSaving(false);
    }
  };

  const closeBulk = () => {
    if (bulkSaving) return;
    setBulkOpen(false);
    setPreviews([]);
  };

  // ── Edit single slide ────────────────────────────────────────
  const openEdit = (s) => { setEditModal(s); setForm({ ...s }); };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateHeroSlide(editModal._id, form);
      setEditModal(null);
      load();
      showToast('Slide updated');
    } catch { showToast('Failed to save', 'error'); }
    finally { setSaving(false); }
  };

  const toggleActive = async (slide) => {
    await updateHeroSlide(slide._id, { active: !slide.active });
    load();
    showToast(slide.active ? 'Slide hidden' : 'Slide visible');
  };

  const confirmDelete = async () => {
    await deleteHeroSlide(deleteId);
    setDeleteId(null);
    load();
    showToast('Slide deleted');
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-black text-2xl tracking-tight text-[#0a0a0a]">Hero Slides</h1>
          <p className="text-xs text-gray-400 mt-1">{slides.filter(s => s.active).length} active · {slides.length} total</p>
        </div>
        <button onClick={() => fileInputRef.current?.click()} className="btn-primary flex items-center gap-2 px-5 py-2.5">
          <Upload size={15} /> Upload Images
        </button>
        <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFilePick} />
      </div>

      {/* Slides grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(3).fill(0).map((_, i) => <div key={i} className="skeleton h-48 w-full" />)}
        </div>
      ) : slides.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-gray-200 cursor-pointer hover:border-[#0a0a0a] transition-colors"
          onClick={() => fileInputRef.current?.click()}>
          <ImageIcon size={32} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400 text-sm mb-1">No hero slides yet</p>
          <p className="text-xs text-gray-300">Click to upload multiple images at once</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {slides.map((slide, i) => (
            <motion.div key={slide._id}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className={`border overflow-hidden group ${slide.active ? 'border-gray-200' : 'border-dashed border-gray-300 opacity-60'}`}>
              <div className="relative h-44 bg-gray-100 overflow-hidden">
                <img src={slide.image} alt={slide.label || 'slide'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                {slide.label && <span className="absolute top-2 left-2 bg-[#dc2626] text-white text-[9px] font-bold tracking-widest uppercase px-2 py-1">{slide.label}</span>}
                {slide.tag   && <span className="absolute top-2 right-2 bg-[#0a0a0a] text-white text-[9px] font-bold tracking-widest uppercase px-2 py-1">{slide.tag}</span>}
                <span className="absolute bottom-2 left-2 bg-black/60 text-white text-[9px] font-bold px-2 py-0.5 flex items-center gap-1">
                  <GripVertical size={9} /> #{slide.order}
                </span>
              </div>
              <div className="flex items-center justify-between px-3 py-2.5 bg-white border-t border-gray-100">
                <div className="flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${slide.active ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <span className="text-[11px] text-gray-500">{slide.active ? 'Visible' : 'Hidden'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => toggleActive(slide)} className="p-1.5 text-gray-400 hover:text-[#0a0a0a] transition-colors">
                    {slide.active ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                  <button onClick={() => openEdit(slide)} className="p-1.5 text-gray-400 hover:text-[#0a0a0a] transition-colors"><Pencil size={14} /></button>
                  <button onClick={() => setDeleteId(slide._id)} className="p-1.5 text-gray-400 hover:text-[#dc2626] transition-colors"><Trash2 size={14} /></button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ── Bulk Upload Modal ── */}
      <AnimatePresence>
        {bulkOpen && (
          <>
            <motion.div key="bulk-bg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={closeBulk} className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm" />
            <motion.div key="bulk-modal" initial={{ opacity: 0, scale: 0.96, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 20 }} transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              <div className="bg-white border border-gray-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto pointer-events-auto shadow-2xl">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
                  <div>
                    <h2 className="font-black text-lg tracking-tight">Upload Hero Images</h2>
                    <p className="text-xs text-gray-400 mt-0.5">{previews.length} image{previews.length !== 1 ? 's' : ''} selected</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => fileInputRef.current?.click()} disabled={bulkSaving}
                      className="btn-outline text-xs px-3 py-1.5 flex items-center gap-1.5">
                      <Upload size={12} /> Add more
                    </button>
                    <button onClick={closeBulk} disabled={bulkSaving} className="p-1.5 text-gray-400 hover:text-gray-700"><X size={18} /></button>
                  </div>
                </div>

                {/* Preview grid */}
                <div className="p-6">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                    {previews.map((item, idx) => (
                      <div key={idx} className="relative group border border-gray-200 overflow-hidden">
                        <img src={item.localUrl} alt="" className="w-full h-32 object-cover" />
                        {/* Status overlay */}
                        {item.status === 'uploading' && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <Loader2 size={20} className="text-white animate-spin" />
                          </div>
                        )}
                        {item.status === 'done' && (
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                            <CheckCircle size={20} className="text-green-400" />
                          </div>
                        )}
                        {item.status === 'error' && (
                          <div className="absolute inset-0 bg-red-900/50 flex items-center justify-center">
                            <span className="text-white text-xs font-bold">Failed</span>
                          </div>
                        )}
                        {item.status === 'pending' && (
                          <button onClick={() => removePreview(idx)}
                            className="absolute top-1.5 right-1.5 bg-black/60 text-white p-0.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#dc2626]">
                            <X size={11} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  <p className="text-xs text-gray-400 mb-5">
                    Each image will become a separate hero slide. You can edit labels and tags after uploading.
                  </p>

                  <div className="flex gap-3">
                    <button onClick={closeBulk} disabled={bulkSaving} className="btn-outline flex-1 py-2.5">Cancel</button>
                    <button onClick={handleBulkSave} disabled={bulkSaving || !previews.length}
                      className="btn-primary flex-1 py-2.5 flex items-center justify-center gap-2">
                      {bulkSaving
                        ? <><Loader2 size={14} className="animate-spin" /> Uploading...</>
                        : <><Upload size={14} /> Upload {previews.length} Slide{previews.length !== 1 ? 's' : ''}</>
                      }
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Edit Modal ── */}
      <AnimatePresence>
        {editModal && (
          <>
            <motion.div key="edit-bg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setEditModal(null)} className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm" />
            <motion.div key="edit-modal" initial={{ opacity: 0, scale: 0.96, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 20 }} transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              <div className="bg-white border border-gray-200 w-full max-w-md pointer-events-auto shadow-2xl">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                  <h2 className="font-black text-lg tracking-tight">Edit Slide</h2>
                  <button onClick={() => setEditModal(null)} className="p-1.5 text-gray-400 hover:text-gray-700"><X size={18} /></button>
                </div>
                <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
                  {/* Preview */}
                  <img src={editModal.image} alt="" className="w-full h-36 object-cover border border-gray-200" />

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">Label</label>
                      <input className="input-field" placeholder="e.g. FEATURED / AUDIO"
                        value={form.label} onChange={e => set('label', e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">Tag</label>
                      <input className="input-field" placeholder="e.g. BEST SELLER"
                        value={form.tag} onChange={e => set('tag', e.target.value)} />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">Display Order</label>
                    <input className="input-field" type="number" min="0"
                      value={form.order} onChange={e => set('order', Number(e.target.value))} />
                  </div>

                  <div className="flex items-center gap-3">
                    <button type="button" onClick={() => set('active', !form.active)}
                      className={`w-10 h-5 rounded-full transition-colors relative ${form.active ? 'bg-[#dc2626]' : 'bg-gray-200'}`}>
                      <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${form.active ? 'left-5' : 'left-0.5'}`} />
                    </button>
                    <span className="text-sm text-gray-600">{form.active ? 'Visible on homepage' : 'Hidden'}</span>
                  </div>

                  <div className="flex gap-3 pt-1">
                    <button type="button" onClick={() => setEditModal(null)} className="btn-outline flex-1 py-2.5">Cancel</button>
                    <button type="submit" disabled={saving}
                      className="btn-primary flex-1 py-2.5 flex items-center justify-center gap-2">
                      <Save size={14} /> {saving ? 'Saving...' : 'Update Slide'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Delete confirm ── */}
      <AnimatePresence>
        {deleteId && (
          <>
            <motion.div key="del-bg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setDeleteId(null)} className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm" />
            <motion.div key="del-modal" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              <div className="bg-white border border-gray-200 p-6 w-full max-w-sm pointer-events-auto shadow-2xl">
                <div className="w-12 h-12 bg-red-50 flex items-center justify-center mx-auto mb-4">
                  <Trash2 size={20} className="text-[#dc2626]" />
                </div>
                <h3 className="font-black text-lg text-center mb-1">Delete Slide?</h3>
                <p className="text-sm text-gray-400 text-center mb-6">This slide will be removed from the homepage.</p>
                <div className="flex gap-3">
                  <button onClick={() => setDeleteId(null)} className="btn-outline flex-1 py-2.5">Cancel</button>
                  <button onClick={confirmDelete}
                    className="flex-1 py-2.5 bg-[#dc2626] text-white text-xs font-bold uppercase tracking-wider hover:bg-red-700 transition-colors">
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
