'use client';
import { useState, useEffect } from 'react';
import { createProduct, updateProduct, getCategories, uploadImages } from '@/lib/api';
import { motion } from 'framer-motion';
import { X, Save, AlertCircle, Plus, Trash2 } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

// ── Modal wrapper ────────────────────────────────────────────────
export function ProductModal({ open, onClose, initial, onSuccess }) {
  if (!open) return null;
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm"
          />
          {/* Panel */}
          <motion.div
            key="panel"
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 20 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <div className="bg-white border border-gray-200 w-full max-w-lg max-h-[90vh] overflow-y-auto pointer-events-auto shadow-2xl">
              {/* Modal header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h2 className="classic-heading text-lg">
                  {initial?._id ? 'Edit Product' : 'Add New Product'}
                </h2>
                <motion.button whileTap={{ scale: 0.9 }} onClick={onClose}
                  className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
                  <X size={18} />
                </motion.button>
              </div>
              {/* Form */}
              <div className="p-6">
                <ProductForm key={initial?._id || 'new'} initial={initial} onSuccess={onSuccess} onClose={onClose} />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ── Form ─────────────────────────────────────────────────────────
export default function ProductForm({ initial, onSuccess, onClose }) {
  const data = initial || {};
  const isEdit = !!data._id;
  const [form, setForm] = useState({
    name:           data.name          || '',
    description:    data.description   || '',
    price:          data.price         || '',
    originalPrice:  data.originalPrice || '',
    category:       data.category      || '',
    brand:          data.brand         || '',
    stock:          data.stock         || '',
    image:          data.image         || '',
    images:         data.images?.length > 0 ? data.images : (data.image ? [data.image] : []),
    specifications: data.specifications?.length > 0
      ? data.specifications
      : [{ label: '', value: '' }],
    warranty:        data.warranty        || '',
    warrantyEnabled: data.warrantyEnabled  || false,
    warrantyDuration:data.warrantyDuration || 1,
    warrantyUnit:    data.warrantyUnit     || 'Years',
    returnsEnabled: data.returnsEnabled || false,
    returnDays:     data.returnDays     || 7,
    freeShipping:   data.freeShipping   || false,
  });
  const [categories, setCategories] = useState([]);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    getCategories().then(r => {
      const cats = r.data || [];
      setCategories(cats);
      if (!form.category && cats.length > 0) {
        setForm(f => ({ ...f, category: f.category || cats[0].name }));
      }
    });
  }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const setSpec = (i, key, val) =>
    setForm(f => {
      const specs = [...f.specifications];
      specs[i] = { ...specs[i], [key]: val };
      return { ...f, specifications: specs };
    });
  const addSpec    = () => setForm(f => ({ ...f, specifications: [...f.specifications, { label: '', value: '' }] }));
  const removeSpec = (i) => setForm(f => ({ ...f, specifications: f.specifications.filter((_, idx) => idx !== i) }));

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    setError('');
    try {
      const { data: res } = await uploadImages(files);
      setForm(f => {
        const merged = [...f.images, ...res.urls];
        return { ...f, images: merged, image: merged[0] };
      });
    } catch {
      setError('Image upload failed. Check Cloudinary credentials.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const removeImage = (i) =>
    setForm(f => {
      const imgs = f.images.filter((_, idx) => idx !== i);
      return { ...f, images: imgs, image: imgs[0] || '' };
    });

  const setCover = (i) =>
    setForm(f => {
      const imgs = [...f.images];
      const [picked] = imgs.splice(i, 1);
      imgs.unshift(picked);
      return { ...f, images: imgs, image: imgs[0] };
    });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isEdit) await updateProduct(initial._id, form);
      else        await createProduct(form);
      onSuccess?.();
      onClose?.();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2.5">
          <AlertCircle size={14} /> {error}
        </div>
      )}

      <div>
        <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">Product Name</label>
        <input className="input-field" type="text" required value={form.name} onChange={e => set('name', e.target.value)} />
      </div>

      <div>
        <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">Brand</label>
        <input className="input-field" type="text" required value={form.brand} onChange={e => set('brand', e.target.value)} />
      </div>

      {/* Images Upload */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-xs text-gray-500 uppercase tracking-wider">Product Images</label>
          <span className="text-[10px] text-gray-400">{form.images.length}/10 — first image is cover</span>
        </div>

        {/* Existing images grid */}
        {form.images.length > 0 && (
          <div className="grid grid-cols-4 gap-2 mb-2">
            {form.images.map((url, i) => (
              <div key={url + i} className="relative group aspect-square border border-gray-200 overflow-hidden">
                <img src={url} alt="" className="w-full h-full object-cover" />
                {/* Cover badge */}
                {i === 0 && (
                  <div className="absolute top-1 left-1 bg-[#dc2626] text-white text-[9px] font-bold px-1.5 py-0.5 uppercase tracking-wider">
                    Cover
                  </div>
                )}
                {/* Actions overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                  {i !== 0 && (
                    <button type="button" onClick={() => setCover(i)}
                      className="bg-white text-[#0a0a0a] text-[9px] font-bold px-2 py-1 uppercase tracking-wider hover:bg-[#dc2626] hover:text-white transition-colors">
                      Cover
                    </button>
                  )}
                  <button type="button" onClick={() => removeImage(i)}
                    className="bg-white text-[#dc2626] p-1 hover:bg-[#dc2626] hover:text-white transition-colors">
                    <Trash2 size={11} />
                  </button>
                </div>
              </div>
            ))}

            {/* Add more slot */}
            {form.images.length < 10 && (
              <label className={`aspect-square border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors ${
                uploading ? 'border-gray-200 bg-gray-50' : 'border-gray-300 hover:border-[#0a0a0a]'
              }`}>
                <input type="file" accept="image/*" multiple className="sr-only"
                  onChange={handleImageUpload} disabled={uploading} />
                {uploading
                  ? <div className="w-4 h-4 border-2 border-[#0a0a0a] border-t-transparent rounded-full animate-spin" />
                  : <Plus size={16} className="text-gray-400" />}
              </label>
            )}
          </div>
        )}

        {/* Empty state drop zone */}
        {form.images.length === 0 && (
          <label className={`flex flex-col items-center justify-center w-full border-2 border-dashed cursor-pointer transition-colors py-8 ${
            uploading ? 'border-gray-200 bg-gray-50' : 'border-gray-300 hover:border-[#0a0a0a]'
          }`}>
            <input type="file" accept="image/*" multiple className="sr-only"
              onChange={handleImageUpload} disabled={uploading} />
            {uploading ? (
              <>
                <div className="w-6 h-6 border-2 border-[#0a0a0a] border-t-transparent rounded-full animate-spin mb-2" />
                <span className="text-xs text-gray-400">Uploading to Cloudinary...</span>
              </>
            ) : (
              <>
                <Plus size={20} className="text-gray-400 mb-2" />
                <span className="text-xs font-bold text-gray-500">Click to upload images</span>
                <span className="text-[10px] text-gray-400 mt-1">JPG, PNG, WEBP — up to 10 images, max 5MB each</span>
              </>
            )}
          </label>
        )}

        {uploading && (
          <p className="text-[10px] text-gray-400 mt-1">Uploading... please wait</p>
        )}
      </div>

      <div>
        <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">Description</label>
        <textarea className="input-field resize-none" rows={3} required
          value={form.description} onChange={e => set('description', e.target.value)} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">Price (₹)</label>
          <input className="input-field" type="number" min="0" required
            value={form.price} onChange={e => set('price', e.target.value)} />
        </div>
        <div>
          <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">Original Price (₹) <span className="normal-case text-gray-400">— for Deal badge</span></label>
          <input className="input-field" type="number" min="0"
            placeholder="Leave empty if no deal"
            value={form.originalPrice} onChange={e => set('originalPrice', e.target.value)} />
        </div>
      </div>

      <div>
        <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">Stock</label>
        <input className="input-field" type="number" min="0" required
          value={form.stock} onChange={e => set('stock', e.target.value)} />
      </div>

      <div>
        <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">Category</label>
        <select className="input-field" value={form.category} onChange={e => set('category', e.target.value)}>
          {categories.length === 0 && <option value="">Loading categories...</option>}
          {categories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
        </select>
      </div>

      {/* Specifications */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-xs text-gray-500 uppercase tracking-wider">Specifications</label>
          <button type="button" onClick={addSpec}
            className="flex items-center gap-1 text-xs font-bold text-[#0a0a0a] hover:text-[#dc2626] transition-colors">
            <Plus size={12} /> Add Row
          </button>
        </div>
        <div className="space-y-2">
          {form.specifications.map((spec, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                placeholder="Label (e.g. Display)"
                value={spec.label}
                onChange={e => setSpec(i, 'label', e.target.value)}
                className="input-field flex-1 text-xs"
              />
              <input
                placeholder="Value (e.g. 6.1 inch OLED)"
                value={spec.value}
                onChange={e => setSpec(i, 'value', e.target.value)}
                className="input-field flex-1 text-xs"
              />
              <button type="button" onClick={() => removeSpec(i)}
                className="p-1.5 text-gray-400 hover:text-[#dc2626] transition-colors shrink-0">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
        {form.specifications.length === 0 && (
          <p className="text-xs text-gray-400 mt-1">No specifications added. Click "Add Row" to add one.</p>
        )}
      </div>

      {/* Warranty Toggle */}
      <div className="border border-gray-200">
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <p className="text-xs font-bold text-[#0a0a0a]">Warranty</p>
            <p className="text-[10px] text-gray-400">Show warranty info on product page</p>
          </div>
          <button type="button" onClick={() => set('warrantyEnabled', !form.warrantyEnabled)}
            className={`w-10 h-5 rounded-full transition-colors relative ${
              form.warrantyEnabled ? 'bg-[#0a0a0a]' : 'bg-gray-200'
            }`}>
            <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all ${
              form.warrantyEnabled ? 'left-5' : 'left-0.5'
            }`} />
          </button>
        </div>
        {form.warrantyEnabled && (
          <div className="px-4 pb-4 border-t border-gray-100 pt-3">
            <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-2">Warranty Duration</label>
            <div className="flex gap-2">
              <input
                type="number" min="1" max="99"
                className="input-field w-24 text-sm"
                value={form.warrantyDuration}
                onChange={e => set('warrantyDuration', parseInt(e.target.value) || 1)}
              />
              <select className="input-field flex-1 text-sm"
                value={form.warrantyUnit}
                onChange={e => set('warrantyUnit', e.target.value)}>
                <option value="Days">Days</option>
                <option value="Months">Months</option>
                <option value="Years">Years</option>
              </select>
            </div>
            <p className="text-[10px] text-gray-400 mt-1.5">
              Displays as: <span className="font-semibold text-[#0a0a0a]">{form.warrantyDuration} {form.warrantyUnit} Warranty</span>
            </p>
          </div>
        )}
      </div>

      {/* Returns */}
      <div className="flex items-center justify-between border border-gray-200 px-4 py-3">
        <div>
          <p className="text-xs font-bold text-[#0a0a0a]">Easy Returns</p>
          <p className="text-[10px] text-gray-400">Show returns policy on product page</p>
        </div>
        <div className="flex items-center gap-3">
          {form.returnsEnabled && (
            <input className="input-field w-20 text-xs" type="number" min="1" max="30"
              value={form.returnDays} onChange={e => set('returnDays', parseInt(e.target.value) || 7)}
              title="Return days" />
          )}
          <button type="button" onClick={() => set('returnsEnabled', !form.returnsEnabled)}
            className={`w-10 h-5 rounded-full transition-colors relative ${
              form.returnsEnabled ? 'bg-[#0a0a0a]' : 'bg-gray-200'
            }`}>
            <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all ${
              form.returnsEnabled ? 'left-5' : 'left-0.5'
            }`} />
          </button>
        </div>
      </div>

      {/* Free Shipping */}
      <div className="flex items-center justify-between border border-gray-200 px-4 py-3">
        <div>
          <p className="text-xs font-bold text-[#0a0a0a]">Free Shipping</p>
          <p className="text-[10px] text-gray-400">Enable free shipping for this product</p>
        </div>
        <button type="button" onClick={() => set('freeShipping', !form.freeShipping)}
          className={`w-10 h-5 rounded-full transition-colors relative ${
            form.freeShipping ? 'bg-[#0a0a0a]' : 'bg-gray-200'
          }`}>
          <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all ${
            form.freeShipping ? 'left-5' : 'left-0.5'
          }`} />
        </button>
      </div>

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onClose}
          className="btn-outline flex-1 py-2.5">
          Cancel
        </button>
        <button type="submit" disabled={loading || uploading}
          className="btn-primary flex-1 py-2.5 flex items-center justify-center gap-2">
          <Save size={14} />
          {loading ? 'Saving...' : uploading ? 'Uploading...' : isEdit ? 'Update Product' : 'Create Product'}
        </button>
      </div>
    </form>
  );
}
