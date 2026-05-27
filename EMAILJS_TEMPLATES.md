# EmailJS Setup Guide for AFORA

## Step 1: Create EmailJS Account
1. Go to https://www.emailjs.com/ and sign up
2. Go to **Email Services** → Add New Service → Connect your Gmail/Outlook
3. Note down the **Service ID** (e.g., `service_afora`)

## Step 2: Create 3 Email Templates

---

### Template 1: Order Confirmation
**Template Name:** `order_confirmation`  
**Template ID:** Save this as `NEXT_PUBLIC_EMAILJS_TEMPLATE_ORDER` in `.env.local`

**Subject:** `AFORA — Order Confirmed! #{{order_number}}`

**HTML Body:**
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #FFFDF7; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #C5A355, #D4AF37, #E8D5A3); padding: 40px 30px; text-align: center;">
      <h1 style="margin: 0; font-size: 28px; color: #ffffff; letter-spacing: 4px; font-weight: 300;">AFORA</h1>
      <p style="margin: 5px 0 0; font-size: 11px; color: rgba(255,255,255,0.8); letter-spacing: 2px;">by Sidra Shahzad</p>
    </div>

    <!-- Main Content -->
    <div style="padding: 40px 30px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <div style="width: 60px; height: 60px; border-radius: 50%; background-color: #f0fdf4; margin: 0 auto 15px; line-height: 60px; font-size: 28px;">✓</div>
        <h2 style="margin: 0; font-size: 22px; color: #1a1a1a;">Order Confirmed!</h2>
        <p style="color: #888; font-size: 14px; margin-top: 8px;">Thank you for your order, {{to_name}}</p>
      </div>

      <!-- Order Info -->
      <div style="background-color: #FFFDF7; border-radius: 12px; padding: 20px; margin-bottom: 25px;">
        <table style="width: 100%; font-size: 14px; color: #555;">
          <tr>
            <td style="padding: 6px 0;">Order Number</td>
            <td style="padding: 6px 0; text-align: right; font-weight: 600; font-family: monospace;">#{{order_number}}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0;">Date</td>
            <td style="padding: 6px 0; text-align: right;">{{order_date}}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0;">Payment</td>
            <td style="padding: 6px 0; text-align: right;">Cash on Delivery</td>
          </tr>
        </table>
      </div>

      <!-- Items Table -->
      <h3 style="font-size: 16px; color: #1a1a1a; margin-bottom: 15px;">Your Items</h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <thead>
          <tr style="border-bottom: 2px solid #E8D5A3;">
            <th style="text-align: left; padding: 10px 0; color: #888; font-weight: 500;">Product</th>
            <th style="text-align: center; padding: 10px 0; color: #888; font-weight: 500;">Qty</th>
            <th style="text-align: right; padding: 10px 0; color: #888; font-weight: 500;">Price</th>
            <th style="text-align: right; padding: 10px 0; color: #888; font-weight: 500;">Total</th>
          </tr>
        </thead>
        <tbody>
          {{{items_html}}}
        </tbody>
      </table>

      <!-- Totals -->
      <div style="border-top: 2px solid #E8D5A3; margin-top: 15px; padding-top: 15px;">
        <table style="width: 100%; font-size: 14px;">
          <tr>
            <td style="padding: 5px 0; color: #888;">Subtotal</td>
            <td style="padding: 5px 0; text-align: right;">{{subtotal}}</td>
          </tr>
          <tr>
            <td style="padding: 5px 0; color: #888;">Delivery</td>
            <td style="padding: 5px 0; text-align: right;">{{delivery}}</td>
          </tr>
          <tr>
            <td style="padding: 5px 0; color: #888;">Discount</td>
            <td style="padding: 5px 0; text-align: right; color: #16a34a;">-{{discount}}</td>
          </tr>
          <tr style="border-top: 1px solid #E8D5A3;">
            <td style="padding: 12px 0; font-weight: 700; font-size: 16px; color: #1a1a1a;">Total</td>
            <td style="padding: 12px 0; text-align: right; font-weight: 700; font-size: 16px; color: #C5A355;">{{total}}</td>
          </tr>
        </table>
      </div>

      <!-- Shipping -->
      <div style="background-color: #FFFDF7; border-radius: 12px; padding: 20px; margin-top: 25px;">
        <h3 style="font-size: 14px; color: #888; font-weight: 500; margin: 0 0 10px;">Delivering to</h3>
        <p style="margin: 0; font-size: 14px; color: #1a1a1a; line-height: 1.6;">
          {{address}}<br>
          {{city}}<br>
          {{phone}}
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div style="background-color: #FFFDF7; padding: 25px 30px; text-align: center; border-top: 1px solid #E8D5A3;">
      <p style="margin: 0; font-size: 12px; color: #888;">
        AFORA by Sidra Shahzad — Luxury Skincare from Pakistan
      </p>
      <p style="margin: 8px 0 0; font-size: 11px; color: #aaa;">
        Questions? Reply to this email or contact us on WhatsApp
      </p>
    </div>

  </div>
