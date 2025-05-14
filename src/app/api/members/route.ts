import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// The file path for members data
const dataFilePath = path.join(process.cwd(), 'src/data/members.json');

// Helper to ensure the data file exists
const ensureDataFileExists = () => {
  const dirPath = path.dirname(dataFilePath);
  
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  
  if (!fs.existsSync(dataFilePath)) {
    fs.writeFileSync(dataFilePath, JSON.stringify([
      {
        id: '1',
        name: 'Priya Yadav',
        position: 'Director',
        age: 35,
        photo: '/owner.png',
        bio: 'Priya is the visionary leader of our foundation with over 10 years of experience in community development and philanthropy.'
      },
      {
        id: '2',
        name: 'Rahul Sharma',
        position: 'Program Manager',
        age: 32,
        photo: '/team-member1.jpg',
        bio: 'Rahul oversees our education initiatives and has successfully implemented numerous programs for underprivileged children.'
      },
      {
        id: '3',
        name: 'Ananya Patel',
        position: 'Community Outreach',
        age: 28,
        photo: '/team-member2.jpg',
        bio: 'Ananya builds relationships with local communities and ensures our programs address their specific needs.'
      }
    ]), 'utf-8');
  }
};

// GET all members
export async function GET() {
  try {
    ensureDataFileExists();
    const data = fs.readFileSync(dataFilePath, 'utf-8');
    const members = JSON.parse(data);
    
    return NextResponse.json(members);
  } catch (error) {
    console.error('Error reading members data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch members' },
      { status: 500 }
    );
  }
}

// POST to add a new member
export async function POST(request: NextRequest) {
  try {
    ensureDataFileExists();
    const data = fs.readFileSync(dataFilePath, 'utf-8');
    const members = JSON.parse(data);
    
    const newMember = await request.json();
    
    // Validate new member data
    if (!newMember.name || !newMember.position || !newMember.bio) {
      return NextResponse.json(
        { error: 'Name, position, and bio are required' },
        { status: 400 }
      );
    }
    
    // Generate an ID if not provided
    if (!newMember.id) {
      newMember.id = Date.now().toString();
    }
    
    // Add the new member
    members.push(newMember);
    
    // Save the updated data
    fs.writeFileSync(dataFilePath, JSON.stringify(members, null, 2), 'utf-8');
    
    return NextResponse.json(newMember, { status: 201 });
  } catch (error) {
    console.error('Error adding member:', error);
    return NextResponse.json(
      { error: 'Failed to add member' },
      { status: 500 }
    );
  }
} 