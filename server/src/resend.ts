import axios from 'axios';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_API_URL = 'https://api.resend.com/emails';

if (!RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY is not set in environment variables');
}

export async function sendVerificationEmail(to: string, code: string, purpose: 'register' | 'reset') {
  const subject = purpose === 'register' ? 'Your Leornian Registration Code' : 'Your Leornian Password Reset Code';
  const text = `Your verification code is: ${code}\n\nThis code will expire in 15 minutes.`;
  const html = `
    <div style="font-family: Georgia, 'Times New Roman', Times, serif; color: #1f1f1f; line-height: 1.7; padding: 0 12px;">
  <p style="font-size: 18px; margin-bottom: 16px;">
    Bonsoir, cher invité distingué —
  </p>

  <p style="font-size: 16px; margin-bottom: 16px;">
    It is with the deepest pleasure that we present to you the next delicately prepared offering in your authentication <em>dégustation</em> — a six-digit <em>code de vérification</em>, curated with the utmost care by our in-house cryptographic artisans.
  </p>

  <p style="font-size: 16px; margin-bottom: 16px;">
    This ephemeral morsel, a fleeting fusion of security and elegance, has been served <em>en clair</em> and garnished with a whisper of urgency. It is, as the French say, <em>à consommer sans délai</em> — to be consumed without delay.
  </p>

  <div style="font-family: 'Courier New', Courier, monospace; font-size: 2.8em; font-weight: bold; letter-spacing: 0.25em; color: #2563eb; margin: 32px 0; text-align: center;">
    ${code}
  </div>

  <p style="font-size: 16px; color: #444; margin-bottom: 16px;">
    This course will expire gracefully in <strong>15 minutes</strong>, vanishing like a fine sabayon into the ether. Should you desire an encore, a fresh code may be summoned at your convenience — the <em>maison</em> is always prepared.
  </p>

  <p style="font-size: 14px; color: #666; font-style: italic; margin-bottom: 8px;">
    With gratitude for allowing us to serve you in this brief but exquisite moment of <em>cyber-gastronomie</em>,
  </p>

  <p style="font-size: 14px; color: #888;">
    <strong>Le Système de Sécurité</strong><br/>
    Maison Leornian, Est. 2025
  </p>
</div>
  `;

  try {
    await axios.post(
      RESEND_API_URL,
      {
        from: 'no-reply@leo.jackcrew.net',
        to,
        subject,
        text,
        html,
      },
      {
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Failed to send verification email:', error);
    throw new Error('Failed to send verification email');
  }
} 