</body>
</html>
```

---

### Template 2: Contact Form
**Template Name:** `contact_form`  
**Template ID:** Save as `NEXT_PUBLIC_EMAILJS_TEMPLATE_CONTACT` in `.env.local`

**Subject:** `AFORA Contact: {{subject}}`

**HTML Body:**
```html
<!DOCTYPE html>
<html>
<body style="margin: 0; padding: 0; background-color: #FFFDF7; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    
    <div style="background: linear-gradient(135deg, #C5A355, #D4AF37, #E8D5A3); padding: 30px; text-align: center;">
      <h1 style="margin: 0; font-size: 24px; color: #ffffff; letter-spacing: 4px; font-weight: 300;">AFORA</h1>
      <p style="margin: 8px 0 0; font-size: 14px; color: rgba(255,255,255,0.9);">New Contact Form Message</p>
    </div>

    <div style="padding: 35px 30px;">
      <div style="background-color: #FFFDF7; border-radius: 12px; padding: 20px; margin-bottom: 25px;">
        <table style="width: 100%; font-size: 14px; color: #555;">
          <tr>
            <td style="padding: 8px 0; font-weight: 600; width: 100px;">From</td>
            <td style="padding: 8px 0;">{{from_name}}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: 600;">Email</td>
            <td style="padding: 8px 0;"><a href="mailto:{{from_email}}" style="color: #C5A355;">{{from_email}}</a></td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: 600;">Subject</td>
            <td style="padding: 8px 0;">{{subject}}</td>
          </tr>
        </table>
      </div>

      <h3 style="font-size: 14px; color: #888; font-weight: 500; margin-bottom: 10px;">Message</h3>
      <div style="background-color: #fff; border: 1px solid #E8D5A3; border-radius: 12px; padding: 20px;">
        <p style="margin: 0; font-size: 14px; color: #333; line-height: 1.7; white-space: pre-wrap;">{{message}}</p>
      </div>
    </div>

    <div style="background-color: #FFFDF7; padding: 20px 30px; text-align: center; border-top: 1px solid #E8D5A3;">
      <p style="margin: 0; font-size: 11px; color: #aaa;">Reply directly to the sender at {{from_email}}</p>
    </div>
  </div>
</body>
</html>
```

**To Email:** Set to `{{to_email}}` (this will come from site_settings)  
**Reply To:** `{{from_email}}`

---

### Template 3: Order Status Update
**Template Name:** `status_update`  
**Template ID:** Save as `NEXT_PUBLIC_EMAILJS_TEMPLATE_STATUS` in `.env.local`

**Subject:** `AFORA — Order #{{order_number}} {{new_status}}`

**HTML Body:**
```html
<!DOCTYPE html>
<html>
<body style="margin: 0; padding: 0; background-color: #FFFDF7; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    
    <div style="background: linear-gradient(135deg, #C5A355, #D4AF37, #E8D5A3); padding: 30px; text-align: center;">
      <h1 style="margin: 0; font-size: 24px; color: #ffffff; letter-spacing: 4px; font-weight: 300;">AFORA</h1>
      <p style="margin: 5px 0 0; font-size: 11px; color: rgba(255,255,255,0.8); letter-spacing: 2px;">by Sidra Shahzad</p>
    </div>

    <div style="padding: 40px 30px; text-align: center;">
      <div style="width: 70px; height: 70px; border-radius: 50%; background: linear-gradient(135deg, #C5A355, #D4AF37); margin: 0 auto 20px; line-height: 70px; font-size: 30px;">📦</div>
      
      <h2 style="margin: 0 0 10px; font-size: 22px; color: #1a1a1a;">Order Update</h2>
      <p style="margin: 0; color: #888; font-size: 14px;">Hi {{to_name}}, your order status has been updated</p>

      <div style="background-color: #FFFDF7; border-radius: 12px; padding: 25px; margin: 25px 0; text-align: center;">
        <p style="margin: 0 0 5px; font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 1px;">Order Number</p>
        <p style="margin: 0 0 20px; font-size: 16px; font-weight: 600; font-family: monospace; color: #1a1a1a;">#{{order_number}}</p>
        
        <p style="margin: 0 0 5px; font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 1px;">New Status</p>
        <div style="display: inline-block; background: linear-gradient(135deg, #C5A355, #D4AF37); color: #fff; padding: 8px 24px; border-radius: 20px; font-size: 14px; font-weight: 600; text-transform: capitalize;">
          {{new_status}}
        </div>
      </div>

      <p style="font-size: 14px; color: #555; line-height: 1.6;">{{status_message}}</p>
    </div>

    <div style="background-color: #FFFDF7; padding: 25px 30px; text-align: center; border-top: 1px solid #E8D5A3;">
      <p style="margin: 0; font-size: 12px; color: #888;">AFORA by Sidra Shahzad — Luxury Skincare from Pakistan</p>
      <p style="margin: 8px 0 0; font-size: 11px; color: #aaa;">Questions about your order? Reply to this email</p>
    </div>
  </div>
</body>
</html>
```

---

## Step 3: Get Your Public Key
1. Go to EmailJS → Account → General tab
2. Copy your **Public Key**

## Step 4: Fill `.env.local`
```
NEXT_PUBLIC_EMAILJS_SERVICE_ID=service_afora         # Your service ID
NEXT_PUBLIC_EMAILJS_TEMPLATE_ORDER=template_order     # Order confirmation template ID
NEXT_PUBLIC_EMAILJS_TEMPLATE_CONTACT=template_contact # Contact form template ID  
NEXT_PUBLIC_EMAILJS_TEMPLATE_STATUS=template_status   # Status update template ID
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=your_public_key_here   # Your public key
```

## Step 5: Template Variables Reference

| Template | Variables |
|----------|-----------|
| Order Confirmation | `to_email`, `to_name`, `order_number`, `order_date`, `items_html`, `subtotal`, `delivery`, `discount`, `total`, `address`, `city`, `phone` |
| Contact Form | `from_name`, `from_email`, `subject`, `message`, `to_email` |
| Status Update | `to_email`, `to_name`, `order_number`, `new_status`, `status_message` |
