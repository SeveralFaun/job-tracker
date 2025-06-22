require('dotenv').config();
const imaps = require('imap-simple');
const { simpleParser } = require('mailparser');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const config = {
  imap: {
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASS,
    host: 'imap.gmail.com',
    port: 993,
    tls: true,
    tlsOptions: { rejectUnauthorized: false }, // Bypass SSL verification (personal use)
  }
};

async function fetchEmails() {
  const connection = await imaps.connect({ imap: config.imap });
  await connection.openBox('INBOX');

  // Unread emails within the last week
  const searchCriteria = ['UNSEEN', ['SINCE', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)]];
  const fetchOptions = { bodies: [''], markSeen: false };

  const messages = await connection.search(searchCriteria, fetchOptions);

  for (const msg of messages) {
    const raw = msg.parts[0].body;
    const parsed = await simpleParser(raw);

    const subject = parsed.subject?.toLowerCase() || '';
    const body = parsed.text || '';

    if (
        subject.includes("thank you for applying") ||
        body.includes("thank you for applying") ||
        subject.includes("application received") ||
        body.includes("application received") ||
        body.includes("you applied to") ||
        body.includes("we received your application")
    ) {
        const jobData = {
            companyName: parsed.from?.text.split('"')[1] || 'Unknown', // crude company name extraction
            jobTitle: parsed.subject || 'Job Application',
            status: 'Applied',
            appliedDate: parsed.date
        };
        
        await fetch('http://localhost:3000/jobs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(jobData)
        });
    }
  }

  connection.end();
}

fetchEmails().catch(console.error);