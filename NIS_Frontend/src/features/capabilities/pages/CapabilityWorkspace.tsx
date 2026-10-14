import React, { useState, useMemo } from 'react';
import { WorkspaceShell } from '../../../components/layout/WorkspaceShell';
import { useProducts, useProductMutations } from '../../../hooks/useProducts';
import type { ProductItem, ProductInput } from '../../../services/api/products.api';
import { 
  Package, 
  Search, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  Users, 
  Briefcase, 
  X, 
  Sparkles,
  Layers
} from 'lucide-react';

export const CapabilityWorkspace: React.FC = () => {
  const { data: products, isLoading, isError } = useProducts();
  const { createMutation, updateMutation, deleteMutation } = useProductMutations();

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);

  // Form state
  const [formData, setFormData] = useState<ProductInput>({
    name: '',
    tagline: '',
    category: '',
    description: '',
    features: '',
    target_audience: '',
    business_model: '',
    status: 'ACTIVE'
  });

  const categories = useMemo(() => {
    if (!products) return ['ALL'];
    const unique = Array.from(new Set(products.map(p => p.category).filter(Boolean))) as string[];
    return ['ALL', ...unique];
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    return products.filter(p => {
      const matchesSearch = 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.tagline && p.tagline.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.category && p.category.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      tagline: '',
      category: 'Healthtech & Maternity',
      description: '',
      features: '',
      target_audience: '',
      business_model: '',
      status: 'ACTIVE'
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product: ProductItem) => {
    setEditingProduct(product);
    let parsedFeatures = product.features || '';
    if (parsedFeatures.startsWith('[')) {
      try {
        const arr = JSON.parse(parsedFeatures);
        if (Array.isArray(arr)) {
          parsedFeatures = arr.join('\n');
        }
      } catch (e) {
        // fallback to raw
      }
    }
    setFormData({
      name: product.name,
      tagline: product.tagline || '',
      category: product.category || '',
      description: product.description,
      features: parsedFeatures,
      target_audience: product.target_audience || '',
      business_model: product.business_model || '',
      status: product.status || 'ACTIVE'
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.description.trim()) {
      alert('Please fill in the Product Name and Description.');
      return;
    }

    // Format features as JSON array string if multiline
    let formattedFeatures = formData.features?.trim() || '';
    if (formattedFeatures && !formattedFeatures.startsWith('[')) {
      const lines = formattedFeatures.split('\n').map(l => l.trim()).filter(Boolean);
      formattedFeatures = JSON.stringify(lines);
    }

    const payload: ProductInput = {
      ...formData,
      features: formattedFeatures
    };

    try {
      if (editingProduct) {
        await updateMutation.mutateAsync({ id: editingProduct.id, data: payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      handleCloseModal();
    } catch (err: any) {
      alert(`Failed to save product: ${err.message || 'Unknown error'}`);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete the product "${name}"? This will remove it from the database.`)) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (err: any) {
        alert(`Failed to delete product: ${err.message || 'Unknown error'}`);
      }
    }
  };

  const parseFeaturesList = (featuresStr?: string): string[] => {
    if (!featuresStr) return [];
    if (featuresStr.startsWith('[')) {
      try {
        const arr = JSON.parse(featuresStr);
        if (Array.isArray(arr)) return arr;
      } catch (e) {
        // ignore
      }
    }
    return featuresStr.split('\n').map(s => s.trim()).filter(Boolean);
  };

  return (
    <WorkspaceShell
      title="Products & Capabilities"
      subtitle="Central database catalog of present products and solutions available for client matching."
      breadcrumbs={[
        { label: 'Capabilities', path: '/capabilities' }
      ]}
      primaryAction={{
        label: '+ Add Product',
        onClick: handleOpenAddModal
      }}
      isLoading={isLoading}
      isError={isError}
      isEmpty={!isLoading && !isError && (!products || products.length === 0)}
      emptyStateMessage="No products recorded in the database yet."
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
        
        {/* Metric Summary Ribbon */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 'var(--space-4)',
        }}>
          <div style={{
            background: '#FFFFFF',
            padding: 'var(--space-5)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-4)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
          }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: 'var(--radius-md)',
              background: '#EEF2FF',
              color: 'var(--color-brand-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Package size={22} />
            </div>
            <div>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Present Products
              </span>
              <h3 style={{ margin: '2px 0 0 0', fontSize: '24px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                {products?.length || 0}
              </h3>
            </div>
          </div>

          <div style={{
            background: '#FFFFFF',
            padding: 'var(--space-5)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-4)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
          }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: 'var(--radius-md)',
              background: '#ECFDF5',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Sparkles size={22} />
            </div>
            <div>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Active Platforms
              </span>
              <h3 style={{ margin: '2px 0 0 0', fontSize: '24px', fontWeight: 700, color: '#059669' }}>
                {products?.filter(p => p.status === 'ACTIVE').length || 0}
              </h3>
            </div>
          </div>

          <div style={{
            background: '#FFFFFF',
            padding: 'var(--space-5)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-4)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
          }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: 'var(--radius-md)',
              background: '#F8FAFC',
              color: '#475569',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Layers size={22} />
            </div>
            <div>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Product Verticals
              </span>
              <h3 style={{ margin: '2px 0 0 0', fontSize: '24px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                {Math.max(categories.length - 1, 0)}
              </h3>
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 'var(--space-4)',
          background: '#FFFFFF',
          padding: 'var(--space-4) var(--space-5)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)'
        }}>
          {/* Search Box */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            background: '#F8FAFC',
            padding: '8px 14px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
            width: '100%',
            maxWidth: '360px'
          }}>
            <Search size={18} color="#94A3B8" />
            <input 
              type="text"
              placeholder="Search products, keywords, capabilities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                border: 'none',
                background: 'transparent',
                outline: 'none',
                width: '100%',
                fontSize: '14px',
                color: 'var(--color-text-primary)'
              }}
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#94A3B8' }}
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  border: '1px solid',
                  borderColor: selectedCategory === cat ? 'var(--color-brand-primary)' : 'var(--color-border)',
                  background: selectedCategory === cat ? 'var(--color-brand-primary)' : '#FFFFFF',
                  color: selectedCategory === cat ? '#FFFFFF' : 'var(--color-text-secondary)',
                  fontSize: '12px',
                  fontWeight: selectedCategory === cat ? 600 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {cat === 'ALL' ? 'All Products' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
          gap: 'var(--space-6)'
        }}>
          {filteredProducts.map((product) => {
            const features = parseFeaturesList(product.features);

            return (
              <div
                key={product.id}
                style={{
                  background: '#FFFFFF',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--color-border)',
                  padding: 'var(--space-6)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-4)',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.03)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  position: 'relative'
                }}
              >
                {/* Card Top: Category + Status Badge */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-2)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <span style={{
                      fontSize: '12px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      background: '#EEF2FF',
                      color: 'var(--color-brand-primary)',
                      padding: '3px 10px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid #E0E7FF'
                    }}>
                      {product.category || 'Portfolio Product'}
                    </span>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-sm)',
                      background: product.status === 'ACTIVE' ? '#ECFDF5' : '#FFFBEB',
                      color: product.status === 'ACTIVE' ? '#047857' : '#B45309',
                      border: `1px solid ${product.status === 'ACTIVE' ? '#A7F3D0' : '#FDE68A'}`
                    }}>
                      {product.status || 'ACTIVE'}
                    </span>
                  </div>

                  {/* Actions: Edit & Delete */}
                  <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                    <button
                      type="button"
                      title="Modify product"
                      onClick={() => handleOpenEditModal(product)}
                      style={{
                        background: '#F8FAFC',
                        border: '1px solid var(--color-border)',
                        color: '#475569',
                        padding: '5px 8px',
                        borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '12px',
                        fontWeight: 500,
                        transition: 'background 0.15s ease'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#EEF2FF'; e.currentTarget.style.color = '#3730A3'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = '#F8FAFC'; e.currentTarget.style.color = '#475569'; }}
                    >
                      <Edit3 size={13} />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      title="Delete product"
                      onClick={() => handleDelete(product.id, product.name)}
                      style={{
                        background: '#F8FAFC',
                        border: '1px solid var(--color-border)',
                        color: '#94A3B8',
                        padding: '5px 8px',
                        borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        transition: 'color 0.15s ease'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = '#DC2626'; e.currentTarget.style.background = '#FEF2F2'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = '#94A3B8'; e.currentTarget.style.background = '#F8FAFC'; }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Name & Tagline */}
                <div>
                  <h3 style={{ margin: '0 0 var(--space-1) 0', fontSize: '20px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                    {product.name}
                  </h3>
                  {product.tagline && (
                    <p style={{ margin: 0, fontSize: '13px', fontStyle: 'italic', color: 'var(--color-brand-primary)', fontWeight: 500 }}>
                      "{product.tagline}"
                    </p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <p style={{
                    margin: 0,
                    fontSize: '14px',
                    lineHeight: 1.6,
                    color: 'var(--color-text-secondary)',
                    display: '-webkit-box',
                    WebkitLineClamp: 4,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {product.description}
                  </p>
                </div>

                {/* Core Capabilities / Features */}
                {features.length > 0 && (
                  <div>
                    <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#64748B', display: 'block', marginBottom: 'var(--space-2)', letterSpacing: '0.04em' }}>
                      Key Features & Capabilities
                    </span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {features.slice(0, 4).map((feat, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                          <CheckCircle2 size={14} color="#10B981" style={{ flexShrink: 0, marginTop: '2px' }} />
                          <span style={{ fontSize: '12px', color: '#334155', lineHeight: 1.4 }}>
                            {feat}
                          </span>
                        </div>
                      ))}
                      {features.length > 4 && (
                        <span style={{ fontSize: '11px', color: 'var(--color-brand-primary)', fontWeight: 600, paddingLeft: '20px' }}>
                          +{features.length - 4} additional capabilities
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Target Audience & Business Model Footer */}
                <div style={{
                  borderTop: '1px solid var(--color-border)',
                  paddingTop: 'var(--space-3)',
                  marginTop: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-2)'
                }}>
                  {product.target_audience && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                      <Users size={14} color="#64748B" style={{ flexShrink: 0 }} />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        <strong style={{ color: '#334155' }}>Audience:</strong> {product.target_audience}
                      </span>
                    </div>
                  )}

                  {product.business_model && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                      <Briefcase size={14} color="#64748B" style={{ flexShrink: 0 }} />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        <strong style={{ color: '#334155' }}>Model:</strong> {product.business_model}
                      </span>
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>

      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: 'var(--space-4)'
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: 'var(--radius-xl)',
            width: '100%',
            maxWidth: '680px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: 'var(--space-7)',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-5)'
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: 'var(--space-4)' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  {editingProduct ? 'Modify Product Details' : 'Add New Product to Catalog'}
                </h2>
                <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                  This product will be saved directly into the database and available for matching.
                </p>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#64748B',
                  padding: '4px',
                  borderRadius: 'var(--radius-sm)'
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. JanmaSethu"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--color-border)',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Category *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Healthtech, AI-Native EdTech"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--color-border)',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Tagline / High-Concept Pitch
                </label>
                <input
                  type="text"
                  placeholder="e.g. Bridge to Parenthood / Bloom Your Social Footprint"
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Description / Overview *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Detailed summary of the product, purpose, and problem it solves..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                    fontSize: '14px',
                    lineHeight: 1.5,
                    boxSizing: 'border-box',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Key Features & Capabilities (One per line)
                </label>
                <span style={{ display: 'block', fontSize: '12px', color: '#64748B', marginBottom: '6px' }}>
                  Enter each core feature or offering on a new line.
                </span>
                <textarea
                  rows={4}
                  placeholder={"Journey-Aware Adaptive Interface\nSakhi AI Chat Companion (WhatsApp & Web)\nClinician-Reviewed Knowledge Hub\nB2B Clinic Lead Portal"}
                  value={formData.features}
                  onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                    fontSize: '13px',
                    fontFamily: 'monospace',
                    boxSizing: 'border-box',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Target Audience / Users
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Couples, B2B Clinics, Developers"
                    value={formData.target_audience}
                    onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--color-border)',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Business Model / Pricing
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. B2C Subscriptions & B2B SaaS"
                    value={formData.business_model}
                    onChange={(e) => setFormData({ ...formData, business_model: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--color-border)',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Product Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                    fontSize: '14px',
                    background: '#FFFFFF',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="BETA">BETA</option>
                  <option value="IN_DEVELOPMENT">IN DEVELOPMENT</option>
                </select>
              </div>

              {/* Modal Actions */}
              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 'var(--space-3)',
                borderTop: '1px solid var(--color-border)',
                paddingTop: 'var(--space-4)',
                marginTop: 'var(--space-2)'
              }}>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  style={{
                    padding: '10px 18px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                    background: '#FFFFFF',
                    color: 'var(--color-text-secondary)',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  style={{
                    padding: '10px 22px',
                    borderRadius: 'var(--radius-md)',
                    border: 'none',
                    background: 'var(--color-brand-primary)',
                    color: '#FFFFFF',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {createMutation.isPending || updateMutation.isPending ? 'Saving to Database...' : editingProduct ? 'Save Modifications' : 'Add to Catalog'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </WorkspaceShell>
  );
};
