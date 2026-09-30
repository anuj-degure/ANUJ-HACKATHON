const API_BASE = window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost' ? "http://127.0.0.1:8000/api" : "/api";

// --- STATE ---
let currentState = {
    view: 'dashboard',
    stats: {},
    appointments: [],
    patients: [],
    ambulanceRequests: [],
    bloodRequests: [],
    facilities: [],
    activity: []
};

// --- INIT ---
document.addEventListener('DOMContentLoaded', () => {
    // Handle Login
    document.getElementById('login-form').addEventListener('submit', (e) => {
        e.preventDefault();
        login();
    });
});

function login() {
    document.getElementById('view-login').classList.remove('active');
    document.getElementById('view-app').classList.remove('hidden');
    document.getElementById('view-app').classList.add('active');
    
    showToast("Welcome to CareBridge Command Center", "success");
    navigate('dashboard');
}

function logout() {
    document.getElementById('view-app').classList.remove('active');
    document.getElementById('view-app').classList.add('hidden');
    document.getElementById('view-login').classList.add('active');
    showToast("Logged out successfully", "success");
}

// --- ROUTING ---
const pageTitles = {
    'dashboard': 'Command Center',
    'appointments': 'Appointments',
    'patients': 'Patients Directory',
    'ambulance': 'Ambulance Coordination',
    'blood': 'Blood Connect',
    'facilities': 'Healthcare Nearby'
};

async function navigate(view) {
    currentState.view = view;
    
    // Update active nav
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    const navItem = document.getElementById(`nav-${view}`);
    if (navItem) navItem.classList.add('active');
    
    // Update Title
    document.getElementById('page-title').innerText = pageTitles[view] || 'CareBridge';
    
    // Render loading state
    const contentArea = document.getElementById('content-area');
    contentArea.innerHTML = `<div class="w-full h-full flex items-center justify-center"><i data-lucide="loader-2" class="w-8 h-8 animate-spin text-primary-500"></i></div>`;
    lucide.createIcons();
    
    // Fetch Data & Render View
    await loadViewData(view);
    renderView(view);
}

async function loadViewData(view) {
    try {
        if (view === 'dashboard') {
            const [statsRes, activityRes, appRes, ambRes, bloodRes] = await Promise.all([
                fetch(`${API_BASE}/dashboard/stats`),
                fetch(`${API_BASE}/activity`),
                fetch(`${API_BASE}/appointments?limit=5`),
                fetch(`${API_BASE}/ambulance-requests`),
                fetch(`${API_BASE}/blood-requests`)
            ]);
            currentState.stats = await statsRes.json();
            currentState.activity = await activityRes.json();
            currentState.appointments = await appRes.json();
            currentState.ambulanceRequests = await ambRes.json();
            currentState.bloodRequests = await bloodRes.json();
        } else if (view === 'patients') {
            const res = await fetch(`${API_BASE}/patients`);
            currentState.patients = await res.json();
        } else if (view === 'appointments') {
            const res = await fetch(`${API_BASE}/appointments`);
            currentState.appointments = await res.json();
        } else if (view === 'ambulance') {
            const res = await fetch(`${API_BASE}/ambulance-requests`);
            currentState.ambulanceRequests = await res.json();
        } else if (view === 'blood') {
            const res = await fetch(`${API_BASE}/blood-requests`);
            currentState.bloodRequests = await res.json();
        } else if (view === 'facilities') {
            const res = await fetch(`${API_BASE}/facilities`);
            currentState.facilities = await res.json();
        }
        updateBadges();
    } catch (e) {
        console.error("API Error:", e);
        showToast("Error loading data from server", "danger");
    }
}

function updateBadges() {
    const ambCount = currentState.ambulanceRequests.filter(r => ['Requested', 'Assigned', 'En Route'].includes(r.status)).length;
    const bloodCount = currentState.bloodRequests.filter(r => ['Open', 'Partially Fulfilled'].includes(r.status)).length;
    
    document.getElementById('badge-ambulance').innerText = ambCount;
    document.getElementById('badge-blood').innerText = bloodCount;
}

// --- RENDERERS ---
function renderView(view) {
    const contentArea = document.getElementById('content-area');
    
    if (view === 'dashboard') {
        contentArea.innerHTML = renderDashboard();
    } else if (view === 'patients') {
        contentArea.innerHTML = renderPatients();
    } else if (view === 'appointments') {
        contentArea.innerHTML = renderAppointments();
    } else if (view === 'ambulance') {
        contentArea.innerHTML = renderAmbulance();
    } else if (view === 'blood') {
        contentArea.innerHTML = renderBlood();
    } else if (view === 'facilities') {
        contentArea.innerHTML = renderFacilities();
    }
    
    lucide.createIcons();
}

