import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertOrderSchema, insertProductSchema, updateOrderStatusSchema, orderSearchSchema } from "@shared/schema";
import PDFDocument from 'pdfkit';
import { Readable } from 'stream';
import multer from 'multer';

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Order routes
  app.get("/api/orders", async (req, res) => {
    try {
      const searchParams = orderSearchSchema.parse({
        search: req.query.search as string,
        status: req.query.status as string,
        dateFrom: req.query.dateFrom as string,
        dateTo: req.query.dateTo as string,
        sortBy: req.query.sortBy as string,
        sortOrder: req.query.sortOrder as string,
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      });

      const result = await storage.searchOrders(searchParams);
      res.json(result);
    } catch (error) {
      res.status(400).json({ message: "Invalid search parameters" });
    }
  });

  app.get("/api/orders/:id", async (req, res) => {
    try {
      const order = await storage.getOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  app.post("/api/orders", upload.single('invoice'), async (req, res) => {
    try {
      const orderData = insertOrderSchema.parse(req.body);
      
      // Create order
      const order = await storage.createOrder(orderData);
      
      // Generate PDF invoice if no file uploaded
      let invoiceUrl = null;
      if (req.file) {
        // Handle uploaded PDF file
        // In a real app, this would be uploaded to S3
        invoiceUrl = `/api/invoices/${order.id}.pdf`;
        await storage.updateOrderInvoiceUrl(order.id, invoiceUrl);
      } else {
        // Generate PDF invoice
        const pdfBuffer = await generateInvoicePDF(order);
        invoiceUrl = `/api/invoices/${order.id}.pdf`;
        await storage.updateOrderInvoiceUrl(order.id, invoiceUrl);
        
        // Store PDF buffer (in real app, upload to S3)
        (global as any).invoiceBuffers = (global as any).invoiceBuffers || new Map();
        (global as any).invoiceBuffers.set(order.id, pdfBuffer);
      }

      // Send mock SNS notification
      console.log(`[SNS] Order created notification sent for order ${order.orderNumber} to ${order.customerEmail}`);

      const updatedOrder = await storage.getOrder(order.id);
      res.status(201).json(updatedOrder);
    } catch (error) {
      console.error('Order creation error:', error);
      res.status(400).json({ message: "Failed to create order" });
    }
  });

  app.put("/api/orders/:id/status", async (req, res) => {
    try {
      const statusUpdate = updateOrderStatusSchema.parse(req.body);
      const order = await storage.updateOrderStatus(req.params.id, statusUpdate);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      // Send mock SNS notification for status updates
      console.log(`[SNS] Order status update notification sent for order ${order.orderNumber} - Status: ${order.status}`);

      res.json(order);
    } catch (error) {
      res.status(400).json({ message: "Failed to update order status" });
    }
  });

  // Get order statistics
  app.get("/api/orders/stats/dashboard", async (req, res) => {
    try {
      const stats = await storage.getOrderStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch order statistics" });
    }
  });

  // Product routes
  app.get("/api/products", async (req, res) => {
    try {
      const search = req.query.search as string;
      const products = search 
        ? await storage.searchProducts(search)
        : await storage.getProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  app.post("/api/products", async (req, res) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(productData);
      res.status(201).json(product);
    } catch (error) {
      res.status(400).json({ message: "Failed to create product" });
    }
  });

  // Customer routes
  app.get("/api/customers", async (req, res) => {
    try {
      const customers = await storage.getCustomers();
      res.json(customers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch customers" });
    }
  });

  app.get("/api/customers/:id/orders", async (req, res) => {
    try {
      const orders = await storage.getOrdersByCustomer(req.params.id);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch customer orders" });
    }
  });

  // Invoice routes
  app.get("/api/invoices/:orderId.pdf", async (req, res) => {
    try {
      const order = await storage.getOrder(req.params.orderId);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      // Check if we have a stored PDF buffer
      const buffers = (global as any).invoiceBuffers || new Map();
      let pdfBuffer = buffers.get(req.params.orderId);
      
      if (!pdfBuffer) {
        // Generate PDF on demand
        pdfBuffer = await generateInvoicePDF(order);
        buffers.set(req.params.orderId, pdfBuffer);
      }

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="invoice-${order.orderNumber}.pdf"`);
      res.send(pdfBuffer);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate invoice" });
    }
  });

  // Export routes
  app.get("/api/orders/export/json", async (req, res) => {
    try {
      const { orders } = await storage.searchOrders({});
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename="orders-export.json"');
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Failed to export orders" });
    }
  });

  app.get("/api/orders/export/csv", async (req, res) => {
    try {
      const { orders } = await storage.searchOrders({});
      
      // Generate CSV
      const headers = ['Order Number', 'Customer Name', 'Customer Email', 'Status', 'Total Amount', 'Created Date'];
      const csvRows = [
        headers.join(','),
        ...orders.map(order => [
          order.orderNumber,
          `"${order.customerName}"`,
          order.customerEmail,
          order.status,
          order.totalAmount,
          new Date(order.createdAt).toISOString().split('T')[0]
        ].join(','))
      ];
      
      const csvContent = csvRows.join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="orders-export.csv"');
      res.send(csvContent);
    } catch (error) {
      res.status(500).json({ message: "Failed to export orders as CSV" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// PDF Invoice Generation
async function generateInvoicePDF(order: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const buffers: Buffer[] = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });

      // Header
      doc.fontSize(20).text('INVOICE', 50, 50, { align: 'center' });
      doc.fontSize(12).text(`Order #: ${order.orderNumber}`, 50, 100);
      doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 50, 120);

      // Customer Info
      doc.fontSize(14).text('Bill To:', 50, 160);
      doc.fontSize(12)
         .text(order.customerName, 50, 180)
         .text(order.customerEmail, 50, 200);

      // Order Items
      doc.fontSize(14).text('Order Items:', 50, 240);
      
      let yPosition = 260;
      doc.fontSize(10)
         .text('Item', 50, yPosition)
         .text('Qty', 200, yPosition)
         .text('Price', 250, yPosition)
         .text('Total', 300, yPosition);

      yPosition += 20;
      doc.moveTo(50, yPosition).lineTo(350, yPosition).stroke();
      yPosition += 10;

      order.items.forEach((item: any) => {
        const itemTotal = item.quantity * item.price;
        doc.fontSize(10)
           .text(item.productName, 50, yPosition)
           .text(item.quantity.toString(), 200, yPosition)
           .text(`$${item.price.toFixed(2)}`, 250, yPosition)
           .text(`$${itemTotal.toFixed(2)}`, 300, yPosition);
        yPosition += 20;
      });

      // Total
      yPosition += 20;
      doc.moveTo(200, yPosition).lineTo(350, yPosition).stroke();
      yPosition += 10;
      doc.fontSize(12)
         .text('Total Amount:', 200, yPosition)
         .text(`$${order.totalAmount}`, 300, yPosition);

      // Footer
      doc.fontSize(10)
         .text('Thank you for your business!', 50, yPosition + 50)
         .text('OrderFlow Management System', 50, yPosition + 70);

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
