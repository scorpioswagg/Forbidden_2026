type TemplatePayload = {
  name?: string | null;
  referenceId?: string | null;
  decision?: "approved" | "denied" | "fulfilled";
  reason?: string | null;
};

export type EmailTemplate = {
  subject: string;
  html: string;
  text: string;
};

function wrap(content: string) {
  return `
    <div style="font-family:Arial, sans-serif; background:#0b0b10; color:#f8fafc; padding:24px">
      <div style="max-width:560px; margin:0 auto; background:#0f172a; border-radius:16px; padding:24px">
        ${content}
      </div>
      <p style="font-size:12px; color:#94a3b8; margin-top:16px">
        Forbidden 2026 · This inbox is for notifications only.
      </p>
    </div>
  `;
}

export function welcomeTemplate(payload: TemplatePayload): EmailTemplate {
  const name = payload.name ?? "there";
  return {
    subject: "Welcome to Forbidden 2026",
    html: wrap(
      `<h1 style="margin:0 0 12px">Welcome, ${name}</h1>
       <p style="margin:0">Your account is ready. Explore the feed, upload to your vault, and meet your admirers.</p>`
    ),
    text: `Welcome, ${name}! Your account is ready. Explore the feed, upload to your vault, and meet your admirers.`
  };
}

export function uploadConfirmTemplate(payload: TemplatePayload): EmailTemplate {
  return {
    subject: "Vault upload received",
    html: wrap(
      `<h1 style="margin:0 0 12px">Upload confirmed</h1>
       <p style="margin:0">We received your vault upload${
         payload.referenceId ? ` (ID: ${payload.referenceId})` : ""
       }. Your points have been updated.</p>`
    ),
    text: `Upload confirmed. We received your vault upload${
      payload.referenceId ? ` (ID: ${payload.referenceId})` : ""
    }. Your points have been updated.`
  };
}

export function redemptionRequestTemplate(payload: TemplatePayload): EmailTemplate {
  return {
    subject: "Redemption request received",
    html: wrap(
      `<h1 style="margin:0 0 12px">Redemption requested</h1>
       <p style="margin:0">We received your redemption request${
         payload.referenceId ? ` (ID: ${payload.referenceId})` : ""
       }. We will notify you once it is reviewed.</p>`
    ),
    text: `We received your redemption request${
      payload.referenceId ? ` (ID: ${payload.referenceId})` : ""
    }. We will notify you once it is reviewed.`
  };
}

export function redemptionDecisionTemplate(payload: TemplatePayload): EmailTemplate {
  const decision = payload.decision ?? "approved";
  return {
    subject: `Redemption ${decision}`,
    html: wrap(
      `<h1 style="margin:0 0 12px">Redemption ${decision}</h1>
       <p style="margin:0">Your redemption request has been ${decision}.${
         payload.referenceId ? ` Reference: ${payload.referenceId}.` : ""
       }</p>`
    ),
    text: `Your redemption request has been ${decision}.${
      payload.referenceId ? ` Reference: ${payload.referenceId}.` : ""
    }`
  };
}

export function moderationNoticeTemplate(payload: TemplatePayload): EmailTemplate {
  return {
    subject: "Account moderation notice",
    html: wrap(
      `<h1 style="margin:0 0 12px">Moderation update</h1>
       <p style="margin:0">We took action on your account.${
         payload.reason ? ` Reason: ${payload.reason}.` : ""
       } Reply to this message if you have questions.</p>`
    ),
    text: `We took action on your account.${
      payload.reason ? ` Reason: ${payload.reason}.` : ""
    } Reply to this message if you have questions.`
  };
}
