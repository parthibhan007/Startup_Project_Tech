import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/Layout";
import { Dashboard } from "@/pages/Dashboard";
import { Orders } from "@/pages/Orders";
import { Products } from "@/pages/Products";
import { OrderDetail } from "@/pages/OrderDetail";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/">
        <Layout title="Dashboard" subtitle="Welcome back, Admin">
          <Dashboard />
        </Layout>
      </Route>
      
      <Route path="/orders">
        <Layout title="Orders" subtitle="Manage your orders">
          <Orders />
        </Layout>
      </Route>
      
      <Route path="/orders/:id">
        <Layout title="Order Details">
          <OrderDetail />
        </Layout>
      </Route>
      
      <Route path="/products">
        <Layout title="Products" subtitle="Manage your product catalog">
          <Products />
        </Layout>
      </Route>
      
      <Route path="/customers">
        <Layout title="Customers" subtitle="Manage your customers">
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">Customers page coming soon...</p>
          </div>
        </Layout>
      </Route>
      
      <Route path="/analytics">
        <Layout title="Analytics" subtitle="View your business analytics">
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">Analytics page coming soon...</p>
          </div>
        </Layout>
      </Route>
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
