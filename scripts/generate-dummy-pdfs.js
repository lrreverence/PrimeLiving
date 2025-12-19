import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ensure public directory exists
const publicDir = path.join(__dirname, '..', 'public', 'documents');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Helper function to create a PDF
function createPDF(filename, title, content) {
  const doc = new PDFDocument({ margin: 50 });
  const filePath = path.join(publicDir, filename);
  doc.pipe(fs.createWriteStream(filePath));

  // Add title
  doc.fontSize(20).text(title, { align: 'center' });
  doc.moveDown(2);

  // Add content
  doc.fontSize(12).text(content, { align: 'left' });

  // Add footer
  doc.fontSize(10)
     .text('PrimeLiving - Property Management System', 50, doc.page.height - 50, { align: 'center' });

  doc.end();
  console.log(`Created: ${filename}`);
}

// Create Rental Contract PDF
createPDF(
  'rental-contract.pdf',
  'Rental Contract',
  `RENTAL AGREEMENT

This is a sample rental contract document.

TERMS AND CONDITIONS:

1. Lease Term: The lease period is as specified in the contract.
2. Monthly Rent: Rent is due on the 15th of each month.
3. Security Deposit: A security deposit is required as per agreement.
4. Maintenance: Tenant is responsible for maintaining the property.
5. Utilities: Utilities are the responsibility of the tenant unless otherwise specified.

This is a dummy document for demonstration purposes.

For questions or concerns, please contact the property management office.`
);

// Create Property Rules PDF
createPDF(
  'property-rules.pdf',
  'Property Rules and Regulations',
  `PROPERTY RULES AND REGULATIONS

BUILDING RULES:

1. Quiet Hours: Please observe quiet hours from 10 PM to 7 AM.
2. Common Areas: Keep common areas clean and tidy.
3. Smoking: No smoking in common areas or near building entrances.
4. Pets: Pet policy as per building regulations.
5. Visitors: All visitors must be registered with the management office.
6. Parking: Follow assigned parking spaces and regulations.
7. Waste Management: Dispose of waste in designated areas only.
8. Renovations: Any renovations require prior approval from management.

COMMUNITY GUIDELINES:

- Respect your neighbors and maintain a peaceful environment.
- Report any maintenance issues promptly.
- Follow all building security protocols.
- Participate in community activities when possible.

This is a dummy document for demonstration purposes.`
);

// Create Move-in Checklist PDF
createPDF(
  'move-in-checklist.pdf',
  'Move-in Checklist',
  `PROPERTY CONDITION REPORT AND INVENTORY CHECKLIST

UNIT INFORMATION:
Unit Number: _______________
Date of Move-in: _______________

ROOM-BY-ROOM INSPECTION:

LIVING ROOM:
☐ Walls - Condition noted
☐ Floor - Condition noted
☐ Windows - Condition noted
☐ Doors - Condition noted
☐ Lighting - Condition noted
☐ Electrical outlets - Condition noted

KITCHEN:
☐ Appliances - Condition noted
☐ Cabinets - Condition noted
☐ Countertops - Condition noted
☐ Sink - Condition noted
☐ Faucet - Condition noted

BEDROOM(S):
☐ Walls - Condition noted
☐ Floor - Condition noted
☐ Windows - Condition noted
☐ Closet - Condition noted

BATHROOM(S):
☐ Toilet - Condition noted
☐ Shower/Bath - Condition noted
☐ Sink - Condition noted
☐ Mirror - Condition noted

ADDITIONAL NOTES:
_________________________________________________
_________________________________________________
_________________________________________________

Tenant Signature: _______________ Date: _______
Management Signature: _______________ Date: _______

This is a dummy document for demonstration purposes.`
);

// Create Philippine Emergency Contacts PDF
createPDF(
  'philippine-emergency-contacts.pdf',
  'Philippine Emergency Contacts',
  `EMERGENCY CONTACT NUMBERS - PHILIPPINES

IMMEDIATE EMERGENCIES:

Police Emergency: 911
Fire Department: 911
Medical Emergency: 911
National Emergency Hotline: 911

LOCAL EMERGENCY SERVICES:

Manila Police: (02) 527-3086
Quezon City Police: (02) 8722-0650
Makati Police: (02) 8844-3146
Pasig Police: (02) 8641-1111

HOSPITALS:

Philippine General Hospital: (02) 8554-8400
Makati Medical Center: (02) 8888-8999
St. Luke's Medical Center: (02) 8723-0101
Asian Hospital: (02) 8771-9000

UTILITIES:

Meralco (Electricity): 16211
Maynilad (Water): 1627
Manila Water: 1627
PLDT: 171

GOVERNMENT AGENCIES:

Department of Health: (02) 8651-7800
Bureau of Fire Protection: (02) 8426-0219
MMDA: 136

PROPERTY MANAGEMENT:

PrimeLiving Office: [Your Contact Number]
Building Security: [Security Contact]
Maintenance: [Maintenance Contact]

IMPORTANT NOTES:

- Keep this document in an easily accessible location
- Program emergency numbers into your phone
- In case of emergency, stay calm and provide clear information
- For non-emergency inquiries, use regular business hours contacts

This is a dummy document for demonstration purposes.`
);

console.log('\nAll dummy PDF files have been created in public/documents/');
