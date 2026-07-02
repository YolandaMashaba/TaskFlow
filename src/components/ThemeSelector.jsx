import React, { useState, useEffect } from 'react';
import { Palette, Sun, Moon, Droplets, Leaf, Flame, Heart, Sparkles } from 'lucide-react';

const themes = [
  { id: 'light', name: 'Light', icon: Sun, color: '#f8fafc' },
  { id: 'dark', name: 'Dark', icon: Moon, color: '#0f172a' },
  { id: 'ocean', name: 'Ocean', icon: Droplets, color: '#0ea5e9' },
  { id: 'forest', name: 'Forest', icon: Leaf, color: '#16a34a' },
  { id: 'sunset', name: 'Sunset', icon: Flame, color: '#f97316' },
  { id: 'pink', name: 'Pink', icon: Heart, color: '#ec4899' },
  { id: 'purple', name: 'Purple', icon: Sparkles, color: '#8b5cf6' }
];

const ThemeSelector = () => {
  const [currentTheme, setCurrentTheme] = useState('light');

  useEffect(() => {
    // Load theme from localStorage
    const savedTheme = localStorage.getItem('app-theme') || 'light';
    setCurrentTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const handleThemeChange = (themeId) => {
    setCurrentTheme(themeId);
    localStorage.setItem('app-theme', themeId);
    document.documentElement.setAttribute('data-theme', themeId);
  };

  return (
    <div className="theme-selector">
      <div className="theme-selector-header">
        <Palette size={18} />
        <h3>Theme</h3>
      </div>
      <div className="theme-options">
        {themes.map((theme) => {
          const Icon = theme.icon;
          return (
            <button
              key={theme.id}
              className={`theme-option ${currentTheme === theme.id ? 'active' : ''}`}
              onClick={() => handleThemeChange(theme.id)}
              title={theme.name}
            >
              <div className="theme-preview" style={{ backgroundColor: theme.color }}>
                <Icon size={16} />
              </div>
              <span>{theme.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ThemeSelector;
