// db.js - Shared IndexedDB configuration for all pages
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

function openDatabase() {
    return new Promise((resolve, reject) => {
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

// Make DB functions globally available
window.DB_CONFIG = DB_CONFIG;
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
