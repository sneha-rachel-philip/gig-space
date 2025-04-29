import React from 'react';
import Navbar from './Navbar';

function Layout({ children }) {
  return (
    <>
      {/* <Navbar /> */}
      <main className="container py-4">
        {children}
      </main>
      <footer className="bg-light text-center py-3 mt-5">
        © 2025 Gig Space. All rights reserved.
      </footer>
    </>
  );
}

export default Layout;
