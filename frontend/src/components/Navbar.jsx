import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bars3Icon, MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import CreateChannel from './CreateChannel';

const Navbar = ({ toggleSidebar }) => {
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  const { user, logout, hasChannel } = useAuth();
  const navigate = useNavigate();

  const handleCreateChannelClick = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (user.channelId) {
      // If user already has a channel, navigate to it
      navigate(`/channel/${user.channelId}`);
    } else {
      // Otherwise show create channel dialog
      setShowCreateChannel(true);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const renderUserMenu = () => {
    if (!user) {
      return (
        <div className="flex items-center space-x-4">
          <Link 
            to="/login" 
            className="text-gray-700 hover:text-red-600 px-3 py-1 rounded-lg hover:bg-gray-100"
          >
            Sign In
          </Link>
          <Link 
            to="/signup" 
            className="bg-red-600 text-white px-4 py-1 rounded-lg text-sm"
          >
            Sign Up
          </Link>
        </div>
      );
    }

    return (
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={handleCreateChannelClick}
            className="bg-red-600 text-white px-4 py-1 rounded-lg text-sm hover:bg-red-700"
          >
            {hasChannel() ? 'My Channel' : 'Create Channel'}
          </button>
          <img src={user.avatar} alt={user.username} className="h-8 w-8 rounded-full" />
          <span className="text-sm font-medium hidden sm:block">{user.username}</span>
          <button 
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="text-sm text-gray-700 hover:text-red-600 px-3 py-1 rounded-lg hover:bg-gray-100"
          >
            Logout
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      <nav className="bg-white shadow-lg fixed w-full top-0 z-50">
        {showMobileSearch ? (
          <div className="md:hidden flex items-center h-14 px-4">
            <button onClick={() => setShowMobileSearch(false)} className="p-2">
              <XMarkIcon className="h-6 w-6" />
            </button>
            <div className="flex-1 mx-2">
              <input type="text" placeholder="Search" 
                className="w-full px-4 py-1 border border-gray-300 rounded-full focus:outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between h-14">
              <div className="flex items-center space-x-4">
                <button onClick={toggleSidebar} className="p-2 hover:bg-gray-100 rounded-full">
                  <Bars3Icon className="h-6 w-6" />
                </button>
                <Link to="/" className="flex items-center">
                  <span className="text-xl font-bold">YouTube</span>
                </Link>
              </div>
              
              <div className="hidden md:flex flex-1 max-w-2xl mx-4">
                <form onSubmit={handleSearch} className="flex items-center w-full">
                  <input
                    type="text"
                    placeholder="Search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-1 border border-gray-300 rounded-l-full focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-6 py-1 border border-l-0 border-gray-300 rounded-r-full bg-gray-50 hover:bg-gray-100"
                  >
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-600" />
                  </button>
                </form>
              </div>

              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => setShowMobileSearch(true)}
                  className="md:hidden p-2 hover:bg-gray-100 rounded-full"
                >
                  <MagnifyingGlassIcon className="h-6 w-6" />
                </button>
                
                {renderUserMenu()}
              </div>
            </div>
          </div>
        )}
      </nav>

      {showCreateChannel && (
        <CreateChannel onClose={() => setShowCreateChannel(false)} />
      )}
    </>
  );
};

export default Navbar;
