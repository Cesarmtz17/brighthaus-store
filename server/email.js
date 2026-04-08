// ============================================
// BrightHaus — Email Service
// ============================================

const nodemailer = require('nodemailer');

let transporter = null;

function initTransporter() {
    if (transporter) return transporter;

    transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT),
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });

    return transporter;
}

async function sendOrderConfirmation(order) {
    try {
        const t = initTransporter();
        const items = JSON.parse(order.items);

        const itemRows = items.map(item => `
            <tr>
                <td style="padding: 12px; border-bottom: 1px solid #E5E0D8;">${item.name}</td>
                <td style="padding: 12px; border-bottom: 1px solid #E5E0D8; text-align: center;">${item.qty}</td>
                <td style="padding: 12px; border-bottom: 1px solid #E5E0D8; text-align: right;">$${(item.price * item.qty).toFixed(2)}</td>
            </tr>
        `).join('');

        const html = `
        <div style="max-width: 600px; margin: 0 auto; font-family: 'Helvetica Neue', Arial, sans-serif; color: #2C2C2C;">
            <div style="background: #1A1A1A; padding: 32px; text-align: center;">
                <h1 style="color: #F0EBE3; font-size: 28px; margin: 0;">BrightHaus</h1>
            </div>

            <div style="padding: 40px 32px; background: #FAF7F2;">
                <h2 style="font-size: 24px; margin-bottom: 8px;">Thank you for your order!</h2>
                <p style="color: #6B6B6B; margin-bottom: 24px;">Order #${order.order_number}</p>

                <p>Hi ${order.customer_name || 'there'},</p>
                <p style="color: #6B6B6B; line-height: 1.7;">We've received your order and it's being processed. You'll receive a shipping confirmation with tracking info once your order ships.</p>

                <div style="background: white; border: 1px solid #E5E0D8; border-radius: 8px; margin: 24px 0; overflow: hidden;">
                    <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                        <thead>
                            <tr style="background: #F0EBE3;">
                                <th style="padding: 12px; text-align: left;">Item</th>
                                <th style="padding: 12px; text-align: center;">Qty</th>
                                <th style="padding: 12px; text-align: right;">Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemRows}
                        </tbody>
                    </table>

                    <div style="padding: 16px; border-top: 1px solid #E5E0D8;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px;">
                            <span>Subtotal</span>
                            <span>$${order.subtotal.toFixed(2)}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px;">
                            <span>Shipping (${order.shipping_method})</span>
                            <span>${order.shipping_cost === 0 ? 'FREE' : '$' + order.shipping_cost.toFixed(2)}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; font-weight: 700; font-size: 16px; padding-top: 8px; border-top: 1px solid #E5E0D8;">
                            <span>Total</span>
                            <span>$${order.total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                <div style="background: white; border: 1px solid #E5E0D8; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                    <h3 style="font-size: 14px; margin-bottom: 12px; color: #6B6B6B; text-transform: uppercase; letter-spacing: 1px;">Shipping Address</h3>
                    <p style="margin: 0; line-height: 1.6;">
                        ${order.shipping_name}<br>
                        ${order.shipping_address_line1}<br>
                        ${order.shipping_address_line2 ? order.shipping_address_line2 + '<br>' : ''}
                        ${order.shipping_city}, ${order.shipping_state} ${order.shipping_zip}
                    </p>
                </div>

                <p style="color: #6B6B6B; font-size: 14px; line-height: 1.7;">
                    Estimated delivery: ${order.shipping_method === 'express' ? '2-3' : '5-7'} business days.<br>
                    Questions? Reply to this email and we'll help you out.
                </p>
            </div>

            <div style="background: #1A1A1A; padding: 24px 32px; text-align: center;">
                <p style="color: #7A746A; font-size: 12px; margin: 0;">© 2026 BrightHaus. All rights reserved.</p>
            </div>
        </div>
        `;

        await t.sendMail({
            from: process.env.EMAIL_FROM,
            to: order.customer_email,
            subject: `Order Confirmed — #${order.order_number}`,
            html
        });

        console.log(`Order confirmation email sent to ${order.customer_email}`);
    } catch (err) {
        console.error('Email send failed:', err.message);
        // Don't throw — email failure shouldn't break the order flow
    }
}

