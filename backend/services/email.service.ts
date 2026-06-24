import nodemailer from "nodemailer";
import { env } from "../config/env.js";

// ← Transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASS,
  },
});

// ← Email templates
const emailTemplates = {
  pending: {
    subject: "🛍️ Order Received — MyStore",
    color: "#F59E0B",
    icon: "⏳",
    title: "Order Received!",
    message:
      "Your order has been received and is pending processing. We will update you soon!",
    statusLabel: "Pending",
  },
  processing: {
    subject: "⚙️ Order Processing — MyStore",
    color: "#3B82F6",
    icon: "⚙️",
    title: "Order Processing!",
    message: "Your order is being processed. It will be shipped soon!",
    statusLabel: "Processing",
  },
  shipped: {
    subject: "🚚 Order Shipped — MyStore",
    color: "#8B5CF6",
    icon: "🚚",
    title: "Order Shipped!",
    message: "Your order has been shipped. It will reach you soon!",
    statusLabel: "Shipped",
  },
  delivered: {
    subject: "✅ Order Delivered — MyStore",
    color: "#10B981",
    icon: "✅",
    title: "Order Delivered!",
    message: "Your order has been delivered. We hope you enjoy it!",
    statusLabel: "Delivered",
  },
  cancelled: {
    subject: "❌ Order Cancelled — MyStore",
    color: "#EF4444",
    icon: "❌",
    title: "Order Cancelled",
    message:
      "Your order has been cancelled. If you have any questions, please contact us.",
    statusLabel: "Cancelled",
  },
};

