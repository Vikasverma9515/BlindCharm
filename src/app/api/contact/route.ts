// app/api/contact/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { supabase } from '@/lib/supabase';
import { zeptoMail } from '@/lib/zepto-mail';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { messageType, subject, message, name, email } = await request.json();

    // Validation
    if (!subject || !message || !name || !email || !messageType) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      );
    }

    if (message.length > 1000) {
      return NextResponse.json(
        { success: false, error: 'Message is too long (max 1000 characters)' },
        { status: 400 }
      );
    }

    // Get user agent and IP for tracking
    const userAgent = request.headers.get('user-agent') || '';
    const forwarded = request.headers.get('x-forwarded-for');
    const ipAddress = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || '';

    // Determine priority based on message type
    const priority = messageType === 'bug_report' ? 'high' : messageType === 'complaint' ? 'high' : 'normal';

    // Save to database
    const { data, error: dbError } = await supabase
      .from('contact_messages')
      .insert({
        user_id: session?.user?.id || null,
        name,
        email,
        message_type: messageType,
        subject,
        message,
        priority,
        user_agent: userAgent,
        ip_address: ipAddress,
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { success: false, error: 'Failed to save message' },
        { status: 500 }
      );
    }

    // Send notification email to admin
    const adminEmailResult = await zeptoMail.sendEmail({
      to: process.env.ADMIN_EMAIL || 'admin@blindcharm.com', // Set your admin email
      subject: `[BlindCharm] New ${messageType.replace('_', ' ').toUpperCase()}: ${subject}`,
      htmlContent: generateAdminNotificationEmail({
        id: data.id,
        name,
        email,
        messageType,
        subject,
        message,
        priority,
        userId: session?.user?.id,
        userAgent,
        ipAddress,
      }),
    });

    // Send confirmation email to user
    const userEmailResult = await zeptoMail.sendEmail({
      to: email,
      subject: `We received your message - ${subject}`,
      htmlContent: generateUserConfirmationEmail({
        name,
        messageType,
        subject,
        message,
      }),
    });

    console.log('Admin email result:', adminEmailResult);
    console.log('User email result:', userEmailResult);

        return NextResponse.json({
      success: true,
      message: 'Your message has been sent successfully!',
      id: data.id,
    });

  } catch (error) {
    console.error('Contact form API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Email template for admin notification
function generateAdminNotificationEmail(data: {
  id: string;
  name: string;
  email: string;
  messageType: string;
  subject: string;
  message: string;
  priority: string;
  userId?: string;
  userAgent: string;
  ipAddress: string;
}) {
  const priorityColor = data.priority === 'high' ? '#dc3545' : data.priority === 'normal' ? '#28a745' : '#6c757d';
  const typeEmoji = {
    bug_report: '🐛',
    feature_request: '💡',
    feedback: '💬',
    complaint: '⚠️',
    question: '❓',
    other: '📝'
  }[data.messageType] || '📝';

  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>New Contact Message - BlindCharm</title>
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center; color: white; }
            .content { padding: 30px; }
            .priority-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; text-transform: uppercase; margin-bottom: 15px; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
            .info-item { background: #f8f9fa; padding: 15px; border-radius: 8px; }
            .info-label { font-size: 12px; color: #6c757d; text-transform: uppercase; margin-bottom: 5px; }
            .info-value { font-weight: 600; color: #333; }
            .message-content { background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea; margin: 20px 0; }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #6c757d; font-size: 14px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 10px 5px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>${typeEmoji} New Contact Message</h1>
                <p>BlindCharm Admin Panel</p>
            </div>
            
            <div class="content">
                <div class="priority-badge" style="background-color: ${priorityColor}; color: white;">
                    ${data.priority} Priority
                </div>
                
                <h2 style="margin: 0 0 10px; color: #333;">${data.subject}</h2>
                <p style="color: #666; margin-bottom: 20px;">Message Type: <strong>${data.messageType.replace('_', ' ').toUpperCase()}</strong></p>
                
                <div class="info-grid">
                    <div class="info-item">
                        <div class="info-label">From</div>
                        <div class="info-value">${data.name}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Email</div>
                        <div class="info-value">${data.email}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Message ID</div>
                        <div class="info-value">${data.id}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">User ID</div>
                        <div class="info-value">${data.userId || 'Guest'}</div>
                    </div>
                </div>
                
                <div class="message-content">
                    <h3 style="margin: 0 0 15px; color: #333;">Message:</h3>
                    <p style="line-height: 1.6; color: #555; white-space: pre-wrap;">${data.message}</p>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="mailto:${data.email}?subject=Re: ${data.subject}" class="button">Reply to User</a>
                    <a href="${process.env.NEXTAUTH_URL}/admin/messages/${data.id}" class="button" style="background: #28a745;">View in Admin Panel</a>
                </div>
                
                <div style="font-size: 12px; color: #999; margin-top: 20px;">
                    <p><strong>Technical Details:</strong></p>
                    <p>IP: ${data.ipAddress}</p>
                    <p>User Agent: ${data.userAgent}</p>
                    <p>Timestamp: ${new Date().toISOString()}</p>
                </div>
            </div>
            
            <div class="footer">
                <p><strong>BlindCharm</strong> - Admin Notification System</p>
            </div>
        </div>
    </body>
    </html>
  `;
}

// Email template for user confirmation
function generateUserConfirmationEmail(data: {
  name: string;
  messageType: string;
  subject: string;
  message: string;
}) {
  const typeEmoji = {
    bug_report: '🐛',
    feature_request: '💡',
    feedback: '💬',
    complaint: '⚠️',
    question: '❓',
    other: '📝'
  }[data.messageType] || '📝';

  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Message Received - BlindCharm</title>
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; }
            .header h1 { color: white; margin: 0; font-size: 28px; font-weight: 700; }
            .header p { color: rgba(255,255,255,0.9); margin: 8px 0 0; font-size: 16px; }
            .content { padding: 40px 30px; }
            .message-summary { background: #f8f9ff; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0; border-radius: 0 8px 8px 0; }
            .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #6c757d; font-size: 14px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>${typeEmoji} Message Received!</h1>
                <p>Thank you for contacting BlindCharm</p>
            </div>
            
            <div class="content">
                <h2>Hi ${data.name}! 👋</h2>
                <p>We've successfully received your message and wanted to let you know that we're on it!</p>
                
                <div class="message-summary">
                    <p><strong>Message Type:</strong> ${data.messageType.replace('_', ' ').charAt(0).toUpperCase() + data.messageType.replace('_', ' ').slice(1)}</p>
                    <p><strong>Subject:</strong> ${data.subject}</p>
                    <p><strong>Your Message:</strong></p>
                    <p style="font-style: italic; color: #666; white-space: pre-wrap;">"${data.message}"</p>
                </div>
                
                <h3>What happens next?</h3>
                <ul style="line-height: 1.8;">
                    <li>🔍 Our team will review your message within 24 hours</li>
                    <li>📧 You'll receive a personal response within 24-48 hours</li>
                    <li>🚀 If it's a bug report or feature request, we'll keep you updated on progress</li>
                </ul>
                
                <p>In the meantime, feel free to continue enjoying BlindCharm! If you have any urgent concerns, you can always reach out to us directly.</p>
                
                <p style="color: #666; margin-top: 30px;">
                    <strong>Need immediate help?</strong><br>
                    Check out our <a href="${process.env.NEXTAUTH_URL}/help" style="color: #667eea;">Help Center</a> or 
                    <a href="${process.env.NEXTAUTH_URL}/faq" style="color: #667eea;">FAQ</a> for quick answers.
                </p>
            </div>
            
            <div class="footer">
                <p>
                    <strong>BlindCharm</strong> - Where authentic connections begin<br>
                    This is an automated confirmation. Please do not reply to this email.
                </p>
            </div>
        </div>
    </body>
    </html>
  `;
}