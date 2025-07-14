class WealthSimulator {
    constructor() {
        this.settings = {
            salaryType: '月薪',
            salaryAmount: 10000,
            workDays: 5,
            workHours: 8,
            workStartTime: '09:00',
            animationDuration: 3,
            soundEnabled: false
        };
        
        this.startTime = null;
        this.totalWealth = 0;
        this.lastUpdateTime = null;
        this.animationId = null;
        this.isBossMode = false;
        this.isWealthCalculationActive = false; // 新增：控制财富计算是否激活
        this.previousWealth = 0; // 记录上一次的财富值，用于判断是否需要动画
        this.lastCelebrationMinute = 0; // 记录上次庆祝的分钟数
        this.isFishing = false; // 摸鱼状态
        this.fishStartTime = null; // 摸鱼开始时间
        this.totalFishTime = 0; // 总摸鱼时间
        
        this.init();
    }
    
    init() {
        this.loadSettings();
        this.setupEventListeners();
        this.checkFirstVisitToday();
        this.startWealthCalculation();
        this.updateDisplay();
        this.createWorkEmojis();
        
        // 检查是否有保存的设置，如果有则激活财富计算
        const savedSettings = localStorage.getItem('wealthSimulatorSettings');
        if (savedSettings) {
            this.isWealthCalculationActive = true;
        }
    }
    
    loadSettings() {
        const saved = localStorage.getItem('wealthSimulatorSettings');
        if (saved) {
            this.settings = { ...this.settings, ...JSON.parse(saved) };
        }
        
        // 加载今日数据
        const today = new Date().toDateString();
        const todayData = localStorage.getItem(`wealthData_${today}`);
        if (todayData) {
            const data = JSON.parse(todayData);
            this.startTime = new Date(data.startTime);
            this.totalWealth = data.totalWealth || 0;
        }
        
        this.applySettings();
    }
    
    saveSettings() {
        localStorage.setItem('wealthSimulatorSettings', JSON.stringify(this.settings));
    }
    
    saveTodayData() {
        const today = new Date().toDateString();
        const data = {
            startTime: this.startTime,
            totalWealth: this.totalWealth
        };
        localStorage.setItem(`wealthData_${today}`, JSON.stringify(data));
    }
    
    checkFirstVisitToday() {
        const today = new Date().toDateString();
        const lastVisit = localStorage.getItem('lastVisitDate');
        
        if (lastVisit !== today) {
            localStorage.setItem('lastVisitDate', today);
            this.showWealthMorning();
            this.startTime = new Date();
            this.totalWealth = 0;
        } else if (!this.startTime) {
            this.startTime = new Date();
        }
    }
    
    showWealthMorning() {
        const wealthMorning = document.getElementById('wealth-morning');
        const mainApp = document.getElementById('main-app');
        
        wealthMorning.classList.remove('hidden');
        mainApp.classList.add('hidden');
        
        this.startMoneyAnimation();
        
        setTimeout(() => {
            wealthMorning.classList.add('hidden');
            mainApp.classList.remove('hidden');
            mainApp.classList.add('fade-in');
        }, this.settings.animationDuration * 1000);
    }
    
    startMoneyAnimation() {
        const canvas = document.getElementById('money-canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        const particles = [];
        const particleCount = 50;
        
        // 创建粒子
        for (let i = 0; i < particleCount; i++) {
            particles.push(this.createParticle(canvas.width, canvas.height));
        }
        
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            particles.forEach(particle => {
                this.updateParticle(particle, canvas.width, canvas.height);
                this.drawParticle(ctx, particle);
            });
            
            this.animationId = requestAnimationFrame(animate);
        };
        
        animate();
    }
    
    createParticle(width, height) {
        const symbols = ['💰', '💵', '💴', '💶', '💷', '🪙', '💎', '✨'];
        return {
            x: Math.random() * width,
            y: -50,
            vx: (Math.random() - 0.5) * 2,
            vy: Math.random() * 3 + 1,
            symbol: symbols[Math.floor(Math.random() * symbols.length)],
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 5,
            size: Math.random() * 20 + 20
        };
    }
    
    updateParticle(particle, width, height) {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.rotation += particle.rotationSpeed;
        
        if (particle.y > height + 50) {
            particle.y = -50;
            particle.x = Math.random() * width;
        }
        
        if (particle.x < -50 || particle.x > width + 50) {
            particle.vx *= -1;
        }
    }
    
    drawParticle(ctx, particle) {
        ctx.save();
        ctx.translate(particle.x, particle.y);
        ctx.rotate(particle.rotation * Math.PI / 180);
        ctx.font = `${particle.size}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(particle.symbol, 0, 0);
        ctx.restore();
    }
    
    setupEventListeners() {
        // 设置项监听
        document.getElementById('salary-type').addEventListener('change', (e) => {
            this.settings.salaryType = e.target.value;
            this.updateSalaryPlaceholder();
            this.saveSettings();
            this.updateDisplay();
        });
        
        document.getElementById('salary-amount').addEventListener('input', (e) => {
            this.settings.salaryAmount = parseFloat(e.target.value) || 0;
            this.saveSettings();
            this.updateDisplay();
        });
        
        document.getElementById('work-days').addEventListener('input', (e) => {
            this.settings.workDays = parseInt(e.target.value) || 5;
            this.saveSettings();
            this.updateDisplay();
        });
        
        document.getElementById('work-hours').addEventListener('input', (e) => {
            this.settings.workHours = parseFloat(e.target.value) || 8;
            this.saveSettings();
            this.updateDisplay();
        });
        
        document.getElementById('work-start-time').addEventListener('change', (e) => {
            this.settings.workStartTime = e.target.value;
            this.saveSettings();
        });
        

        
        // 老板键
        document.getElementById('boss-mode-btn').addEventListener('click', () => {
            this.toggleBossMode();
        });
        
        document.getElementById('exit-boss-mode').addEventListener('click', () => {
            this.toggleBossMode();
        });
        
        // 键盘快捷键
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (this.isBossMode) {
                    this.toggleBossMode();
                }
            }
        });
        
        // 按钮事件
        document.getElementById('save-settings').addEventListener('click', () => {
            this.saveSettingsWithFeedback();
        });
        
        document.getElementById('restore-defaults').addEventListener('click', () => {
            this.restoreDefaults();
        });
        
        // 摸鱼按钮事件
        document.getElementById('fish-toggle').addEventListener('click', () => {
            this.toggleFishing();
        });
        
        document.getElementById('end-fish').addEventListener('click', () => {
            this.endFishing();
        });
        
        // 工作总结弹窗关闭
        document.getElementById('close-summary').addEventListener('click', () => {
            this.closeSummary();
        });
        
        // 窗口大小变化
        window.addEventListener('resize', () => {
            if (this.animationId) {
                const canvas = document.getElementById('money-canvas');
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
            }
        });
    }
    
    applySettings() {
        document.getElementById('salary-type').value = this.settings.salaryType;
        document.getElementById('salary-amount').value = this.settings.salaryAmount;
        document.getElementById('work-days').value = this.settings.workDays;
        document.getElementById('work-hours').value = this.settings.workHours;
        document.getElementById('work-start-time').value = this.settings.workStartTime;
        
        this.updateSalaryPlaceholder();
    }
    
    updateSalaryPlaceholder() {
        const salaryInput = document.getElementById('salary-amount');
        const salaryType = this.settings.salaryType;
        
        switch(salaryType) {
            case '月薪':
                salaryInput.placeholder = '请输入月薪（如：10000）';
                break;
            case '年薪':
                salaryInput.placeholder = '请输入年薪（如：120000）';
                break;
            case '时薪':
                salaryInput.placeholder = '请输入时薪（如：50）';
                break;
            case '日薪':
                salaryInput.placeholder = '请输入日薪（如：400）';
                break;
        }
    }
    
    calculateHourlyRate() {
        const { salaryType, salaryAmount, workDays, workHours } = this.settings;
        
        switch(salaryType) {
            case '月薪':
                // 假设一个月22个工作日
                return salaryAmount / (22 * workHours);
            case '年薪':
                // 一年52周
                return salaryAmount / (52 * workDays * workHours);
            case '时薪':
                return salaryAmount;
            case '日薪':
                return salaryAmount / workHours;
            default:
                return 50;
        }
    }
    
    isWorkingTime(currentTime) {
        const now = currentTime || new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        const currentTimeInMinutes = currentHour * 60 + currentMinute;
        
        // 获取工作开始时间
        const [startHour, startMinute] = this.settings.workStartTime.split(':').map(Number);
        const workStartInMinutes = startHour * 60 + startMinute;
        
        // 计算工作结束时间
        const workEndInMinutes = workStartInMinutes + (this.settings.workHours * 60);
        
        // 检查当前时间是否在工作时间内
        return currentTimeInMinutes >= workStartInMinutes && currentTimeInMinutes < workEndInMinutes;
    }
    
    startWealthCalculation() {
        this.lastUpdateTime = new Date();
        
        setInterval(() => {
            this.updateWealth();
            this.updateDisplay();
            this.saveTodayData();
            this.checkMinuteCelebration();
        }, 1000);
    }
    
    updateWealth() {
        if (!this.startTime || !this.isWealthCalculationActive) return;
        
        const now = new Date();
        
        // 检查是否在工作时间内
        if (!this.isWorkingTime(now)) {
            return; // 不在工作时间，不增加财富
        }
        
        const timeDiff = (now - this.lastUpdateTime) / 1000 / 3600; // 小时
        const hourlyRate = this.calculateHourlyRate();
        const wealthIncrease = hourlyRate * timeDiff;
        
        this.totalWealth += wealthIncrease;
        this.lastUpdateTime = now;
    }
    
    updateDisplay() {
        const hourlyRate = this.calculateHourlyRate();
        
        // 更新货币符号
        document.querySelectorAll('#currency-symbol').forEach(el => {
            el.textContent = '¥';
        });
        
        // 更新总财富
        const totalWealthEl = document.getElementById('total-wealth');
        totalWealthEl.textContent = this.formatNumber(this.totalWealth);
        
        // 只有在财富真正增长时才添加动画效果
        if (this.totalWealth > this.previousWealth && this.isWealthCalculationActive) {
            totalWealthEl.classList.add('number-roll');
            setTimeout(() => totalWealthEl.classList.remove('number-roll'), 300);
        }
        this.previousWealth = this.totalWealth;
        
        // 更新增长值
        const growthEl = document.getElementById('wealth-growth');
        if (this.isWealthCalculationActive && this.isWorkingTime()) {
            growthEl.textContent = this.formatNumber(hourlyRate / 3600); // 每秒增长
        } else {
            growthEl.textContent = '0.00';
        }
        
        // 更新时薪显示
        document.getElementById('hourly-rate-display').textContent = 
            `¥${this.formatNumber(hourlyRate)}`;
        
        // 更新工作时间
        this.updateWorkTime();
        
        // 更新总工作时长
        this.updateTotalWorkTime();
        
        // 更新下班倒计时
        this.updateCountdown();
    }
    
    updateWorkTime() {
        if (!this.startTime) return;
        
        const now = new Date();
        const diff = now - this.startTime;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        
        document.getElementById('work-time').textContent = `${hours}小时${minutes}分钟`;
    }
    
    updateTotalWorkTime() {
        if (!this.startTime) {
            document.getElementById('total-work-time').textContent = '0小时0分钟';
            return;
        }
        
        const now = new Date();
        const startOfDay = new Date(this.startTime);
        startOfDay.setHours(parseInt(this.settings.workStartTime.split(':')[0]), parseInt(this.settings.workStartTime.split(':')[1]), 0, 0);
        
        let totalWorkMinutes = 0;
        if (now > startOfDay) {
            totalWorkMinutes = Math.floor((now - startOfDay) / (1000 * 60));
        }
        
        const hours = Math.floor(totalWorkMinutes / 60);
        const minutes = totalWorkMinutes % 60;
        
        document.getElementById('total-work-time').textContent = `${hours}小时${minutes}分钟`;
    }
    
    updateCountdown() {
        const now = new Date();
        
        // 检查是否在工作时间内
        if (!this.isWorkingTime(now)) {
            document.getElementById('countdown-text').textContent = '🌙 现在是下班时间，好好休息吧！';
            return;
        }
        
        // 计算今天的工作开始时间
        const todayWorkStart = new Date();
        todayWorkStart.setHours(parseInt(this.settings.workStartTime.split(':')[0]), parseInt(this.settings.workStartTime.split(':')[1]), 0, 0);
        
        // 计算今天的下班时间
        const todayWorkEnd = new Date(todayWorkStart);
        todayWorkEnd.setHours(todayWorkEnd.getHours() + this.settings.workHours);
        
        // 如果当前时间已经过了今天的下班时间，显示下班文案
        if (now >= todayWorkEnd) {
            document.getElementById('countdown-text').textContent = '🎉 恭喜你，又活过了一天';
        } else {
            const remainingTime = todayWorkEnd - now;
            const remainingHours = Math.floor(remainingTime / (1000 * 60 * 60));
            const remainingMinutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));
            
            document.getElementById('countdown-text').textContent = `还有${remainingHours}小时${remainingMinutes}分钟就能下班`;
        }
    }
    
    formatNumber(num) {
        return num.toFixed(2);
    }
    
    toggleBossMode() {
        const mainApp = document.getElementById('main-app');
        const bossMode = document.getElementById('boss-mode');
        
        if (this.isBossMode) {
            bossMode.classList.add('hidden');
            mainApp.classList.remove('hidden');
            this.isBossMode = false;
        } else {
            mainApp.classList.add('hidden');
            bossMode.classList.remove('hidden');
            this.isBossMode = true;
            this.initFakeChart();
        }
    }
    
    initFakeChart() {
        const canvas = document.getElementById('fake-chart-canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        
        // 绘制假的业务图表
        ctx.fillStyle = '#f8f9fa';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // 绘制网格
        ctx.strokeStyle = '#dee2e6';
        ctx.lineWidth = 1;
        
        for (let i = 0; i <= 10; i++) {
            const x = (canvas.width / 10) * i;
            const y = (canvas.height / 10) * i;
            
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }
        
        // 绘制折线图
        ctx.strokeStyle = '#007bff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        
        const points = [];
        for (let i = 0; i <= 20; i++) {
            const x = (canvas.width / 20) * i;
            const y = canvas.height - (Math.random() * 0.3 + 0.4) * canvas.height;
            points.push({ x, y });
        }
        
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.stroke();
        
        // 绘制数据点
        ctx.fillStyle = '#007bff';
        points.forEach(point => {
            ctx.beginPath();
            ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
            ctx.fill();
        });
    }
    
    saveSettingsWithFeedback() {
        this.saveSettings();
        
        // 保存设置时不激活财富计算，需要点击开始摸鱼后才激活
        // this.isWealthCalculationActive = true; // 移除这行
        
        // 如果还没有开始时间，设置开始时间
        if (!this.startTime) {
            this.startTime = new Date();
            this.lastUpdateTime = new Date();
        }
        
        // 显示保存成功提示
        const saveBtn = document.getElementById('save-settings');
        const originalText = saveBtn.textContent;
        saveBtn.textContent = '✅ 保存成功！';
        saveBtn.style.background = '#28a745';
        
        setTimeout(() => {
            saveBtn.textContent = originalText;
            saveBtn.style.background = '#4285f4';
        }, 2000);
    }
    
    restoreDefaults() {
        if (confirm('确定要恢复默认设置吗？')) {
            this.settings = {
                salaryType: '月薪',
                salaryAmount: 10000,
                workDays: 5,
                workHours: 8,
                workStartTime: '09:00',
                animationDuration: 15,
                soundEnabled: false
            };
            
            // 停止财富计算
            this.isWealthCalculationActive = false;
            
            // 重置所有数据状态
            this.totalWealth = 0;
            this.previousWealth = 0;
            this.workTime = 0;
            this.totalWorkTime = 0;
            this.startTime = new Date();
            this.lastCelebrationMinute = 0;
            
            // 重置摸鱼状态
            this.isFishing = false;
            this.fishStartTime = null;
            this.totalFishTime = 0;
            
            // 重置摸鱼按钮
            const fishBtn = document.getElementById('fish-toggle');
            if (fishBtn) {
                fishBtn.textContent = '🐟 开始摸鱼';
                fishBtn.classList.remove('fishing');
            }
            
            this.applySettings();
            this.saveSettings();
            this.updateDisplay();
            
            // 显示恢复成功提示
            const defaultBtn = document.getElementById('restore-defaults');
            const originalText = defaultBtn.textContent;
            defaultBtn.textContent = '✅ 恢复成功！';
            defaultBtn.style.background = '#28a745';
            
            setTimeout(() => {
                defaultBtn.textContent = originalText;
                defaultBtn.style.background = '#6c757d';
            }, 2000);
        }
    }
    

    
    checkMinuteCelebration() {
        if (!this.startTime || !this.isWealthCalculationActive) return;
        
        const now = new Date();
        
        // 只在工作时间内才进行庆祝
        if (!this.isWorkingTime(now)) return;
        
        const totalMinutes = Math.floor((now - this.startTime) / (1000 * 60));
        
        if (totalMinutes > this.lastCelebrationMinute && totalMinutes > 0) {
            this.lastCelebrationMinute = totalMinutes;
            this.startCelebrationAnimation();
        }
    }
    
    startCelebrationAnimation() {
        // 创建庆祝容器
        const celebrationContainer = document.createElement('div');
        celebrationContainer.style.position = 'fixed';
        celebrationContainer.style.top = '0';
        celebrationContainer.style.left = '0';
        celebrationContainer.style.width = '100vw';
        celebrationContainer.style.height = '100vh';
        celebrationContainer.style.pointerEvents = 'none';
        celebrationContainer.style.zIndex = '9999';
        document.body.appendChild(celebrationContainer);
        
        // 创建撒花效果
        const celebrationEmojis = ['🎉', '🎊', '✨', '🌟', '💫', '🎈', '🎁', '🏆', '👏', '🥳'];
        
        for (let i = 0; i < 30; i++) {
            setTimeout(() => {
                const emoji = document.createElement('div');
                emoji.textContent = celebrationEmojis[Math.floor(Math.random() * celebrationEmojis.length)];
                emoji.style.position = 'absolute';
                emoji.style.fontSize = '2rem';
                emoji.style.left = Math.random() * 100 + 'vw';
                emoji.style.top = '-50px';
                emoji.style.animation = 'celebrationFall 3s ease-out forwards';
                
                celebrationContainer.appendChild(emoji);
                
                // 3秒后移除emoji
                setTimeout(() => {
                    if (emoji.parentNode) {
                        emoji.parentNode.removeChild(emoji);
                    }
                }, 3000);
            }, i * 100);
        }
        
        // 显示庆祝文字
        const celebrationText = document.createElement('div');
        celebrationText.innerHTML = '🎉 恭喜！又熬过了一分钟！🎉';
        celebrationText.style.position = 'fixed';
        celebrationText.style.top = '50%';
        celebrationText.style.left = '50%';
        celebrationText.style.transform = 'translate(-50%, -50%)';
        celebrationText.style.fontSize = '2.5rem';
        celebrationText.style.fontWeight = 'bold';
        celebrationText.style.color = '#ff6b6b';
        celebrationText.style.textShadow = '2px 2px 4px rgba(0,0,0,0.3)';
        celebrationText.style.zIndex = '10000';
        celebrationText.style.pointerEvents = 'none';
        celebrationText.style.animation = 'celebrationTextShow 3s ease-in-out';
        
        document.body.appendChild(celebrationText);
        
        // 添加CSS动画
        if (!document.getElementById('celebration-style')) {
            const style = document.createElement('style');
            style.id = 'celebration-style';
            style.textContent = `
                @keyframes celebrationFall {
                    0% {
                        transform: translateY(-50px) rotate(0deg);
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(100vh) rotate(360deg);
                        opacity: 0;
                    }
                }
                
                @keyframes celebrationTextShow {
                    0% {
                        opacity: 0;
                        transform: translate(-50%, -50%) scale(0.5);
                    }
                    20% {
                        opacity: 1;
                        transform: translate(-50%, -50%) scale(1.2);
                    }
                    80% {
                        opacity: 1;
                        transform: translate(-50%, -50%) scale(1);
                    }
                    100% {
                        opacity: 0;
                        transform: translate(-50%, -50%) scale(0.8);
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        // 3秒后清理
        setTimeout(() => {
            if (celebrationContainer.parentNode) {
                celebrationContainer.parentNode.removeChild(celebrationContainer);
            }
            if (celebrationText.parentNode) {
                celebrationText.parentNode.removeChild(celebrationText);
            }
        }, 3000);
    }
    
    createWorkEmojis() {
        const workEmojis = ['💼', '📊', '📈', '💻', '📝', '☕', '🖱️', '⌨️', '📱', '💡'];
        const container = document.body;
        
        // 创建随机位置的工作emoji装饰
        for (let i = 0; i < 8; i++) {
            const emoji = document.createElement('div');
            emoji.textContent = workEmojis[Math.floor(Math.random() * workEmojis.length)];
            emoji.style.position = 'fixed';
            emoji.style.fontSize = '20px';
            emoji.style.opacity = '0.1';
            emoji.style.pointerEvents = 'none';
            emoji.style.zIndex = '-1';
            emoji.style.left = Math.random() * 90 + '%';
            emoji.style.top = Math.random() * 90 + '%';
            emoji.style.animation = 'float 6s ease-in-out infinite';
            emoji.style.animationDelay = Math.random() * 2 + 's';
            
            container.appendChild(emoji);
        }
        
        // 添加CSS动画
        if (!document.getElementById('emoji-animation-style')) {
            const style = document.createElement('style');
            style.id = 'emoji-animation-style';
            style.textContent = `
                @keyframes float {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-20px) rotate(180deg); }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    toggleFishing() {
        const fishBtn = document.getElementById('fish-toggle');
        
        if (!this.isFishing) {
            // 开始摸鱼 - 激活财富计算
            this.isFishing = true;
            this.fishStartTime = new Date();
            fishBtn.textContent = '⏸️ 暂停摸鱼';
            fishBtn.classList.add('fishing');
            
            // 开始摸鱼时激活财富计算
            this.isWealthCalculationActive = true;
        } else {
            // 暂停/恢复摸鱼
            if (this.isWealthCalculationActive) {
                // 当前在工作，切换到暂停摸鱼
                this.isWealthCalculationActive = false;
                fishBtn.textContent = '▶️ 继续摸鱼';
            } else {
                // 当前暂停中，切换到继续摸鱼
                this.isWealthCalculationActive = true;
                fishBtn.textContent = '⏸️ 暂停摸鱼';
            }
        }
    }
    
    endFishing() {
        if (!this.isFishing) {
            alert('您还没有开始摸鱼呢！');
            return;
        }
        
        // 计算摸鱼时间
        const now = new Date();
        if (this.fishStartTime) {
            this.totalFishTime += (now - this.fishStartTime) / 1000 / 60; // 分钟
        }
        
        // 重置摸鱼状态
        this.isFishing = false;
        this.fishStartTime = null;
        
        // 结束摸鱼时停止财富计算
        this.isWealthCalculationActive = false;
        
        // 重置按钮
        const fishBtn = document.getElementById('fish-toggle');
        fishBtn.textContent = '🐟 开始摸鱼';
        fishBtn.classList.remove('fishing');
        
        // 显示工作总结
        this.showWorkSummary();
    }
    
    showWorkSummary() {
        const modal = document.getElementById('work-summary-modal');
        const summaryWealth = document.getElementById('summary-wealth');
        const summaryWorkTime = document.getElementById('summary-work-time');
        
        // 更新总结数据
        summaryWealth.textContent = `¥${this.formatNumber(this.totalWealth)}`;
        
        // 计算总工作时间
        if (this.startTime) {
            const now = new Date();
            const totalMinutes = Math.floor((now - this.startTime) / (1000 * 60));
            const hours = Math.floor(totalMinutes / 60);
            const minutes = totalMinutes % 60;
            summaryWorkTime.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`;
        }
        
        // 显示弹窗
        modal.classList.remove('hidden');
    }
    
    closeSummary() {
        const modal = document.getElementById('work-summary-modal');
        modal.classList.add('hidden');
    }

}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    new WealthSimulator();
});

