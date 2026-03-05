package com.carbacount.common.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    @Value("${spring.mail.username:noreply@carbacount.com}")
    private String fromEmail;

    // ─────────────────────────────────────────────────────────────────────────
    // 1. INVITATION EMAIL (now includes assigned role)
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Send an invitation email to a new user.
     *
     * @param toEmail     Recipient's email
     * @param toName      Recipient's full name
     * @param inviterName Name of the owner who sent the invite
     * @param orgName     Organization name
     * @param inviteToken UUID token string for password setup
     * @param roleName    The role being assigned (e.g. "ADMIN", "DATA_ENTRY",
     *                    "VIEWER")
     */
    public void sendInvitationEmail(String toEmail, String toName, String inviterName,
            String orgName, String inviteToken, String roleName) {
        String setPasswordUrl = frontendUrl + "/set-password?token=" + inviteToken;
        String subject = "You've been invited to " + orgName + " on CarbACount";
        String html = buildInvitationHtml(toName, inviterName, orgName, setPasswordUrl, roleName);
        send(toEmail, subject, html, "Invitation [role=" + roleName + "]");
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 2. ROLE CHANGE EMAIL
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Notify a user that their role has been changed by the owner.
     */
    public void sendRoleChangedEmail(String toEmail, String toName, String orgName,
            String oldRole, String newRole) {
        String subject = "Your role in " + orgName + " has been updated";
        String html = buildRoleChangeHtml(toName, orgName, oldRole, newRole);
        send(toEmail, subject, html, "Role change [" + oldRole + " → " + newRole + "]");
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 3. ACCOUNT DELETION EMAIL
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Notify a user that their account has been removed from the organization.
     */
    public void sendAccountDeletedEmail(String toEmail, String toName, String orgName) {
        String subject = "Your account in " + orgName + " has been removed";
        String html = buildAccountDeletedHtml(toName, orgName);
        send(toEmail, subject, html, "Account deleted");
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 4. PROFILE UPDATED EMAIL (for active users edited by owner)
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Notify an ACTIVE user that their profile was updated by the owner.
     *
     * @param toEmail The user's (possibly new) email address
     * @param toName  The user's (possibly new) full name
     * @param orgName Organization name
     * @param changes A list of human-readable change descriptions, e.g. "Name
     *                changed to John"
     */
    public void sendProfileUpdatedEmail(String toEmail, String toName, String orgName,
            java.util.List<String> changes) {
        String subject = "Your profile in " + orgName + " has been updated";
        String html = buildProfileUpdatedHtml(toName, orgName, changes);
        send(toEmail, subject, html, "Profile updated");
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Internal helpers
    // ─────────────────────────────────────────────────────────────────────────

    private void send(String toEmail, String subject, String htmlBody, String logLabel) {
        if (mailSender == null) {
            System.out.println("[EMAIL - SIMULATED] " + logLabel + " → " + toEmail);
            return;
        }
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            mailSender.send(message);
            System.out.println("[EMAIL] Sent '" + subject + "' to: " + toEmail);
        } catch (MessagingException e) {
            System.err.println("[EMAIL ERROR] Failed to send '" + subject + "' to " + toEmail + ": " + e.getMessage());
        }
    }

    // ── HTML builders ─────────────────────────────────────────────────────────

    private String header() {
        return "<!DOCTYPE html><html><head><meta charset='UTF-8'></head>" +
                "<body style='font-family:Arial,sans-serif;background:#f4f6f8;margin:0;padding:0;'>" +
                "<div style='max-width:520px;margin:40px auto;background:white;border-radius:12px;" +
                "overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);'>" +
                "  <div style='background:#1a4030;padding:32px 40px;text-align:center;'>" +
                "    <h1 style='color:white;margin:0;font-size:22px;letter-spacing:-0.5px;'>CarbACount</h1>" +
                "    <p style='color:#a3c4b5;margin:6px 0 0;font-size:14px;'>Carbon Accounting Platform</p>" +
                "  </div>" +
                "  <div style='padding:40px;'>";
    }

    private String footer() {
        return "  </div>" +
                "  <div style='background:#f9fafb;padding:16px 40px;border-top:1px solid #e5e7eb;text-align:center;'>" +
                "    <p style='color:#9ca3af;font-size:11px;margin:0;'>© 2025 CarbACount. Carbon Accounting Platform.</p>"
                +
                "  </div>" +
                "</div></body></html>";
    }

    private String roleBadge(String role) {
        String color;
        String upper = role == null ? "" : role.toUpperCase();
        if ("ADMIN".equals(upper)) {
            color = "#2563eb";
        } else if ("DATA_ENTRY".equals(upper)) {
            color = "#7c3aed";
        } else if ("VIEWER".equals(upper)) {
            color = "#0891b2";
        } else {
            color = "#1a4030";
        }
        return "<span style='display:inline-block;background:" + color +
                ";color:white;padding:4px 14px;border-radius:999px;font-size:13px;" +
                "font-weight:700;letter-spacing:0.3px;'>" + upper.replace("_", " ") + "</span>";
    }

    private String buildInvitationHtml(String name, String inviterName, String orgName,
            String url, String roleName) {
        return header() +
                "<p style='color:#374151;font-size:16px;margin:0 0 8px;'>Hello <strong>" + name + "</strong>,</p>" +
                "<p style='color:#6b7280;font-size:14px;line-height:1.7;margin:0 0 16px;'>" +
                "<strong>" + inviterName + "</strong> has invited you to join <strong>" + orgName +
                "</strong> on CarbACount as a:</p>" +
                "<div style='text-align:center;margin:8px 0 20px;'>" + roleBadge(roleName) + "</div>" +
                "<p style='color:#6b7280;font-size:14px;line-height:1.7;margin:0 0 24px;'>" +
                "Click below to set your password and get started.</p>" +
                "<div style='text-align:center;margin:32px 0;'>" +
                "  <a href='" + url + "' style='display:inline-block;background:#1a4030;color:white;" +
                "  padding:14px 32px;border-radius:8px;text-decoration:none;font-size:15px;" +
                "  font-weight:600;letter-spacing:0.2px;'>Set Your Password &rarr;</a>" +
                "</div>" +
                "<p style='color:#9ca3af;font-size:12px;text-align:center;margin:0;'>This link expires in 24 hours.</p>"
                +
                "<hr style='border:none;border-top:1px solid #e5e7eb;margin:28px 0;'/>" +
                "<p style='color:#9ca3af;font-size:11px;margin:0;'>If the button doesn't work, copy this link:</p>" +
                "<p style='color:#1a4030;font-size:11px;word-break:break-all;margin:4px 0 0;'>" + url + "</p>" +
                footer();
    }

    private String buildRoleChangeHtml(String name, String orgName, String oldRole, String newRole) {
        return header() +
                "<p style='color:#374151;font-size:16px;margin:0 0 8px;'>Hello <strong>" + name + "</strong>,</p>" +
                "<p style='color:#6b7280;font-size:14px;line-height:1.7;margin:0 0 20px;'>" +
                "Your role in <strong>" + orgName + "</strong> has been updated by the organization owner:</p>" +
                "<table style='width:100%;border-collapse:collapse;margin:0 0 24px;'>" +
                "  <tr>" +
                "    <td style='padding:12px 16px;background:#f9fafb;border:1px solid #e5e7eb;" +
                "    border-radius:6px 0 0 6px;text-align:center;'>" +
                "      <p style='color:#9ca3af;font-size:11px;font-weight:700;text-transform:uppercase;" +
                "      letter-spacing:0.5px;margin:0 0 8px;'>Previous</p>" +
                "      " + roleBadge(oldRole) +
                "    </td>" +
                "    <td style='padding:12px 8px;text-align:center;font-size:20px;color:#9ca3af;'>→</td>" +
                "    <td style='padding:12px 16px;background:#f0fdf4;border:1px solid #bbf7d0;" +
                "    border-radius:0 6px 6px 0;text-align:center;'>" +
                "      <p style='color:#16a34a;font-size:11px;font-weight:700;text-transform:uppercase;" +
                "      letter-spacing:0.5px;margin:0 0 8px;'>New Role</p>" +
                "      " + roleBadge(newRole) +
                "    </td>" +
                "  </tr>" +
                "</table>" +
                "<p style='color:#6b7280;font-size:14px;line-height:1.7;margin:0;'>" +
                "Your permissions and access within the platform have been updated accordingly. " +
                "Please log in again to apply the changes.</p>" +
                footer();
    }

    private String buildAccountDeletedHtml(String name, String orgName) {
        return header() +
                "<div style='text-align:center;margin:0 0 24px;'>" +
                "  <div style='display:inline-flex;align-items:center;justify-content:center;" +
                "  width:56px;height:56px;background:#fff1f2;border-radius:50%;'>" +
                "    <span style='font-size:28px;'>🚫</span>" +
                "  </div>" +
                "</div>" +
                "<p style='color:#374151;font-size:16px;margin:0 0 8px;text-align:center;'>Hello <strong>" + name
                + "</strong>,</p>" +
                "<p style='color:#6b7280;font-size:14px;line-height:1.7;margin:0 0 20px;text-align:center;'>" +
                "Your account has been <strong>removed</strong> from <strong>" + orgName
                + "</strong> on CarbACount.</p>" +
                "<div style='background:#fff1f2;border:1px solid #fecaca;border-radius:8px;padding:16px 20px;margin-bottom:24px;'>"
                +
                "  <p style='color:#991b1b;font-size:13px;line-height:1.6;margin:0;'>" +
                "  ⚠️ Your access to the organization's data and dashboards has been revoked. " +
                "  If you believe this was done in error, please contact your organization owner.</p>" +
                "</div>" +
                "<p style='color:#9ca3af;font-size:12px;text-align:center;margin:0;'>" +
                "Thank you for using CarbACount.</p>" +
                footer();
    }

    private String buildProfileUpdatedHtml(String name, String orgName, java.util.List<String> changes) {
        StringBuilder changeItems = new StringBuilder();
        for (String change : changes) {
            changeItems.append("<li style='padding:6px 0;color:#374151;font-size:14px;'>✔ ").append(change).append("</li>");
        }
        return header() +
                "<p style='color:#374151;font-size:16px;margin:0 0 8px;'>Hello <strong>" + name + "</strong>,</p>" +
                "<p style='color:#6b7280;font-size:14px;line-height:1.7;margin:0 0 20px;'>" +
                "The organization owner has updated your profile in <strong>" + orgName + "</strong>. " +
                "Here's a summary of what changed:</p>" +
                "<ul style='background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;" +
                "padding:12px 20px 12px 36px;margin:0 0 24px;list-style:none;'>" +
                changeItems +
                "</ul>" +
                "<p style='color:#6b7280;font-size:14px;line-height:1.7;margin:0;'>" +
                "Your account remains active. Please log out and back in if you notice any access changes.</p>" +
                footer();
    }
}
