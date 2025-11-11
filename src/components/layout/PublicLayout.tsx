import React from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
type PublicLayoutProps = {
  children: React.ReactNode;
};
export function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
}