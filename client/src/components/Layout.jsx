import React from 'react';
import Navbar from './Navbar';

function Layout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* <Navbar /> */}
      <main className="container py-4 flex-grow">
        {children}
      </main>
      <footer className="bg-light text-center py-3">
        © 2025 Gig Space. All rights reserved.
      </footer>
    </div>
  );
}

export default Layout;
