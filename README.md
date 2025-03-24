# Billing_apk_GST
A billing software where GST fraud detection is enabled
Introduction
In today’s digital economy, ensuring transparency and compliance with tax regulations is crucial for businesses. The Node.js & MongoDB-Based Billing System with GST Fraud Prevention is designed to streamline invoicing while ensuring GST compliance through secure QR code validation. This system offers an efficient way to manage product records, generate bills, and prevent tax fraud by integrating a government-linked verification mechanism.
Key Features

1. Billing System
The system allows businesses to generate GST-compliant invoices that include essential details such as buyer and seller information, invoice date, and total amount. The generated bills are stored securely in a MongoDB database and can be retrieved anytime for reference.

2. Product Management
The system provides full-fledged product management functionalities, allowing users to:
Add New Products: Register new products by providing details such as name, selling price, cost price, quantity, GST percentage, barcode, and HSN/SAC codes.
Update Product Details: Modify product information whenever necessary.
Delete Products: Remove outdated or unnecessary products from the database.

3. Invoice Generation and Storage
Each invoice generated includes:
Seller & Buyer Information: The supplier's name, GST number, and contact details, along with the recipient’s details.
Invoice Information: A unique invoice number, invoice date, and due date (if applicable).
Product & Tax Breakdown: Description of items/services, quantity, taxable amount, and applicable CGST, SGST, or IGST.
Total Invoice Value: The final amount payable, inclusive of taxes.

4. QR Code-Based GST Fraud Prevention
To enhance tax compliance and prevent GST fraud, each invoice includes a unique QR code that contains encrypted billing information. The process of QR code generation involves:
Creating a JWT (JSON Web Token) that encrypts invoice data such as the bill number and GST details.
Using node-qrcode to generate the QR code image.
Uploading the QR code image to Cloudinary for cloud storage.
Storing the Cloudinary URL in MongoDB, linking the QR code to the respective invoice.
This ensures that when authorities or customers scan the QR code, they can verify whether the invoice is registered with the government database.

5. Dual Database Storage for Compliance
To ensure tax transparency, the system stores invoices in two separate databases:
Local Database: Keeps the invoice within the seller’s system for internal records.
Government Database: Stores the invoice in a centralized tax authority database, allowing for real-time tax tracking and fraud detection.
This mechanism discourages tax evasion and ensures that sellers comply with GST regulations.

6. Bill Download & Print Functionality
The system provides options for downloading and printing invoices in PDF format. This ensures ease of record-keeping and simplifies sharing invoices with customers and tax authorities. The printed invoice contains all the required details along with the embedded QR code for verification.
