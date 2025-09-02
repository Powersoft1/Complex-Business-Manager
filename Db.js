// db.js - Shared IndexedDB configuration with subscription validation
var DB_CONFIG = {
    name: 'BusinessManagerDB',
    version: 1,
    stores: {
        products: { 
            keyPath: 'id',
            indexes: [
                { name: 'name', keyPath: 'name', options: { unique: false } },
                { name: 'category', keyPath: 'category', options: { unique: false } },
                { name: 'stock_status', keyPath: ['stock', 'lowStockThreshold'], options: { unique: false } }
            ]
        },
        categories: { 
            keyPath: 'id',
            indexes: [
                { name: 'name', keyPath: 'name', options: { unique: true } }
            ]
        },
        orders: { 
            keyPath: 'id',
            indexes: [
                { name: 'productId', keyPath: 'productId', options: { unique: false } },
                { name: 'status', keyPath: 'status', options: { unique: false } },
                { name: 'date', keyPath: 'date', options: { unique: false } },
                { name: 'isBulkOrder', keyPath: 'isBulkOrder', options: { unique: false } }
            ]
        },
        damaged_items: {
            keyPath: 'id',
            indexes: [
                { name: 'orderId', keyPath: 'orderId', options: { unique: false } },
                { name: 'productId', keyPath: 'productId', options: { unique: false } },
                { name: 'date', keyPath: 'date', options: { unique: false } }
            ]
        },
        sales: {
            keyPath: 'id',
            indexes: [
                { name: 'date', keyPath: 'date', options: { unique: false } },
                { name: 'customer', keyPath: 'customer', options: { unique: false } }
            ]
        },
        sale_transactions: {
            keyPath: 'id',
            indexes: [
                { name: 'saleId', keyPath: 'saleId', options: { unique: false } },
                { name: 'productId', keyPath: 'productId', options: { unique: false } },
                { name: 'orderId', keyPath: 'orderId', options: { unique: false } },
                { name: 'date', keyPath: 'date', options: { unique: false } }
            ]
        },
        customers: { 
            keyPath: 'id',
            indexes: [
                { name: 'name', keyPath: 'name', options: { unique: false } },
                { name: 'phone', keyPath: 'phone', options: { unique: false } },
                { name: 'status', keyPath: 'status', options: { unique: false } }
            ]
        },
        dailyStock: {
            keyPath: 'id',
            indexes: [
                { name: 'date', keyPath: 'date', options: { unique: false } },
                { name: 'productId', keyPath: 'productId', options: { unique: false } }
            ]
        },
        settings: {
            keyPath: 'id'
        },
        finance: {
            keyPath: 'id'
        },
        finance_transactions: {
            keyPath: 'id',
            indexes: [
                { name: 'type', keyPath: 'type', options: { unique: false } },
                { name: 'status', keyPath: 'status', options: { unique: false } },
                { name: 'date', keyPath: 'date', options: { unique: false } }
            ]
        }
    }
};

// Subscription configuration
const SUBSCRIPTION_CONFIG = {
    debtValue: 0, // Set to 0 if no debt, positive value if debt exists
    subscriptionDate: '2025-9-1', // Format: YYYY-MM-DD
    durationDays: 30 // Duration in days
};

