require('dotenv').config();
const imaps = require('imap-simple');
const { simpleParser } = require('mailparser');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

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

    const matchPatterns = [
      /thank you for applying/i,
      /application (received|submitted)/i,
      /you (applied|have applied)/i,
      /we (received|got) your (application|resume)/i,
      /you (successfully )?applied/i,
      /your application has been/i,
    ];

    const combinedText = `${subject} ${body}`;
    const isJobEmail = matchPatterns.some((pattern) => pattern.test(combinedText));

    if (isJobEmail) {
      // --- Company Name Extraction ---
      let companyName = 'Unknown';
      if (parsed.from?.value?.length > 0) {
        const from = parsed.from.value[0];
        if (from.name && from.name.trim()) {
          companyName = from.name;
        } else if (from.address) {
          const domainMatch = from.address.match(/@([\w.-]+)/);
          if (domainMatch) {
            companyName = domainMatch[1].split('.')[0]; // "workday"
          }
        }
      }

      // --- Job Title Extraction ---
      let jobTitle = 'Job Application';
      const subjectRaw = parsed.subject || '';
      const titleMatch = subjectRaw.match(/(applying|applied) (to|for)? (.+?)( at | with |$)/i);
      if (titleMatch && titleMatch[3]) {
        jobTitle = titleMatch[3].trim();
      } else {
        jobTitle = subjectRaw
          .replace(/thank you for applying( to)?/i, '')
          .replace(/application received/i, '')
          .trim();
      }

      const jobData = {
        companyName,
        jobTitle,
        status: 'Applied',
        appliedDate: parsed.date,
      };

      await fetch('http://localhost:3000/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jobData),
      });
    }
  }

  connection.end();
}

module.exports = fetchEmails;