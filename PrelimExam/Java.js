// ===== COLLEGE OF COMPUTER STUDIES WEBSITE =====
// All JavaScript in One File

// ===== GLOBAL VARIABLES =====
let announcementsVisible = 3;

// ===== DOM CONTENT LOADED =====
document.addEventListener('DOMContentLoaded', function() {
    // Initialize navigation
    initNavigation();
    
    // Initialize theme toggle
    initThemeToggle();
    
    // Initialize back to top button
    initBackToTop();
    
    // Get current page from URL
    const currentPage = getCurrentPage();
    
    // Initialize page-specific features
    switch(currentPage) {
        case 'index.html':
        case '':
        case 'home':
            initHomePage();
            break;
        case 'about.html':
            initAboutPage();
            break;
        case 'programs.html':
            initProgramsPage();
            break;
        case 'faculty.html':
            initFacultyPage();
            break;
        case 'announcements.html':
            initAnnouncementsPage();
            break;
        case 'contact.html':
            initContactPage();
            break;
    }
    
    // Show welcome message on homepage
    if (currentPage === 'index.html' || currentPage === '' || currentPage === 'home') {
        setTimeout(() => {
            showToast('Welcome to College of Computer Studies!');
        }, 1000);
    }
});

// ===== UTILITY FUNCTIONS =====
function getCurrentPage() {
    const path = window.location.pathname;
    const page = path.split('/').pop() || 'index.html';
    return page;
}

// ===== NAVIGATION =====
function initNavigation() {
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');
    
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            menuToggle.innerHTML = navMenu.classList.contains('active') 
                ? '<i class="fas fa-times"></i>' 
                : '<i class="fas fa-bars"></i>';
        });
        
        // Close menu when clicking a link
        document.querySelectorAll('.nav-menu a').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                if (menuToggle) menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
            });
        });
    }
    
    // Set active link based on current page
    const currentPage = getCurrentPage();
    const navLinks = document.querySelectorAll('.nav-menu a');
    navLinks.forEach(link => {
        const linkPage = link.getAttribute('href');
        if (linkPage === currentPage || 
            (currentPage === 'index.html' && linkPage === 'index.html') ||
            (currentPage === '' && linkPage === 'index.html')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// ===== THEME TOGGLE =====
function initThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    
    // Check for saved theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        updateThemeButton(true);
    }
    
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            const isDarkMode = document.body.classList.contains('dark-mode');
            localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
            updateThemeButton(isDarkMode);
        });
    }
}

function updateThemeButton(isDarkMode) {
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.innerHTML = isDarkMode 
            ? '<i class="fas fa-sun"></i> Light Mode' 
            : '<i class="fas fa-moon"></i> Dark Mode';
    }
}

// ===== BACK TO TOP =====
function initBackToTop() {
    const backToTopBtn = document.getElementById('backToTop');
    
    if (backToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }
        });
        
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
}

// ===== HOME PAGE FEATURES =====
function initHomePage() {
    // Animated stats counter
    initStatsCounter();
    
    // Program tabs
    initProgramTabs();
    
    // Faculty slider
    initFacultySlider();
    
    // Load events
    loadEvents();
}

function initStatsCounter() {
    const statNumbers = document.querySelectorAll('.stat-number');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const statNumber = entry.target;
                const target = parseInt(statNumber.getAttribute('data-count'));
                animateCounter(statNumber, target);
                observer.unobserve(statNumber);
            }
        });
    }, { threshold: 0.5 });
    
    statNumbers.forEach(stat => observer.observe(stat));
}

function animateCounter(element, target) {
    let current = 0;
    const increment = target / 50;
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            clearInterval(timer);
            element.textContent = target + '+';
        } else {
            element.textContent = Math.floor(current) + '+';
        }
    }, 30);
}

function initProgramTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons and panes
            tabBtns.forEach(b => b.classList.remove('active'));
            tabPanes.forEach(p => p.classList.remove('active'));
            
            // Add active class to clicked button
            btn.classList.add('active');
            
            // Show corresponding pane
            const tabId = btn.getAttribute('data-tab');
            const targetPane = document.getElementById(tabId);
            if (targetPane) targetPane.classList.add('active');
        });
    });
}

