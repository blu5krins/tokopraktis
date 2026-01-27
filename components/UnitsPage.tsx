'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Package } from 'lucide-react';
import Swal from 'sweetalert2';

interface Unit {
  id: number;
  name: string;
  description: string;
}

export default function UnitsPage() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    loadUnits();
  }, []);

  const loadUnits = async () => {
    try {
      const res = await fetch('/api/units');
      const data = await res.json();
      setUnits(data);
    } catch (error) {
      console.error('Error loading units:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingId) {
        const res = await fetch(`/api/units/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        
        if (res.ok) {
          await Swal.fire({
            icon: 'success',
            title: 'Berhasil!',
            text: 'Unit berhasil diupdate.',
            timer: 2000,
            showConfirmButton: false
          });
        } else {
          const error = await res.json();
          throw new Error(error.error);
        }
      } else {
        const res = await fetch('/api/units', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        
        if (res.ok) {
          await Swal.fire({
            icon: 'success',
            title: 'Berhasil!',
            text: 'Unit berhasil ditambahkan.',
            timer: 2000,
            showConfirmButton: false
          });
        } else {
          const error = await res.json();
          throw new Error(error.error);
        }
      }
      
      loadUnits();
      resetForm();
    } catch (error: any) {
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: error.message || 'Terjadi kesalahan'
      });
    }
  };

  const handleEdit = (unit: Unit) => {
    setEditingId(unit.id);
    setFormData({
      name: unit.name,
      description: unit.description || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: 'Hapus Unit?',
      text: 'Data unit akan dihapus permanen',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`/api/units/${id}`, {
          method: 'DELETE'
        });

        if (res.ok) {
          await Swal.fire({
            icon: 'success',
            title: 'Terhapus!',
            text: 'Unit berhasil dihapus.',
            timer: 2000,
            showConfirmButton: false
          });
          loadUnits();
        } else {
          const error = await res.json();
          throw new Error(error.error);
        }
      } catch (error: any) {
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: error.message || 'Gagal menghapus unit'
        });
      }
    }
  };

  const resetForm = () => {
    setFormData({ name: '', description: '' });
    setEditingId(null);
    setShowModal(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Header */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg">
                <Package className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Satuan Unit</h1>
                <p className="text-xs text-slate-600 mt-1">Kelola satuan produk (pcs, box, kg, dll)</p>
              </div>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all text-sm font-medium"
            >
              <Plus size={16} />
              Tambah Unit
            </button>
          </div>
        </div>

        {/* Units List */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="space-y-3">
            {units.length === 0 ? (
              <div className="text-center py-12">
                <Package className="mx-auto text-slate-300 mb-3" size={48} />
                <p className="text-slate-500">Belum ada unit yang ditambahkan</p>
              </div>
            ) : (
              units.map(unit => (
                <div
                  key={unit.id}
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900">{unit.name}</h3>
                    {unit.description && (
                      <p className="text-sm text-slate-600 mt-1">{unit.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(unit)}
                      className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(unit.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-900">
                {editingId ? 'Edit Unit' : 'Tambah Unit'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Nama Unit <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Misal: pcs, box, kg"
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Deskripsi
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Keterangan tentang unit ini"
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all font-medium"
                >
                  {editingId ? 'Update' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
