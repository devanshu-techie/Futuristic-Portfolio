// Minimal SMTP client (implicit TLS, AUTH LOGIN) for providers such as Gmail.
// Used when SMTP_HOST / SMTP_USER / SMTP_PASS are configured.
import tls from 'node:tls';
import { randomBytes } from 'node:crypto';

function b64(s) {
  return Buffer.from(s, 'utf8').toString('base64');
}

function encodeHeader(s) {
  // RFC 2047 encoded-word for non-ASCII headers
  return /^[\x20-\x7e]*$/.test(s) ? s : `=?UTF-8?B?${b64(s)}?=`;
}

function wrap76(s) {
  return s.replace(/.{1,76}/g, '$&\r\n');
}

export function buildMime({ from, to, replyTo, subject, html, text }) {
  const boundary = `b_${randomBytes(12).toString('hex')}`;
  const headers = [
    `From: ${from}`,
    `To: ${to}`,
    replyTo ? `Reply-To: ${replyTo}` : null,
    `Subject: ${encodeHeader(subject)}`,
    `Date: ${new Date().toUTCString()}`,
    `Message-ID: <${randomBytes(12).toString('hex')}@${(from.match(/@([^>]+)/) || [])[1] || 'localhost'}>`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
  ].filter(Boolean);
  const body = [
    `--${boundary}`,
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: base64',
    '',
    wrap76(b64(text)),
    `--${boundary}`,
    'Content-Type: text/html; charset=UTF-8',
    'Content-Transfer-Encoding: base64',
    '',
    wrap76(b64(html)),
    `--${boundary}--`,
    '',
  ];
  return `${headers.join('\r\n')}\r\n\r\n${body.join('\r\n')}`;
}

export function sendSmtp({ host, port = 465, user, pass, from, to, replyTo, subject, html, text, timeoutMs = 15000 }) {
  return new Promise((resolve, reject) => {
    const socket = tls.connect({ host, port, servername: host });
    let buffer = '';
    let step = 0;
    const envelopeFrom = (from.match(/<([^>]+)>/) || [null, from])[1];
    const commands = [
      () => `EHLO devanshugulati.in`,
      () => 'AUTH LOGIN',
      () => b64(user),
      () => b64(pass),
      () => `MAIL FROM:<${envelopeFrom}>`,
      () => `RCPT TO:<${to}>`,
      () => 'DATA',
      () => `${buildMime({ from, to, replyTo, subject, html, text }).replace(/^\./gm, '..')}\r\n.`,
      () => 'QUIT',
    ];
    const expected = [220, 250, 334, 334, 235, 250, 250, 354, 250, 221];
    const timer = setTimeout(() => { socket.destroy(); reject(new Error('SMTP timeout')); }, timeoutMs);

    socket.setEncoding('utf8');
    socket.on('data', (chunk) => {
      buffer += chunk;
      // A reply is complete when its last line has a space after the code.
      const lines = buffer.split('\r\n').filter(Boolean);
      const last = lines[lines.length - 1];
      if (!last || !/^\d{3} /.test(last) || !buffer.endsWith('\r\n')) return;
      const code = Number(last.slice(0, 3));
      buffer = '';
      if (code !== expected[step]) {
        clearTimeout(timer);
        socket.destroy();
        reject(new Error(`SMTP error at step ${step}: ${last.slice(0, 120)}`));
        return;
      }
      if (step === commands.length) {
        clearTimeout(timer);
        socket.end();
        resolve(true);
        return;
      }
      socket.write(`${commands[step]()}\r\n`);
      step += 1;
    });
    socket.on('error', (err) => { clearTimeout(timer); reject(err); });
  });
}
