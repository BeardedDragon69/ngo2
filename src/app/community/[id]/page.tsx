'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import './style.css';

interface Member {
  id: string;
  name: string;
  position: string;
  age: number;
  photo: string;
  bio: string;
}

export default function MemberDetailPage() {
  const params = useParams();
  const [member, setMember] = useState<Member | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMember = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/members/members/${params.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch member details');
        }
        const data = await response.json();
        setMember(data);
        setError(null);
      } catch (err) {
        setError('Error loading member details. Please try again later.');
        console.error('Error fetching member:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchMember();
    }
  }, [params.id]);

  // Process photo URL for display
  const getPhotoUrl = (photoPath: string): string => {
    if (!photoPath) return '/owner.png';
    
    if (photoPath.startsWith('http')) {
      return photoPath;
    }
    
    return `http://localhost:8000/static/${photoPath}`;
  };

  if (isLoading) {
    return (
      <main className="main-content">
        <div className="member-detail-content">
          <div className="loading">Loading member details...</div>
        </div>
      </main>
    );
  }

  if (error || !member) {
    return (
      <main className="main-content">
        <div className="member-detail-content">
          <div className="error-alert">
            <p>{error || 'Member not found'}</p>
            <Link href="/community" className="back-button">
              <ArrowLeft size={20} />
              Back to Members
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="main-content">
      <div className="member-detail-content">
        <Link href="/community" className="back-button">
          <ArrowLeft size={20} />
          Back to Members
        </Link>

        <div className="member-detail-card">
          <div className="member-image-container">
            <img
              src={getPhotoUrl(member.photo)}
              alt={member.name}
              className="member-detail-image"
            />
          </div>

          <div className="member-info">
            <h1>{member.name}</h1>
            <h2>{member.position}</h2>

            <div className="member-stats">
              <div className="stat">
                <span className="stat-label">Age</span>
                <span className="stat-value">{member.age}</span>
              </div>
            </div>

            <div className="member-bio">
              <h3>About</h3>
              <p>{member.bio}</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 