import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// The file path for members data
const dataFilePath = path.join(process.cwd(), 'src/data/members.json');

// Helper to ensure the data file exists
const ensureDataFileExists = () => {
  if (!fs.existsSync(dataFilePath)) {
    const dirPath = path.dirname(dataFilePath);
    fs.mkdirSync(dirPath, { recursive: true });
    fs.writeFileSync(dataFilePath, JSON.stringify([]), 'utf-8');
  }
};

// GET a specific member by ID
export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    ensureDataFileExists();
    const data = fs.readFileSync(dataFilePath, 'utf-8');
    const members = JSON.parse(data);
    
    const member = members.find((m: any) => m.id === context.params.id);
    
    if (!member) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(member);
  } catch (error) {
    console.error('Error fetching member:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE a member by ID
export async function DELETE(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    ensureDataFileExists();
    const data = fs.readFileSync(dataFilePath, 'utf-8');
    const members = JSON.parse(data);
    
    const memberIndex = members.findIndex((m: any) => m.id === context.params.id);
    
    if (memberIndex === -1) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      );
    }
    
    // Remove the member
    const deletedMember = members.splice(memberIndex, 1)[0];
    
    // Save the updated data
    fs.writeFileSync(dataFilePath, JSON.stringify(members, null, 2), 'utf-8');
    
    return NextResponse.json({ message: 'Member deleted successfully', deletedMember });
  } catch (error) {
    console.error('Error deleting member:', error);
    return NextResponse.json(
      { error: 'Failed to delete member' },
      { status: 500 }
    );
  }
}

// PUT to update a member
export async function PUT(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    ensureDataFileExists();
    const data = fs.readFileSync(dataFilePath, 'utf-8');
    const members = JSON.parse(data);
    
    const memberIndex = members.findIndex((m: any) => m.id === context.params.id);
    
    if (memberIndex === -1) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      );
    }
    
    // Get the updated member data
    const updatedMember = await request.json();
    
    // Preserve the ID
    updatedMember.id = context.params.id;
    
    // Update the member
    members[memberIndex] = updatedMember;
    
    // Save the updated data
    fs.writeFileSync(dataFilePath, JSON.stringify(members, null, 2), 'utf-8');
    
    return NextResponse.json(updatedMember);
  } catch (error) {
    console.error('Error updating member:', error);
    return NextResponse.json(
      { error: 'Failed to update member' },
      { status: 500 }
    );
  }
} 