// ← HTML template generate
const generateEmailHTML = (
  template: (typeof emailTemplates)[keyof typeof emailTemplates],
  order: {
    orderId: string;
    items: { name: string; quantity: number; price: number }[];
    totalAmount: number;
    shippingAddress: {
      fullName: string;
      phone: string;
      address: string;
      city: string;
      postalCode: string;
    };
  },
): string => {
  const itemsHTML = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #f3f4f6;">
          ${item.name}
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #f3f4f6;
                   text-align: center;">
          ${item.quantity}
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #f3f4f6;
                   text-align: right;">
          Rs ${(item.price * item.quantity).toLocaleString()}
        </td>
      </tr>
    `,
    )
    .join("");

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${template.subject}</title>
      </head>
      <body style="margin:0;padding:0;background:#f9fafb;
                   font-family:Arial,sans-serif;">
        <div style="max-width:600px;margin:40px auto;background:white;
                    border-radius:16px;overflow:hidden;
                    box-shadow:0 4px 6px rgba(0,0,0,0.07);">

          <!-- Header -->
          <div style="background:#111827;padding:30px;text-align:center;">
            <h1 style="color:#818CF8;margin:0;font-size:24px;">
              🛍️ MyStore
            </h1>
          </div>

          <!-- Status Banner -->
          <div style="background:${template.color};padding:20px;
                      text-align:center;">
            <span style="font-size:40px;">${template.icon}</span>
            <h2 style="color:white;margin:10px 0 0;font-size:22px;">
              ${template.title}
            </h2>
          </div>

          <!-- Body -->
          <div style="padding:30px;">

            <p style="color:#374151;font-size:16px;margin-bottom:8px;">
              Assalam-o-Alaikum
              <strong>${order.shippingAddress.fullName}</strong>!
            </p>
            <p style="color:#6B7280;font-size:14px;margin-bottom:24px;">
              ${template.message}
            </p>

            <!-- Order ID -->
            <div style="background:#F3F4F6;border-radius:8px;
                        padding:12px 16px;margin-bottom:24px;">
              <p style="margin:0;color:#6B7280;font-size:12px;">
                Order ID
              </p>
              <p style="margin:4px 0 0;color:#111827;font-weight:bold;
                        font-family:monospace;font-size:14px;">
                #${order.orderId.slice(-8).toUpperCase()}
              </p>
            </div>

            <!-- Status -->
            <div style="text-align:center;margin-bottom:24px;">
              <span style="background:${template.color}20;
                           color:${template.color};padding:6px 16px;
                           border-radius:20px;font-size:13px;
                           font-weight:bold;">
                Status: ${template.statusLabel}
              </span>
            </div>

            <!-- Items Table -->
            <h3 style="color:#111827;font-size:16px;margin-bottom:12px;">
              Order Items:
            </h3>
            <table style="width:100%;border-collapse:collapse;
                          margin-bottom:16px;">
              <thead>
                <tr style="background:#F9FAFB;">
                  <th style="padding:10px;text-align:left;color:#6B7280;
                             font-size:12px;border-bottom:2px solid #E5E7EB;">
                    Product
                  </th>
                  <th style="padding:10px;text-align:center;color:#6B7280;
                             font-size:12px;border-bottom:2px solid #E5E7EB;">
                    Qty
                  </th>
                  <th style="padding:10px;text-align:right;color:#6B7280;
                             font-size:12px;border-bottom:2px solid #E5E7EB;">
                    Price
                  </th>
                </tr>
              </thead>
              <tbody>${itemsHTML}</tbody>
              <tfoot>
                <tr>
                  <td colspan="2" style="padding:12px 10px;
                                         font-weight:bold;color:#111827;">
                    Total
                  </td>
                  <td style="padding:12px 10px;font-weight:bold;
                             color:#111827;text-align:right;">
                    Rs ${order.totalAmount.toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>

            <!-- Shipping -->
            <div style="background:#F3F4F6;border-radius:8px;
                        padding:16px;margin-bottom:24px;">
              <p style="margin:0 0 8px;color:#6B7280;font-size:12px;
                        font-weight:bold;text-transform:uppercase;">
                Shipping Address
              </p>
              <p style="margin:0;color:#374151;font-size:14px;">
                ${order.shippingAddress.fullName}<br>
                ${order.shippingAddress.phone}<br>
                ${order.shippingAddress.address}<br>
                ${order.shippingAddress.city},
                ${order.shippingAddress.postalCode}
              </p>
            </div>

            <p style="color:#9CA3AF;font-size:13px;text-align:center;
                      border-top:1px solid #E5E7EB;padding-top:20px;">
              Feel free to contact us if you have any questions.<br>
              Thank you for shopping with us! 🙏
            </p>
          </div>

          <!-- Footer -->
          <div style="background:#111827;padding:20px;text-align:center;">
            <p style="color:#6B7280;font-size:12px;margin:0;">
              © 2025 MyStore. All rights reserved.
            </p>
          </div>

        </div>
      </body>
    </html>
  `;
};

// ← Main email function
export const sendOrderStatusEmail = async ({
  toEmail,
  status,
  order,
}: {
  toEmail: string;
  status: keyof typeof emailTemplates;
  order: {
    orderId: string;
    items: { name: string; quantity: number; price: number }[];
    totalAmount: number;
    shippingAddress: {
      fullName: string;
      phone: string;
      address: string;
      city: string;
      postalCode: string;
    };
  };
}): Promise<{ success: boolean; error?: string }> => {
  try {
    const template = emailTemplates[status];

    await transporter.sendMail({
      from: env.EMAIL_FROM,
      to: toEmail,
      subject: template.subject,
      html: generateEmailHTML(template, order),
    });

    console.log(`✅ Email sent to ${toEmail} — Status: ${status}`);
    return { success: true };
  } catch (error: any) {
    console.error("❌ Email error:", error.message);
    return { success: false, error: error.message };
  }
};

// ← Connection verify
export const verifyEmailConnection = async (): Promise<boolean> => {
  try {
    await transporter.verify();
    console.log("✅ Email connection verified!");
    return true;
  } catch (error: any) {
    console.error("❌ Email connection failed:", error.message);
    return false;
  }
};
