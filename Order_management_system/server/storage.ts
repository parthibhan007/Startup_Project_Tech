import { type Customer, type Product, type Order, type InsertCustomer, type InsertProduct, type InsertOrder, type UpdateOrderStatus, type OrderSearch } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Customers
  getCustomer(id: string): Promise<Customer | undefined>;
  getCustomerByEmail(email: string): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  getCustomers(): Promise<Customer[]>;

  // Products
  getProduct(id: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<boolean>;
  getProducts(): Promise<Product[]>;
  searchProducts(query: string): Promise<Product[]>;

  // Orders
  getOrder(id: string): Promise<Order | undefined>;
  getOrderByNumber(orderNumber: string): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: string, status: UpdateOrderStatus): Promise<Order | undefined>;
  updateOrderInvoiceUrl(id: string, invoiceUrl: string): Promise<Order | undefined>;
  getOrders(): Promise<Order[]>;
  searchOrders(params: OrderSearch): Promise<{ orders: Order[], total: number }>;
  getOrdersByCustomer(customerId: string): Promise<Order[]>;
  getOrderStats(): Promise<{
    totalOrders: number;
    totalRevenue: number;
    activeOrders: number;
    recentOrders: Order[];
  }>;
}

export class MemStorage implements IStorage {
  private customers: Map<string, Customer>;
  private products: Map<string, Product>;
  private orders: Map<string, Order>;
  private orderCounter: number;

  constructor() {
    this.customers = new Map();
    this.products = new Map();
    this.orders = new Map();
    this.orderCounter = 1000;

    // Initialize with sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Sample products
    const sampleProducts: Product[] = [
      {
        id: randomUUID(),
        name: "Premium Wireless Headphones",
        description: "High-quality wireless headphones with noise cancellation",
        price: "299.99",
        imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
        category: "Electronics",
        stock: "50",
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        name: "Gaming Laptop Pro",
        description: "High-performance gaming laptop with RTX graphics",
        price: "1299.00",
        imageUrl: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
        category: "Computers",
        stock: "25",
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        name: "Smartphone 15 Pro",
        description: "Latest smartphone with advanced camera system",
        price: "999.00",
        imageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
        category: "Mobile",
        stock: "75",
        createdAt: new Date(),
      },
    ];

    sampleProducts.forEach(product => {
      this.products.set(product.id, product);
    });
  }

  private generateOrderNumber(): string {
    return `ORD-${new Date().getFullYear()}-${String(this.orderCounter++).padStart(4, '0')}`;
  }

  // Customer methods
  async getCustomer(id: string): Promise<Customer | undefined> {
    return this.customers.get(id);
  }

  async getCustomerByEmail(email: string): Promise<Customer | undefined> {
    return Array.from(this.customers.values()).find(customer => customer.email === email);
  }

  async createCustomer(insertCustomer: InsertCustomer): Promise<Customer> {
    const id = randomUUID();
    const customer: Customer = {
      ...insertCustomer,
      id,
      createdAt: new Date(),
    };
    this.customers.set(id, customer);
    return customer;
  }

  async getCustomers(): Promise<Customer[]> {
    return Array.from(this.customers.values());
  }

  // Product methods
  async getProduct(id: string): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = randomUUID();
    const product: Product = {
      ...insertProduct,
      id,
      createdAt: new Date(),
    };
    this.products.set(id, product);
    return product;
  }

  async updateProduct(id: string, updateData: Partial<InsertProduct>): Promise<Product | undefined> {
    const product = this.products.get(id);
    if (!product) return undefined;

    const updatedProduct: Product = {
      ...product,
      ...updateData,
    };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  async deleteProduct(id: string): Promise<boolean> {
    return this.products.delete(id);
  }

  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async searchProducts(query: string): Promise<Product[]> {
    const products = Array.from(this.products.values());
    if (!query) return products;

    const searchTerm = query.toLowerCase();
    return products.filter(product =>
      product.name.toLowerCase().includes(searchTerm) ||
      product.description?.toLowerCase().includes(searchTerm) ||
      product.category?.toLowerCase().includes(searchTerm)
    );
  }

  // Order methods
  async getOrder(id: string): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async getOrderByNumber(orderNumber: string): Promise<Order | undefined> {
    return Array.from(this.orders.values()).find(order => order.orderNumber === orderNumber);
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = randomUUID();
    const orderNumber = this.generateOrderNumber();
    
    // Create or get customer
    let customer = await this.getCustomerByEmail(insertOrder.customerEmail);
    if (!customer) {
      customer = await this.createCustomer({
        name: insertOrder.customerName,
        email: insertOrder.customerEmail,
      });
    }

    const order: Order = {
      ...insertOrder,
      id,
      orderNumber,
      customerId: customer.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    this.orders.set(id, order);
    return order;
  }

  async updateOrderStatus(id: string, statusUpdate: UpdateOrderStatus): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;

    const updatedOrder: Order = {
      ...order,
      status: statusUpdate.status,
      updatedAt: new Date(),
    };
    
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }

  async updateOrderInvoiceUrl(id: string, invoiceUrl: string): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;

    const updatedOrder: Order = {
      ...order,
      invoiceUrl,
      updatedAt: new Date(),
    };
    
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }

  async getOrders(): Promise<Order[]> {
    return Array.from(this.orders.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async searchOrders(params: OrderSearch): Promise<{ orders: Order[], total: number }> {
    let orders = Array.from(this.orders.values());

    // Apply search filter
    if (params.search) {
      const searchTerm = params.search.toLowerCase();
      orders = orders.filter(order =>
        order.orderNumber.toLowerCase().includes(searchTerm) ||
        order.customerName.toLowerCase().includes(searchTerm) ||
        order.customerEmail.toLowerCase().includes(searchTerm)
      );
    }

    // Apply status filter
    if (params.status) {
      orders = orders.filter(order => order.status === params.status);
    }

    // Apply date filters
    if (params.dateFrom) {
      const fromDate = new Date(params.dateFrom);
      orders = orders.filter(order => new Date(order.createdAt) >= fromDate);
    }

    if (params.dateTo) {
      const toDate = new Date(params.dateTo);
      orders = orders.filter(order => new Date(order.createdAt) <= toDate);
    }

    // Apply sorting
    const sortBy = params.sortBy || 'createdAt';
    const sortOrder = params.sortOrder || 'desc';
    
    orders.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'createdAt':
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        case 'totalAmount':
          aValue = parseFloat(a.totalAmount);
          bValue = parseFloat(b.totalAmount);
          break;
        case 'customerName':
          aValue = a.customerName.toLowerCase();
          bValue = b.customerName.toLowerCase();
          break;
        default:
          aValue = a.createdAt;
          bValue = b.createdAt;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    const total = orders.length;

    // Apply pagination
    const page = params.page || 1;
    const limit = params.limit || 10;
    const offset = (page - 1) * limit;
    const paginatedOrders = orders.slice(offset, offset + limit);

    return { orders: paginatedOrders, total };
  }

  async getOrdersByCustomer(customerId: string): Promise<Order[]> {
    return Array.from(this.orders.values())
      .filter(order => order.customerId === customerId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getOrderStats(): Promise<{
    totalOrders: number;
    totalRevenue: number;
    activeOrders: number;
    recentOrders: Order[];
  }> {
    const orders = Array.from(this.orders.values());
    
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.totalAmount), 0);
    const activeOrders = orders.filter(order => ['pending', 'processing', 'shipped'].includes(order.status)).length;
    const recentOrders = orders
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);

    return {
      totalOrders,
      totalRevenue,
      activeOrders,
      recentOrders,
    };
  }
}

export const storage = new MemStorage();
