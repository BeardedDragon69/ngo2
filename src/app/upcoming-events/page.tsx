'use client';

import './style.css';
import React, { useState, useEffect } from 'react';
import type { ReactElement } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Globe, Info, FileText, Users, Calendar, Mail, Menu, X, Search, Clock } from 'lucide-react';

interface NavItem {
  label: string;
  icon: ReactElement;
  href: string;
}

interface UpcomingEvent {
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
  { label: 'Upcoming Events', icon: <Clock size={20} />, href: '/upcoming-events' },
  { label: 'Space Community', icon: <Users size={20} />, href: '/community' },
  { label: 'Space Calendar', icon: <Calendar size={20} />, href: '/calendar' },
  { label: 'Contact us', icon: <Mail size={20} />, href: '/contact' },
];

// Backend base URL
const BACKEND_URL = 'http://127.0.0.1:8000';

export default function UpcomingEventsPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUpcomingEvents();
  }, []);

  const fetchUpcomingEvents = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/upcoming-events/?skip=0&limit=100`, {
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
      console.log('Upcoming events data:', data);
      
      // Log image URLs for debugging
      data.forEach((event: UpcomingEvent) => {
        if (event.image_url) {
          console.log(`Upcoming event ${event.id} image URL: ${getImageUrl(event.image_url)}`);
        }
      });
      
      setUpcomingEvents(data);
    } catch (error) {
      console.error('Error fetching upcoming events:', error);
      setError('Failed to load upcoming events. Please try again later.');
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

  // Get the current date at midnight for date comparison
  const getCurrentDate = () => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return now;
  };

  // Filter events that have dates in the future
  const filteredEvents = upcomingEvents
    .filter(event => {
      // Filter by search query
      return (
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    })
    .sort((a, b) => {
      // Sort by date (ascending - closest events first)
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Calculate days remaining until the event
  const getDaysRemaining = (eventDate: string) => {
    const today = getCurrentDate();
    const eventDay = new Date(eventDate);
    eventDay.setHours(0, 0, 0, 0);
    
    const timeDiff = eventDay.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    if (daysDiff === 0) return "Today";
    if (daysDiff === 1) return "Tomorrow";
    return `${daysDiff} days remaining`;
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
            <h2>Upcoming Events</h2>
            <div className="search-container">
              {isSearchExpanded ? (
                <div className="search-input-wrapper">
                  <input
                    type="text"
                    placeholder="Search upcoming events..."
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
                  aria-label="Search upcoming events"
                >
                  <Search size={18} />
                </button>
              )}
            </div>
          </div>

          {isLoading && (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading upcoming events...</p>
            </div>
          )}

          {error && (
            <div className="error-container">
              <p>{error}</p>
              <button onClick={fetchUpcomingEvents} className="retry-button">Retry</button>
            </div>
          )}

          {!isLoading && !error && filteredEvents.length === 0 && (
            <div className="no-results">
              <p>No upcoming events found matching your search criteria.</p>
            </div>
          )}

          <div className="events-grid">
            {filteredEvents.map(event => (
              <div key={event.id} className="event-card upcoming-event-card">
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
                  <div className="event-countdown">
                    {getDaysRemaining(event.date)}
                  </div>
                </div>
                <div className="event-details">
                  <h3>{event.title}</h3>
                  <p>{event.description}</p>
                  <div className="event-date">
                    <Clock size={16} />
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
                  <button className="register-btn">Register Now</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}