function initFacultySlider() {
    const facultySlider = document.querySelector('.faculty-cards');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    
    if (!facultySlider) return;
    
    // Sample faculty data for homepage
    const facultyData = [
        { name: "Dr. Sarah Johnson", position: "Dean & Professor", image: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&h=400&fit=crop" },
        { name: "Prof. Michael Chen", position: "Department Chair", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop" },
        { name: "Dr. Emily Rodriguez", position: "Associate Professor", image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop" },
        { name: "Prof. David Kim", position: "Assistant Professor", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop" },
        { name: "Dr. Lisa Wong", position: "Professor", image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=400&fit=crop" }
    ];
    
    // Render faculty cards
    facultySlider.innerHTML = facultyData.map(faculty => `
        <div class="faculty-card">
            <img src="${faculty.image}" alt="${faculty.name}" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect width=%22100%22 height=%22100%22 fill=%22%23eee%22/><text x=%2250%22 y=%2250%22 font-size=%2212%22 text-anchor=%22middle%22 dy=%22.3em%22>Faculty</text></svg>'">
            <div class="faculty-card-content">
                <h4 class="faculty-name">${faculty.name}</h4>
                <p class="faculty-position">${faculty.position}</p>
                <a href="faculty.html" class="btn btn-secondary">View Profile</a>
            </div>
        </div>
    `).join('');
    
    // Slider controls
    if (prevBtn && nextBtn) {
        prevBtn.addEventListener('click', () => {
            facultySlider.scrollBy({ left: -300, behavior: 'smooth' });
        });
        
        nextBtn.addEventListener('click', () => {
            facultySlider.scrollBy({ left: 300, behavior: 'smooth' });
        });
    }
}

function loadEvents() {
    const eventsList = document.getElementById('eventsList');
    if (!eventsList) return;
    
    const events = [
        { title: "Tech Symposium 2023", date: "Dec 15, 2023", desc: "Annual technology conference featuring industry leaders and research presentations." },
        { title: "Code for Good Hackathon", date: "Dec 20, 2023", desc: "48-hour coding competition focusing on social and environmental challenges." },
        { title: "AI & Machine Learning Workshop", date: "Jan 10, 2024", desc: "Hands-on workshop covering the latest developments in AI and machine learning." }
    ];
    
    eventsList.innerHTML = events.map(event => {
        const day = event.date.split(' ')[1].replace(',', '');
        const month = event.date.split(' ')[0];
        
        return `
            <div class="event-card">
                <div class="event-date">
                    <span class="day">${day}</span>
                    <span class="month">${month}</span>
                </div>
                <div class="event-content">
                    <h4 class="event-title">${event.title}</h4>
                    <p class="event-description">${event.desc}</p>
                    <a href="announcements.html" class="btn-link">Learn More <i class="fas fa-arrow-right"></i></a>
                </div>
            </div>
        `;
    }).join('');
}

// ===== ABOUT PAGE =====
function initAboutPage() {
    // No special JavaScript needed for about page
    console.log('About page initialized');
}

// ===== PROGRAMS PAGE =====
function initProgramsPage() {
    // Initialize program tabs
    const programTabBtns = document.querySelectorAll('.tab-btn');
    const programTabPanes = document.querySelectorAll('.tab-pane');
    
    programTabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            programTabBtns.forEach(b => b.classList.remove('active'));
            programTabPanes.forEach(p => p.classList.remove('active'));
            
            btn.classList.add('active');
            const tabId = btn.getAttribute('data-tab');
            const targetPane = document.getElementById(tabId);
            if (targetPane) targetPane.classList.add('active');
            
            // Load accordion for this tab
            loadAccordion(tabId);
        });
    });
    
    // Load initial accordion
    loadAccordion('undergrad');
}

function loadAccordion(level) {
    const accordionId = level + 'Accordion';
    const accordionContainer = document.getElementById(accordionId);
    if (!accordionContainer) return;
    
    const programs = {
        undergrad: [
            { 
                title: "BS Computer Science", 
                desc: "Focuses on algorithms, software development, and computational theory. Students gain expertise in programming, data structures, and software engineering.", 
                courses: ["Data Structures", "Algorithms", "Software Engineering", "Database Systems", "Operating Systems", "Computer Networks"], 
                duration: "4 years",
                units: "120 units"
            },
            { 
                title: "BS Information Technology", 
                desc: "Focuses on IT infrastructure, network administration, cybersecurity, and system integration. Prepares students for careers in IT management and technical support.", 
                courses: ["Network Fundamentals", "System Administration", "Cybersecurity", "Web Development", "Database Management", "Cloud Computing"], 
                duration: "4 years",
                units: "120 units"
            },
            { 
                title: "BS Information Systems", 
                desc: "Combines business knowledge with technical skills. Focuses on database management, business intelligence, and enterprise systems development.", 
                courses: ["Database Management", "Business Intelligence", "Enterprise Systems", "Project Management", "Systems Analysis", "E-Commerce"], 
                duration: "4 years",
                units: "120 units"
            }
        ],
        graduate: [
            { 
                title: "MS Computer Science", 
                desc: "Advanced study in computer science with research opportunities. Focuses on cutting-edge technologies and research methodologies.", 
                courses: ["Advanced Algorithms", "Machine Learning", "Research Methods", "Thesis", "Data Mining", "Cloud Architecture"], 
                duration: "2 years",
                units: "36 units"
            },
            { 
                title: "MS Information Technology", 
                desc: "Advanced IT management and technical leadership program. Prepares students for executive roles in technology organizations.", 
                courses: ["IT Governance", "Advanced Networking", "Security Management", "Capstone Project", "Strategic IT", "Enterprise Architecture"], 
                duration: "2 years",
                units: "36 units"
            }
        ],
        doctorate: [
            { 
                title: "PhD Computer Science", 
                desc: "Doctoral program focusing on original research in computer science. Students work closely with faculty on groundbreaking research projects.", 
                requirements: ["Master's degree in related field", "Research proposal", "Comprehensive examinations", "Dissertation defense", "Publications"], 
                duration: "4-6 years"
            }
        ]
    };
    
    const programList = programs[level] || [];
    accordionContainer.innerHTML = programList.map(program => `
        <div class="accordion-item">
            <button class="accordion-header">
                ${program.title}
                <i class="fas fa-chevron-down"></i>
            </button>
            <div class="accordion-content">
                <p>${program.desc}</p>
                ${program.courses ? `<h4>Core Courses:</h4><ul>${program.courses.map(course => `<li>${course}</li>`).join('')}</ul>` : ''}
                ${program.requirements ? `<h4>Requirements:</h4><ul>${program.requirements.map(req => `<li>${req}</li>`).join('')}</ul>` : ''}
                <div class="program-details">
                    <span><i class="fas fa-clock"></i> ${program.duration}</span>
                    ${program.units ? `<span><i class="fas fa-book"></i> ${program.units}</span>` : ''}
                </div>
            </div>
        </div>
    `).join('');
    
    // Initialize accordion functionality
    initAccordions(accordionContainer);
}

function initAccordions(container) {
    const headers = container.querySelectorAll('.accordion-header');
    headers.forEach(header => {
        header.addEventListener('click', function() {
            const content = this.nextElementSibling;
            const icon = this.querySelector('i');
            
            if (content.style.display === 'block') {
                content.style.display = 'none';
                icon.classList.remove('fa-chevron-up');
                icon.classList.add('fa-chevron-down');
            } else {
                content.style.display = 'block';
                icon.classList.remove('fa-chevron-down');
                icon.classList.add('fa-chevron-up');
            }
        });
    });
}

// ===== FACULTY PAGE =====
function initFacultyPage() {
    const facultyGrid = document.getElementById('facultyGrid');
    const searchInput = document.getElementById('facultySearch');
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    if (!facultyGrid) return;
    
    // Sample faculty data
    const facultyData = [
        { 
            id: 1, 
            name: "Dr. Sarah Johnson", 
            position: "Dean & Professor", 
            department: "Computer Science", 
            expertise: "Artificial Intelligence, Machine Learning", 
            email: "s.johnson@ccs.edu",
            category: "professor",
            office: "Tech Building Room 101",
            officeHours: "Mon-Wed 10:00 AM - 12:00 PM"
        },
        { 
            id: 2, 
            name: "Prof. Michael Chen", 
            position: "Department Chair", 
            department: "Computer Science", 
            expertise: "Data Science, Big Data Analytics", 
            email: "m.chen@ccs.edu",
            category: "professor",
            office: "Tech Building Room 102",
            officeHours: "Tue-Thu 1:00 PM - 3:00 PM"
        },
        { 
            id: 3, 
            name: "Dr. Emily Rodriguez", 
            position: "Associate Professor", 
            department: "Cybersecurity", 
            expertise: "Network Security, Cryptography", 
            email: "e.rodriguez@ccs.edu",
            category: "associate",
            office: "Tech Building Room 201",
            officeHours: "Mon-Fri 9:00 AM - 11:00 AM"
        },
        { 
            id: 4, 
            name: "Prof. David Kim", 
            position: "Assistant Professor", 
            department: "Software Engineering", 
            expertise: "DevOps, Cloud Computing", 
            email: "d.kim@ccs.edu",
            category: "assistant",
            office: "Tech Building Room 202",
            officeHours: "Wed-Fri 2:00 PM - 4:00 PM"
        },
        { 
            id: 5, 
            name: "Dr. Lisa Wong", 
            position: "Professor", 
            department: "Human-Computer Interaction", 
            expertise: "UX Design, Human-Computer Interaction", 
            email: "l.wong@ccs.edu",
            category: "professor",
            office: "Tech Building Room 103",
            officeHours: "Mon-Thu 11:00 AM - 1:00 PM"
        },
        { 
            id: 6, 
            name: "Prof. Robert Garcia", 
            position: "Lecturer", 
            department: "Information Technology", 
            expertise: "Web Development, Database Systems", 
            email: "r.garcia@ccs.edu",
            category: "assistant",
            office: "Tech Building Room 203",
            officeHours: "Tue-Thu 3:00 PM - 5:00 PM"
        }
    ];
    
    // Store data globally
    window.facultyData = facultyData;
    
    // Render faculty
    renderFaculty(facultyData);
    
    // Search functionality
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const filtered = facultyData.filter(faculty => 
                faculty.name.toLowerCase().includes(searchTerm) ||
                faculty.expertise.toLowerCase().includes(searchTerm) ||
                faculty.department.toLowerCase().includes(searchTerm)
            );
            renderFaculty(filtered);
        });
    }
    
    // Filter functionality
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            const filter = this.getAttribute('data-filter');
            const filtered = filter === 'all' 
                ? facultyData 
                : facultyData.filter(faculty => faculty.category === filter);
            
            renderFaculty(filtered);
        });
    });
}

