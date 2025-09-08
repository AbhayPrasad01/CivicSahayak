// Admin Dashboard JavaScript

// State Management
let adminState = {
    reports: [],
    departments: [
        { id: 1, name: 'Roads & Infrastructure', efficiency: 87 },
        { id: 2, name: 'Sanitation', efficiency: 92 },
        { id: 3, name: 'Street Lighting', efficiency: 78 },
        { id: 4, name: 'Water Supply', efficiency: 85 }
    ],
    filters: {
        category: '',
        status: '',
        priority: '',
        date: ''
    }
};

// Initialize Admin Dashboard
function initAdmin() {
    loadReports();
    initAdminMap();
    setupFilters();
    initCharts();
    updateDepartmentGrid();
    updateStats();
}

// Load Reports
function loadReports() {
    // In a real app, this would be an API call
    const reports = JSON.parse(localStorage.getItem('reports') || '[]');
    adminState.reports = reports.map(report => ({
        ...report,
        priority: assignPriority(report),
        department: assignDepartment(report)
    }));
    updateReportsTable();
}

// Initialize Admin Map
function initAdminMap() {
    const map = L.map('adminMap').setView([20.5937, 78.9629], 5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Add report markers
    adminState.reports.forEach(report => {
        if (report.location) {
            const marker = L.marker([report.location.lat, report.location.lng])
                .addTo(map)
                .bindPopup(`
                    <strong>${report.category}</strong><br>
                    ${report.description}<br>
                    <em>Status: ${report.status}</em>
                `);
        }
    });
}

// Setup Filter Listeners
function setupFilters() {
    const filters = ['category', 'status', 'priority', 'date'];
    filters.forEach(filter => {
        const element = document.getElementById(`${filter}Filter`);
        if (element) {
            element.addEventListener('change', (e) => {
                adminState.filters[filter] = e.target.value;
                updateReportsTable();
            });
        }
    });
}

// Update Reports Table
function updateReportsTable() {
    const tbody = document.getElementById('reportsTableBody');
    const filteredReports = filterReports(adminState.reports);
    
    tbody.innerHTML = filteredReports.map(report => `
        <tr>
            <td>#${report.id}</td>
            <td>${report.category}</td>
            <td>${report.description.substring(0, 50)}...</td>
            <td>${formatLocation(report.location)}</td>
            <td><span class="status-badge status-${report.status.toLowerCase()}">${report.status}</span></td>
            <td class="priority-${report.priority.toLowerCase()}">${report.priority}</td>
            <td>
                <button onclick="updateReportStatus(${report.id})" class="btn btn-small">
                    Update Status
                </button>
            </td>
        </tr>
    `).join('');
}

// Filter Reports
function filterReports(reports) {
    return reports.filter(report => {
        const { category, status, priority, date } = adminState.filters;
        
        return (!category || report.category === category) &&
               (!status || report.status.toLowerCase() === status) &&
               (!priority || report.priority.toLowerCase() === priority) &&
               (!date || isReportFromDate(report, date));
    });
}

// Initialize Charts
function initCharts() {
    // Category Distribution Chart
    const categoryCtx = document.getElementById('categoryChart').getContext('2d');
    new Chart(categoryCtx, {
        type: 'pie',
        data: getCategoryChartData(),
        options: {
            responsive: true,
            title: {
                display: true,
                text: 'Issues by Category'
            }
        }
    });

    // Status Distribution Chart
    const statusCtx = document.getElementById('statusChart').getContext('2d');
    new Chart(statusCtx, {
        type: 'doughnut',
        data: getStatusChartData(),
        options: {
            responsive: true,
            title: {
                display: true,
                text: 'Resolution Status'
            }
        }
    });
}

// Get Category Chart Data
function getCategoryChartData() {
    const categories = {};
    adminState.reports.forEach(report => {
        categories[report.category] = (categories[report.category] || 0) + 1;
    });

    return {
        labels: Object.keys(categories),
        datasets: [{
            data: Object.values(categories),
            backgroundColor: [
                '#FF6384',
                '#36A2EB',
                '#FFCE56',
                '#4BC0C0',
                '#9966FF'
            ]
        }]
    };
}

// Get Status Chart Data
function getStatusChartData() {
    const statuses = {
        pending: 0,
        inprogress: 0,
        resolved: 0
    };

    adminState.reports.forEach(report => {
        statuses[report.status.toLowerCase()]++;
    });

    return {
        labels: ['Pending', 'In Progress', 'Resolved'],
        datasets: [{
            data: Object.values(statuses),
            backgroundColor: [
                '#ffc107',
                '#17a2b8',
                '#28a745'
            ]
        }]
    };
}

// Update Department Performance Grid
function updateDepartmentGrid() {
    const grid = document.getElementById('departmentGrid');
    
    grid.innerHTML = adminState.departments.map(dept => `
        <div class="department-card">
            <h3>${dept.name}</h3>
            <div class="performance-stats">
                <div class="stat-row">
                    <span>Efficiency</span>
                    <span>${dept.efficiency}%</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-bar-fill" style="width: ${dept.efficiency}%"></div>
                </div>
            </div>
        </div>
    `).join('');
}

// Update Dashboard Stats
function updateStats() {
    document.getElementById('totalReports').textContent = adminState.reports.length;
    document.getElementById('pendingReports').textContent = 
        adminState.reports.filter(r => r.status.toLowerCase() === 'pending').length;
    document.getElementById('inProgressReports').textContent = 
        adminState.reports.filter(r => r.status.toLowerCase() === 'inprogress').length;
    document.getElementById('resolvedReports').textContent = 
        adminState.reports.filter(r => r.status.toLowerCase() === 'resolved').length;
}

// Utility Functions
function assignPriority(report) {
    // In a real app, this would use more sophisticated logic
    const priorities = ['High', 'Medium', 'Low'];
    return priorities[Math.floor(Math.random() * priorities.length)];
}

function assignDepartment(report) {
    // Simple mapping based on category
    const deptMapping = {
        'roads': 'Roads & Infrastructure',
        'streetlights': 'Street Lighting',
        'garbage': 'Sanitation',
        'water': 'Water Supply'
    };
    return deptMapping[report.category.toLowerCase()] || 'General';
}

function formatLocation(location) {
    return location ? 
        `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : 
        'No location';
}

function isReportFromDate(report, date) {
    const reportDate = new Date(report.timestamp).toISOString().split('T')[0];
    return reportDate === date;
}

// Update Report Status
function updateReportStatus(reportId) {
    const report = adminState.reports.find(r => r.id === reportId);
    if (!report) return;

    const statuses = ['pending', 'inprogress', 'resolved'];
    const currentIndex = statuses.indexOf(report.status.toLowerCase());
    const nextStatus = statuses[(currentIndex + 1) % statuses.length];
    
    report.status = nextStatus.charAt(0).toUpperCase() + nextStatus.slice(1);
    
    // Update localStorage
    const allReports = JSON.parse(localStorage.getItem('reports') || '[]');
    const reportIndex = allReports.findIndex(r => r.id === reportId);
    if (reportIndex !== -1) {
        allReports[reportIndex].status = report.status;
        localStorage.setItem('reports', JSON.stringify(allReports));
    }

    // Update UI
    updateReportsTable();
    updateStats();
    initCharts(); // Refresh charts
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initAdmin);
