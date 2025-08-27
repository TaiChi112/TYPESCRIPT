export interface ProposalSoftware {
  id: string;
  name: string;
  description?: string;
  category: string;
  pricing: string;
  features: string[];
  website?: string;
  company: string;
  rating?: number;
  reviewCount?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProposalSoftwareData {
  name: string;
  description?: string;
  category: string;
  pricing: string;
  features: string[];
  website?: string;
  company: string;
  rating?: number;
  reviewCount?: number;
}

export interface ProposalSoftwareResponse {
  data: ProposalSoftware[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
