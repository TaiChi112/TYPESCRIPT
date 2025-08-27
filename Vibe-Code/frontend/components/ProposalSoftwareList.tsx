'use client'

import { useState, useEffect } from 'react';
import { proposalSoftwareApi } from '@/lib/api';
import { ProposalSoftware } from '@/lib/types';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useLoading } from '@/hooks/useLoading';
import { ErrorDisplay, LoadingSkeleton, EmptyState } from '@/components/ui/display';
import { Star, ExternalLink, Building, Tag } from 'lucide-react';

interface ProposalSoftwareListProps {
  searchTerm: string;
  selectedCategory: string;
}

export function ProposalSoftwareList({ searchTerm, selectedCategory }: ProposalSoftwareListProps) {
  const [software, setSoftware] = useState<ProposalSoftware[]>([]);
  const { loading, withLoading } = useLoading(true);
  const { error, handleError, clearError } = useErrorHandler();
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchSoftware();
  }, [searchTerm, selectedCategory, page]);

  const fetchSoftware = async () => {
    clearError();
    try {
      await withLoading(async () => {
        const response = await proposalSoftwareApi.getAll({
          page,
          limit: 10,
          category: selectedCategory || undefined,
          search: searchTerm || undefined,
        });
        setSoftware(response.data);
        setTotalPages(response.pagination.pages);
      });
    } catch (err) {
      handleError('Failed to fetch proposal software');
      console.error('Error fetching software:', err);
    }
  };

  const renderStars = (rating?: number) => {
    if (!rating) return null;
    
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <Star key="half" className="w-4 h-4 fill-yellow-400/50 text-yellow-400" />
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />
      );
    }

    return stars;
  };

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return <ErrorDisplay error={error} onRetry={fetchSoftware} />;
  }

  if (software.length === 0) {
    return <EmptyState message="No proposal software found matching your criteria." />;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {software.map((item) => (
          <div key={item.id} className="card p-6 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {item.name}
                  </h3>
                  {item.website && (
                    <a
                      href={item.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-700"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                  <div className="flex items-center gap-1">
                    <Building className="w-4 h-4" />
                    {item.company}
                  </div>
                  <div className="flex items-center gap-1">
                    <Tag className="w-4 h-4" />
                    {item.category}
                  </div>
                </div>

                {item.rating && (
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex gap-1">
                      {renderStars(item.rating)}
                    </div>
                    <span className="text-sm font-medium">{item.rating}</span>
                    {item.reviewCount && (
                      <span className="text-sm text-gray-500">
                        ({item.reviewCount} reviews)
                      </span>
                    )}
                  </div>
                )}

                {item.description && (
                  <p className="text-gray-600 mb-4">{item.description}</p>
                )}

                {item.features.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Key Features:</h4>
                    <div className="flex flex-wrap gap-2">
                      {item.features.slice(0, 6).map((feature) => (
                        <span
                          key={`${item.id}-${feature}`}
                          className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm"
                        >
                          {feature}
                        </span>
                      ))}
                      {item.features.length > 6 && (
                        <span className="text-gray-500 text-sm">
                          +{item.features.length - 6} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="text-right ml-4">
                <div className="bg-green-50 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  {item.pricing}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          <div className="flex items-center gap-2">
            {[...Array(totalPages)].map((_, i) => {
              const pageNumber = i + 1;
              return (
                <button
                  key={`page-${pageNumber}`}
                  onClick={() => setPage(pageNumber)}
                  className={`px-3 py-2 rounded ${
                    page === pageNumber
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {pageNumber}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
