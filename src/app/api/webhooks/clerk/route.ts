import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { Webhook } from 'svix'
import { dbHelpers } from '@/lib/supabase'

export async function POST(req: Request) {
  // Get the headers
  const headerPayload = await headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new NextResponse('Error occured -- no svix headers', {
      status: 400,
    })
  }

  // Get the body
  const payload = await req.json()
  const body = JSON.stringify(payload)

  // Create a new Svix instance with your secret.
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!)

  let evt: any

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as any
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return new NextResponse('Error occured', {
      status: 400,
    })
  }

  // Handle the webhook
  const eventType = evt.type

  try {
    switch (eventType) {
      case 'user.created': {
        const { id, username, image_url, email_addresses } = evt.data
        
        await dbHelpers.createUserProfile(id, {
          username: username || email_addresses[0]?.email_address?.split('@')[0],
          avatarUrl: image_url,
        })
        
        console.log('User profile created for:', id)
        break
      }
      
      case 'user.updated': {
        const { id, username, image_url } = evt.data
        
        // You can add update logic here if needed
        console.log('User updated:', id)
        break
      }
      
      case 'user.deleted': {
        const { id } = evt.data
        
        // Note: Supabase will handle cascading deletes due to foreign key constraints
        console.log('User deleted:', id)
        break
      }
      
      default:
        console.log('Unhandled webhook type:', eventType)
    }
    
    return new NextResponse('Webhook processed successfully', { status: 200 })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return new NextResponse('Error processing webhook', { status: 500 })
  }
}