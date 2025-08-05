import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { ThemeProvider } from "./ThemeProvider";

interface LayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export function Layout({ children, title, subtitle }: LayoutProps) {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <Sidebar />
        <div className="ml-64 transition-all duration-200">
          <Header title={title} subtitle={subtitle} />
          <main className="p-6">
            {children}
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}
