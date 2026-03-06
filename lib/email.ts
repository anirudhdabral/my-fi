import nodemailer from "nodemailer";

const { ADMIN_EMAIL, GMAIL_PASS } = process.env;

if (!ADMIN_EMAIL || !GMAIL_PASS) {
  throw new Error("Gmail SMTP credentials are not configured");
}

const transport = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: ADMIN_EMAIL,
    pass: GMAIL_PASS,
  },
});

export async function sendRebalanceEmail(
  recipients: string[],
  html: string,
  text: string,
) {
  if (!recipients.length) {
    throw new Error("No subscribed users available for the rebalance email");
  }

  await transport.sendMail({
    from: ADMIN_EMAIL,
    to: recipients,
    subject: "MyFi Portfolio Rebalance",
    text,
    html,
  });
}

export async function sendUserApprovalEmail(recipient: string) {
  const html = `
    <h1>Access Granted</h1>
    <p>Welcome! Your access to the MyFi portal has been approved.</p>
    <p>You can now log in and manage your investment allocations.</p>
    <a href="${process.env.NEXTAUTH_URL}">Go to Dashboard</a>
  `;
  const text = `Access Granted. Your access to the MyFi portal has been approved. You can now log in and manage your investment allocations at ${process.env.NEXTAUTH_URL}`;

  await transport.sendMail({
    from: ADMIN_EMAIL,
    to: recipient,
    subject: "MyFi Portal: Access Granted",
    text,
    html,
  });
}

