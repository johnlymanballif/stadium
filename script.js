document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('logoutBtn');
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('themeIcon');
    const currentDateEl = document.getElementById('currentDate');
    const streakCountEl = document.getElementById('streakCount');
    const progressRing = document.getElementById('progressRing');
    const emailCountEl = document.getElementById('emailCount');
    const emailInput = document.getElementById('emailInput');
    const addEmailBtn = document.getElementById('addEmailBtn');
    const emailList = document.getElementById('emailList');
    const totalEmailsEl = document.getElementById('totalEmails');
    const workingDaysEl = document.getElementById('workingDays');
    const clientCountEl = document.getElementById('clientCount');
    const clientProgressBar = document.getElementById('clientProgressBar');
    const emailsInCycleEl = document.getElementById('emailsInCycle');
    const expectedMeetingsEl = document.getElementById('expectedMeetings');
    const calendarGrid = document.getElementById('calendarGrid');
    const completeDayBtn = document.getElementById('completeDayBtn');

    const RING_CIRCUMFERENCE = 2 * Math.PI * 80;

    let state = {
        user: null,
        dailyEmails: [],
        completedDays: {},
        totalEmails: 0,
        streak: 0,
        theme: 'dark',
        editingId: null,
    };

    function getTodayKey() {
        return new Date().toISOString().split('T')[0];
    }

    function init() {
        const { createClient } = supabase;
        const supabaseClient = createClient('https://onwfrweefxxcimvzunjd.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ud2Zyd2VlZnh4Y2ltdnp1bmpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyNDczMTQsImV4cCI6MjA2ODgyMzMxNH0.uLRXdtv3l1SyX8HFq1FHGY3rRR3akLpqCfTVRUjhUUg');

        supabaseClient.auth.onAuthStateChange((event, session) => {
            if (!session) {
                // If no session, check for demo user
                const demoUser = localStorage.getItem('demo_user');
                if (demoUser) {
                    state.user = { email: demoUser };
                    loadState();
                    setupEventListeners();
                    renderAll();
                    requestNotificationPermission();
                } else {
                    window.location.href = 'login.html';
                }
            } else {
                state.user = session.user;
                loadState();
                setupEventListeners();
                renderAll();
                requestNotificationPermission();
            }
        });
    }

    function loadState() {
        const data = JSON.parse(localStorage.getItem(state.user.email)) || {};
        state.completedDays = data.completedDays || {};
        state.totalEmails = data.totalEmails || 0;
        state.theme = data.theme || 'dark';
        
        const todayKey = getTodayKey();
        state.dailyEmails = state.completedDays[todayKey]?.emails || [];
    }

    function saveState() {
        if (!state.user || state.user.email === 'guest' || localStorage.getItem('demo_user')) {
            return; // Do not save for guest or demo users
        }

        const todayKey = getTodayKey();
        if (state.dailyEmails.length > 0) {
            state.completedDays[todayKey] = {
                emails: state.dailyEmails,
                count: state.dailyEmails.length,
            };
        } else {
            delete state.completedDays[todayKey];
        }

        calculateTotalEmails();

        const dataToSave = {
            completedDays: state.completedDays,
            totalEmails: state.totalEmails,
            theme: state.theme,
        };

        localStorage.setItem(state.user.email, JSON.stringify(dataToSave));
    }

    function setupEventListeners() {
        logoutBtn.addEventListener('click', logout);
        themeToggle.addEventListener('click', toggleTheme);
        addEmailBtn.addEventListener('click', addEmail);
        emailInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                addEmail();
            }
        });
        emailList.addEventListener('click', handleEmailListClick);
    }

    function logout() {
        const { createClient } = supabase;
        const supabaseClient = createClient('https://onwfrweefxxcimvzunjd.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ud2Zyd2VlZnh4Y2ltdnp1bmpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyNDczMTQsImV4cCI6MjA2ODgyMzMxNH0.uLRXdtv3l1SyX8HFq1FHGY3rRR3akLpqCfTVRUjhUUg');
        
        localStorage.removeItem('demo_user');
        supabaseClient.auth.signOut();
    }

    function renderAll() {
        renderTheme();
        renderDate();
        renderDailyEmails();
        updateProgress();
        updateClientProgress();
        updateStats();
        renderCalendar();
    }

    function toggleTheme() {
        state.theme = state.theme === 'dark' ? 'light' : 'dark';
        saveState();
        renderTheme();
    }

    function renderTheme() {
        document.body.className = state.theme;
        themeIcon.textContent = state.theme === 'dark' ? '☀️' : '🌙';
        if (state.theme === 'dark') {
            document.body.classList.add('dark');
            document.body.classList.remove('light');
        } else {
            document.body.classList.add('light');
            document.body.classList.remove('dark');
        }
    }

    function renderDate() {
        const today = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        currentDateEl.textContent = today.toLocaleDateString('en-US', options);
    }

    function addEmail() {
        const name = emailInput.value.trim();
        if (name) {
            const newEmail = {
                id: Date.now(),
                name,
                date: new Date().toISOString(),
            };
            state.dailyEmails.push(newEmail);
            emailInput.value = '';

            const todayKey = getTodayKey();
            state.completedDays[todayKey] = {
                emails: state.dailyEmails,
                count: state.dailyEmails.length,
            };
            
            calculateTotalEmails();
            saveState();
            renderAll();
        }
    }

    function handleEmailListClick(e) {
        const target = e.target;
        const emailItem = target.closest('.email-item');
        if (!emailItem) return;

        const id = parseInt(emailItem.dataset.id);

        if (target.classList.contains('delete-btn')) {
            if (confirm('Are you sure you want to delete this email?')) {
                deleteEmail(id);
            }
        } else if (target.classList.contains('edit-btn')) {
            state.editingId = id;
            renderDailyEmails();
        } else if (target.classList.contains('save-btn')) {
            const input = emailItem.querySelector('.edit-input');
            updateEmail(id, input.value);
        } else if (target.classList.contains('cancel-btn')) {
            state.editingId = null;
            renderDailyEmails();
        }
    }

    function deleteEmail(id) {
        state.dailyEmails = state.dailyEmails.filter(email => email.id !== id);
        const todayKey = getTodayKey();
        if (state.dailyEmails.length > 0) {
            state.completedDays[todayKey] = {
                emails: state.dailyEmails,
                count: state.dailyEmails.length,
            };
        } else {
            delete state.completedDays[todayKey];
        }
        calculateTotalEmails();
        saveState();
        renderAll();
    }

    function updateEmail(id, newName) {
        const email = state.dailyEmails.find(e => e.id === id);
        if (email && newName.trim()) {
            email.name = newName.trim();
            state.editingId = null;
            const todayKey = getTodayKey();
            state.completedDays[todayKey] = {
                emails: state.dailyEmails,
                count: state.dailyEmails.length,
            };
            calculateTotalEmails();
            saveState();
            renderAll();
        }
    }

    function renderDailyEmails() {
        emailList.innerHTML = '';
        state.dailyEmails.forEach(email => {
            const isEditing = state.editingId === email.id;
            const item = document.createElement('div');
            item.className = 'email-item';
            item.dataset.id = email.id;

            if (isEditing) {
                item.innerHTML = `
                    <input type="text" class="edit-input" value="${email.name}">
                    <div class="email-actions">
                        <button class="save-btn">Save</button>
                        <button class="cancel-btn">Cancel</button>
                    </div>
                `;
            } else {
                item.innerHTML = `
                    <span class="email-name">${email.name}</span>
                    <div class="email-actions">
                        <button class="edit-btn">Edit</button>
                        <button class="delete-btn">Delete</button>
                    </div>
                `;
            }
            emailList.appendChild(item);
        });
    }

    function updateProgress() {
        const count = state.dailyEmails.length;
        emailCountEl.textContent = count;

        const progress = Math.min((count / 3) * 100, 100);
        const offset = RING_CIRCUMFERENCE - (progress / 100) * RING_CIRCUMFERENCE;
        progressRing.style.strokeDashoffset = offset;

        if (count >= 3) {
            progressRing.classList.add('complete');
            completeDayBtn.classList.add('active');
            if (count === 3) {
                // Trigger celebration animation
                document.querySelector('.progress-ring-container').classList.add('celebrate');
                setTimeout(() => {
                    document.querySelector('.progress-ring-container').classList.remove('celebrate');
                }, 1000);
            }
        } else {
            progressRing.classList.remove('complete');
            completeDayBtn.classList.remove('active');
        }
    }

    function updateClientProgress() {
        const emailsInCycle = state.totalEmails % 50;
        const progress = (emailsInCycle / 50) * 100;

        clientProgressBar.style.width = `${progress}%`;
        clientProgressBar.className = 'progress-bar-fill'; // Reset classes
        if (progress <= 25) {
            clientProgressBar.classList.add('red');
        } else if (progress <= 50) {
            clientProgressBar.classList.add('orange');
        } else if (progress <= 75) {
            clientProgressBar.classList.add('yellow');
        } else {
            clientProgressBar.classList.add('green');
        }

        emailsInCycleEl.textContent = emailsInCycle;
        expectedMeetingsEl.textContent = Math.floor(state.totalEmails * 0.04);
        clientCountEl.textContent = Math.floor(state.totalEmails / 50);
    }

    function calculateTotalEmails() {
        state.totalEmails = Object.values(state.completedDays).reduce((sum, day) => sum + day.count, 0);
    }

    function updateStats() {
        totalEmailsEl.textContent = state.totalEmails;
        const workingDays = Object.keys(state.completedDays).length;
        workingDaysEl.textContent = workingDays;
        calculateStreak();
        streakCountEl.textContent = state.streak;
    }

    function calculateStreak() {
        const dates = Object.keys(state.completedDays)
            .filter(date => state.completedDays[date].count >= 3)
            .sort((a, b) => new Date(b) - new Date(a));

        if (dates.length === 0) {
            state.streak = 0;
            return;
        }

        let currentStreak = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const firstStreakDate = new Date(dates[0]);
        firstStreakDate.setHours(0, 0, 0, 0);

        const diff = (today - firstStreakDate) / (1000 * 60 * 60 * 24);

        if (diff > 1) {
            state.streak = 0;
            return;
        }
        
        currentStreak = 1;

        for (let i = 0; i < dates.length - 1; i++) {
            const date1 = new Date(dates[i]);
            const date2 = new Date(dates[i + 1]);
            const dayDiff = (date1 - date2) / (1000 * 60 * 60 * 24);

            if (dayDiff === 1) {
                currentStreak++;
            } else {
                break;
            }
        }

        state.streak = currentStreak;
    }

    function renderCalendar() {
        calendarGrid.innerHTML = '';
        const today = new Date();
        const month = today.getMonth();
        const year = today.getFullYear();

        const firstDayOfMonth = new Date(year, month, 1);
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const startDayOfWeek = firstDayOfMonth.getDay();

        // Add empty cells for alignment
        for (let i = 0; i < startDayOfWeek; i++) {
            calendarGrid.appendChild(document.createElement('div'));
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const dayEl = document.createElement('div');
            dayEl.className = 'calendar-day';
            dayEl.textContent = day;

            const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            if (state.completedDays[dateKey]) {
                dayEl.classList.add('completed');
                dayEl.dataset.tooltip = `${state.completedDays[dateKey].count} emails`;
            }

            if (day === today.getDate()) {
                dayEl.classList.add('today');
            }
            calendarGrid.appendChild(dayEl);
        }
    }

    function requestNotificationPermission() {
        if ('Notification' in window) {
            Notification.requestPermission(status => {
                console.log('Notification permission status:', status);
                if (status === 'granted') {
                    scheduleDailyNotifications();
                }
            });
        }
    }

    function scheduleDailyNotifications() {
        if (Notification.permission !== 'granted') {
            return;
        }

        navigator.serviceWorker.ready.then(registration => {
            const now = new Date();

            const scheduleNotification = (hour, minute) => {
                const notificationTime = new Date();
                notificationTime.setHours(hour, minute, 0, 0);

                if (now > notificationTime) {
                    // If it's past the time for today, schedule for tomorrow
                    notificationTime.setDate(notificationTime.getDate() + 1);
                }

                const delay = notificationTime.getTime() - now.getTime();

                setTimeout(() => {
                    registration.showNotification('STADIUM Reminder', {
                        body: 'Time to open your PWA!',
                        icon: 'icons/icon-192x192.png'
                    });
                    // Reschedule for the next day
                    setInterval(() => {
                        registration.showNotification('STADIUM Reminder', {
                            body: 'Time to open your PWA!',
                            icon: 'icons/icon-192x192.png'
                        });
                    }, 24 * 60 * 60 * 1000);
                }, delay);
            };

            scheduleNotification(15, 0); // 3:00 PM
            scheduleNotification(18, 0); // 6:00 PM
        });
    }

    // Initial call
    init();
});
