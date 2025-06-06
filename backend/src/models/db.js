// backend/src/models/db.js
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

// Determine the correct path for the database file
const dbPath = path.resolve(__dirname, '..', '..', 'database.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    db.run('PRAGMA foreign_keys = ON;', (pragmaErr) => {
      if (pragmaErr) {
        console.error('Failed to enable foreign key support:', pragmaErr.message);
      }
    });
  }
});

const initDatabase = () => {
  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS Users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        passwordHash TEXT NOT NULL
      )
    `, (err) => {
      if (err) console.error('Error creating Users table', err.message);
      else console.log('Users table created or already exists.');
    });

    db.run(`
      CREATE TABLE IF NOT EXISTS Cards (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        name TEXT NOT NULL,
        isMyCard BOOLEAN DEFAULT 0,
        cardType TEXT NOT NULL,
        companyName TEXT,
        identifier TEXT,
        position TEXT,
        email TEXT,
        phone TEXT,
        mobile TEXT,
        website TEXT,
        address TEXT,
        linkedinUrl TEXT,
        cardColor TEXT DEFAULT '#0070d1',
        logo TEXT,
        notes TEXT,
        verified BOOLEAN DEFAULT 0,
        barcode TEXT,
        barcodeType TEXT,
        balance TEXT,
        expiryDate TEXT,
        eventDate TEXT,
        eventTime TEXT,
        seat TEXT,
        venue TEXT,
        photoUrl TEXT,
        FOREIGN KEY (userId) REFERENCES Users (id) ON DELETE CASCADE
      )
    `, (err) => {
      if (err) console.error('Error creating Cards table', err.message);
      else console.log('Cards table created or already exists.');
    });
  });
};

// Sample card data (using original frontend field names)
const SAMPLE_CARDS = [
  { id: 1, name: 'Alex Chen', company: 'TechSphere Inc.', position: 'Product Manager', type: 'business', cardColor: '#0070d1', logo: 'placeholder', identifier: 'TSI10293', email: 'alex@techsphere.com', phone: '+1 (415) 555-1234', mobile: '+1 (415) 555-9876', website: 'www.techsphere.com', address: '123 Innovation Drive, San Francisco, CA 94105', linkedin: 'linkedin.com/in/alexchen', verified: true, photo: 'placeholder', isMyCard: true },
  { id: 2, name: 'Sarah Johnson', company: 'Design Forward', position: 'Creative Director', type: 'business', cardColor: '#2c3e50', logo: 'placeholder', identifier: 'DF87542', email: 'sarah.j@designforward.com', phone: '+1 (628) 555-7890', mobile: '+1 (628) 555-4321', website: 'www.designforward.com', address: '456 Creative Way, San Francisco, CA 94107', linkedin: 'linkedin.com/in/sarahjohnsondesign', verified: true, photo: null, isMyCard: false },
  { id: 3, name: 'Coffee Club', company: 'Seattle Coffee Co.', type: 'reward', cardColor: '#16a085', logo: 'placeholder', identifier: 'SCC-R78901', verified: true, barcode: '978020137962', barcodeType: 'code128', photo: null, isMyCard: false },
  { id: 4, name: 'Book Lovers', company: 'City Books', type: 'reward', cardColor: '#8e44ad', logo: 'placeholder', identifier: 'CB-24680', verified: true, barcode: '9780201379625', barcodeType: 'qr', photo: null, isMyCard: false },
  { id: 5, name: 'Fitness Plus', company: 'FitLife Center', type: 'membership', cardColor: '#e60012', logo: 'placeholder', identifier: 'FL-13579', verified: true, barcode: '9780201379628', barcodeType: 'code128', website: 'www.fitlifecenter.com', photo: null, expiry: '05/2026', isMyCard: false },
  { id: 6, name: 'Global Exchange', company: 'International Bank', type: 'other', cardColor: '#f39c12', logo: 'placeholder', identifier: 'IB-000789', verified: true, balance: '$2,345.50', photo: null, isMyCard: false },
  { id: 8, name: 'City Transit Card', company: 'Metro Transport', type: 'other', cardColor: '#0070d1', logo: 'placeholder', identifier: 'MT-56473', verified: true, barcode: '9780201379629', barcodeType: 'code128', balance: '$37.25', expiry: '12/2025', photo: null, isMyCard: false },
  { id: 11, name: 'Summer Music Festival', company: 'LiveSound Events', type: 'ticket', cardColor: '#e60012', logo: 'placeholder', identifier: 'LSE-92847', verified: true, barcode: '9780201379632', barcodeType: 'qr', date: 'June 18, 2025', time: '6:30 PM', seat: 'Section A, Row 12, Seat 34', venue: 'Oceanside Amphitheater', photo: null, isMyCard: false },
  { id: 12, name: 'Robert Zhang', company: 'Quantum Computing', position: 'Senior Engineer', type: 'business', cardColor: '#8e44ad', logo: 'placeholder', identifier: 'QC-10045', email: 'robert@quantumcomputing.com', phone: '+1 (650) 555-3456', mobile: '+1 (650) 555-7890', website: 'www.quantumcomputing.com', address: '789 Future Lane, Palo Alto, CA 94301', linkedin: 'linkedin.com/in/robertzhang', verified: true, photo: null, isMyCard: false },
  { id: 13, name: 'Emma Williams', company: 'Green Energy Solutions', position: 'Sustainability Consultant', type: 'business', cardColor: '#16a085', logo: 'placeholder', identifier: 'GES-78901', email: 'emma@greenenergy.com', phone: '+1 (510) 555-4567', mobile: '+1 (510) 555-8901', website: 'www.greenenergysolutions.com', address: '101 Renewable Way, Oakland, CA 94612', linkedin: 'linkedin.com/in/emmawilliams', verified: true, photo: null, isMyCard: false },
  { id: 14, name: 'Michael Patel', company: 'Global Finance Group', position: 'Investment Advisor', type: 'business', cardColor: '#f39c12', logo: 'placeholder', identifier: 'GFG-24680', email: 'michael@globalfinance.com', phone: '+1 (415) 555-5678', mobile: '+1 (415) 555-9012', website: 'www.globalfinancegroup.com', address: '222 Market Street, San Francisco, CA 94111', linkedin: 'linkedin.com/in/michaelpatel', verified: true, photo: null, isMyCard: false },
  { id: 15, name: 'Jessica Kim', company: 'Creative Solutions', position: 'Marketing Director', type: 'business', cardColor: '#e60012', logo: 'placeholder', identifier: 'CS-13579', email: 'jessica@creativesolutions.com', phone: '+1 (213) 555-6789', mobile: '+1 (213) 555-0123', website: 'www.creativesolutions.com', address: '333 Design Ave, Los Angeles, CA 90028', linkedin: 'linkedin.com/in/jessicakim', verified: true, photo: null, isMyCard: false }
];

const seedCardsForUser = (userId) => {
  if (!SAMPLE_CARDS || SAMPLE_CARDS.length === 0) {
    console.log('No sample cards to seed.');
    return;
  }
  console.log(`Seeding ${SAMPLE_CARDS.length} cards for user ID: ${userId}...`);
  const sql = `INSERT INTO Cards (
    userId, name, isMyCard, cardType, companyName, identifier, position, email, phone, mobile, 
    website, address, linkedinUrl, cardColor, logo, notes, verified, barcode, barcodeType, 
    balance, expiryDate, eventDate, eventTime, seat, venue, photoUrl
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  SAMPLE_CARDS.forEach(card => {
    const params = [
      userId,
      card.name,
      card.isMyCard || false,
      card.type,          // DB: cardType
      card.company,       // DB: companyName
      card.identifier,
      card.position,
      card.email,
      card.phone,
      card.mobile,
      card.website,
      card.address,
      card.linkedin,      // DB: linkedinUrl
      card.cardColor,     // DB: cardColor (frontend 'cardColor' maps to 'cardColor' in DB)
      card.logo,
      card.notes,
      card.verified || false,
      card.barcode,
      card.barcodeType,
      card.balance,
      card.expiryDate || card.expiry, // DB: expiryDate
      card.eventDate || card.date,    // DB: eventDate
      card.eventTime || card.time,    // DB: eventTime
      card.seat,
      card.venue,
      card.photo          // DB: photoUrl
    ];
    db.run(sql, params, function(err) {
      if (err) {
        console.error(`Error inserting card '${card.name}':`, err.message);
      } else {
        console.log(`Card '${card.name}' (Original ID: ${card.id}) inserted with new ID: ${this.lastID} for user ${userId}`);
      }
    });
  });
  console.log('Card seeding process initiated. Check logs for details.');
};