// Function to create and show subscription modal with Font Awesome
function showSubscriptionModal(title, message) {
    // Create modal overlay
    const modalOverlay = document.createElement('div');
    modalOverlay.id = 'subscriptionModalOverlay';
    modalOverlay.style.position = 'fixed';
    modalOverlay.style.top = '0';
    modalOverlay.style.left = '0';
    modalOverlay.style.width = '100%';
    modalOverlay.style.height = '100%';
    modalOverlay.style.backgroundColor = 'rgba(0,0,0,0.5)';
    modalOverlay.style.display = 'flex';
    modalOverlay.style.justifyContent = 'center';
    modalOverlay.style.alignItems = 'center';
    modalOverlay.style.zIndex = '10000';
    
    // Create modal content
    const modalContent = document.createElement('div');
    modalContent.style.backgroundColor = '#fff';
    modalContent.style.borderRadius = '8px';
    modalContent.style.padding = '20px';
    modalContent.style.width = '90%';
    modalContent.style.maxWidth = '500px';
    modalContent.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
    
    // Create modal header with icon
    const modalHeader = document.createElement('div');
    modalHeader.style.display = 'flex';
    modalHeader.style.alignItems = 'center';
    modalHeader.style.marginBottom = '15px';
    
    const icon = document.createElement('i');
    icon.className = 'fas fa-exclamation-triangle';
    icon.style.color = '#ff9800';
    icon.style.fontSize = '24px';
    icon.style.marginRight = '10px';
    
    const titleEl = document.createElement('h3');
    titleEl.textContent = title;
    titleEl.style.margin = '0';
    titleEl.style.color = '#333';
    
    modalHeader.appendChild(icon);
    modalHeader.appendChild(titleEl);
    
    // Create modal body
    const modalBody = document.createElement('div');
    modalBody.textContent = message;
    modalBody.style.marginBottom = '20px';
    modalBody.style.color = '#555';
    modalBody.style.lineHeight = '1.5';
    
    // Create OK button
    const okButton = document.createElement('button');
    okButton.textContent = 'OK';
    okButton.style.display = 'block';
    okButton.style.marginLeft = 'auto';
    okButton.style.padding = '8px 20px';
    okButton.style.backgroundColor = '#4CAF50';
    okButton.style.color = 'white';
    okButton.style.border = 'none';
    okButton.style.borderRadius = '4px';
    okButton.style.cursor = 'pointer';
    okButton.style.fontSize = '16px';
    
    okButton.onclick = function() {
        document.body.removeChild(modalOverlay);
    };
    
    // Assemble modal
    modalContent.appendChild(modalHeader);
    modalContent.appendChild(modalBody);
    modalContent.appendChild(okButton);
    modalOverlay.appendChild(modalContent);
    
    // Add to document
    document.body.appendChild(modalOverlay);
}

function checkSubscriptionValidity() {
    // Check if there's any debt
    if (SUBSCRIPTION_CONFIG.debtValue > 0) {
        const debtMessage = `Your account has an outstanding balance of ${formatCurrency(SUBSCRIPTION_CONFIG.debtValue)}. Please settle your balance to continue using the service.`;
          showToast(debtMessage, 'error');
          showSubscriptionModal('Payment Required', debtMessage);
          return { valid: false, reason: debtMessage };
    }
    
    const today = new Date();
    const subDate = new Date(SUBSCRIPTION_CONFIG.subscriptionDate);
    const expiryDate = new Date(subDate);
    expiryDate.setDate(subDate.getDate() + SUBSCRIPTION_CONFIG.durationDays);
    
    // Check if subscription has expired
    if (today > expiryDate) {
        const expiryMessage = `Your subscription expired on ${expiryDate.toLocaleDateString()}. Please renew to continue using the service.`;
        showToast(expiryMessage, 'error');
        showSubscriptionModal('Subscription Expired', expiryMessage);
        return { 
            valid: false, 
            reason: expiryMessage
        };
    }
    
    return { valid: true };
}

function openDatabase() {
    return new Promise((resolve, reject) => {
        // First check subscription validity
        const subscriptionCheck = checkSubscriptionValidity();
        if (!subscriptionCheck.valid) {
            reject(new Error('Subscription validation failed: ' + subscriptionCheck.reason));
            return;
        }
        
        const request = indexedDB.open(DB_CONFIG.name, DB_CONFIG.version);
        
        request.onupgradeneeded = function(event) {
            const db = event.target.result;
            
            for (const [storeName, config] of Object.entries(DB_CONFIG.stores)) {
                if (!db.objectStoreNames.contains(storeName)) {
                    const store = db.createObjectStore(storeName, { keyPath: config.keyPath });
                    
                    if (config.indexes) {
                        config.indexes.forEach(function(index) {
                            store.createIndex(index.name, index.keyPath, index.options);
                        });
                    }
                }
            }
        };
        
        request.onsuccess = function(event) {
            const db = event.target.result;
            db.onversionchange = function() {
                db.close();
                showToast('Database upgrade needed. Page will reload.', 'warning');
                setTimeout(function() { window.location.reload(); }, 2000);
            };
            resolve(db);
        };
        
        request.onerror = function(event) {
            console.error('Database error:', event.target.error);
            showToast('Database initialization failed. Please refresh the page.', 'error');
            reject(event.target.error);
        };
    });
}

