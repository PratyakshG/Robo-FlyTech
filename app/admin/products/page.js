'use client';
import { useEffect, useState } from 'react';
import { getProducts, deleteProduct } from '@/lib/api';
import { ProductModal } from '@/components/admin/ProductForm';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { useToast } from '@/components/Toast';

export default function AdminProductsPage() {
  const [products, setProducts]   = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing]     = useState(null);       // null = add, object = edit
  const [deleteId, setDeleteId]   = useState(null);       // confirm delete modal
  const { showToast } = useToast();

  const load = () => getProducts({ limit: 100 }).then(r => {
    setProducts(r.data.products);
    setFilteredProducts(r.data.products);
  });
  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredProducts(products);
      return;
    }
    const query = searchQuery.toLowerCase();
    const filtered = products.filter(p => 
      p.name.toLowerCase().includes(query) ||
      p.category.toLowerCase().includes(query) ||
      p.brand.toLowerCase().includes(query)
    );
    setFilteredProducts(filtered);
  }, [searchQuery, products]);

  const openAdd  = ()        => { setEditing(null); setModalOpen(true); };
  const openEdit = (product) => { setEditing(product); setModalOpen(true); };
  const onSuccess = () => { load(); showToast(editing ? 'Product updated' : 'Product created'); };

  const confirmDelete = async () => {
    await deleteProduct(deleteId);
    setDeleteId(null);
    load();
    showToast('Product deleted', 'info');
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-8 gap-4">
        <h1 className="section-title">Products</h1>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="border border-gray-200 pl-10 pr-4 py-2 text-sm outline-none focus:border-[#0a0a0a] transition-colors w-64"
            />
          </div>
          <motion.button whileTap={{ scale: 0.97 }} onClick={openAdd}
            className="btn-primary flex items-center gap-2 px-5 py-2.5 whitespace-nowrap">
            <Plus size={15} /> Add Product
          </motion.button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 overflow-x-auto">
        <table className="classic-table">
          <thead>
            <tr>
              {['Image', 'Name', 'Category', 'Brand', 'Price', 'Stock', 'Actions'].map(h => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map(p => (
              <tr key={p._id}>
                <td>
                  <img src={p.image || 'https://placehold.co/48x48?text=...'} alt={p.name}
                    className="w-10 h-10 object-cover border border-gray-100" />
                </td>
                <td className="font-medium text-gray-800 max-w-[160px] truncate">{p.name}</td>
                <td className="text-gray-500">{p.category}</td>
                <td className="text-gray-500">{p.brand}</td>
                <td className="text-green-700 font-semibold">₹{p.price.toLocaleString()}</td>
                <td>
                  <span className={p.stock > 0 ? 'badge-green' : 'badge-red'}>{p.stock}</span>
                </td>
                <td>
                  <div className="flex items-center gap-2">
                    <motion.button whileTap={{ scale: 0.9 }}
                      onClick={() => openEdit(p)}
                      className="flex items-center gap-1 text-xs text-green-700 hover:text-green-900 font-medium transition-colors">
                      <Pencil size={12} /> Edit
                    </motion.button>
                    <motion.button whileTap={{ scale: 0.9 }}
                      onClick={() => setDeleteId(p._id)}
                      className="flex items-center gap-1 text-xs text-red-400 hover:text-red-600 transition-colors">
                      <Trash2 size={12} /> Delete
                    </motion.button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredProducts.length === 0 && products.length > 0 && (
          <div className="text-center py-14">
            <p className="text-gray-400 text-sm">No products found matching "{searchQuery}"</p>
          </div>
        )}
        {products.length === 0 && (
          <div className="text-center py-14">
            <p className="text-gray-400 text-sm mb-3">No products yet</p>
            <button onClick={openAdd} className="btn-primary flex items-center gap-2 mx-auto px-5 py-2">
              <Plus size={14} /> Add First Product
            </button>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      <ProductModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        initial={editing}
        onSuccess={onSuccess}
      />

      {/* Delete Confirm Modal */}
      <AnimatePresence>
        {deleteId && (
          <>
            <motion.div key="del-backdrop"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setDeleteId(null)}
              className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm" />
            <motion.div key="del-modal"
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              <div className="bg-white border border-gray-200 p-6 w-full max-w-sm pointer-events-auto shadow-2xl">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 size={20} className="text-red-500" />
                </div>
                <h3 className="classic-heading text-lg text-center mb-1">Delete Product?</h3>
                <p className="text-sm text-gray-400 text-center mb-6">This action cannot be undone.</p>
                <div className="flex gap-3">
                  <button onClick={() => setDeleteId(null)}
                    className="btn-outline flex-1 py-2.5">Cancel</button>
                  <button onClick={confirmDelete}
                    className="flex-1 py-2.5 bg-red-500 text-white text-xs font-semibold uppercase tracking-wider hover:bg-red-600 transition-colors">
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
