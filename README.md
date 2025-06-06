# Card Wallet App

A modern digital mobile wallet for organizing all your business cards, membership cards, and loyalty cards in one place.

## Features

### Card Management

- **Add Cards**: Easily add new cards with:
  - Contact details (name, company, position)
  - Multiple contact methods (phone, email, address)
  - Custom colors and logos
  - Categories (business, membership, reward, etc.)

- **Edit Cards**: Update any card details including:
  - Basic information
  - Contact methods
  - Card appearance (color, logo)
  - Card type/category

- **Delete Cards**: Remove cards with confirmation

### Card Actions

Each card supports several actions:

- **Share**:
  - Share card details via email, messaging apps, or social media
  - Generate shareable links for business cards
  - Export as vCard (.vcf) for contacts

- **Edit**:
  - Update any field on the card
  - Change card type/category
  - Modify appearance (color, logo)

- **Save to Contacts**:
  - One-click save business cards to device contacts
  - Auto-fill contact fields from card data
  - Option to merge with existing contacts

- **QR Code**:
  - Generate scannable QR code containing card data
  - Download QR code image
  - Copy QR code data to clipboard

- **Delete**:
  - Remove cards with confirmation
  - Option to archive instead of delete

### Card Details

Each card type stores different information:

- **Business Cards**:
  - Full name, title, company
  - Contact info (email, phone, address)
  - Social profiles (LinkedIn, Twitter, etc.)
  - Website, company logo
  - Notes section

- **Membership/Reward Cards**:
  - Company/Organization name
  - Membership number/ID
  - Barcode/QR code data
  - Expiration date
  - Terms & conditions

- **Identification Cards**:
  - ID number
  - Issuing authority
  - Issue/expiry dates
  - Photo/scan of ID

- **Tickets**:
  - Event name/details
  - Date/time/location
  - Ticket number
  - Barcode/QR code
  - Seat/section info

### Organization

- **Categories**: Automatic organization by card type
  - Business cards
  - Reward cards
  - Membership cards
  - Tickets
  - Identification
  - Custom types

- **Grouping**: Cards automatically grouped by:
  - Type
  - Company
  - Custom categories

- **Search**: Quickly find cards by:
  - Name
  - Company
  - Keywords

### Viewing Options

- **Card View**: Visual grid layout showing:
  - Card design
  - Basic info at a glance
  - Color-coded by type

- **List View**: Compact table layout showing:
  - Key details in a list
  - Sortable columns
  - Quick access to contact info

### Business Card Features

- **QR Code Generation**:
  - Generate shareable QR codes for your business cards
  - Contains full contact information in vCard format
  - Download QR codes as images

### Non-Business Card Features

- **QR/Barcode Scanning**:
  - Scan QR codes and barcodes from other cards
  - Store scanned data with the card
  - View scanned code data

### Additional Features

- **Dark/Light Mode**: Toggle between themes
- **Responsive Design**: Works on mobile and desktop
- **Cloud Sync**: Optional account sync (simulated)
- **Sharing**: Share cards via various methods

## How It Works

### Adding Cards
1. Click the "+" button to add a new card
2. Fill in the card details
3. Choose a card type and color
4. Save to add to your collection

### Editing Cards
1. Open a card's detail view
2. Click the edit button
3. Make your changes
4. Save to update

### Scanning Codes
1. Open a non-business card
2. Click the "Scan" button
3. Point camera at QR code or barcode
4. Save the scanned data

### Generating QR Codes
1. Open a business card
2. Click the "QR Code" button
3. View/download the generated QR code
4. Share with others

### Switching Views
- Use the view toggle in the header to switch between:
  - Card view (visual grid)
  - List view (compact table)

## Technical Stack

- **Frontend**: React, TypeScript, Vite
- **Styling**: CSS Modules
- **QR Generation**: qrcode.react
- **Barcode Scanning**: html5-qrcode
- **Icons**: Lucide