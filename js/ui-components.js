/**
 * UI Components and Utilities for 100-Day Study Streak Tracker
 * Enhances the app with modern UI interactions and feedback mechanisms
 */

// Toast notification system
class ToastManager {
    constructor() {
        this.container = document.createElement('div');
        this.container.className = 'toast-container';
        this.container.style.position = 'fixed';
        this.container.style.bottom = '20px';
        this.container.style.right = '20px';
        this.container.style.zIndex = '1000';
        document.body.appendChild(this.container);
    }

    show(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.style.backgroundColor = 'var(--card-background)';
        toast.style.color = 'var(--text-color)';
        toast.style.padding = '12px 16px';
        toast.style.margin = '10px 0';
        toast.style.borderRadius = '8px';
        toast.style.boxShadow = 'var(--box-shadow)';
        toast.style.display = 'flex';
        toast.style.alignItems = 'center';
        toast.style.width = '300px';
        toast.style.transform = 'translateX(400px)';
        toast.style.transition = 'transform 0.3s ease';
        toast.style.borderLeft = '4px solid';
        toast.style.opacity = '0';

        // Style based on type
        let icon = '';
        switch(type) {
            case 'success':
                toast.style.borderLeftColor = 'var(--success-color)';
                icon = '<i class="fas fa-check-circle" style="color: var(--success-color); margin-right: 10px; font-size: 1.2rem;"></i>';
                break;
            case 'error':
                toast.style.borderLeftColor = 'var(--error-color)';
                icon = '<i class="fas fa-exclamation-circle" style="color: var(--error-color); margin-right: 10px; font-size: 1.2rem;"></i>';
                break;
            case 'warning':
                toast.style.borderLeftColor = 'var(--warning-color)';
                icon = '<i class="fas fa-exclamation-triangle" style="color: var(--warning-color); margin-right: 10px; font-size: 1.2rem;"></i>';
                break;
            default:
                toast.style.borderLeftColor = 'var(--primary-color)';
                icon = '<i class="fas fa-info-circle" style="color: var(--primary-color); margin-right: 10px; font-size: 1.2rem;"></i>';
        }

        toast.innerHTML = `
            ${icon}
            <div style="flex: 1;">${message}</div>
            <button style="background: none; border: none; cursor: pointer; font-size: 1rem; color: var(--text-secondary); margin-left: 10px;">
                <i class="fas fa-times"></i>
            </button>
        `;

        this.container.appendChild(toast);
        
        // Close button functionality
        const closeBtn = toast.querySelector('button');
        closeBtn.addEventListener('click', () => {
            this.close(toast);
        });

        // Animate in
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
            toast.style.opacity = '1';
        }, 50);

        // Auto dismiss
        if (duration > 0) {
            setTimeout(() => {
                this.close(toast);
            }, duration);
        }

        return toast;
    }

    close(toast) {
        toast.style.transform = 'translateX(400px)';
        toast.style.opacity = '0';
        
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }

    success(message, duration = 3000) {
        return this.show(message, 'success', duration);
    }

    error(message, duration = 3000) {
        return this.show(message, 'error', duration);
    }

    warning(message, duration = 3000) {
        return this.show(message, 'warning', duration);
    }

    info(message, duration = 3000) {
        return this.show(message, 'info', duration);
    }
}

// Loading button utility
class LoadingButton {
    constructor(button) {
        this.button = button;
        this.originalContent = button.innerHTML;
        this.originalWidth = button.offsetWidth;
    }

    start(text = 'Loading...') {
        this.button.disabled = true;
        this.button.style.width = `${this.originalWidth}px`;
        this.button.innerHTML = `<i class="fas fa-circle-notch fa-spin"></i> ${text}`;
        return this;
    }

    success(text = 'Success!', resetAfter = 1500) {
        this.button.innerHTML = `<i class="fas fa-check"></i> ${text}`;
        this.button.style.backgroundColor = 'var(--success-color)';
        
        if (resetAfter > 0) {
            setTimeout(() => this.reset(), resetAfter);
        }
        return this;
    }

    error(text = 'Failed!', resetAfter = 1500) {
        this.button.innerHTML = `<i class="fas fa-times"></i> ${text}`;
        this.button.style.backgroundColor = 'var(--error-color)';
        
        if (resetAfter > 0) {
            setTimeout(() => this.reset(), resetAfter);
        }
        return this;
    }

    reset() {
        this.button.disabled = false;
        this.button.innerHTML = this.originalContent;
        this.button.style.backgroundColor = '';
        this.button.style.width = '';
        return this;
    }
}

// Confetti animation for streak milestones
class ConfettiCelebration {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '1000';
        this.ctx = this.canvas.getContext('2d');
    }

    createConfetti(count = 100) {
        document.body.appendChild(this.canvas);
        this.resize();
        window.addEventListener('resize', () => this.resize());

        const confetti = [];
        const colors = [
            '#4361ee', '#3f8efc', '#ef476f', '#06d6a0', '#ffd166'
        ];

        for (let i = 0; i < count; i++) {
            confetti.push({
                x: Math.random() * this.canvas.width,
                y: -20,
                size: Math.random() * 10 + 5,
                color: colors[Math.floor(Math.random() * colors.length)],
                rotation: Math.random() * 360,
                speed: Math.random() * 3 + 2,
                rotationSpeed: (Math.random() - 0.5) * 2,
                horizontalSpeed: (Math.random() - 0.5) * 2
            });
        }

        const animate = () => {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            let stillFalling = false;
            confetti.forEach(particle => {
                particle.y += particle.speed;
                particle.x += particle.horizontalSpeed;
                particle.rotation += particle.rotationSpeed;

                this.ctx.save();
                this.ctx.translate(particle.x, particle.y);
                this.ctx.rotate(particle.rotation * Math.PI / 180);
                this.ctx.fillStyle = particle.color;
                this.ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size);
                this.ctx.restore();

                if (particle.y < this.canvas.height + 20) {
                    stillFalling = true;
                }
            });

            if (stillFalling) {
                requestAnimationFrame(animate);
            } else {
                this.stop();
            }
        };

        animate();
        
        // Auto cleanup after 6 seconds
        setTimeout(() => this.stop(), 6000);
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    stop() {
        if (this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }
    }
}

// Initialize components
document.addEventListener('DOMContentLoaded', () => {
    // Create global instances
    window.toastManager = new ToastManager();
    window.confetti = new ConfettiCelebration();
    
    // Add pulse animation to streak counter
    const streakCounter = document.getElementById('streak-counter');
    if (streakCounter) {
        setInterval(() => {
            streakCounter.style.transform = 'scale(1.05)';
            streakCounter.style.transition = 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
            
            setTimeout(() => {
                streakCounter.style.transform = 'scale(1)';
            }, 500);
        }, 5000);
    }
    
    // Add hover effect to stat cards
    document.querySelectorAll('.stat-card').forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-8px)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });
}); 