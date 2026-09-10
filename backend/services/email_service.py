"""
Email Service — EcoBuild AI

Sends credential emails when Admins create Architect accounts or Architects
create Customer accounts. Falls back to console logging if SMTP is not configured.

TODO: Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS in backend/.env to enable
      real email delivery. Until then, credentials are logged to console and
      returned once in the API response.
"""
import os
import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from config import get_settings

logger = logging.getLogger("ecobuild.email")


def _get_smtp_config():
    settings = get_settings()
    return {
        "host": getattr(settings, "SMTP_HOST", ""),
        "port": int(getattr(settings, "SMTP_PORT", 587)),
        "user": getattr(settings, "SMTP_USER", ""),
        "password": getattr(settings, "SMTP_PASS", ""),
        "from_addr": getattr(settings, "SMTP_FROM", "noreply@ecobuild.ai"),
    }


def _is_smtp_configured() -> bool:
    cfg = _get_smtp_config()
    return bool(cfg["host"] and cfg["user"] and cfg["password"])


def send_architect_credentials(to_email: str, name: str, temp_password: str) -> bool:
    """
    Send Architect account credentials to the given email address.
    Returns True if email was sent, False if SMTP not configured (credentials
    will be shown once in the UI instead).
    """
    subject = "Your EcoBuild AI Architect Account — Login Credentials"
    body = f"""Hello {name},

Your EcoBuild AI Architect account has been created by your platform administrator.

Login Details
-------------
Email:    {to_email}
Password: {temp_password}

Login URL: http://localhost:3000/login

IMPORTANT: Please change your password immediately after logging in for the first time.
           Go to your Profile page and click "Change Password".

If you have any questions, contact your EcoBuild AI platform administrator.

— EcoBuild AI Platform
"""
    return _send_email(to_email, subject, body)


def send_customer_credentials(to_email: str, name: str, temp_password: str, project_name: str = "") -> bool:
    """
    Send Customer account credentials to the given email address.
    Returns True if email was sent, False if SMTP not configured.
    """
    project_note = f'You have been invited to track the project: "{project_name}".\n\n' if project_name else ""
    subject = "Your EcoBuild AI Customer Account — Project Access Credentials"
    body = f"""Hello {name},

Your EcoBuild AI Customer account has been created. You can now log in to track your construction project.

{project_note}Login Details
-------------
Email:    {to_email}
Password: {temp_password}

Login URL: http://localhost:3000/login

IMPORTANT: Please change your password after your first login.

— EcoBuild AI Platform
"""
    return _send_email(to_email, subject, body)


def send_contact_email(name: str, email: str, phone: str, subject: str, message: str) -> bool:
    """
    Forward a ContactUs form submission to the platform admin email.
    Returns True if sent, False if SMTP not configured.
    """
    cfg = _get_smtp_config()
    admin_email = cfg["user"] or "admin@ecobuild.ai"
    body = f"""New Contact Form Submission — EcoBuild AI

From:    {name}
Email:   {email}
Phone:   {phone}
Subject: {subject}

Message:
{message}
"""
    return _send_email(admin_email, f"[EcoBuild AI Contact] {subject}", body, reply_to=email)


def _send_email(to_addr: str, subject: str, body: str, reply_to: str = None) -> bool:
    """Internal helper. Returns True if email sent, False if SMTP not configured."""
    if not _is_smtp_configured():
        # TODO: Configure SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM in .env
        logger.warning(
            "[EMAIL_STUB] SMTP not configured. Email that would have been sent:\n"
            f"  To: {to_addr}\n"
            f"  Subject: {subject}\n"
            f"  Body: {body[:200]}..."
        )
        return False

    cfg = _get_smtp_config()
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = cfg["from_addr"]
        msg["To"] = to_addr
        if reply_to:
            msg["Reply-To"] = reply_to

        msg.attach(MIMEText(body, "plain"))

        with smtplib.SMTP(cfg["host"], cfg["port"]) as server:
            server.ehlo()
            server.starttls()
            server.login(cfg["user"], cfg["password"])
            server.sendmail(cfg["from_addr"], to_addr, msg.as_string())

        logger.info(f"[EMAIL] Sent '{subject}' to {to_addr}")
        return True

    except Exception as e:
        logger.error(f"[EMAIL_ERROR] Failed to send email to {to_addr}: {e}")
        return False
