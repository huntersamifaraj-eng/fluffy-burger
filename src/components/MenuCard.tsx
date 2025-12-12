import React from 'react';
import { MenuItem } from '../types';

interface MenuCardProps {
  item: MenuItem;
  onAdd: (item: MenuItem) => void;
}

export const MenuCard: React.FC<MenuCardProps> = ({ item, onAdd }) => {
  return (
    <div className="bg-white rounded-[2rem] shadow-xl overflow-hidden group hover:-translate-y-2 transition-transform duration-300 border border-gray-100 flex flex-col h-full font-sans">
      <div className="relative h-48 overflow-hidden">
        <img 
          src={item.image} 
          alt={item.name} 
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60"></div>
      </div>
      
      <div className="p-6 flex flex-col flex-grow relative">
        <div className="absolute -top-10 left-4 bg-brand-yellow text-brand-brown w-12 h-12 flex items-center justify-center rounded-full shadow-lg text-xl border-4 border-white z-10 font-bold group-hover:rotate-12 transition-transform">
          +
        </div>
        
        <h3 className="text-xl font-heading font-black text-brand-dark mb-2 leading-tight">
          {item.name}
        </h3>
        <p className="text-gray-500 text-sm leading-relaxed mb-6 flex-grow font-medium">
          {item.description}
        </p>
        
        <button 
          onClick={() => onAdd(item)}
          className="w-full py-3 bg-brand-red text-white font-bold rounded-xl hover:bg-red-600 hover:shadow-lg transition-all shadow-md border-2 border-transparent active:scale-95 flex items-center justify-center gap-2"
        >
          <span>إضافة للطلب</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
};