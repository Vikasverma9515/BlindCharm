// lib/zepto-mail.ts
interface ZeptoMailConfig {
  apiKey: string;
  fromEmail: string;
  fromName: string;
}

interface SendEmailParams {
  to: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
}

class ZeptoMailService {
  private config: ZeptoMailConfig;

  constructor() {
    this.config = {
      apiKey: process.env.ZEPTO_MAIL_API_KEY!,
      fromEmail: process.env.ZEPTO_MAIL_FROM_EMAIL || 'noreply@blindcharm.com',
      fromName: process.env.ZEPTO_MAIL_FROM_NAME || 'BlindCharm Verification'
    };
  }

  async sendEmail({ to, subject, htmlContent, textContent }: SendEmailParams) {
    try {
      console.log('🔧 Sending email via ZeptoMail to:', to);
      
      const response = await fetch('https://api.zeptomail.in/v1.1/email', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Zoho-enczapikey ${this.config.apiKey}`, // Properly formatted
        },
        body: JSON.stringify({
          from: {
            address: this.config.fromEmail,
            name: this.config.fromName
          },
          to: [
            {
              email_address: {
                address: to,
                name: to.split('@')[0]
              }
            }
          ],
          subject,
          htmlbody: htmlContent,
          textbody: textContent || htmlContent.replace(/<[^>]*>/g, '')
        })
      });

      const result = await response.json();
      
      console.log('📧 ZeptoMail Response Status:', response.status);
      console.log('📧 ZeptoMail Response:', result);

      if (!response.ok) {
        throw new Error(`ZeptoMail API error: ${result.message || JSON.stringify(result)}`);
      }

      console.log('✅ Email sent successfully via ZeptoMail');
      return { success: true, data: result };
    } catch (error) {
      console.error('❌ ZeptoMail send error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Failed to send email' };
    }
  }

  generateOTPEmailTemplate(otp: string, collegeName?: string): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>College Verification - BlindCharm</title>
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; }
            .header h1 { color: white; margin: 0; font-size: 28px; font-weight: 700; }
            .header p { color: rgba(255,255,255,0.9); margin: 8px 0 0; font-size: 16px; }
            .content { padding: 40px 30px; }
            .otp-box { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; font-size: 32px; font-weight: bold; text-align: center; padding: 20px; border-radius: 12px; margin: 30px 0; letter-spacing: 8px; }
            .info { background-color: #f8f9ff; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0; border-radius: 0 8px 8px 0; }
            .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #6c757d; font-size: 14px; }
            .warning { color: #dc3545; font-weight: 600; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎓 College Verification</h1>
                <p>Verify your college email to get your verified badge</p>
            </div>
            
            <div class="content">
                <h2>Hello there! 👋</h2>
                <p>We received a request to verify your college email${collegeName ? ` for <strong>${collegeName}</strong>` : ''} on BlindCharm.</p>
                
                <p>Your verification code is:</p>
                
                <div class="otp-box">${otp}</div>
                
                <div class="info">
                    <p><strong>Important:</strong></p>
                    <ul>
                        <li>This code will expire in <strong>10 minutes</strong></li>
                        <li>Enter this code in the BlindCharm app to verify your college email</li>
                        <li>Don't share this code with anyone</li>
                    </ul>
                </div>
                
                <p>Once verified, you'll get a <strong>✅ College Verified</strong> badge on your profile, which helps build trust with other users.</p>
                
                <p class="warning">If you didn't request this verification, please ignore this email.</p>
            </div>
            
            <div class="footer">
                <p>
                    <strong>BlindCharm</strong> - Where authentic connections begin<br>
                    This is an automated message, please do not reply to this email.
                </p>
            </div>
        </div>
    </body>
    </html>
    `;
  }
}

export const zeptoMail = new ZeptoMailService();