function renderFaculty(facultyArray) {
    const facultyGrid = document.getElementById('facultyGrid');
    if (!facultyGrid) return;
    
    facultyGrid.innerHTML = facultyArray.map(faculty => `
        <div class="faculty-card" data-category="${faculty.category}">
            <img src="https://images.unsplash.com/photo-${150000 + faculty.id}?w=400&h=400&fit=crop&auto=format" 
                 alt="${faculty.name}"
                 onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect width=%22100%22 height=%22100%22 fill=%22%23ddd%22/><text x=%2250%22 y=%2250%22 font-size=%2212%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22%23666%22>${faculty.name.split(' ')[0]}</text></svg>'">
            <div class="faculty-card-content">
                <h3 class="faculty-name">${faculty.name}</h3>
                <p class="faculty-position">${faculty.position}</p>
                <p class="faculty-department">${faculty.department}</p>
                <p><i class="fas fa-graduation-cap"></i> ${faculty.expertise}</p>
                <p><i class="fas fa-envelope"></i> ${faculty.email}</p>
                <button class="btn btn-secondary" onclick="viewFacultyProfile(${faculty.id})">View Profile</button>
            </div>
        </div>
    `).join('');
}

function viewFacultyProfile(id) {
    const faculty = window.facultyData?.find(f => f.id === id);
    if (faculty) {
        const profileHTML = `
            <h3>${faculty.name}</h3>
            <p><strong>Position:</strong> ${faculty.position}</p>
            <p><strong>Department:</strong> ${faculty.department}</p>
            <p><strong>Expertise:</strong> ${faculty.expertise}</p>
            <p><strong>Email:</strong> ${faculty.email}</p>
            <p><strong>Office:</strong> ${faculty.office}</p>
            <p><strong>Office Hours:</strong> ${faculty.officeHours}</p>
            <p><strong>Education:</strong> PhD in Computer Science</p>
            <p><strong>Research Interests:</strong> ${faculty.expertise}</p>
            <p><strong>Publications:</strong> 20+ peer-reviewed papers</p>
        `;
        
        // Create modal for profile view
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.7);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
            padding: 20px;
        `;
        
        const modalContent = document.createElement('div');
        modalContent.style.cssText = `
            background: white;
            padding: 2rem;
            border-radius: 8px;
            max-width: 600px;
            width: 100%;
            max-height: 80vh;
            overflow-y: auto;
            position: relative;
        `;
        
        if (document.body.classList.contains('dark-mode')) {
            modalContent.style.background = '#1a1a1a';
            modalContent.style.color = '#e0e0e0';
        }
        
        modalContent.innerHTML = `
            <button onclick="this.parentElement.parentElement.remove()" style="position: absolute; top: 10px; right: 10px; background: none; border: none; font-size: 1.5rem; cursor: pointer;">&times;</button>
            ${profileHTML}
        `;
        
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
        
        // Close modal when clicking outside
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.remove();
            }
        });
    }
}

// ===== ANNOUNCEMENTS PAGE =====
function initAnnouncementsPage() {
    const container = document.getElementById('announcementsContainer');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const loadMoreBtn = document.getElementById('loadMore');
    
    if (!container) return;
    
    // Sample announcements
    const announcements = [
        { 
            id: 1, 
            title: "Registration for Spring Semester 2024", 
            content: "Online registration for Spring Semester 2024 begins on December 1, 2023. Please check your student portal for your registration schedule and make sure to meet with your academic advisor before registration.", 
            date: "2023-11-25", 
            type: "deadline",
            priority: "high"
        },
        { 
            id: 2, 
            title: "Guest Lecture: Future of AI in Education", 
            content: "Join us for a special guest lecture by Dr. Alan Turing from MIT on the future of artificial intelligence in education. The lecture will cover recent advancements in AI and their implications for teaching and learning.", 
            date: "2023-12-05", 
            type: "event",
            priority: "medium"
        },
        { 
            id: 3, 
            title: "Scholarship Application Deadline", 
            content: "Last day to submit scholarship applications for the academic year 2024-2025 is November 30, 2023. Applications received after this date will not be considered.", 
            date: "2023-11-30", 
            type: "deadline",
            priority: "high"
        },
        { 
            id: 4, 
            title: "New Computer Lab Opening", 
            content: "The new AI research lab equipped with high-performance computing resources will open on December 10, 2023. All students and faculty are invited to the opening ceremony at 10:00 AM.", 
            date: "2023-12-01", 
            type: "news",
            priority: "medium"
        },
        { 
            id: 5, 
            title: "Final Exam Schedule Released", 
            content: "Final exam schedule for Fall 2023 has been posted on the college website and student portal. Please check your exam dates and venues carefully.", 
            date: "2023-11-28", 
            type: "deadline",
            priority: "high"
        },
        { 
            id: 6, 
            title: "Research Grant Opportunities", 
            content: "Applications are now open for undergraduate research grants. Deadline for submission is December 15, 2023. Grants range from $1,000 to $5,000 for research projects.", 
            date: "2023-12-01", 
            type: "news",
            priority: "medium"
        },
        { 
            id: 7, 
            title: "Career Fair 2024", 
            content: "Annual Career Fair will be held on January 20, 2024. Over 50 tech companies will be participating. Register through the Career Services portal.", 
            date: "2024-01-05", 
            type: "event",
            priority: "medium"
        },
        { 
            id: 8, 
            title: "Thesis Defense Schedule", 
            content: "Thesis defense presentations for graduate students will be held from December 10-15, 2023. All students are welcome to attend.", 
            date: "2023-12-01", 
            type: "event",
            priority: "low"
        }
    ];
    
    window.announcementsData = announcements;
    window.announcementsVisible = 3;
    
    // Render announcements
    renderAnnouncements(announcements.slice(0, window.announcementsVisible));
    
    // Filter functionality
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            const type = this.getAttribute('data-type');
            const filtered = type === 'all' 
                ? announcements 
                : announcements.filter(ann => ann.type === type);
            
            window.announcementsVisible = 3;
            renderAnnouncements(filtered.slice(0, window.announcementsVisible));
            
            // Show/hide load more button
            if (loadMoreBtn) {
                loadMoreBtn.style.display = filtered.length > window.announcementsVisible ? 'block' : 'none';
            }
        });
    });
    
    // Load more functionality
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', function() {
            const currentFilter = document.querySelector('.filter-btn.active');
            const type = currentFilter ? currentFilter.getAttribute('data-type') : 'all';
            const filtered = type === 'all' 
                ? announcements 
                : announcements.filter(ann => ann.type === type);
            
            window.announcementsVisible += 3;
            renderAnnouncements(filtered.slice(0, window.announcementsVisible));
            
            if (window.announcementsVisible >= filtered.length) {
                this.style.display = 'none';
            }
        });
    }
}

function renderAnnouncements(announcements) {
    const container = document.getElementById('announcementsContainer');
    if (!container) return;
    
    container.innerHTML = announcements.map(ann => {
        const date = new Date(ann.date);
        const formattedDate = date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        return `
            <div class="announcement-card">
                <div class="announcement-header">
                    <span class="announcement-type">${ann.type.toUpperCase()}</span>
                    <span class="announcement-date">${formattedDate}</span>
                </div>
                <h3 class="announcement-title">${ann.title}</h3>
                <p class="announcement-content">${ann.content}</p>
                <button class="read-more" onclick="viewAnnouncementDetail(${ann.id})">
                    Read More <i class="fas fa-arrow-right"></i>
                </button>
            </div>
        `;
    }).join('');
}

function viewAnnouncementDetail(id) {
    const announcement = window.announcementsData?.find(a => a.id === id);
    if (announcement) {
        const date = new Date(announcement.date);
        const formattedDate = date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        // Create modal for announcement detail
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.7);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
            padding: 20px;
        `;
        
        const modalContent = document.createElement('div');
        modalContent.style.cssText = `
            background: white;
            padding: 2rem;
            border-radius: 8px;
            max-width: 600px;
            width: 100%;
            max-height: 80vh;
            overflow-y: auto;
            position: relative;
        `;
        
        if (document.body.classList.contains('dark-mode')) {
            modalContent.style.background = '#1a1a1a';
            modalContent.style.color = '#e0e0e0';
        }
        
        modalContent.innerHTML = `
            <button onclick="this.parentElement.parentElement.remove()" style="position: absolute; top: 10px; right: 10px; background: none; border: none; font-size: 1.5rem; cursor: pointer;">&times;</button>
            <h2>${announcement.title}</h2>
            <p><strong>Date:</strong> ${formattedDate}</p>
            <p><strong>Type:</strong> ${announcement.type.charAt(0).toUpperCase() + announcement.type.slice(1)}</p>
            <p><strong>Priority:</strong> ${announcement.priority.charAt(0).toUpperCase() + announcement.priority.slice(1)}</p>
            <hr style="margin: 1rem 0;">
            <p>${announcement.content}</p>
            <p style="margin-top: 1rem;"><strong>For more information:</strong> Please contact the College Administration Office at admin@ccs.edu or visit Room 100 in the Administration Building.</p>
        `;
        
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
        
        // Close modal when clicking outside
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.remove();
            }
        });
    }
}

