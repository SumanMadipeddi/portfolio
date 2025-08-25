import emailjs from '@emailjs/browser';

// EmailJS Configuration using environment variables
// Create a .env file in your project root with these variables:
// VITE_EMAILJS_SERVICE_ID=your_service_id_here
// VITE_EMAILJS_TEMPLATE_ID=your_template_id_here
// VITE_EMAILJS_PUBLIC_KEY=your_public_key_here
export const EMAILJS_CONFIG = {
  SERVICE_ID: import.meta.env.VITE_EMAILJS_SERVICE_ID || 'YOUR_SERVICE_ID',
  TEMPLATE_ID: import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'YOUR_TEMPLATE_ID',
  PUBLIC_KEY: import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'YOUR_PUBLIC_KEY',
};

// Initialize EmailJS
emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);

// Email template variables interface
export interface EmailTemplateData extends Record<string, unknown> {
  from_name: string;
  from_email: string;
  subject: string;
  message: string;
  to_email: string;
}

// Send email function
export const sendEmail = async (templateData: EmailTemplateData): Promise<any> => {
  try {
    const result = await emailjs.send(
      EMAILJS_CONFIG.SERVICE_ID,
      EMAILJS_CONFIG.TEMPLATE_ID,
      templateData,
      EMAILJS_CONFIG.PUBLIC_KEY
    );
    return result;
  } catch (error) {
    console.error('EmailJS Error:', error);
    throw error;
  }
};
