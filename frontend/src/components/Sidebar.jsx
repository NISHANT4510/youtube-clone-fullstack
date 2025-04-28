import React from 'react';
import { Link } from 'react-router-dom';
import { HomeIcon, FireIcon, ClockIcon, FilmIcon } from '@heroicons/react/24/outline';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const menuItems = [
    { icon: HomeIcon, text: 'Home', path: '/' },
    { icon: FireIcon, text: 'Trending', path: '/trending' },
    { icon: FilmIcon, text: 'Subscriptions', path: '/subscriptions' },
    { icon: ClockIcon, text: 'Library', path: '/library' },
  ];

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={toggleSidebar}
        />
      )}
      <aside 
        className={`fixed left-0 top-14 h-[calc(100vh-56px)] bg-white w-64 shadow-lg 
          transform transition-transform duration-300 ease-in-out z-40
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 ${!isOpen && 'md:hidden'}`}
      >
        <div className="p-4 overflow-y-auto h-full">
          {menuItems.map((item, index) => (
            <Link
              key={index}
              to={item.path}
              className="flex items-center space-x-4 p-3 hover:bg-gray-100 rounded-lg mb-1"
            >
              <item.icon className="h-6 w-6" />
              <span className="font-medium">{item.text}</span>
            </Link>
          ))}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
