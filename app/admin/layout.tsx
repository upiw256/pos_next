import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="antialiased bg-gray-50 dark:bg-gray-900 min-h-screen">
      <Header />
      <Sidebar />
      <main className="p-4 md:ml-64 h-auto pt-20">
        <div className="mx-auto max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  );
}