// ===== CONTACT PAGE =====
function initContactPage() {
    const form = document.getElementById('inquiryForm');
    if (!form) return;
    
    // Real-time validation
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const messageInput = document.getElementById('message');
    
    if (nameInput) nameInput.addEventListener('blur', validateName);
    if (emailInput) emailInput.addEventListener('blur', validateEmail);
    if (messageInput) messageInput.addEventListener('blur', validateMessage);
    
    // Form submission
    form.addEventListener('submit', handleFormSubmit);
}

function validateName() {
    const nameInput = document.getElementById('name');
    const errorElement = document.getElementById('nameError');
    const name = nameInput.value.trim();
    
    if (name.length < 2) {
        showError(nameInput, errorElement, "Name must be at least 2 characters");
        return false;
    } else {
        clearError(nameInput, errorElement);
        return true;
    }
}

function validateEmail() {
    const emailInput = document.getElementById('email');
    const errorElement = document.getElementById('emailError');
    const email = emailInput.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailRegex.test(email)) {
        showError(emailInput, errorElement, "Please enter a valid email address");
        return false;
    } else {
        clearError(emailInput, errorElement);
        return true;
    }
}

function validateMessage() {
    const messageInput = document.getElementById('message');
    const errorElement = document.getElementById('messageError');
    const message = messageInput.value.trim();
    
    if (message.length < 10) {
        showError(messageInput, errorElement, "Message must be at least 10 characters");
        return false;
    } else {
        clearError(messageInput, errorElement);
        return true;
    }
}