function executeTransaction(db, storeNames, mode, operation) {
    return new Promise((resolve, reject) => {
        // Check subscription validity before each transaction
        const subscriptionCheck = checkSubscriptionValidity();
        if (!subscriptionCheck.valid) {
            reject(new Error(subscriptionCheck.reason));
            return;
        }
        
        const transaction = db.transaction(storeNames, mode);
        
        transaction.oncomplete = function() { resolve(); };
        transaction.onerror = function(event) {
            console.error('Transaction error:', event.target.error);
            reject(event.target.error);
        };
        
        operation(transaction);
    });
}

function executeTransaction(db, storeNames, mode, operation) {
    return new Promise((resolve, reject) => {
        // Check subscription validity before each transaction
        const subscriptionCheck = checkSubscriptionValidity();
        if (!subscriptionCheck.valid) {
            reject(new Error('Subscription validation failed: ' + subscriptionCheck.reason));
            return;
        }
        
        const transaction = db.transaction(storeNames, mode);
        
        transaction.oncomplete = function() { resolve(); };
        transaction.onerror = function(event) {
            console.error('Transaction error:', event.target.error);
            reject(event.target.error);
        };
        
        operation(transaction);
    });
}

function addRecord(db, storeName, data) {
    try {
        return executeTransaction(db, [storeName], 'readwrite', function(transaction) {
            const store = transaction.objectStore(storeName);
            store.add(data);
        }).then(function() {
            return data.id;
        });
    } catch (error) {
        console.error('Add record error:', error);
        throw error;
    }
}

function getRecord(db, storeName, key) {
    try {
        return new Promise(function(resolve) {
            executeTransaction(db, [storeName], 'readonly', function(transaction) {
                const store = transaction.objectStore(storeName);
                const request = store.get(key);
                request.onsuccess = function() { resolve(request.result); };
            });
        });
    } catch (error) {
        console.error('Get record error:', error);
        throw error;
    }
}

function getAllRecords(db, storeName, indexName, range) {
    try {
        return new Promise(function(resolve) {
            executeTransaction(db, [storeName], 'readonly', function(transaction) {
                const store = transaction.objectStore(storeName);
                const target = indexName ? store.index(indexName) : store;
                const request = range ? target.getAll(range) : target.getAll();
                request.onsuccess = function() { resolve(request.result); };
            });
        });
    } catch (error) {
        console.error('Get all records error:', error);
        throw error;
    }
}

function updateRecord(db, storeName, data) {
    try {
        return executeTransaction(db, [storeName], 'readwrite', function(transaction) {
            const store = transaction.objectStore(storeName);
            store.put(data);
        }).then(function() {
            return data.id;
        });
    } catch (error) {
        console.error('Update record error:', error);
        throw error;
    }
}

function deleteRecord(db, storeName, key) {
    try {
        return executeTransaction(db, [storeName], 'readwrite', function(transaction) {
            const store = transaction.objectStore(storeName);
            store.delete(key);
        }).then(function() {
            return true;
        });
    } catch (error) {
        console.error('Delete record error:', error);
        throw error;
    }
}

function clearStore(db, storeName) {
    try {
        return executeTransaction(db, [storeName], 'readwrite', function(transaction) {
            const store = transaction.objectStore(storeName);
            store.clear();
        }).then(function() {
            return true;
        });
    } catch (error) {
        console.error('Clear store error:', error);
        throw error;
    }
}

function generateId(prefix) {
    return prefix + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

function genFormatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-NG', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatCurrency(amount) {
    if (isNaN(amount)) return '₦0.00';
    return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
        minimumFractionDigits: 0
    }).format(amount);
}

// Make DB functions and config globally available
window.DB_CONFIG = DB_CONFIG;
window.SUBSCRIPTION_CONFIG = SUBSCRIPTION_CONFIG;
window.openDatabase = openDatabase;
window.executeTransaction = executeTransaction;
window.addRecord = addRecord;
window.getRecord = getRecord;
window.getAllRecords = getAllRecords;
window.updateRecord = updateRecord;
window.deleteRecord = deleteRecord;
window.clearStore = clearStore;
window.generateId = generateId;
window.genFormatDate = genFormatDate;
window.formatCurrency = formatCurrency;
window.checkSubscriptionValidity = checkSubscriptionValidity;
window.showSubscriptionModal = showSubscriptionModal;
