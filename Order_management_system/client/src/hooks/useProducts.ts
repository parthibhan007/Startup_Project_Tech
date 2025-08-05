import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Product } from "@shared/schema";

export function useProducts(search?: string) {
  const queryParams = search ? `?search=${encodeURIComponent(search)}` : '';
  
  return useQuery<Product[]>({
    queryKey: ['/api/products', search],
    queryFn: async () => {
      const response = await fetch(`/api/products${queryParams}`);
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      return response.json();
    },
  });
}

export function useProduct(id: string) {
  return useQuery<Product>({
    queryKey: ['/api/products', id],
    enabled: !!id,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productData: any) => {
      return apiRequest('POST', '/api/products', productData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
    },
  });
}
