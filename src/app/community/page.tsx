'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import './style.css';
import MemberCard from '../../MyComponents/MembersCard';
import {
  Globe,
  Info,
  FileText,
  Users,
  Calendar,
  Mail,
  Menu,
  X,
  Search
} from 'lucide-react';

interface NavItem {
  label: string;
  icon: React.ReactNode;
  href: string;
}

interface Member {
  id: string;
  name: string;
  position: string;
  age: number;
  photo: string;
  bio: string;
}

const navItems: NavItem[] = [
  { label: 'Home', icon: <Globe size={20} />, href: '/' },
  { label: 'About Us', icon: <Info size={20} />, href: '/about' },
  { label: 'Media', icon: <FileText size={20} />, href: '/media' },
  { label: 'Space Community', icon: <Users size={20} />, href: '/community' },
  { label: 'Space Calendar', icon: <Calendar size={20} />, href: '/calendar' },
  { label: 'Contact us', icon: <Mail size={20} />, href: '/contact' },
];

export default function MembersPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch members from the API
  useEffect(() => {
    const fetchMembers = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('http://localhost:8000/api/members/members/');
        if (!response.ok) {
          throw new Error('Failed to fetch members');
        }
        const data = await response.json();
        setMembers(data);
        setError(null);
      } catch (err) {
        setError('Error loading members. Please try again later.');
        console.error('Error fetching members:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMembers();
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Filter members based on search term
  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className="main-content">
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

      <div className="member-content">
        <div className="section-title-container">
          <h2>Our <span className="highlight">Team</span></h2>
        </div>
        
        {error && (
          <div className="error-alert">
            <p>{error}</p>
            <button onClick={() => setError(null)}>Dismiss</button>
          </div>
        )}
        
        <p className="member-description">
          Meet the dedicated individuals who work tirelessly to make our foundation's mission a reality.
          Our diverse team brings together expertise from various fields to create impactful programs.
        </p>
        
        <div className="search-container">
          <div className="search-input-wrapper">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search members..."
              className="search-input"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        {isLoading ? (
          <div className="loading">Loading members...</div>
        ) : (
          <div className="members-grid">
            {filteredMembers.length > 0 ? (
              filteredMembers.map(member => (
                <MemberCard
                  key={member.id}
                  id={member.id}
                  name={member.name}
                  position={member.position}
                  age={member.age}
                  photo={member.photo}
                  bio={member.bio}
                />
              ))
            ) : (
              <div className="no-results">
                <p>No members found matching your search.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
