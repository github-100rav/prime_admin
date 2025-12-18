export const orderTemplate = (order: any, message?: string) => {
  let containerCredential = ``;

  for (let i = 0; i < order.credentials.length; i++) {
    const orderOne = order.credentials[i];
    const html = `
    <div class="credential-card">
        <h3 class="credential-title">${orderOne.product}</h3>
        <div class="credential-field"><span class="label">Email:</span> <span>${orderOne.email}</span></div>
        <div class="credential-field"><span class="label">Password:</span> <span>${orderOne.password}</span></div>
        ${orderOne.message ? `<div class="credential-field"><span class="label">Message:</span> <span>${orderOne.message}</span></div>` : ''}
    </div>`;
    containerCredential += html;
  }

  const orderDate = new Date(order.createdAt).toLocaleDateString();
  const orderTime = new Date(order.createdAt).toLocaleTimeString();

  const messageSection = message ? `
    <div class="message-container">
      <h3>Special Message</h3>
      <p>${message}</p>
    </div>` : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Your Premium Subscription Access</title>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600&family=Playfair+Display:wght@700&display=swap" rel="stylesheet">
  <style>
    body {
      font-family: 'Montserrat', sans-serif;
      margin: 0;
      padding: 0;
      background: #f7f7f7;
      color: #222;
    }

    .email-container {
      max-width: 720px;
      margin: auto;
      background: #fff;
      box-shadow: 0 0 12px rgba(0, 0, 0, 0.1);
      overflow: hidden;
      border-radius: 12px;
    }

    .header {
      background-color: #37005c;
      background-image: url("https://www.transparenttextures.com/patterns/asfalt-light.png");
      background-blend-mode: overlay;
      color: white;
      text-align: center;
      padding: 40px 30px;
      box-shadow: inset 0 0 100px rgba(0, 0, 0, 0.3);
    }

    .header h1 {
      margin: 0;
      font-family: 'Playfair Display', serif;
      font-size: 32px;
      text-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
    }

    .header p {
      font-size: 16px;
      margin-top: 10px;
      color: #ddd;
    }

    .content {
      padding: 30px;
    }

    .message-container {
      background: #eef5ff;
      border-left: 4px solid #4a90e2;
      border-radius: 10px;
      padding: 20px;
      margin-bottom: 30px;
    }

    .message-container h3 {
      margin-top: 0;
      font-family: 'Playfair Display', serif;
      color: #4a90e2;
    }

    .order-summary h2,
    .credentials-container h2 {
      font-size: 20px;
      border-bottom: 2px solid #ddd;
      padding-bottom: 6px;
      margin-bottom: 16px;
    }

    .order-detail {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px dashed #ccc;
    }

    .order-detail .detail-label {
      font-weight: 600;
      color: #333;
    }

    .credential-card {
      background: #f9f9f9;
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 16px;
      border: 1px solid #ddd;
    }

    .credential-title {
      font-size: 18px;
      margin-bottom: 10px;
      color: #37005c;
    }

    .credential-field {
      margin: 6px 0;
    }

    .credential-field .label {
      font-weight: 500;
      color: #444;
      margin-right: 8px;
    }

    .instructions {
      margin-top: 40px;
    }

    .instructions h3 {
      font-size: 18px;
      margin-bottom: 10px;
    }

    .instructions ol {
      padding-left: 20px;
      color: #333;
    }

    .button-container {
      text-align: center;
      margin-top: 30px;
    }

    .button {
      display: inline-block;
      background-color: #37005c;
      color: #fff;
      padding: 12px 24px;
      border-radius: 6px;
      text-decoration: none;
      font-weight: 600;
      transition: background-color 0.3s ease;
    }

    .button:hover {
      background-color: #4a007a;
    }

    .footer {
      text-align: center;
      background: #f1f1f1;
      padding: 30px 20px;
      font-size: 14px;
      color: #666;
    }

    .footer .logo {
      font-size: 20px;
      font-weight: bold;
      margin-bottom: 10px;
      color: #37005c;
    }

    .footer .social-icons {
      margin: 10px 0;
    }

    .footer .social-icon {
      margin: 0 10px;
      color: #37005c;
      text-decoration: none;
      font-weight: 600;
    }

    .footer .social-icon:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <h1>Your Premium Access</h1>
      <p>Here are your exclusive subscription credentials</p>
    </div>
    <div class="content">
      ${messageSection}
      <div class="order-summary">
        <h2>Order Summary</h2>
        <div class="order-detail"><span class="detail-label">Order ID:</span><span class="detail-value">${order._id}</span></div>
        <div class="order-detail"><span class="detail-label">Order Date:</span><span class="detail-value">${orderDate} (${orderTime})</span></div>
        <div class="order-detail"><span class="detail-label">Total Amount:</span><span class="detail-value">${order.totalAmount}</span></div>
      </div>
      <div class="credentials-container">
        <h2>Your Subscription Credentials</h2>
        ${containerCredential}
      </div>
    </div>
    <div class="footer">
      <div class="logo">PRIMEFLIX</div>
      
      <p>© 2025 Primeflix. All rights reserved.</p>
      <p>This is an automated message, please do not reply to this email.</p>
    </div>
  </div>
</body>
</html>`;
};
