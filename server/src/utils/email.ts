// backend/utils/email.ts
import { Resend } from 'resend';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

if (!process.env.RESEND_API_KEY) {
  throw new Error('Missing RESEND_API_KEY in environment variables.');
}

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail(to: string, subject: string, emailHtml: string) {
  try {
    const response = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to,
      subject,  
      html: emailHtml,
    });

    console.log('📧 Email sent:', response);
    return response;
  } catch (error) {
    console.error('❌ Failed to send email:', error);
    throw error;
  }
}
