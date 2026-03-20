import React from 'react';
import { List, Circle, CheckCircle2, Search } from 'lucide-react';

const FilterButtons = ({ filter, setFilter }) => {
  return (
    <div className="filter-section-wrapper">
      {/* 1. Search Bar at the very top */}
      <div className="search-wrapper">
        <Search className="search-icon" size={18} />
        <input type="text" className="search-bar" placeholder="Search tasks..." />
      </div>

      {/* 2. Filter Buttons directly below search */}
      <div className="button-group">
        <button 
          className={`btn-outline ${filter === 'all' ? 'active' : ''}`} 
          onClick={() => setFilter('all')}
        >
          <List size={16} /> All
        </button>
        <button 
          className={`btn-outline ${filter === 'active' ? 'active' : ''}`} 
          onClick={() => setFilter('active')}
        >
          <Circle size={16} /> Active
        </button>
        <button 
          className={`btn-outline ${filter === 'completed' ? 'active' : ''}`} 
          onClick={() => setFilter('completed')}
        >
          <CheckCircle2 size={16} /> Done
        </button>
      </div>
    </div>
  );
};

export default FilterButtons;