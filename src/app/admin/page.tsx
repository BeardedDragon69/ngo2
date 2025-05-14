'use client';
import './style.css';
import Link from 'next/link';
import Image from 'next/image';
import React, { useState, ReactElement, useEffect, useRef } from 'react';
import {
  Globe,
  Info,
  Wrench,
  Megaphone,
  FileText,
  Users,
  Calendar,
  Mail,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Plus,
  Search
} from 'lucide-react';

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
  image: string;
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

export default function AdminDashboard() {
  return (
    <div className="admin-dashboard">
      <h2>Admin Dashboard</h2>
      
      <div className="admin-cards">
        <Link href="/member_control" className="admin-card">
          <h3>Team Members</h3>
          <p>Manage team members</p>
        </Link>
        
        <Link href="/admin/events" className="admin-card">
          <h3>Events</h3>
          <p>Manage upcoming events</p>
        </Link>
        
        <Link href="/admin/users" className="admin-card">
          <h3>Users</h3>
          <p>Manage user accounts</p>
        </Link>
      </div>
      
      <style jsx>{`
        .admin-dashboard {
          padding: 2rem;
        }
        
        h2 {
          margin-bottom: 2rem;
          color: white;
        }
        
        .admin-cards {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 2rem;
        }
        
        .admin-card {
          background: rgba(15, 23, 42, 0.8);
          border-radius: 0.5rem;
          padding: 1.5rem;
          color: white;
          text-decoration: none;
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: all 0.3s ease;
        }
        
        .admin-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
          border-color: rgba(59, 130, 246, 0.5);
        }
        
        .admin-card h3 {
          margin-top: 0;
          margin-bottom: 0.5rem;
        }
        
        .admin-card p {
          margin: 0;
          opacity: 0.7;
        }
      `}</style>
      </div>
  );
}