// --- VIEW: DASHBOARD ---
function renderDashboard() {
    const { stats, activity, appointments } = currentState;
    
    return `
    <div class="animate-slide-up space-y-6">
        <!-- STATS ROW -->
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow">
                <div class="p-3 bg-primary-100 text-primary-600 rounded-lg">
                    <i data-lucide="calendar-check" class="w-6 h-6"></i>
                </div>
                <div>
                    <p class="text-sm font-medium text-slate-500">Today's Appointments</p>
                    <p class="text-2xl font-bold text-slate-900">${stats.todays_appointments || 0}</p>
                </div>
            </div>
            <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow">
                <div class="p-3 bg-warning/20 text-warning rounded-lg">
                    <i data-lucide="alert-circle" class="w-6 h-6"></i>
                </div>
                <div>
                    <p class="text-sm font-medium text-slate-500">Pending Requests</p>
                    <p class="text-2xl font-bold text-slate-900">${stats.pending_requests || 0}</p>
                </div>
            </div>
            <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow">
                <div class="p-3 bg-accent-500/20 text-accent-600 rounded-lg">
                    <i data-lucide="truck" class="w-6 h-6"></i>
                </div>
                <div>
                    <p class="text-sm font-medium text-slate-500">Active Ambulances</p>
                    <p class="text-2xl font-bold text-slate-900">${stats.active_ambulances || 0}</p>
                </div>
            </div>
            <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow">
                <div class="p-3 bg-danger/20 text-danger rounded-lg">
                    <i data-lucide="droplet" class="w-6 h-6"></i>
                </div>
                <div>
                    <p class="text-sm font-medium text-slate-500">Open Blood Req.</p>
                    <p class="text-2xl font-bold text-slate-900">${stats.open_blood_requests || 0}</p>
                </div>
            </div>
        </div>

        <!-- MAIN GRIDS -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- LEFT COLUMN (WIDER) -->
            <div class="lg:col-span-2 space-y-6">
                <!-- Appointments -->
                <div class="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                    <div class="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <h3 class="font-semibold text-slate-800">Upcoming Appointments</h3>
                        <button onclick="navigate('appointments')" class="text-sm text-primary-600 font-medium hover:text-primary-700">View All</button>
                    </div>
                    <div class="divide-y divide-slate-100">
                        ${appointments.length === 0 ? '<div class="p-6 text-center text-slate-500">No appointments today</div>' : ''}
                        ${appointments.map(app => `
                            <div class="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                <div class="flex items-center gap-4">
                                    <div class="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center text-primary-600 font-bold text-sm">
                                        P${app.patient_id}
                                    </div>
                                    <div>
                                        <p class="font-medium text-slate-800 text-sm">${app.department}</p>
                                        <p class="text-xs text-slate-500">${app.time}</p>
                                    </div>
                                </div>
                                ${getStatusBadge(app.status)}
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <!-- Quick Actions -->
                <div class="bg-primary-900 rounded-xl shadow-lg p-6 text-white relative overflow-hidden">
                    <div class="absolute top-0 right-0 p-8 opacity-10">
                        <i data-lucide="shield-plus" class="w-32 h-32"></i>
                    </div>
                    <h3 class="font-semibold text-lg mb-4 relative z-10">Emergency Quick Actions</h3>
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
                        <button onclick="openPatientModal()" class="bg-white/10 hover:bg-white/20 p-4 rounded-lg flex flex-col items-center gap-2 transition-colors border border-white/10">
                            <i data-lucide="user-plus" class="text-accent-500"></i>
                            <span class="text-sm font-medium">New Patient</span>
                        </button>
                        <button onclick="openAmbulanceModal()" class="bg-white/10 hover:bg-white/20 p-4 rounded-lg flex flex-col items-center gap-2 transition-colors border border-white/10">
                            <i data-lucide="truck" class="text-warning"></i>
                            <span class="text-sm font-medium">Req. Ambulance</span>
                        </button>
                        <button onclick="openBloodModal()" class="bg-white/10 hover:bg-white/20 p-4 rounded-lg flex flex-col items-center gap-2 transition-colors border border-white/10">
                            <i data-lucide="droplet" class="text-danger"></i>
                            <span class="text-sm font-medium">Blood Request</span>
                        </button>
                        <button onclick="openAppointmentModal()" class="bg-white/10 hover:bg-white/20 p-4 rounded-lg flex flex-col items-center gap-2 transition-colors border border-white/10">
                            <i data-lucide="calendar-plus" class="text-primary-400"></i>
                            <span class="text-sm font-medium">Book Appt.</span>
                        </button>
                    </div>
                </div>
            </div>

            <!-- RIGHT COLUMN -->
            <div class="space-y-6">
                <!-- Live Timeline -->
                <div class="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden h-full">
                    <div class="p-5 border-b border-slate-100 flex items-center gap-2 bg-slate-50/50">
                        <div class="w-2 h-2 bg-danger rounded-full animate-pulse"></div>
                        <h3 class="font-semibold text-slate-800">Live Coordination</h3>
                    </div>
                    <div class="p-5 space-y-6">
                        ${activity.length === 0 ? '<p class="text-sm text-slate-500 text-center">No recent activity</p>' : ''}
                        ${activity.slice(0, 5).map(act => `
                            <div class="relative pl-6 border-l-2 border-slate-100 pb-1 last:pb-0 last:border-transparent">
                                <div class="absolute w-3 h-3 rounded-full bg-primary-500 -left-[7px] top-1 border-2 border-white"></div>
                                <p class="text-sm text-slate-800 font-medium">${act.text}</p>
                                <p class="text-xs text-slate-400 mt-1">${new Date(act.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} • ${act.type}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        </div>
    </div>
    `;
}

// --- VIEW: PATIENTS ---
function renderPatients() {
    return `
    <div class="animate-slide-up bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div class="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 class="font-semibold text-slate-800">Patient Directory</h3>
            <button onclick="openPatientModal()" class="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                <i data-lucide="plus" class="w-4 h-4"></i> Add Patient
            </button>
        </div>
        <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
                <thead>
                    <tr class="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                        <th class="p-4 font-semibold">ID</th>
                        <th class="p-4 font-semibold">Name</th>
                        <th class="p-4 font-semibold">Contact</th>
                        <th class="p-4 font-semibold">Blood</th>
                        <th class="p-4 font-semibold">City</th>
                        <th class="p-4 font-semibold">Action</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 text-sm text-slate-700">
                    ${currentState.patients.map(p => `
                        <tr class="hover:bg-slate-50">
                            <td class="p-4 font-medium">PT-${p.id.toString().padStart(4, '0')}</td>
                            <td class="p-4">
                                <div class="font-medium text-slate-900">${p.full_name}</div>
                                <div class="text-xs text-slate-500">${p.age} yrs • ${p.gender}</div>
                            </td>
                            <td class="p-4">${p.phone}</td>
                            <td class="p-4"><span class="bg-danger/10 text-danger font-bold px-2 py-1 rounded text-xs">${p.blood_group}</span></td>
                            <td class="p-4">${p.city}</td>
                            <td class="p-4">
                                <button class="text-primary-600 hover:bg-primary-50 p-1.5 rounded"><i data-lucide="eye" class="w-4 h-4"></i></button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    </div>
    `;
}

// --- VIEW: APPOINTMENTS ---
function renderAppointments() {
    return `
    <div class="animate-slide-up bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div class="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 class="font-semibold text-slate-800">All Appointments</h3>
            <button onclick="openAppointmentModal()" class="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                <i data-lucide="calendar-plus" class="w-4 h-4"></i> Book Appt
            </button>
        </div>
        <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
                <thead>
                    <tr class="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                        <th class="p-4 font-semibold">Date & Time</th>
                        <th class="p-4 font-semibold">Patient ID</th>
                        <th class="p-4 font-semibold">Department</th>
                        <th class="p-4 font-semibold">Status</th>
                        <th class="p-4 font-semibold">Action</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 text-sm text-slate-700">
                    ${currentState.appointments.map(a => `
                        <tr class="hover:bg-slate-50">
                            <td class="p-4">
                                <div class="font-medium text-slate-900">${a.date}</div>
                                <div class="text-xs text-slate-500">${a.time}</div>
                            </td>
                            <td class="p-4 font-medium">PT-${a.patient_id.toString().padStart(4, '0')}</td>
                            <td class="p-4">${a.department}</td>
                            <td class="p-4">${getStatusBadge(a.status)}</td>
                            <td class="p-4">
                                <select onchange="updateAppointmentStatus(${a.id}, this.value)" class="text-xs border-slate-200 rounded p-1">
                                    <option value="" disabled selected>Update...</option>
                                    <option value="Confirmed">Confirm</option>
                                    <option value="Completed">Complete</option>
                                    <option value="Cancelled">Cancel</option>
                                </select>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    </div>
    `;
}

// --- VIEW: AMBULANCE ---
function renderAmbulance() {
    return `
    <div class="animate-slide-up space-y-6">
        <div class="flex justify-between items-center">
            <h2 class="text-lg font-semibold text-slate-800">Active Requests</h2>
            <button onclick="openAmbulanceModal()" class="bg-warning hover:bg-warning/90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-sm">
                <i data-lucide="plus" class="w-4 h-4"></i> Request Ambulance
            </button>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            ${currentState.ambulanceRequests.map(r => `
                <div class="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden relative">
                    <div class="absolute top-0 left-0 w-1 h-full ${r.emergency_priority === 'Critical' ? 'bg-danger' : r.emergency_priority === 'High' ? 'bg-warning' : 'bg-success'}"></div>
                    <div class="p-5">
                        <div class="flex justify-between items-start mb-4">
                            ${getStatusBadge(r.status)}
                            <span class="text-xs font-bold ${r.emergency_priority === 'Critical' ? 'text-danger' : 'text-slate-500'} uppercase">${r.emergency_priority} Priority</span>
                        </div>
                        <h4 class="font-semibold text-slate-800 mb-1">REQ-${r.id.toString().padStart(4, '0')}</h4>
                        <div class="space-y-2 mt-4 text-sm text-slate-600">
                            <div class="flex gap-2 items-start"><i data-lucide="map-pin" class="w-4 h-4 text-slate-400 mt-0.5 shrink-0"></i> <span><strong>From:</strong> ${r.pickup_location}</span></div>
                            <div class="flex gap-2 items-start"><i data-lucide="navigation" class="w-4 h-4 text-slate-400 mt-0.5 shrink-0"></i> <span><strong>To:</strong> ${r.destination_facility}</span></div>
                            <div class="flex gap-2 items-start"><i data-lucide="phone" class="w-4 h-4 text-slate-400 mt-0.5 shrink-0"></i> <span>${r.contact_number}</span></div>
                        </div>
                    </div>
                    <div class="bg-slate-50 p-3 border-t border-slate-100 flex justify-between items-center">
                        <span class="text-xs text-slate-500">${r.assigned_ambulance ? `Assigned: ${r.assigned_ambulance}` : 'Unassigned'}</span>
                        <select onchange="updateAmbulanceStatus(${r.id}, this.value)" class="text-xs border-slate-200 rounded p-1 bg-white">
                            <option value="" disabled selected>Update...</option>
                            <option value="Assigned">Assign</option>
                            <option value="En Route">En Route</option>
                            <option value="Completed">Complete</option>
                        </select>
                    </div>
                </div>
            `).join('')}
        </div>
    </div>
    `;
}

// --- VIEW: BLOOD ---
function renderBlood() {
    const fGroup = currentState.bloodFilters?.group || '';
    const fStatus = currentState.bloodFilters?.status || '';
    const fUrgency = currentState.bloodFilters?.urgency || '';

    let filtered = currentState.bloodRequests.filter(r => {
        if (fGroup && r.blood_group !== fGroup) return false;
        if (fStatus && r.status !== fStatus) return false;
        if (fUrgency && r.urgency !== fUrgency) return false;
        return true;
    });

    return `
    <div class="animate-slide-up space-y-6">
        <div class="flex justify-between items-center flex-wrap gap-4">
            <h2 class="text-lg font-semibold text-slate-800">Blood Requirements</h2>
            
            <div class="flex gap-2">
                <select onchange="currentState.bloodFilters = {...(currentState.bloodFilters||{}), group: this.value}; renderView('blood');" class="text-sm border-slate-200 rounded-lg p-2 bg-white">
                    <option value="">All Groups</option>
                    <option value="A+" ${fGroup === 'A+' ? 'selected':''}>A+</option>
                    <option value="A-" ${fGroup === 'A-' ? 'selected':''}>A-</option>
                    <option value="B+" ${fGroup === 'B+' ? 'selected':''}>B+</option>
                    <option value="B-" ${fGroup === 'B-' ? 'selected':''}>B-</option>
                    <option value="O+" ${fGroup === 'O+' ? 'selected':''}>O+</option>
                    <option value="O-" ${fGroup === 'O-' ? 'selected':''}>O-</option>
                    <option value="AB+" ${fGroup === 'AB+' ? 'selected':''}>AB+</option>
                    <option value="AB-" ${fGroup === 'AB-' ? 'selected':''}>AB-</option>
                </select>
                <select onchange="currentState.bloodFilters = {...(currentState.bloodFilters||{}), status: this.value}; renderView('blood');" class="text-sm border-slate-200 rounded-lg p-2 bg-white">
                    <option value="">All Statuses</option>
                    <option value="Open" ${fStatus === 'Open' ? 'selected':''}>Open</option>
                    <option value="Partially Fulfilled" ${fStatus === 'Partially Fulfilled' ? 'selected':''}>Partially Fulfilled</option>
                    <option value="Fulfilled" ${fStatus === 'Fulfilled' ? 'selected':''}>Fulfilled</option>
                    <option value="Cancelled" ${fStatus === 'Cancelled' ? 'selected':''}>Cancelled</option>
                </select>
                <select onchange="currentState.bloodFilters = {...(currentState.bloodFilters||{}), urgency: this.value}; renderView('blood');" class="text-sm border-slate-200 rounded-lg p-2 bg-white">
                    <option value="">All Urgencies</option>
                    <option value="Normal" ${fUrgency === 'Normal' ? 'selected':''}>Normal</option>
                    <option value="High" ${fUrgency === 'High' ? 'selected':''}>High</option>
                </select>
                <button onclick="openBloodModal()" class="bg-danger hover:bg-danger/90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-sm">
                    <i data-lucide="plus" class="w-4 h-4"></i> Post Requirement
                </button>
            </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            ${filtered.length === 0 ? '<div class="col-span-full p-8 text-center text-slate-500">No blood requirements match your filters.</div>' : ''}
            ${filtered.map(r => `
                <div class="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden relative">
                    ${r.urgency === 'High' ? '<div class="absolute top-0 right-0 m-2 w-2 h-2 rounded-full bg-danger animate-pulse" title="High Urgency"></div>' : ''}
                    <div class="p-5 flex gap-4">
                        <div class="w-16 h-16 rounded-xl bg-danger/10 flex items-center justify-center border border-danger/20 shrink-0">
                            <span class="text-2xl font-bold text-danger">${r.blood_group}</span>
                        </div>
                        <div class="flex-1">
                            <div class="flex justify-between items-start">
                                <div>
                                    <h4 class="font-semibold text-slate-800">${r.units_required} Units Req</h4>
                                    <p class="text-xs text-primary-600 font-medium">${r.units_fulfilled || 0} Units Fill</p>
                                </div>
                                ${getStatusBadge(r.status)}
                            </div>
                            <p class="text-sm text-slate-500 mt-1">${r.location}</p>
                            <div class="mt-3 text-xs text-slate-600 bg-slate-50 p-2 rounded">
                                <p class="font-medium">${r.contact_person}</p>
                                <p>${r.contact_number}</p>
                            </div>
                        </div>
                    </div>
                    <div class="bg-slate-50 p-3 border-t border-slate-100 text-right">
                         <select onchange="updateBloodStatus(${r.id}, this.value, ${r.units_required})" class="text-xs border-slate-200 rounded p-1 bg-white">
                            <option value="" disabled selected>Update...</option>
                            <option value="Partially Fulfilled">Partial Fill</option>
                            <option value="Fulfilled">Fulfilled</option>
                            <option value="Cancelled">Cancel</option>
                        </select>
                    </div>
                </div>
            `).join('')}
        </div>
    </div>
    `;
}

// --- VIEW: FACILITIES ---
function renderFacilities() {
    const fType = currentState.facilityFilters?.type || '';
    const fSearch = (currentState.facilityFilters?.search || '').toLowerCase();

    let filtered = currentState.facilities.filter(f => {
        if (fType && f.type !== fType) return false;
        if (fSearch && !f.name.toLowerCase().includes(fSearch) && !f.services.toLowerCase().includes(fSearch)) return false;
        return true;
    });

    return `
    <div class="animate-slide-up space-y-6">
        <div class="flex justify-between items-center flex-wrap gap-4">
            <h2 class="text-lg font-semibold text-slate-800">Healthcare Facilities Nearby</h2>
            
            <div class="flex gap-2 w-full md:w-auto">
                <div class="relative flex-1 md:w-64">
                    <i data-lucide="search" class="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"></i>
                    <input type="text" placeholder="Search name or services..." 
                        value="${currentState.facilityFilters?.search || ''}"
                        onkeyup="currentState.facilityFilters = {...(currentState.facilityFilters||{}), search: this.value}; renderView('facilities');" 
                        class="w-full pl-9 pr-3 py-2 border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary-500 outline-none">
                </div>
                <select onchange="currentState.facilityFilters = {...(currentState.facilityFilters||{}), type: this.value}; renderView('facilities');" class="text-sm border-slate-200 rounded-lg p-2 bg-white">
                    <option value="">All Types</option>
                    <option value="Hospital" ${fType === 'Hospital' ? 'selected':''}>Hospital</option>
                    <option value="Clinic" ${fType === 'Clinic' ? 'selected':''}>Clinic</option>
                    <option value="Blood Bank" ${fType === 'Blood Bank' ? 'selected':''}>Blood Bank</option>
                    <option value="Ambulance Provider" ${fType === 'Ambulance Provider' ? 'selected':''}>Ambulance Provider</option>
                </select>
            </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            ${filtered.length === 0 ? '<div class="col-span-full p-8 text-center text-slate-500">No facilities match your search criteria.</div>' : ''}
            ${filtered.map(f => `
                <div class="bg-white rounded-xl shadow-sm border border-slate-100 p-5 hover:shadow-md transition-shadow">
                    <div class="flex items-start gap-4 mb-4">
                        <div class="w-12 h-12 rounded-lg bg-primary-50 flex items-center justify-center text-primary-600 shrink-0">
                            <i data-lucide="${f.type === 'Hospital' || f.type === 'Clinic' ? 'hospital' : f.type === 'Blood Bank' ? 'droplet' : 'truck'}" class="w-6 h-6"></i>
                        </div>
                        <div>
                            <h4 class="font-semibold text-slate-800">${f.name}</h4>
                            <p class="text-xs font-medium text-primary-600 uppercase tracking-wider">${f.type}</p>
                        </div>
                    </div>
                    <div class="space-y-2 text-sm text-slate-600 mb-4">
                        <div class="flex gap-2 items-start"><i data-lucide="map-pin" class="w-4 h-4 text-slate-400 mt-0.5 shrink-0"></i> <span>${f.location}</span></div>
                        <div class="flex gap-2 items-start"><i data-lucide="phone" class="w-4 h-4 text-slate-400 mt-0.5 shrink-0"></i> <span>${f.phone}</span></div>
                    </div>
                    <div class="pt-4 border-t border-slate-100 flex justify-between items-center">
                        <span class="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded truncate max-w-[150px]" title="${f.services}">${f.services}</span>
                        ${getStatusBadge(f.status)}
                    </div>
                </div>
            `).join('')}
        </div>
    </div>
    `;
}

// --- UTILS ---
function getStatusBadge(status) {
    const colors = {
        'Scheduled': 'bg-blue-100 text-blue-700',
        'Confirmed': 'bg-primary-100 text-primary-700',
        'Completed': 'bg-success/20 text-success',
        'Fulfilled': 'bg-success/20 text-success',
        'Requested': 'bg-warning/20 text-warning',
        'Assigned': 'bg-primary-100 text-primary-700',
        'En Route': 'bg-warning/20 text-warning',
        'Open': 'bg-danger/10 text-danger',
        'Partially Fulfilled': 'bg-warning/20 text-warning',
        'Available': 'bg-success/20 text-success',
        'Cancelled': 'bg-slate-200 text-slate-600',
    };
    const c = colors[status] || 'bg-slate-100 text-slate-700';
    return `<span class="px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${c}">${status}</span>`;
}

function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    const color = type === 'success' ? 'bg-success' : type === 'danger' ? 'bg-danger' : 'bg-primary-600';
    
    toast.className = `toast-enter ${color} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-[250px]`;
    toast.innerHTML = `
        <i data-lucide="${type === 'success' ? 'check-circle' : 'alert-circle'}" class="w-5 h-5"></i>
        <span class="text-sm font-medium">${message}</span>
    `;
    
    container.appendChild(toast);
    lucide.createIcons();
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// --- API ACTIONS ---
async function updateAppointmentStatus(id, status) {
    try {
        await fetch(`${API_BASE}/appointments/${id}/status?status=${status}`, { method: 'PUT' });
        showToast("Appointment updated", "success");
        navigate(currentState.view); // refresh
    } catch (e) {
        showToast("Failed to update", "danger");
    }
}
async function updateAmbulanceStatus(id, status) {
    let url = `${API_BASE}/ambulance-requests/${id}/status?status=${status}`;
    if (status === 'Assigned') {
        const ambId = prompt("Enter assigned ambulance ID/Name:");
        if (!ambId) return; // cancelled
        url += `&assigned_ambulance=${encodeURIComponent(ambId)}`;
    }
    try {
        const res = await fetch(url, { method: 'PUT' });
        if (!res.ok) throw new Error("Update failed");
        showToast("Ambulance request updated", "success");
        navigate(currentState.view);
    } catch (e) {
        showToast("Failed to update", "danger");
    }
}
async function updateBloodStatus(id, status, maxUnits) {
    let url = `${API_BASE}/blood-requests/${id}/status?status=${status}`;
    if (status === 'Partially Fulfilled' || status === 'Fulfilled') {
        let units = prompt(`Enter number of units fulfilled (Max ${maxUnits}):`);
        if (units === null) return;
        units = parseInt(units);
        if (isNaN(units) || units < 0 || units > maxUnits) {
            showToast(`Invalid units. Must be between 0 and ${maxUnits}.`, "danger");
            return;
        }
        url += `&units_fulfilled=${units}`;
    }
    try {
        const res = await fetch(url, { method: 'PUT' });
        if (!res.ok) throw new Error(await res.text());
        showToast("Blood requirement updated", "success");
        navigate(currentState.view);
    } catch (e) {
        console.error(e);
        showToast("Failed to update", "danger");
    }
}

// --- MODAL LOGIC ---
function openModal(title, contentHTML) {
    const container = document.getElementById('modal-container');
    container.innerHTML = `
        <div id="active-modal" class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center animate-slide-up">
            <div class="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
                <div class="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 class="font-semibold text-slate-800">${title}</h3>
                    <button onclick="closeModal()" class="text-slate-400 hover:text-slate-600"><i data-lucide="x" class="w-5 h-5"></i></button>
                </div>
                <div class="p-6 max-h-[80vh] overflow-y-auto">
                    ${contentHTML}
                </div>
            </div>
        </div>
    `;
    lucide.createIcons();
}

function closeModal() {
    const modal = document.getElementById('active-modal');
    if (modal) {
        modal.classList.add('opacity-0');
        setTimeout(() => document.getElementById('modal-container').innerHTML = '', 200);
    }
}

function openPatientModal() {
    const html = `
        <form id="patient-form" class="space-y-4" onsubmit="submitPatient(event)">
            <div class="grid grid-cols-2 gap-4">
                <div class="col-span-2">
                    <label class="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
                    <input type="text" id="p-name" required class="w-full px-3 py-2 border rounded-lg focus:ring-primary-500 focus:border-primary-500">
                </div>
                <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">Age *</label>
                    <input type="number" id="p-age" required min="0" class="w-full px-3 py-2 border rounded-lg">
                </div>
                <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">Gender *</label>
                    <select id="p-gender" required class="w-full px-3 py-2 border rounded-lg">
                        <option value="">Select...</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">Phone *</label>
                    <input type="tel" id="p-phone" required class="w-full px-3 py-2 border rounded-lg">
                </div>
                <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">Blood Group *</label>
                    <select id="p-blood" required class="w-full px-3 py-2 border rounded-lg">
                        <option value="">Select...</option>
                        <option value="A+">A+</option><option value="A-">A-</option>
                        <option value="B+">B+</option><option value="B-">B-</option>
                        <option value="AB+">AB+</option><option value="AB-">AB-</option>
                        <option value="O+">O+</option><option value="O-">O-</option>
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">City *</label>
                    <input type="text" id="p-city" required class="w-full px-3 py-2 border rounded-lg">
                </div>
                <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">Emergency Contact *</label>
                    <input type="text" id="p-emer" required class="w-full px-3 py-2 border rounded-lg">
                </div>
            </div>
            <div class="mt-6 flex justify-end gap-3">
                <button type="button" onclick="closeModal()" class="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                <button type="submit" class="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg">Save Patient</button>
            </div>
        </form>
    `;
    openModal("Add New Patient", html);
}

async function submitPatient(e) {
    e.preventDefault();
    const data = {
        full_name: document.getElementById('p-name').value,
        age: parseInt(document.getElementById('p-age').value),
        gender: document.getElementById('p-gender').value,
        phone: document.getElementById('p-phone').value,
        blood_group: document.getElementById('p-blood').value,
        city: document.getElementById('p-city').value,
        emergency_contact: document.getElementById('p-emer').value,
    };
    try {
        const res = await fetch(`${API_BASE}/patients`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error(await res.text());
        showToast("Patient created successfully", "success");
        closeModal();
        navigate(currentState.view);
    } catch(err) {
        console.error(err);
        showToast("Failed to create patient", "danger");
    }
}

function openAppointmentModal() {
    let patientOptions = currentState.patients.map(p => `<option value="${p.id}">${p.full_name} (PT-${p.id})</option>`).join('');
    if (patientOptions === '') {
        patientOptions = '<option value="" disabled>No patients found. Please add a patient first.</option>';
    }
    const html = `
        <form id="appt-form" class="space-y-4" onsubmit="submitAppointment(event)">
            <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Select Patient *</label>
                <select id="a-patient" required class="w-full px-3 py-2 border rounded-lg">
                    <option value="">Select...</option>
                    ${patientOptions}
                </select>
            </div>
            <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Department *</label>
                <input type="text" id="a-dept" required class="w-full px-3 py-2 border rounded-lg" placeholder="e.g. Cardiology">
            </div>
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">Date *</label>
                    <input type="date" id="a-date" required class="w-full px-3 py-2 border rounded-lg">
                </div>
                <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">Time *</label>
                    <input type="time" id="a-time" required class="w-full px-3 py-2 border rounded-lg">
                </div>
            </div>
            <div class="mt-6 flex justify-end gap-3">
                <button type="button" onclick="closeModal()" class="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                <button type="submit" class="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg">Book Appointment</button>
            </div>
        </form>
    `;
    openModal("Book Appointment", html);
}

async function submitAppointment(e) {
    e.preventDefault();
    const data = {
        patient_id: parseInt(document.getElementById('a-patient').value),
        department: document.getElementById('a-dept').value,
        date: document.getElementById('a-date').value,
        time: document.getElementById('a-time').value,
        status: "Scheduled"
    };
    try {
        const res = await fetch(`${API_BASE}/appointments`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error(await res.text());
        showToast("Appointment booked", "success");
        closeModal();
        navigate(currentState.view);
    } catch(err) {
        console.error(err);
        showToast("Failed to book appointment", "danger");
    }
}

function openAmbulanceModal() {
    const html = `
        <form class="space-y-4" onsubmit="submitAmbulance(event)">
            <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Pickup Location *</label>
                <input type="text" id="amb-pickup" required class="w-full px-3 py-2 border rounded-lg">
            </div>
            <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Destination Facility *</label>
                <input type="text" id="amb-dest" required class="w-full px-3 py-2 border rounded-lg">
            </div>
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">Contact Number *</label>
                    <input type="tel" id="amb-phone" required class="w-full px-3 py-2 border rounded-lg">
                </div>
                <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">Priority *</label>
                    <select id="amb-pri" required class="w-full px-3 py-2 border rounded-lg">
                        <option value="Normal">Normal</option>
                        <option value="High">High</option>
                        <option value="Critical">Critical</option>
                    </select>
                </div>
            </div>
            <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Number of People *</label>
                <input type="number" id="amb-people" required min="1" value="1" class="w-full px-3 py-2 border rounded-lg">
            </div>
            <div class="mt-6 flex justify-end gap-3">
                <button type="button" onclick="closeModal()" class="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                <button type="submit" class="px-4 py-2 bg-warning hover:bg-yellow-600 text-white rounded-lg">Request Ambulance</button>
            </div>
        </form>
    `;
    openModal("Request Ambulance", html);
}

async function submitAmbulance(e) {
    e.preventDefault();
    const data = {
        pickup_location: document.getElementById('amb-pickup').value,
        destination_facility: document.getElementById('amb-dest').value,
        contact_number: document.getElementById('amb-phone').value,
        emergency_priority: document.getElementById('amb-pri').value,
        people_count: parseInt(document.getElementById('amb-people').value),
        status: "Requested"
    };
    try {
        const res = await fetch(`${API_BASE}/ambulance-requests`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error(await res.text());
        showToast("Ambulance requested", "success");
        closeModal();
        navigate(currentState.view);
    } catch(err) {
        console.error(err);
        showToast("Failed to request ambulance", "danger");
    }
}

function openBloodModal() {
    const html = `
        <form class="space-y-4" onsubmit="submitBlood(event)">
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">Blood Group *</label>
                    <select id="b-group" required class="w-full px-3 py-2 border rounded-lg">
                        <option value="">Select...</option>
                        <option value="A+">A+</option><option value="A-">A-</option>
                        <option value="B+">B+</option><option value="B-">B-</option>
                        <option value="AB+">AB+</option><option value="AB-">AB-</option>
                        <option value="O+">O+</option><option value="O-">O-</option>
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">Units Required *</label>
                    <input type="number" id="b-units" required min="1" class="w-full px-3 py-2 border rounded-lg">
                </div>
            </div>
            <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Location / Hospital *</label>
                <input type="text" id="b-loc" required class="w-full px-3 py-2 border rounded-lg">
            </div>
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">Contact Person *</label>
                    <input type="text" id="b-person" required class="w-full px-3 py-2 border rounded-lg">
                </div>
                <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">Contact Number *</label>
                    <input type="tel" id="b-phone" required class="w-full px-3 py-2 border rounded-lg">
                </div>
            </div>
            <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Urgency *</label>
                <select id="b-urgency" required class="w-full px-3 py-2 border rounded-lg">
                    <option value="Normal">Normal</option>
                    <option value="High">High</option>
                </select>
            </div>
            <div class="mt-6 flex justify-end gap-3">
                <button type="button" onclick="closeModal()" class="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                <button type="submit" class="px-4 py-2 bg-danger hover:bg-red-600 text-white rounded-lg">Post Requirement</button>
            </div>
        </form>
    `;
    openModal("Post Blood Requirement", html);
}

async function submitBlood(e) {
    e.preventDefault();
    const data = {
        blood_group: document.getElementById('b-group').value,
        units_required: parseInt(document.getElementById('b-units').value),
        units_fulfilled: 0,
        location: document.getElementById('b-loc').value,
        contact_person: document.getElementById('b-person').value,
        contact_number: document.getElementById('b-phone').value,
        urgency: document.getElementById('b-urgency').value,
        status: "Open"
    };
    try {
        const res = await fetch(`${API_BASE}/blood-requests`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error(await res.text());
        showToast("Blood requirement posted", "success");
        closeModal();
        navigate(currentState.view);
    } catch(err) {
        console.error(err);
        showToast("Failed to post blood requirement", "danger");
    }
}
