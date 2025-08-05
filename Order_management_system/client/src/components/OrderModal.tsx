import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X, Upload } from "lucide-react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useProducts } from "@/hooks/useProducts";
import { formatCurrency } from "@/lib/utils";

const orderFormSchema = z.object({
  customerName: z.string().min(1, "Customer name is required"),
  customerEmail: z.string().email("Valid email is required"),
  items: z.array(z.object({
    productId: z.string(),
    productName: z.string(),
    quantity: z.number().min(1),
    price: z.number().min(0),
  })).min(1, "At least one product must be selected"),
  notes: z.string().optional(),
});

type OrderFormData = z.infer<typeof orderFormSchema>;

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function OrderModal({ isOpen, onClose }: OrderModalProps) {
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: products = [] } = useProducts();

  const form = useForm<OrderFormData>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      customerName: "",
      customerEmail: "",
      items: [],
      notes: "",
    },
  });

  const createOrderMutation = useMutation({
    mutationFn: async (data: OrderFormData & { invoiceFile?: File }) => {
      const formData = new FormData();
      
      // Calculate total amount
      const totalAmount = data.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
      
      formData.append('customerName', data.customerName);
      formData.append('customerEmail', data.customerEmail);
      formData.append('totalAmount', totalAmount.toString());
      formData.append('items', JSON.stringify(data.items));
      formData.append('status', 'pending');
      if (data.notes) formData.append('notes', data.notes);
      if (data.invoiceFile) formData.append('invoice', data.invoiceFile);

      const response = await fetch('/api/orders', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to create order');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Order created successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      queryClient.invalidateQueries({ queryKey: ['/api/orders/stats/dashboard'] });
      onClose();
      form.reset();
      setSelectedProducts(new Set());
      setInvoiceFile(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create order. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleProductToggle = (productId: string, checked: boolean) => {
    const newSelected = new Set(selectedProducts);
    if (checked) {
      newSelected.add(productId);
    } else {
      newSelected.delete(productId);
    }
    setSelectedProducts(newSelected);

    // Update form items
    const selectedProductsList = products
      .filter(p => newSelected.has(p.id))
      .map(p => ({
        productId: p.id,
        productName: p.name,
        quantity: 1,
        price: parseFloat(p.price),
      }));

    form.setValue('items', selectedProductsList);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setInvoiceFile(file);
    } else {
      toast({
        title: "Invalid file",
        description: "Please select a PDF file.",
        variant: "destructive",
      });
    }
  };

  const onSubmit = (data: OrderFormData) => {
    createOrderMutation.mutate({ ...data, invoiceFile: invoiceFile || undefined });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Create New Order</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-1"
            >
              <X className="w-6 h-6" />
            </Button>
          </div>
        </div>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="customerName">Customer Name</Label>
              <Input
                id="customerName"
                {...form.register("customerName")}
                placeholder="Enter customer name"
                className="mt-1"
              />
              {form.formState.errors.customerName && (
                <p className="text-sm text-red-500 mt-1">
                  {form.formState.errors.customerName.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="customerEmail">Customer Email</Label>
              <Input
                id="customerEmail"
                type="email"
                {...form.register("customerEmail")}
                placeholder="customer@example.com"
                className="mt-1"
              />
              {form.formState.errors.customerEmail && (
                <p className="text-sm text-red-500 mt-1">
                  {form.formState.errors.customerEmail.message}
                </p>
              )}
            </div>
          </div>
          
          <div>
            <Label>Product Selection</Label>
            <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-lg p-3 mt-1">
              {products.map((product) => (
                <label key={product.id} className="flex items-center space-x-3">
                  <Checkbox
                    checked={selectedProducts.has(product.id)}
                    onCheckedChange={(checked) => handleProductToggle(product.id, !!checked)}
                  />
                  <img
                    src={product.imageUrl || '/placeholder-product.jpg'}
                    alt={product.name}
                    className="w-8 h-8 rounded object-cover"
                  />
                  <span className="text-sm text-gray-900 dark:text-white flex-1">
                    {product.name} - {formatCurrency(product.price)}
                  </span>
                </label>
              ))}
            </div>
            {form.formState.errors.items && (
              <p className="text-sm text-red-500 mt-1">
                {form.formState.errors.items.message}
              </p>
            )}
          </div>
          
          <div>
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              {...form.register("notes")}
              placeholder="Additional notes for the order..."
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="invoice">Invoice Upload (Optional)</Label>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center mt-1">
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500 dark:text-gray-400 mb-2">
                {invoiceFile ? invoiceFile.name : "Drop PDF file here or click to browse"}
              </p>
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
                id="invoice"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('invoice')?.click()}
              >
                Browse Files
              </Button>
            </div>
          </div>
          
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createOrderMutation.isPending}
              className="min-w-[120px]"
            >
              {createOrderMutation.isPending ? "Creating..." : "Create Order"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
