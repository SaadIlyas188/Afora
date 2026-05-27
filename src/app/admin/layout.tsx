'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Package, FolderOpen, Layers, ShoppingCart, Users, Star, Ticket, HelpCircle, Settings, ArrowLeft } from 'lucide-react';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
  { icon: Package, label: 'Products', href: '/admin/products' },
  { icon: FolderOpen, label: 'Categories', href: '/admin/categories' },
  { icon: Layers, label: 'Bundles', href: '/admin/bundles' },
  { icon: ShoppingCart, label: 'Orders', href: '/admin/orders' },
  { icon: Users, label: 'Users', href: '/admin/users' },
  { icon: Star, label: 'Reviews', href: '/admin/reviews' },
  { icon: Ticket, label: 'Promo Codes', href: '/admin/promos' },
  { icon: HelpCircle, label: 'FAQs', href: '/admin/faqs' },
  { icon: Settings, label: 'Settings', href: '/admin/settings' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex overflow-x-hidden">
      {/* Sidebar - desktop */}
      <aside className="hidden md:flex w-60 bg-white border-r border-gold-200/40 flex-col sticky top-0 h-screen overflow-y-auto">
        <div className="p-5 border-b border-gold-200/40">
          <h2 className="text-lg font-heading font-light tracking-wide text-foreground">Admin Panel</h2>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 text-sm transition-colors ${isActive ? 'bg-foreground text-gold-50 font-medium' : 'text-gray-600 hover:bg-gold-50 hover:text-foreground'}`}
              >
                <item.icon size={16} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-gold-200/40">
          <Link href="/" className="flex items-center gap-2 px-3 py-2 text-sm text-muted hover:text-foreground">
            <ArrowLeft size={14} /> Back to Store
          </Link>
        </div>
      </aside>

      {/* Mobile top nav */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gold-200/40 px-4 py-3 flex items-center justify-between">
        <h2 className="text-sm font-heading font-light tracking-wide text-foreground">Admin</h2>
        <Link href="/" className="text-xs text-muted">← Store</Link>
      </div>
      {/* Mobile bottom scroll nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gold-200/40 flex overflow-x-auto no-scrollbar pb-safe">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href} className={`flex flex-col items-center min-w-[64px] py-2 px-3 text-[10px] ${isActive ? 'text-foreground font-medium' : 'text-gray-400'}`}>
              <item.icon size={16} />
              <span className="mt-0.5">{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Main content */}
      <main className="flex-1 bg-cream-50 min-h-screen p-4 md:p-8 mt-12 md:mt-0 mb-16 md:mb-0 overflow-x-hidden min-w-0">
        {children}
      </main>
    </div>
  );
}
