import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { writeFile } from 'fs/promises';

const dataFilePath = path.join(process.cwd(), 'src/data/mediaEvents.json');
const uploadDir = path.join(process.cwd(), 'public/uploads');

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Helper function to read data
const readData = () => {
  try {
    const data = fs.readFileSync(dataFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return { events: [] };
  }
};

// Helper function to write data
const writeData = (data: any) => {
  fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
};

// Helper function to save image
async function saveImage(file: File, eventId: string): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  
  // Get file extension
  const extension = file.name.split('.').pop();
  const fileName = `${eventId}.${extension}`;
  const filePath = path.join(uploadDir, fileName);
  
  await writeFile(filePath, buffer);
  return `/uploads/${fileName}`;
}

// GET all media events
export async function GET() {
  try {
    const data = readData();
    return NextResponse.json(data.events);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}

// POST new media event
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const eventId = Date.now().toString();
    
    // Handle image upload
    const imageFile = formData.get('image') as File;
    if (!imageFile) {
      return NextResponse.json({ error: 'Image is required' }, { status: 400 });
    }
    
    const imagePath = await saveImage(imageFile, eventId);
    
    // Create event object
    const newEvent = {
      id: eventId,
      title: formData.get('title') as string,
      date: formData.get('date') as string,
      description: formData.get('description') as string,
      location: formData.get('location') as string,
      image: imagePath,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Save event
    const data = readData();
    data.events.push(newEvent);
    writeData(data);
    
    return NextResponse.json(newEvent);
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
}

// PUT update media event
export async function PUT(request: Request) {
  try {
    const formData = await request.formData();
    const eventId = formData.get('id') as string;
    
    // Get existing event
    const data = readData();
    const existingEvent = data.events.find((e: any) => e.id === eventId);
    if (!existingEvent) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }
    
    // Handle image upload if new image is provided
    let imagePath = existingEvent.image;
    const imageFile = formData.get('image') as File;
    if (imageFile && imageFile.size > 0) {
      // Delete old image if it exists
      if (existingEvent.image) {
        const oldImagePath = path.join(process.cwd(), 'public', existingEvent.image);
        try {
          fs.unlinkSync(oldImagePath);
        } catch (error) {
          console.error('Error deleting old image:', error);
        }
      }
      imagePath = await saveImage(imageFile, eventId);
    }
    
    // Update event object
    const updatedEvent = {
      ...existingEvent,
      title: formData.get('title') as string,
      date: formData.get('date') as string,
      description: formData.get('description') as string,
      location: formData.get('location') as string,
      image: imagePath,
      updatedAt: new Date().toISOString()
    };
    
    // Save updated event
    const index = data.events.findIndex((e: any) => e.id === eventId);
    data.events[index] = updatedEvent;
    writeData(data);
    
    return NextResponse.json(updatedEvent);
  } catch (error) {
    console.error('Error updating event:', error);
    return NextResponse.json({ error: 'Failed to update event' }, { status: 500 });
  }
}

// DELETE media event
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 });
    }

    const data = readData();
    const eventIndex = data.events.findIndex((event: any) => event.id === id);

    if (eventIndex === -1) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Delete the associated image
    const imagePath = path.join(process.cwd(), 'public', data.events[eventIndex].image);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    data.events.splice(eventIndex, 1);
    writeData(data);

    return NextResponse.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 });
  }
} 