function showError(input, errorElement, message) {
    if (input) input.classList.add('error');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
}

function clearError(input, errorElement) {
    if (input) input.classList.remove('error');
    if (errorElement) {
        errorElement.textContent = '';
        errorElement.style.display = 'none';
    }
}

function handleFormSubmit(event) {
    event.preventDefault();
    
    // Validate all fields
    const isNameValid = validateName();
    const isEmailValid = validateEmail();
    const isMessageValid = validateMessage();
    
    if (isNameValid && isEmailValid && isMessageValid) {
        // Get form data
        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            subject: document.getElementById('subject').value,
            message: document.getElementById('message').value,
            inquiryType: document.getElementById('inquiryType').value,
            timestamp: new Date().toISOString()
        };
        
        // Save to localStorage
        let submissions = JSON.parse(localStorage.getItem('contactSubmissions') || '[]');
        submissions.push(formData);
        localStorage.setItem('contactSubmissions', JSON.stringify(submissions));
        
        // Show success message
        const formMessage = document.getElementById('formMessage');
        if (formMessage) {
            formMessage.innerHTML = `
                <div class="success-message">
                    <i class="fas fa-check-circle"></i>
                    <p>Thank you! Your message has been sent. We'll respond within 24 hours.</p>
                </div>
            `;
        }
        
        // Reset form
        event.target.reset();
        
        // Show toast
        showToast('Message sent successfully!', 'success');
        
        // Scroll to success message
        if (formMessage) {
            formMessage.scrollIntoView({ behavior: 'smooth' });
        }
    } else {
        showToast('Please fix errors in the form', 'error');
    }
}

// ===== TOAST NOTIFICATIONS =====
function showToast(message, type = 'info') {
    // Create toast
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
        color: white;
        padding: 12px 24px;
        border-radius: 4px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        z-index: 9999;
        animation: slideIn 0.3s ease;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    // Remove after 3 seconds
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
    
    // Add animation styles
    if (!document.querySelector('#toast-animations')) {
        const style = document.createElement('style');
        style.id = 'toast-animations';
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
}

// ===== GLOBAL FUNCTIONS =====
window.viewFacultyProfile = viewFacultyProfile;
window.viewAnnouncementDetail = viewAnnouncementDetail;
window.showToast = showToast;