// 添加一些有趣的彩蛋
document.addEventListener('keydown', (e) => {
    // Konami Code: ↑↑↓↓←→←→BA
    const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 
                       'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'];
    
    if (!window.konamiProgress) window.konamiProgress = 0;
    
    if (e.code === konamiCode[window.konamiProgress]) {
        window.konamiProgress++;
        if (window.konamiProgress === konamiCode.length) {
            // 彩蛋：超级摸鱼模式 - 薪资翻倍
            alert('🎉 恭喜发现隐藏彩蛋！薪资翻倍模式开启！');
            const salaryInput = document.getElementById('salary-amount');
            salaryInput.value = parseFloat(salaryInput.value || 0) * 2;
            salaryInput.dispatchEvent(new Event('input'));
            window.konamiProgress = 0;
        }
    } else {
        window.konamiProgress = 0;
    }
});

// 添加鼠标悬停效果
document.addEventListener('mouseover', (e) => {
    if (e.target.classList.contains('stat-card')) {
        e.target.classList.add('pulse');
        setTimeout(() => e.target.classList.remove('pulse'), 2000);
    }
});

// 防止页面意外关闭
window.addEventListener('beforeunload', (e) => {
    if (Math.random() < 0.1) { // 10%概率显示提示
        e.preventDefault();
        e.returnValue = '确定要离开吗？您的摸鱼财富还在增长中...';
    }
});