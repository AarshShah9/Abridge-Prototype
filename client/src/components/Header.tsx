import React from 'react';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  return (
    <header className="bg-primary py-4 px-6 flex items-center justify-between">
      <div className="flex items-center">
        <Link to="/patients">
          <img 
            src="/abridge-logo.png" 
            alt="Abridge Logo" 
            className="h-8 mr-3" 
          />
        </Link>
        <span className="text-white text-xl font-semibold">Visit Diff</span>
      </div>
      <div className="bg-white/20 text-white py-1 px-3 rounded text-sm">
        Demo only. Not for clinical use.
      </div>
    </header>
  );
};

export default Header;