'use client';

import './style.css';
import React, { useState, useEffect } from 'react';
import type { ReactElement } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Globe, Info, FileText, Users, Calendar, Mail, Menu, X, Search } from 'lucide-react';

interface NavItem {
  label: string;
  icon: ReactElement;
  href: string;
}

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  image_url: string;
  location: string;
}

const navItems: NavItem[] = [
  { label: 'Home', icon: <Globe size={20} />, href: '/' },
  { label: 'About Us', icon: <Info size={20} />, href: '/AboutUs' },
  { label: 'Media', icon: <FileText size={20} />, href: '/media' },
  { label: 'Space Community', icon: <Users size={20} />, href: '/community' },
  { label: 'Space Calendar', icon: <Calendar size={20} />, href: '/calendar' },
  { label: 'Contact us', icon: <Mail size={20} />, href: '/contact' },
];

// Backend base URL
const BACKEND_URL = 'http://127.0.0.1:8000';

export default function MediaPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/events/?skip=0&limit=100`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        mode: 'cors',
        credentials: 'omit',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Events data:', data);
      
      // Log image URLs for debugging
      data.forEach((event: Event) => {
        if (event.image_url) {
          console.log(`Event ${event.id} image URL: ${getImageUrl(event.image_url)}`);
        }
      });
      
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
      setError('Failed to load events. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const getImageUrl = (imageUrl: string | null) => {
    if (!imageUrl) return '/default-event.svg';
    
    // If the URL already starts with http, it's a complete URL
    if (imageUrl.startsWith('http')) return imageUrl;
    
    // For static files from the FastAPI backend
    const staticUrlPattern = /^\/static\//;
    if (staticUrlPattern.test(imageUrl)) {
      // Direct URL to the backend static file
      return `${BACKEND_URL}${imageUrl}`;
    }
    
    // Default fallback
    return '/default-event.svg';
  };

  const filteredEvents = events.filter(event => 
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <>
      <div className="header-container">
        <Link href="/" className="logo-container">
          <Image
            src="/logo.png"
            alt="Logo"
            width={80}
            height={80}
            className="logo-image"
          />
        </Link>

        <nav className="navbar">
          <button className="menu-toggle" onClick={toggleMenu}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          
          <div className={`nav-items ${isMenuOpen ? 'show' : ''}`}>
            {navItems.map((item, index) => (
              <Link 
                key={index} 
                href={item.href} 
                className="nav-item"
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="nav-icon">{item.icon}</div>
                <span className="nav-label">{item.label}</span>
              </Link>
            ))}
          </div>
        </nav>
      </div>

      <div className="media-content">
        <div className="events-list">
          <div className="section-title-container">
            <h2>Our Events</h2>
            <div className="search-container">
              {isSearchExpanded ? (
                <div className="search-input-wrapper">
                  <input
                    type="text"
                    placeholder="Search events..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-input"
                    autoFocus
                  />
                  <button 
                    className="close-search-btn"
                    onClick={() => {
                      setIsSearchExpanded(false);
                      setSearchQuery('');
                    }}
                  >
                    <X size={18} />
                  </button>
                </div>
              ) : (
                <button 
                  className="search-toggle-btn"
                  onClick={() => setIsSearchExpanded(true)}
                  aria-label="Search events"
                >
                  <Search size={18} />
                </button>
              )}
            </div>
          </div>

          {isLoading && (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading events...</p>
            </div>
          )}

          {error && (
            <div className="error-container">
              <p>{error}</p>
              <button onClick={fetchEvents} className="retry-button">Retry</button>
            </div>
          )}

          {!isLoading && !error && filteredEvents.length === 0 && (
            <div className="no-results">
              <p>No events found matching your search criteria.</p>
            </div>
          )}

          <div className="events-grid">
            {filteredEvents.map(event => (
              <div key={event.id} className="event-card">
                <div className="event-image-wrapper">
                  <img 
                    src={getImageUrl(event.image_url)}
                    alt={event.title} 
                    className="event-image" 
                    loading="lazy"
                    onError={(e) => {
                      console.log(`Image failed to load: ${event.image_url}`);
                      // Fallback if image fails to load
                      (e.target as HTMLImageElement).src = '/default-event.svg';
                    }}
                  />
                </div>
                <div className="event-details">
                  <h3>{event.title}</h3>
                  <p>{event.description}</p>
                  <div className="event-date">
                    {new Date(event.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                  <div className="event-location">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    {event.location}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