async function sendShippingNotification(order) {
    try {
        const t = initTransporter();

        const html = `
        <div style="max-width: 600px; margin: 0 auto; font-family: 'Helvetica Neue', Arial, sans-serif; color: #2C2C2C;">
            <div style="background: #1A1A1A; padding: 32px; text-align: center;">
                <h1 style="color: #F0EBE3; font-size: 28px; margin: 0;">BrightHaus</h1>
            </div>
            <div style="padding: 40px 32px; background: #FAF7F2;">
                <h2 style="font-size: 24px; margin-bottom: 16px;">Your order has shipped!</h2>
                <p style="color: #6B6B6B;">Order #${order.order_number}</p>
                <p style="color: #6B6B6B; line-height: 1.7;">Great news! Your order is on its way.</p>
                ${order.tracking_number ? `
                    <div style="background: white; border: 1px solid #E5E0D8; border-radius: 8px; padding: 20px; margin: 24px 0; text-align: center;">
                        <p style="color: #6B6B6B; font-size: 13px; margin-bottom: 8px;">TRACKING NUMBER</p>
                        <p style="font-size: 20px; font-weight: 700; margin: 0;">${order.tracking_number}</p>
                    </div>
                ` : ''}
                <p style="color: #6B6B6B; font-size: 14px;">Questions? Reply to this email.</p>
            </div>
            <div style="background: #1A1A1A; padding: 24px 32px; text-align: center;">
                <p style="color: #7A746A; font-size: 12px; margin: 0;">© 2026 BrightHaus. All rights reserved.</p>
            </div>
        </div>
        `;

        await t.sendMail({
            from: process.env.EMAIL_FROM,
            to: order.customer_email,
            subject: `Your Order Has Shipped — #${order.order_number}`,
            html
        });
    } catch (err) {
        console.error('Shipping email failed:', err.message);
    }
}

// Notify admin (you) about new order so you can fulfill it on CJ
async function sendAdminNotification(order) {
    try {
        const t = initTransporter();
        const items = JSON.parse(order.items);

        const itemList = items.map(i => `- ${i.qty}x ${i.name} ($${(i.price * i.qty).toFixed(2)})`).join('\n');

        const html = `
        <div style="max-width: 600px; margin: 0 auto; font-family: 'Helvetica Neue', Arial, sans-serif; color: #2C2C2C;">
            <div style="background: #B8956A; padding: 24px; text-align: center;">
                <h1 style="color: white; font-size: 22px; margin: 0;">NEW ORDER - Action Required</h1>
            </div>
            <div style="padding: 32px; background: #FAF7F2;">
                <h2 style="font-size: 20px; margin-bottom: 16px;">Order #${order.order_number}</h2>
                <p style="font-size: 14px; color: #6B6B6B;">Total: <strong style="color:#2C2C2C;">$${order.total.toFixed(2)}</strong></p>

                <div style="background: white; border: 1px solid #E5E0D8; border-radius: 8px; padding: 20px; margin: 16px 0;">
                    <h3 style="font-size: 14px; color: #6B6B6B; margin-bottom: 12px;">ITEMS TO ORDER ON CJ:</h3>
                    <pre style="font-size: 14px; margin: 0; white-space: pre-wrap;">${itemList}</pre>
                </div>

                <div style="background: white; border: 1px solid #E5E0D8; border-radius: 8px; padding: 20px; margin: 16px 0;">
                    <h3 style="font-size: 14px; color: #6B6B6B; margin-bottom: 12px;">SHIP TO:</h3>
                    <p style="margin: 0; line-height: 1.8; font-size: 14px;">
                        <strong>${order.shipping_name}</strong><br>
                        ${order.shipping_address_line1}<br>
                        ${order.shipping_address_line2 ? order.shipping_address_line2 + '<br>' : ''}
                        ${order.shipping_city}, ${order.shipping_state} ${order.shipping_zip}<br>
                        ${order.shipping_country}
                    </p>
                </div>

                <div style="background: white; border: 1px solid #E5E0D8; border-radius: 8px; padding: 20px; margin: 16px 0;">
                    <h3 style="font-size: 14px; color: #6B6B6B; margin-bottom: 12px;">CUSTOMER:</h3>
                    <p style="margin: 0; font-size: 14px;">
                        ${order.customer_name} — ${order.customer_email}
                    </p>
                </div>

                <p style="font-size: 13px; color: #9A9A9A; margin-top: 20px;">
                    1. Go to CJ Dropshipping and place this order<br>
                    2. Update tracking at: <a href="${process.env.FRONTEND_URL}/admin">Admin Panel</a>
                </p>
            </div>
        </div>
        `;

        await t.sendMail({
            from: process.env.EMAIL_FROM,
            to: process.env.SMTP_USER, // Send to yourself
            subject: `[BrightHaus] NEW ORDER #${order.order_number} - $${order.total.toFixed(2)}`,
            html
        });

        console.log(`Admin notification sent for order ${order.order_number}`);
    } catch (err) {
        console.error('Admin notification failed:', err.message);
    }
}

module.exports = { sendOrderConfirmation, sendShippingNotification, sendAdminNotification };
