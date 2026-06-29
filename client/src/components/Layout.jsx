import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Map as MapIcon, LogOut, User as UserIcon, Trophy } from 'lucide-react';
import './Layout.css';

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    navigate('/login');
  };

  return (
    <div className="layout-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <Trophy className="logo-icon" />
          <h2>Let's Play</h2>
        </div>
        
        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${location.pathname === '/dashboard' ? 'active' : ''}`}
            onClick={() => navigate('/dashboard')}
          >
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </button>
          
          <button 
            className={`nav-item ${location.pathname === '/map' ? 'active' : ''}`}
            onClick={() => navigate('/map')}
          >
            <MapIcon size={20} />
            <span>Map View</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <button className="nav-item logout" onClick={handleLogout}>
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="main-wrapper">
        {/* Top Navbar */}
        <header className="top-navbar">
          <div className="page-title">
            {location.pathname === '/dashboard' ? 'Match Feed' : 'Player Map'}
          </div>
          <div className="user-profile">
            <div className="avatar">
              <UserIcon size={20} />
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="content-area">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
