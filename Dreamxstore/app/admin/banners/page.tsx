'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent } from '@/src/components/ui/card';
import { AdminService } from '@/src/lib/api/admin/adminService';
import type { Banner } from '@/src/lib/api/admin/types';

export default function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [formData, setFormData] = useState({
    image: '',
    title: '',
    buttonText: '',
    link: '',
    order: 0,
    isActive: true
  });

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const data = await AdminService.getBanners();
      setBanners(data);
    } catch (error) {
      console.error('[Banners] Error fetching:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingBanner) {
        await AdminService.updateBanner(editingBanner.id || (editingBanner as any)._id, formData);
        alert('Banner updated successfully!');
      } else {
        await AdminService.createBanner(formData);
        alert('Banner created successfully!');
      }
      
      setShowModal(false);
      setEditingBanner(null);
      setFormData({
        image: '',
        title: '',
        buttonText: '',
        link: '',
        order: 0,
        isActive: true
      });
      fetchBanners();
    } catch (error) {
      console.error('[Banners] Error saving:', error);
      alert('Failed to save banner');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this banner?')) return;

    try {
      await AdminService.deleteBanner(id);
      alert('Banner deleted successfully!');
      fetchBanners();
    } catch (error) {
      console.error('[Banners] Error deleting:', error);
      alert('Failed to delete banner');
    }
  };

  const handleToggle = async (id: string) => {
    try {
      await AdminService.toggleBanner(id);
      fetchBanners();
    } catch (error) {
      console.error('[Banners] Error toggling:', error);
    }
  };

  const openEditModal = (banner: Banner) => {
    setEditingBanner(banner);
    setFormData({
      image: banner.image,
      title: banner.title,
      buttonText: banner.buttonText,
      link: banner.link,
      order: banner.order,
      isActive: banner.isActive
    });
    setShowModal(true);
  };

  const openAddModal = () => {
    setEditingBanner(null);
    setFormData({
      image: '',
      title: '',
      buttonText: '',
      link: '',
      order: 0,
      isActive: true
    });
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Banner Ads Management</h1>
        <Button onClick={openAddModal} className="bg-purple-600 hover:bg-purple-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Banner
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {banners.map((banner) => (
          <Card key={banner.id || (banner as any)._id}>
            <CardContent className="p-6">
              <div className="flex gap-6">
                <img
                  src={banner.image}
                  alt={banner.title}
                  className="w-48 h-32 object-cover rounded"
                />
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-semibold">{banner.title}</h3>
                      <p className="text-gray-600 mt-1">Button: {banner.buttonText}</p>
                      <p className="text-gray-600">Link: {banner.link}</p>
                      <p className="text-gray-600">Order: {banner.order}</p>
                      <div className="mt-2">
                        <span className={`px-3 py-1 rounded-full text-sm ${banner.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {banner.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleToggle(banner.id || (banner as any)._id)}
                        >
                          {banner.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => openEditModal(banner)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDelete(banner.id || (banner as any)._id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">
                {editingBanner ? 'Edit Banner' : 'Add New Banner'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Image URL *</label>
                  <input
                    type="text"
                    required
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                    placeholder="Banner Title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Button Text *</label>
                  <input
                    type="text"
                    required
                    value={formData.buttonText}
                    onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                    placeholder="Shop Now"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Link *</label>
                  <input
                    type="text"
                    required
                    value={formData.link}
                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                    placeholder="/products or https://external-link.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Order (for sorting)</label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 mr-2"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium">
                    Active
                  </label>
                </div>

                <div className="flex gap-3 mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowModal(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1 bg-purple-600 hover:bg-purple-700">
                    {editingBanner ? 'Update' : 'Create'} Banner
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
