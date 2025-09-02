
//array of busines
var businessInfo = [
  
  ]


// Array of user objects
var users = [
    {
        id: 1,
        email: 'admin@biz.com',
        phone: '1234567890',
        password: 'admin123',
        name: 'Admin User',
        role: 'admin',
        image: 'images/user.png',
        sign: 'images/signature.png',
        lastLogin: null,
        permissions: {
            pages: ['all', 'index.html', 'reports.html'],
            elements: ['all'] // 'all' means can access all elements
        }
    },
    {
        id: 2,
        email: 'manager@biz.com',
        phone: '0987654321',
        password: 'manager123',
        name: 'Manager User',
        role: 'manager',
        lastLogin: null,
        permissions: {
            pages: ['profile.html', 'index.html', 'reports.html'],
            elements: ['dashboard-stats', 'sales-report', 'inventory-summary']
        }
    },
    {
        id: 3,
        email: 'cashier@biz.com',
        phone: '5551234567',
        password: 'cashier123',
        name: 'Cashier User',
        role: 'cashier',
        lastLogin: null,
        permissions: {
            pages: ['profile.html', 'index.html'],
            elements: ['checkout-button', 'customer-info']
        }
    }
];