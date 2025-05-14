'use client';

import { useState, useEffect } from 'react';
import { membersService, Member } from '../services/membersService';

export default function TeamPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMembers() {
      try {
        setLoading(true);
        const data = await membersService.getAllMembers();
        setMembers(data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch team members. Please try again later.');
        console.error('Error fetching members:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchMembers();
  }, []);

  if (loading) return <div className="loading">Loading team members...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="team-page">
      <div className="team-header">
        <h1>Our Team</h1>
        <p>Meet the dedicated individuals who make our mission possible</p>
      </div>
      
      {members.length === 0 ? (
        <p className="no-members">No team members found.</p>
      ) : (
        <div className="members-grid">
          {members.map((member) => (
            <div key={member.id} className="member-card">
              <div className="member-photo">
                {member.photo ? (
                  <img src={member.photo} alt={member.name} />
                ) : (
                  <div className="placeholder-photo">
                    {member.name.charAt(0)}
                  </div>
                )}
              </div>
              <div className="member-content">
                <h2>{member.name}</h2>
                <p className="member-position">{member.position}</p>
                <p className="member-bio">{member.bio}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <style jsx>{`
        .team-page {
          padding: 4rem 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }
        
        .team-header {
          text-align: center;
          margin-bottom: 3rem;
        }
        
        .team-header h1 {
          font-size: 3rem;
          margin-bottom: 1rem;
          color: #fff;
          background: linear-gradient(135deg, #ffffff 0%, #94a3b8 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        
        .team-header p {
          font-size: 1.2rem;
          color: rgba(255, 255, 255, 0.8);
        }
        
        .members-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 2rem;
        }
        
        .member-card {
          background: rgba(15, 23, 42, 0.85);
          border-radius: 1rem;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
          transition: transform 0.3s ease;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .member-card:hover {
          transform: translateY(-10px);
        }
        
        .member-photo {
          height: 250px;
          overflow: hidden;
        }
        
        .member-photo img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .placeholder-photo {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%);
          font-size: 4rem;
          color: white;
        }
        
        .member-content {
          padding: 1.5rem;
        }
        
        .member-content h2 {
          font-size: 1.5rem;
          margin-bottom: 0.5rem;
          color: white;
        }
        
        .member-position {
          font-size: 1rem;
          color: #60a5fa;
          margin-bottom: 1rem;
          font-weight: 500;
        }
        
        .member-bio {
          color: rgba(255, 255, 255, 0.8);
          font-size: 0.95rem;
          line-height: 1.6;
        }
        
        .loading, .error, .no-members {
          text-align: center;
          padding: 2rem;
          color: rgba(255, 255, 255, 0.8);
        }
        
        .error {
          color: #ef4444;
        }
      `}</style>
    </div>
  );
} 