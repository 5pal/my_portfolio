'use server'

import ContactFormEmail from '@/emails/contact-form-email'
import { ContactFormSchema } from '@/lib/schemas'
import { Resend } from 'resend'
import { z } from 'zod'

type ContactFormInputs = z.infer<typeof ContactFormSchema>
const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendEmail(data: ContactFormInputs) {
  const result = ContactFormSchema.safeParse(data)

  if (result.error) {
    return { error: result.error.format() }
  }

  try {
    const { name, email, message } = result.data
    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: [email],
      cc: ['onboarding@resend.dev'],
      subject: 'Contact form submission',
      text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
      react: ContactFormEmail({ name, email, message }) as React.ReactElement
    })

    if (!data || error) {
      throw new Error('Failed to send email')
    }

    return { success: true }
  } catch (error) {
    return {
      error
    }
  }
}
