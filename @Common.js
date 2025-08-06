// Common.js - Enhanced with reliable toast and confirm dialogs
class AppUtils {
    static formatCurrency(amount) {
        if (isNaN(amount)) return '₦0.00';
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
            minimumFractionDigits: 0
        }).format(amount);
    }

    static formatDate(dateString, options = {}) {
        if (!dateString) return '';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Invalid Date';
        
        const defaultOptions = { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true // This ensures 12-hour format
        };
        
        return date.toLocaleDateString('en-NG', { ...defaultOptions, ...options });
    }

    static showToast(message, type = 'success', duration = 3000) {
        // Create container if it doesn't exist
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.style.position = 'fixed';
            container.style.bottom = '20px';
            container.style.right = '20px';
            container.style.zIndex = '9999';
            document.body.appendChild(container);
        }

        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.style.display = 'flex';
        toast.style.alignItems = 'center';
        toast.style.padding = '12px 16px';
        toast.style.marginBottom = '10px';
        toast.style.backgroundColor = 'var(--card-bg)';
        toast.style.color = 'var(--text-color)';
        toast.style.borderRadius = '4px';
        toast.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
        toast.style.transform = 'translateX(150%)';
        toast.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
        toast.style.opacity = '0';

        // Set border color based on type
        const borderColors = {
            success: '#4cc9f0',
            error: '#f72585',
            warning: '#f8961e',
            info: '#4895ef'
        };
        toast.style.borderLeft = `4px solid ${borderColors[type] || borderColors.info}`;

        // Add icon
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        const icon = document.createElement('i');
        icon.className = `fas ${icons[type] || icons.info}`;
        icon.style.marginRight = '10px';
        icon.style.fontSize = '1.2rem';

        // Add message
        const messageEl = document.createElement('div');
        messageEl.textContent = message;
        messageEl.style.flex = '1';

        // Add close button
        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '&times;';
        closeBtn.style.background = 'none';
        closeBtn.style.border = 'none';
        closeBtn.style.color = 'inherit';
        closeBtn.style.cursor = 'pointer';
        closeBtn.style.marginLeft = '15px';
        closeBtn.style.fontSize = '1.2rem';

        // Assemble toast
        toast.appendChild(icon);
        toast.appendChild(messageEl);
        toast.appendChild(closeBtn);
        container.appendChild(toast);

        // Show toast
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
            toast.style.opacity = '1';
        }, 10);

        // Remove toast after duration
        const removeToast = () => {
            toast.style.transform = 'translateX(150%)';
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        };

        closeBtn.addEventListener('click', removeToast);
        setTimeout(removeToast, duration);
    }

    static async confirmAction(message, options = {}) {
        return new Promise((resolve) => {
            // Create overlay
            const overlay = document.createElement('div');
            overlay.className = 'confirm-modal-overlay';

            // Create modal
            const modal = document.createElement('div');
            modal.className = 'confirm-modal';

            // Create header
            const header = document.createElement('div');
            header.style.marginBottom = '15px';
            const title = document.createElement('h3');
            title.textContent = options.title || 'Confirm Action';
            title.style.margin = '0';
            header.appendChild(title);

            // Create body
            const body = document.createElement('div');
            body.style.marginBottom = '20px';
            const messageEl = document.createElement('p');
            messageEl.textContent = message;
            body.appendChild(messageEl);

            // Create footer
            const footer = document.createElement('div');
            footer.style.display = 'flex';
            footer.style.justifyContent = 'flex-end';
            footer.style.gap = '10px';

            const cancelBtn = document.createElement('button');
            cancelBtn.className = 'btn btn-secondary';
            cancelBtn.textContent = options.cancelText || 'Cancel';
            cancelBtn.addEventListener('click', () => {
                document.body.removeChild(overlay);
                resolve(false);
            });

            const confirmBtn = document.createElement('button');
            confirmBtn.className = `btn ${options.danger ? 'btn-danger' : 'btn-primary'}`;
            confirmBtn.textContent = options.okText || 'Confirm';
            confirmBtn.addEventListener('click', () => {
                document.body.removeChild(overlay);
                resolve(true);
            });

            footer.appendChild(cancelBtn);
            footer.appendChild(confirmBtn);

            // Assemble modal
            modal.appendChild(header);
            modal.appendChild(body);
            modal.appendChild(footer);
            overlay.appendChild(modal);
            document.body.appendChild(overlay);

            // Close when clicking outside
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    document.body.removeChild(overlay);
                    resolve(false);
                }
            });
        });
    }

    static generateId(prefix = '') {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substring(2, 7);
        return `${prefix}${timestamp}-${random}`;
    }

    static async delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Make utilities globally available
window.AppUtils = AppUtils;
window.formatCurrency = AppUtils.formatCurrency;
window.formatDate = AppUtils.formatDate;
window.showToast = AppUtils.showToast;
window.confirmAction = AppUtils.confirmAction;
window.generateId = AppUtils.generateId;
window.delay = AppUtils.delay;