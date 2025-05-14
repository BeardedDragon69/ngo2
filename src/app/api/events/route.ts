import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { writeFile } from 'fs/promises';

interface Event {
  id: string;
  title: string;
  date: string;
  description: string;
  location: string;
  image: string;
  badge: string;
}

const eventsFilePath = path.join(process.cwd(), 'data', 'events.json');
const eventsImageDir = path.join(process.cwd(), 'public', 'events');

// Helper function to read events
async function readEvents(): Promise<Event[]> {
  try {
    const fileContents = await fs.readFile(eventsFilePath, 'utf8');
    return JSON.parse(fileContents);
  } catch (error) {
    return [];
  }
}

// Helper function to write events
async function writeEvents(events: Event[]) {
  await fs.mkdir(path.dirname(eventsFilePath), { recursive: true });
  await fs.writeFile(eventsFilePath, JSON.stringify(events, null, 2));
}

// Helper function to save image
async function saveImage(file: File, eventId: string): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  
  // Create directory if it doesn't exist
  await fs.mkdir(eventsImageDir, { recursive: true });
  
  // Get file extension
  const extension = file.name.split('.').pop();
  const fileName = `${eventId}.${extension}`;
  const filePath = path.join(eventsImageDir, fileName);
  
  await writeFile(filePath, buffer);
  return `/events/${fileName}`;
}

// GET /api/events
export async function GET() {
  const events = await readEvents();
  return NextResponse.json(events);
}

// POST /api/events
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
    const event: Event = {
      id: eventId,
      title: formData.get('title') as string,
      date: formData.get('date') as string,
      description: formData.get('description') as string,
      location: formData.get('location') as string,
      image: imagePath,
      badge: formData.get('badge') as string,
    };
    
    // Save event
    const events = await readEvents();
    events.push(event);
    await writeEvents(events);
    
    return NextResponse.json(event);
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
}

// PUT /api/events
export async function PUT(request: Request) {
  try {
    const formData = await request.formData();
    const eventId = formData.get('id') as string;
    
    // Get existing event
    const events = await readEvents();
    const existingEvent = events.find((e: Event) => e.id === eventId);
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
          await fs.unlink(oldImagePath);
        } catch (error) {
          console.error('Error deleting old image:', error);
        }
      }
      imagePath = await saveImage(imageFile, eventId);
    }
    
    // Update event object
    const updatedEvent: Event = {
      id: eventId,
      title: formData.get('title') as string,
      date: formData.get('date') as string,
      description: formData.get('description') as string,
      location: formData.get('location') as string,
      image: imagePath,
      badge: formData.get('badge') as string,
    };
    
    // Save updated event
    const index = events.findIndex((e: Event) => e.id === eventId);
    events[index] = updatedEvent;
    await writeEvents(events);
    
    return NextResponse.json(updatedEvent);
  } catch (error) {
    console.error('Error updating event:', error);
    return NextResponse.json({ error: 'Failed to update event' }, { status: 500 });
  }
}

// DELETE /api/events
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 });
    }

    const events = await readEvents();
    
    // Find event to delete
    const eventToDelete = events.find((e: Event) => e.id === id);
    if (!eventToDelete) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }
    
    // Delete associated image
    if (eventToDelete.image) {
      const imagePath = path.join(process.cwd(), 'public', eventToDelete.image);
      try {
        await fs.unlink(imagePath);
      } catch (error) {
        console.error('Error deleting image:', error);
      }
    }
    
    // Delete event
    const filteredEvents = events.filter((e: Event) => e.id !== id);
    await writeEvents(filteredEvents);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting event:', error);
    return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 });
  }
}

// host/api/v1/routes?= **
// host/api/v2/routes?=events

// host/endpoints?= **

