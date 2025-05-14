'use client';
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import './MembersCard.css';

interface MemberProps {
  id: number;
  name: string;
  position: string;
  age: number;
  photo: string;
  bio: string;
}

const MemberCard: React.FC<MemberProps> = ({ id, name, position, age, photo, bio }) => {
  const photoUrl = photo 
    ? photo.startsWith('http') 
      ? photo 
      : `http://localhost:8000/static/${photo}` 
    : '/owner.png'; // Fallback image
  
  return (
    <Link href={`/community/${id}`} className="member-card-link">
      <div className="member-card">
        <div className="member-photo-container">
          <img src={photoUrl} alt={name} className="member-photo" />
          <div className="member-overlay"></div>
        </div>
        <div className="member-info">
          <h3 className="member-name">{name}</h3>
          <p className="member-position">{position}</p>
          <div className="member-details">
            <div className="detail-item">
              <span className="detail-label">Age</span>
              <span className="detail-value">{age}</span>
            </div>
          </div>
          <p className="member-bio">{bio || 'No bio available'}</p>
        </div>
      </div>
    </Link>
  );
};

export default MemberCard; 