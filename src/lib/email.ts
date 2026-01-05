// Email notification service using Resend

import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export interface EmailParams {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: EmailParams) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not set, skipping email send')
    return { success: false, message: 'Email service not configured' }
  }

  try {
    await resend.emails.send({
      from: process.env.FROM_EMAIL || 'noreply@example.com',
      to,
      subject,
      html,
    })
    return { success: true }
  } catch (error) {
    console.error('Failed to send email:', error)
    return { success: false, error }
  }
}

// Email templates
export function getAppraisalAssignedEmail(
  employeeName: string,
  templateTitle: string,
  dueDate?: Date
): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #3b82f6; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9fafb; }
          .button { display: inline-block; padding: 12px 24px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Appraisal Assigned</h1>
          </div>
          <div class="content">
            <p>Hello ${employeeName},</p>
            <p>A new performance appraisal has been assigned to you: <strong>${templateTitle}</strong></p>
            ${dueDate ? `<p>Due date: <strong>${new Date(dueDate).toLocaleDateString()}</strong></p>` : ''}
            <p>Please log in to the portal to complete your self-assessment.</p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/appraisals" class="button">View Appraisal</a>
          </div>
        </div>
      </body>
    </html>
  `
}

export function getAppraisalSubmittedEmail(
  managerName: string,
  employeeName: string,
  templateTitle: string
): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #3b82f6; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9fafb; }
          .button { display: inline-block; padding: 12px 24px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Appraisal Submitted for Review</h1>
          </div>
          <div class="content">
            <p>Hello ${managerName},</p>
            <p><strong>${employeeName}</strong> has submitted their appraisal: <strong>${templateTitle}</strong></p>
            <p>Please review and provide your feedback.</p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/manager/reviews" class="button">Review Now</a>
          </div>
        </div>
      </body>
    </html>
  `
}

export function getAppraisalCompletedEmail(
  employeeName: string,
  templateTitle: string
): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #10b981; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9fafb; }
          .button { display: inline-block; padding: 12px 24px; background-color: #10b981; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Appraisal Completed</h1>
          </div>
          <div class="content">
            <p>Hello ${employeeName},</p>
            <p>Your performance appraisal <strong>${templateTitle}</strong> has been completed.</p>
            <p>You can now view the final results and download your appraisal report.</p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/appraisals" class="button">View Results</a>
          </div>
        </div>
      </body>
    </html>
  `
}
