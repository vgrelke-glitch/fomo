class DesktopSimulator {
    constructor() {
        this.activeWindows = new Set();
        this.windowZIndex = 100;
        this.calculator = {
            display: '0',
            firstOperand: null,
            operator: null,
            waitingForOperand: false
        };
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateTime();
        this.setupCalculator();
    }

    setupEventListeners() {
        // Обработчики для иконок рабочего стола
        document.querySelectorAll('.desktop-icon').forEach(icon => {
            icon.addEventListener('dblclick', (e) => {
                const app = e.currentTarget.dataset.app;
                this.openWindow(app);
            });
        });

        // Обработчики для кнопок панели задач
        document.querySelectorAll('.taskbar-app').forEach(app => {
            app.addEventListener('click', (e) => {
                const appName = e.currentTarget.dataset.app;
                this.toggleWindow(appName);
            });
        });

        // Обработчики для кнопок управления окнами
        document.querySelectorAll('.window').forEach(window => {
            this.setupWindowControls(window);
        });

        // Обработчики для перетаскивания окон
        document.querySelectorAll('.window-header').forEach(header => {
            this.setupWindowDragging(header);
        });
    }

    openWindow(appName) {
        const window = document.getElementById(`${appName}-window`);
        if (window) {
            window.style.display = 'block';
            window.style.zIndex = ++this.windowZIndex;
            this.activeWindows.add(appName);
            this.updateTaskbar(appName, true);
            
            // Позиционирование окна
            if (!window.style.left) {
                const randomX = Math.random() * (window.innerWidth - 400);
                const randomY = Math.random() * (window.innerHeight - 300);
                window.style.left = `${randomX}px`;
                window.style.top = `${randomY}px`;
            }
        }
    }

    closeWindow(appName) {
        const window = document.getElementById(`${appName}-window`);
        if (window) {
            window.style.display = 'none';
            this.activeWindows.delete(appName);
            this.updateTaskbar(appName, false);
        }
    }

    toggleWindow(appName) {
        const window = document.getElementById(`${appName}-window`);
        if (window && window.style.display === 'block') {
            this.closeWindow(appName);
        } else {
            this.openWindow(appName);
        }
    }

    updateTaskbar(appName, isActive) {
        const taskbarApp = document.querySelector(`[data-app="${appName}"]`);
        if (taskbarApp) {
            taskbarApp.classList.toggle('active', isActive);
        }
    }

    setupWindowControls(window) {
        const closeBtn = window.querySelector('.close-btn');
        const minimizeBtn = window.querySelector('.minimize-btn');
        const maximizeBtn = window.querySelector('.maximize-btn');
        
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                const appName = window.id.replace('-window', '');
                this.closeWindow(appName);
            });
        }

        if (minimizeBtn) {
            minimizeBtn.addEventListener('click', () => {
                const appName = window.id.replace('-window', '');
                this.closeWindow(appName);
            });
        }

        if (maximizeBtn) {
            maximizeBtn.addEventListener('click', () => {
                this.toggleMaximize(window);
            });
        }
    }

    setupWindowDragging(header) {
        let isDragging = false;
        let currentX;
        let currentY;
        let initialX;
        let initialY;
        let xOffset = 0;
        let yOffset = 0;

        header.addEventListener('mousedown', (e) => {
            if (e.target.classList.contains('window-controls') || 
                e.target.closest('.window-controls')) {
                return;
            }

            initialX = e.clientX - xOffset;
            initialY = e.clientY - yOffset;

            if (e.target === header || header.contains(e.target)) {
                isDragging = true;
                header.style.cursor = 'grabbing';
            }
        });

        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                e.preventDefault();
                currentX = e.clientX - initialX;
                currentY = e.clientY - initialY;

                xOffset = currentX;
                yOffset = currentY;

                const window = header.closest('.window');
                window.style.left = currentX + 'px';
                window.style.top = currentY + 'px';
            }
        });

        document.addEventListener('mouseup', () => {
            initialX = currentX;
            initialY = currentY;
            isDragging = false;
            header.style.cursor = 'grab';
        });
    }

    toggleMaximize(window) {
        if (window.style.width === '100vw') {
            window.style.width = '';
            window.style.height = '';
            window.style.left = '';
            window.style.top = '';
            window.style.borderRadius = '8px';
        } else {
            window.style.width = '100vw';
            window.style.height = 'calc(100vh - 60px)';
            window.style.left = '0';
            window.style.top = '0';
            window.style.borderRadius = '0';
        }
    }

    updateTime() {
        const timeElement = document.querySelector('.time');
        if (timeElement) {
            const now = new Date();
            const timeString = now.toLocaleTimeString('ru-RU', {
                hour: '2-digit',
                minute: '2-digit'
            });
            timeElement.textContent = timeString;
        }
        setTimeout(() => this.updateTime(), 1000);
    }

    setupCalculator() {
        const display = document.querySelector('.calculator-display');
        const buttons = document.querySelectorAll('.calc-btn');

        buttons.forEach(button => {
            button.addEventListener('click', () => {
                const value = button.textContent;
                this.handleCalculatorInput(value);
            });
        });
    }

    handleCalculatorInput(value) {
        const display = document.querySelector('.calculator-display');
        
        if (value === 'C') {
            this.calculator.display = '0';
            this.calculator.firstOperand = null;
            this.calculator.operator = null;
            this.calculator.waitingForOperand = false;
        } else if (value === '±') {
            this.calculator.display = this.calculator.display === '0' ? '0' : 
                (parseFloat(this.calculator.display) * -1).toString();
        } else if (value === '%') {
            this.calculator.display = (parseFloat(this.calculator.display) / 100).toString();
        } else if (['+', '−', '×', '÷'].includes(value)) {
            if (this.calculator.firstOperand === null) {
                this.calculator.firstOperand = parseFloat(this.calculator.display);
            } else if (this.calculator.operator) {
                const result = this.calculate();
                this.calculator.display = String(result);
                this.calculator.firstOperand = result;
            }
            
            this.calculator.waitingForOperand = true;
            this.calculator.operator = value;
        } else if (value === '=') {
            if (this.calculator.firstOperand !== null && this.calculator.operator) {
                const result = this.calculate();
                this.calculator.display = String(result);
                this.calculator.firstOperand = null;
                this.calculator.operator = null;
                this.calculator.waitingForOperand = true;
            }
        } else if (value === '.') {
            if (this.calculator.waitingForOperand) {
                this.calculator.display = '0.';
                this.calculator.waitingForOperand = false;
            } else if (this.calculator.display.indexOf('.') === -1) {
                this.calculator.display += '.';
            }
        } else {
            if (this.calculator.waitingForOperand) {
                this.calculator.display = value;
                this.calculator.waitingForOperand = false;
            } else {
                this.calculator.display = this.calculator.display === '0' ? value : 
                    this.calculator.display + value;
            }
        }
        
        display.textContent = this.calculator.display;
    }

    calculate() {
        const first = this.calculator.firstOperand;
        const second = parseFloat(this.calculator.display);
        
        switch (this.calculator.operator) {
            case '+':
                return first + second;
            case '−':
                return first - second;
            case '×':
                return first * second;
            case '÷':
                return second !== 0 ? first / second : 0;
            default:
                return second;
        }
    }
}

// Инициализация симулятора при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    new DesktopSimulator();
});

// Дополнительные функции для интерактивности
document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    // Здесь можно добавить контекстное меню
});

// Обработка клика по рабочему столу для закрытия контекстного меню
document.querySelector('.desktop-area').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) {
        // Закрыть все контекстные меню
    }
});