const seedDatabase = async () => {
  console.log('Starting database seed process...');
  try {
    const legacyEmail = 'legacy-user@example.com';
    const legacyPassword = 'password123';
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(legacyPassword, salt);

    return new Promise((resolve, reject) => {
      db.get('SELECT id FROM Users WHERE email = ?', [legacyEmail], (err, userRow) => {
        if (err) {
          console.error('Error checking for legacy user:', err.message);
          return reject(err);
        }
        if (userRow) {
          console.log('Legacy user already exists. Seeding cards for existing legacy user.');
          seedCardsForUser(userRow.id);
          resolve();
        } else {
          db.run('INSERT INTO Users (email, passwordHash) VALUES (?, ?)', [legacyEmail, passwordHash], function (err) {
            if (err) {
              console.error('Error creating legacy user:', err.message);
              return reject(err);
            }
            const legacyUserId = this.lastID;
            console.log(`Legacy user created with ID: ${legacyUserId}`);
            seedCardsForUser(legacyUserId);
            resolve();
          });
        }
      });
    });
  } catch (error) {
    console.error('Error in seedDatabase main try block:', error.message);
    return Promise.reject(error);
  }
};

// Handle command line arguments for init or seed
if (require.main === module) {
  const command = process.argv[2];
  if (command === 'init') {
    console.log('Initializing database schema...');
    initDatabase();
  } else if (command === 'seed') {
    console.log('Seeding database with legacy user and sample cards...');
    seedDatabase()
      .then(() => console.log('Database seeding process completed successfully.'))
      .catch(err => console.error('Database seeding failed:', err))
      .finally(() => {
        // db.close(err => { // Optionally close DB if script is standalone and all ops are done
        //   if (err) console.error('Error closing database', err.message);
        //   else console.log('Database connection closed after seeding.');
        // });
      });
  } else if (command) {
    console.log(`Unknown command: ${command}. Available commands: init, seed`);
  } else {
    console.log('No command provided. Available commands: init, seed. Exporting db module for application use.');
  }
}

module.exports = db;
