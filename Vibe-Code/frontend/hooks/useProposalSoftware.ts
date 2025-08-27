'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { proposalSoftwareApi } from '@/lib/api'
import { CreateProposalSoftwareData } from '@/lib/types'

export const QUERY_KEYS = {
  proposalSoftware: ['proposalSoftware'] as const,
  proposalSoftwareList: (params?: any) => ['proposalSoftware', 'list', params] as const,
  proposalSoftwareDetail: (id: string) => ['proposalSoftware', 'detail', id] as const,
  categories: ['proposalSoftware', 'categories'] as const,
}

export function useProposalSoftwareList(params?: {
  page?: number
  limit?: number
  category?: string
  search?: string
}) {
  return useQuery({
    queryKey: QUERY_KEYS.proposalSoftwareList(params),
    queryFn: () => proposalSoftwareApi.getAll(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useProposalSoftware(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.proposalSoftwareDetail(id),
    queryFn: () => proposalSoftwareApi.getById(id),
    enabled: !!id,
  })
}

export function useCategories() {
  return useQuery({
    queryKey: QUERY_KEYS.categories,
    queryFn: () => proposalSoftwareApi.getCategories(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

export function useCreateProposalSoftware() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateProposalSoftwareData) => proposalSoftwareApi.create(data),
    onSuccess: () => {
      // Invalidate and refetch proposal software list
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.proposalSoftware })
    },
  })
}

export function useUpdateProposalSoftware() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateProposalSoftwareData> }) =>
      proposalSoftwareApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.proposalSoftwareDetail(id) })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.proposalSoftware })
    },
  })
}

export function useDeleteProposalSoftware() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => proposalSoftwareApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.proposalSoftware })
    },
  })
}
