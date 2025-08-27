'use client'

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { proposalSoftwareApi } from '@/lib/api';
import { CreateProposalSoftwareData } from '@/lib/types';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useLoading } from '@/hooks/useLoading';
import { Plus, X, Loader2, AlertCircle } from 'lucide-react';

const proposalSoftwareSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  description: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  pricing: z.string().min(1, 'Pricing is required'),
  features: z.array(z.string()).default([]),
  website: z.string().url().optional().or(z.literal('')),
  company: z.string().min(1, 'Company is required'),
  rating: z.number().min(0).max(5).optional(),
  reviewCount: z.number().min(0).optional(),
});

interface ProposalSoftwareFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function ProposalSoftwareForm({ onSuccess, onCancel }: ProposalSoftwareFormProps) {
  const { loading, withLoading } = useLoading();
  const { error, handleError, clearError } = useErrorHandler();
  const [features, setFeatures] = useState<string[]>([]);
  const [newFeature, setNewFeature] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<CreateProposalSoftwareData>({
    resolver: zodResolver(proposalSoftwareSchema),
    defaultValues: {
      features: [],
    },
  });

  const addFeature = () => {
    if (newFeature.trim() && !features.includes(newFeature.trim())) {
      const updatedFeatures = [...features, newFeature.trim()];
      setFeatures(updatedFeatures);
      setValue('features', updatedFeatures);
      setNewFeature('');
    }
  };

  const removeFeature = (featureToRemove: string) => {
    const updatedFeatures = features.filter(feature => feature !== featureToRemove);
    setFeatures(updatedFeatures);
    setValue('features', updatedFeatures);
  };

  const onSubmit = async (data: CreateProposalSoftwareData) => {
    clearError();
    try {
      await withLoading(async () => {
        await proposalSoftwareApi.create({
          ...data,
          features,
          rating: data.rating ? Number(data.rating) : undefined,
          reviewCount: data.reviewCount ? Number(data.reviewCount) : undefined,
        });
      });
      onSuccess();
    } catch (error) {
      handleError(error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Name */}
      <div className="form-group">
        <label htmlFor="name" className="form-label">
          Software Name *
        </label>
        <input
          {...register('name')}
          type="text"
          id="name"
          className="form-input"
          placeholder="e.g., PandaDoc"
        />
        {errors.name && (
          <p className="text-red-600 text-sm">{errors.name.message}</p>
        )}
      </div>

      {/* Company */}
      <div className="form-group">
        <label htmlFor="company" className="form-label">
          Company *
        </label>
        <input
          {...register('company')}
          type="text"
          id="company"
          className="form-input"
          placeholder="e.g., PandaDoc Inc."
        />
        {errors.company && (
          <p className="text-red-600 text-sm">{errors.company.message}</p>
        )}
      </div>

      {/* Category */}
      <div className="form-group">
        <label htmlFor="category" className="form-label">
          Category *
        </label>
        <select {...register('category')} id="category" className="form-select">
          <option value="">Select a category</option>
          <option value="Document Automation">Document Automation</option>
          <option value="Sales Proposals">Sales Proposals</option>
          <option value="CRM & Sales">CRM & Sales</option>
          <option value="Interactive Proposals">Interactive Proposals</option>
          <option value="Contract Management">Contract Management</option>
          <option value="E-signature">E-signature</option>
          <option value="Other">Other</option>
        </select>
        {errors.category && (
          <p className="text-red-600 text-sm">{errors.category.message}</p>
        )}
      </div>

      {/* Pricing */}
      <div className="form-group">
        <label htmlFor="pricing" className="form-label">
          Pricing *
        </label>
        <input
          {...register('pricing')}
          type="text"
          id="pricing"
          className="form-input"
          placeholder="e.g., Starting at $19/month"
        />
        {errors.pricing && (
          <p className="text-red-600 text-sm">{errors.pricing.message}</p>
        )}
      </div>

      {/* Website */}
      <div className="form-group">
        <label htmlFor="website" className="form-label">
          Website URL
        </label>
        <input
          {...register('website')}
          type="url"
          id="website"
          className="form-input"
          placeholder="https://example.com"
        />
        {errors.website && (
          <p className="text-red-600 text-sm">{errors.website.message}</p>
        )}
      </div>

      {/* Description */}
      <div className="form-group">
        <label htmlFor="description" className="form-label">
          Description
        </label>
        <textarea
          {...register('description')}
          id="description"
          rows={4}
          className="form-textarea"
          placeholder="Brief description of the software..."
        />
        {errors.description && (
          <p className="text-red-600 text-sm">{errors.description.message}</p>
        )}
      </div>

      {/* Features */}
      <div className="form-group">
        <label htmlFor="features-input" className="form-label">Features</label>
        <div className="flex gap-2 mb-2">
          <input
            id="features-input"
            type="text"
            value={newFeature}
            onChange={(e) => setNewFeature(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addFeature();
              }
            }}
            className="form-input flex-1"
            placeholder="Add a feature..."
          />
          <button
            type="button"
            onClick={addFeature}
            className="btn-secondary flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {features.map((feature) => (
            <span
              key={feature}
              className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm"
            >
              {feature}
              <button
                type="button"
                onClick={() => removeFeature(feature)}
                className="text-blue-600 hover:text-blue-800"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Rating and Review Count */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="form-group">
          <label htmlFor="rating" className="form-label">
            Rating (0-5)
          </label>
          <input
            {...register('rating', { valueAsNumber: true })}
            type="number"
            id="rating"
            min="0"
            max="5"
            step="0.1"
            className="form-input"
            placeholder="4.5"
          />
          {errors.rating && (
            <p className="text-red-600 text-sm">{errors.rating.message}</p>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="reviewCount" className="form-label">
            Review Count
          </label>
          <input
            {...register('reviewCount', { valueAsNumber: true })}
            type="number"
            id="reviewCount"
            min="0"
            className="form-input"
            placeholder="1250"
          />
          {errors.reviewCount && (
            <p className="text-red-600 text-sm">{errors.reviewCount.message}</p>
          )}
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-4 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="btn-secondary"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn-primary flex items-center gap-2"
          disabled={loading}
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {loading ? 'Creating...' : 'Create Software'}
        </button>
      </div>
    </form>
  );
}
