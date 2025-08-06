import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const InventoryLayout = ({ children }) => {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-blue-700 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl md:text-2xl font-bold">Pharmacy Management System</h1>
          <nav>
            <ul className="flex space-x-6 text-sm md:text-base">
              <li className={location.pathname === '/' ? 'font-semibold underline' : ''}>
                <Link to="/" className="hover:text-gray-200 transition-colors">Dashboard</Link>
              </li>
              <li className={location.pathname.includes('/raw-materials') ? 'font-semibold underline' : ''}>
                <Link to="/raw-materials" className="hover:text-gray-200 transition-colors">Raw Materials</Link>
              </li>
              <li className={location.pathname.includes('/medicines') ? 'font-semibold underline' : ''}>
                <Link to="/medicines" className="hover:text-gray-200 transition-colors">Medicines</Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-6">
        {children}
      </main>

      <footer className="bg-white border-t text-center py-4 text-gray-500 text-sm">
        <p>© 2025 Pharmacy Management System</p>
      </footer>
    </div>
  );
};

export default InventoryLayout;
