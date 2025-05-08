// Theme Toggle
const themeToggle = document.getElementById('themeToggle');
const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

const currentTheme = localStorage.getItem('theme') || (prefersDarkScheme.matches ? 'dark' : 'light');
document.documentElement.setAttribute('data-theme', currentTheme);

if (currentTheme === 'dark') {
    themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
} else {
    themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
}

themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    themeToggle.innerHTML = newTheme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
});

// Tab Navigation
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const tabId = btn.getAttribute('data-tab');
        tabBtns.forEach(b => b.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(tabId).classList.add('active');
        document.getElementById('calculationMethod').value = tabId;
    });
});

// Accordion Functionality
const accordionHeaders = document.querySelectorAll('.accordion-header');

accordionHeaders.forEach(header => {
    header.addEventListener('click', () => {
        const accordion = header.parentElement;
        accordion.classList.toggle('active');
        const icon = header.querySelector('i');
        if (accordion.classList.contains('active')) {
            icon.classList.remove('fa-chevron-down');
            icon.classList.add('fa-chevron-up');
            console.log('Accordion opened, triggering updateHistoryChart');
            updateHistoryChart(); // Render chart when accordion opens
        } else {
            icon.classList.remove('fa-chevron-up');
            icon.classList.add('fa-chevron-down');
        }
    });
});

// Back to Top Button
const backToTopBtn = document.getElementById('backToTop');

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

// Quick Start Guide Modal
const quickStartBtn = document.getElementById('quickStartBtn');
const quickStartModal = document.getElementById('quickStartModal');
const closeQuickStartBtn = document.getElementById('closeQuickStartBtn');

quickStartBtn.addEventListener('click', () => {
    quickStartModal.style.display = 'flex';
});

closeQuickStartBtn.addEventListener('click', () => {
    quickStartModal.style.display = 'none';
});

quickStartModal.addEventListener('click', (e) => {
    if (e.target === quickStartModal) {
        quickStartModal.style.display = 'none';
    }
});

// Grade Calculation Logic
let gradeItems = [];
window.historyChart = null; // Initialize as null
window.gradeChart = null;   // Initialize as null

// DOM Elements
const addItemBtn = document.getElementById('addItemBtn');
const calculateBtn = document.getElementById('calculateBtn');
const resetBtn = document.getElementById('resetBtn');
const clearFormBtn = document.getElementById('clearFormBtn');
const whatIfBtn = document.getElementById('whatIfBtn');
const refreshSuggestionsBtn = document.getElementById('refreshSuggestionsBtn');
const gradeItemsTable = document.getElementById('gradeItemsTable');
const gradingScaleSelect = document.getElementById('gradingScale');
const customScaleContainer = document.getElementById('customScaleContainer');

// Show/Hide Custom Scale
gradingScaleSelect.addEventListener('change', () => {
    customScaleContainer.style.display = gradingScaleSelect.value === 'custom' ? 'block' : 'none';
});

// Add Grade Item
addItemBtn.addEventListener('click', () => {
    const categoryType = document.getElementById('categoryType').value;
    const itemName = document.getElementById('itemName').value.trim();
    const itemScore = parseFloat(document.getElementById('itemScore').value) || 0;
    const itemMaxScore = parseFloat(document.getElementById('itemMaxScore').value) || 100;
    const itemWeight = parseFloat(document.getElementById('itemWeight').value) || 0;
    const itemExtraCredit = parseFloat(document.getElementById('itemExtraCredit').value) || 0;
    const itemDueDate = document.getElementById('itemDueDate').value;

    if (!itemName) {
        alert('Please enter an item name');
        return;
    }

    if (itemMaxScore <= 0) {
        alert('Maximum score must be greater than 0');
        return;
    }

    if (itemScore > itemMaxScore && itemExtraCredit <= 0) {
        alert('Score cannot be greater than maximum score without extra credit');
        return;
    }

    if (itemScore < 0 || itemWeight < 0 || itemExtraCredit < 0) {
        alert('Scores, weights, and extra credit cannot be negative');
        return;
    }

    const newItem = {
        id: Date.now(),
        category: categoryType,
        name: itemName,
        score: itemScore,
        maxScore: itemMaxScore,
        weight: itemWeight,
        extraCredit: itemExtraCredit,
        dueDate: itemDueDate,
        percentage: itemMaxScore > 0 ? ((itemScore + itemExtraCredit) / itemMaxScore) * 100 : 0
    };

    gradeItems.push(newItem);
    updateGradeItemsTable();
    clearForm();
});

// Update Grade Items Table
function updateGradeItemsTable() {
    gradeItemsTable.innerHTML = '';

    if (gradeItems.length === 0) {
        const row = document.createElement('tr');
        row.className = 'empty-message';
        row.innerHTML = '<td colspan="5" style="text-align: center;">No grade items added yet</td>';
        gradeItemsTable.appendChild(row);
        return;
    }

    gradeItems.forEach(item => {
        const row = document.createElement('tr');
        row.dataset.id = item.id;
        const scoreDisplay = item.maxScore > 0 ?
            `${item.score + item.extraCredit}/${item.maxScore} (${item.percentage.toFixed(1)}%)` :
            '--';
        row.innerHTML = `
            <td>
                <strong>${item.name}</strong>
                <div class="badge">${item.category}</div>
                ${item.dueDate ? `<div><small>Due: ${formatDate(item.dueDate)}</small></div>` : ''}
            </td>
            <td>${scoreDisplay}</td>
            <td>${item.weight}%</td>
            <td>${item.dueDate ? formatDate(item.dueDate) : '--'}</td>
            <td class="action-btns">
                <button class="action-btn edit-btn" title="Edit" aria-label="Edit Item">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn delete-btn" title="Delete" aria-label="Delete Item">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </td>
        `;
        gradeItemsTable.appendChild(row);
    });

    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const row = e.target.closest('tr');
            const itemId = parseInt(row.dataset.id);
            editItem(itemId);
        });
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const row = e.target.closest('tr');
            const itemId = parseInt(row.dataset.id);
            deleteItem(itemId);
        });
    });
}

// Format Date
function formatDate(dateString) {
    if (!dateString || isNaN(new Date(dateString))) return '--';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

// Edit Item
function editItem(itemId) {
    const item = gradeItems.find(i => i.id === itemId);
    if (!item) return;

    document.getElementById('categoryType').value = item.category;
    document.getElementById('itemName').value = item.name;
    document.getElementById('itemScore').value = item.score;
    document.getElementById('itemMaxScore').value = item.maxScore;
    document.getElementById('itemWeight').value = item.weight;
    document.getElementById('itemExtraCredit').value = item.extraCredit;
    document.getElementById('itemDueDate').value = item.dueDate;

    gradeItems = gradeItems.filter(i => i.id !== itemId);
    updateGradeItemsTable();
}

// Delete Item
function deleteItem(itemId) {
    if (confirm('Are you sure you want to delete this item?')) {
        gradeItems = gradeItems.filter(i => i.id !== itemId);
        updateGradeItemsTable();
    }
}

// Clear Form
function clearForm() {
    document.getElementById('itemName').value = '';
    document.getElementById('itemScore').value = '';
    document.getElementById('itemMaxScore').value = '';
    document.getElementById('itemWeight').value = '';
    document.getElementById('itemExtraCredit').value = '';
    document.getElementById('itemDueDate').value = '';
}

clearFormBtn.addEventListener('click', clearForm);

// Reset All
resetBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to reset all grade items?')) {
        gradeItems = [];
        updateGradeItemsTable();
        clearResults();
    }
});

// Clear Results
function clearResults() {
    document.getElementById('currentGrade').textContent = '--';
    document.getElementById('currentLetter').textContent = '--';
    document.getElementById('projectedGrade').textContent = '--';
    document.getElementById('projectedLetter').textContent = '--';
    document.getElementById('gpaValue').textContent = '--';
    document.getElementById('totalWeight').textContent = '--';
    document.getElementById('whatIfResult').style.display = 'none';

    if (window.gradeChart && typeof window.gradeChart.destroy === 'function') {
        window.gradeChart.destroy();
        window.gradeChart = null;
    }
    if (window.historyChart && typeof window.historyChart.destroy === 'function') {
        window.historyChart.destroy();
        window.historyChart = null;
    }

    document.getElementById('aiSuggestions').innerHTML = `
        <div class="suggestion">
            <div class="suggestion-title"><i class="fas fa-lightbulb"></i> Tip</div>
            <p>Add your grade items to get personalized study suggestions and grade optimization tips.</p>
        </div>
    `;
    document.getElementById('gradePredictionResult').style.display = 'none';
}

// Calculate Grades
calculateBtn.addEventListener('click', calculateGrades);

function calculateGrades() {
    if (gradeItems.length === 0) {
        alert('Please add at least one grade item');
        return;
    }

    const calculationMethod = document.getElementById('calculationMethod').value;
    const gradingScale = document.getElementById('gradingScale').value;

    let totalWeight = 0;
    let weightedSum = 0;
    let totalPointsEarned = 0;
    let totalPointsPossible = 0;

    gradeItems.forEach(item => {
        totalWeight += item.weight;
        if (item.maxScore > 0) {
            const percentage = ((item.score + item.extraCredit) / item.maxScore) * 100;
            weightedSum += (percentage * item.weight) / 100;
            totalPointsEarned += item.score + item.extraCredit;
            totalPointsPossible += item.maxScore;
        }
    });

    if (totalWeight === 0 && calculationMethod === 'weighted') {
        alert('Total weight cannot be zero for weighted grading');
        return;
    }

    let currentGrade, projectedGrade;

    if (calculationMethod === 'weighted' || calculationMethod === 'letter') {
        currentGrade = totalWeight > 0 ? (weightedSum / totalWeight) * 100 : 0;
    } else if (calculationMethod === 'points') {
        currentGrade = totalPointsPossible > 0 ? (totalPointsEarned / totalPointsPossible) * 100 : 0;
    }

    projectedGrade = currentGrade;

    document.getElementById('currentGrade').textContent = currentGrade.toFixed(1);
    document.getElementById('projectedGrade').textContent = projectedGrade.toFixed(1);
    document.getElementById('totalWeight').textContent = totalWeight.toFixed(1);

    const currentLetter = getLetterGrade(currentGrade, gradingScale);
    const projectedLetter = getLetterGrade(projectedGrade, gradingScale);
    document.getElementById('currentLetter').textContent = currentLetter;
    document.getElementById('projectedLetter').textContent = projectedLetter;

    const gpa = calculateGPA(currentGrade, gradingScale);
    document.getElementById('gpaValue').textContent = gpa.toFixed(2);

    updateGradeChart();
    saveGradeHistory(currentGrade);
    console.log('Grades calculated, triggering updateHistoryChart');
    if (document.querySelector('.accordion.active')) {
        updateHistoryChart(); // Update chart if accordion is open
    }
    generateAISuggestions(currentGrade, projectedGrade, totalWeight);
}

// Get Letter Grade
function getLetterGrade(percentage, scale) {
    let aThreshold = 90, bThreshold = 80, cThreshold = 70, dThreshold = 60;
    if (scale === 'strict') {
        aThreshold = 93;
        bThreshold = 85;
        cThreshold = 77;
        dThreshold = 70;
    } else if (scale === 'custom') {
        aThreshold = parseFloat(document.getElementById('aThreshold').value) || aThreshold;
        bThreshold = parseFloat(document.getElementById('bThreshold').value) || bThreshold;
        cThreshold = parseFloat(document.getElementById('cThreshold').value) || cThreshold;
        dThreshold = parseFloat(document.getElementById('dThreshold').value) || dThreshold;
        if (aThreshold <= bThreshold || bThreshold <= cThreshold || cThreshold <= dThreshold || aThreshold > 100 || dThreshold < 0) {
            alert('Invalid custom grade thresholds. Ensure A > B > C > D and all are between 0-100.');
            return 'N/A';
        }
    }
    if (percentage >= aThreshold) return 'A';
    if (percentage >= bThreshold) return 'B';
    if (percentage >= cThreshold) return 'C';
    if (percentage >= dThreshold) return 'D';
    return 'F';
}

// Calculate GPA
function calculateGPA(percentage, scale) {
    const letterGrade = getLetterGrade(percentage, scale);
    switch (letterGrade) {
        case 'A': return 4.0;
        case 'B': return 3.0;
        case 'C': return 2.0;
        case 'D': return 1.0;
        case 'N/A': return 0.0;
        default: return 0.0;
    }
}

// Update Grade Chart
function updateGradeChart(projectedData = null) {
    const ctx = document.getElementById('gradeChart')?.getContext('2d');
    if (!ctx || typeof Chart === 'undefined') {
        console.error('GradeChart canvas or Chart.js not available');
        return;
    }

    if (window.gradeChart && typeof window.gradeChart.destroy === 'function') {
        window.gradeChart.destroy();
    }

    const categories = {};
    gradeItems.forEach(item => {
        if (!categories[item.category]) {
            categories[item.category] = { count: 0, total: 0 };
        }
        categories[item.category].count++;
        categories[item.category].total += item.percentage;
    });

    const labels = Object.keys(categories);
    const data = labels.map(cat => (categories[cat].total / categories[cat].count).toFixed(1));
    const colors = labels.map((_, i) => `hsl(${(i * 360 / labels.length) % 360}, 70%, 50%)`);

    if (projectedData) {
        labels.push('Projected');
        data.push(projectedData.toFixed(1));
        colors.push('hsl(0, 70%, 50%)');
    }

    window.gradeChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Average Grade % by Category',
                data: data,
                backgroundColor: colors.map(c => c.replace('50%)', '50%, 0.7)')),
                borderColor: colors,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    title: { display: true, text: 'Grade Percentage' }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Average: ${context.raw}%`;
                        }
                    }
                }
            }
        }
    });
    console.log('Grade chart rendered successfully');
}

// Save Grade History
function saveGradeHistory(grade) {
    let history = [];
    try {
        const storedHistory = localStorage.getItem('gradeHistory');
        console.log('Raw gradeHistory from localStorage:', storedHistory);
        if (storedHistory) {
            history = JSON.parse(storedHistory);
            if (!Array.isArray(history)) {
                console.warn('Grade history is not an array, resetting');
                history = [];
            }
        }
    } catch (e) {
        console.error('Error parsing grade history:', e);
        history = [];
    }

    const timestamp = new Date().toISOString();
    const gradeValue = parseFloat(grade.toFixed(1));
    history.push({ date: timestamp, grade: gradeValue });
    console.log('Saving grade history entry:', { date: timestamp, grade: gradeValue });
    if (history.length > 6) history.shift(); // Keep only last 6 entries
    try {
        localStorage.setItem('gradeHistory', JSON.stringify(history));
        console.log('Grade history saved:', history);
    } catch (e) {
        console.error('Error saving grade history:', e);
    }
}

// Update History Chart
function updateHistoryChart() {
    const ctx = document.getElementById('historyChart');
    if (!ctx) {
        console.error('History chart canvas not found. Check if ID "historyChart" exists in HTML.');
        return;
    }
    console.log('updateHistoryChart called, canvas found:', ctx);

    const canvasCtx = ctx.getContext('2d');
    if (!canvasCtx || typeof Chart === 'undefined') {
        console.error('HistoryChart canvas context or Chart.js not available');
        return;
    }

    if (window.historyChart && typeof window.historyChart.destroy === 'function') {
        console.log('Destroying existing history chart');
        window.historyChart.destroy();
        window.historyChart = null;
    }

    let history = [];
    try {
        const storedHistory = localStorage.getItem('gradeHistory');
        console.log('Loaded gradeHistory:', storedHistory);
        if (storedHistory) {
            history = JSON.parse(storedHistory);
            if (!Array.isArray(history)) {
                console.warn('Grade history is not an array, resetting');
                history = [];
            }
            history = history.filter(entry => 
                entry && 
                entry.date && !isNaN(new Date(entry.date)) && 
                typeof entry.grade === 'number' && entry.grade >= 0 && entry.grade <= 100
            );
            console.log('Validated history data:', history);
        }
    } catch (e) {
        console.error('Error parsing grade history:', e);
        history = [];
    }

    const labels = history.length > 0 
        ? history.map(entry => new Date(entry.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }))
        : ['No Data'];
    const data = history.length > 0 
        ? history.map(entry => entry.grade)
        : [0];
    console.log('Chart data - Labels:', labels, 'Data:', data);

    try {
        window.historyChart = new Chart(canvasCtx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Grade Trend',
                    data: data,
                    borderColor: 'rgba(72, 149, 239, 1)',
                    backgroundColor: 'rgba(72, 149, 239, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: false,
                        min: data.length > 0 ? Math.max(Math.floor(Math.min(...data) / 10) * 10 - 10, 0) : 0,
                        max: data.length > 0 ? Math.min(Math.ceil(Math.max(...data) / 10) * 10 + 10, 100) : 100,
                        title: { display: true, text: 'Grade Percentage' },
                        ticks: { stepSize: 10 }
                    },
                    x: {
                        title: { display: true, text: 'Date' }
                    }
                },
                plugins: {
                    legend: { display: true, position: 'top' },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `Grade: ${context.raw.toFixed(1)}%`;
                            },
                            title: function(context) {
                                return context[0].label;
                            }
                        }
                    }
                }
            }
        });
        console.log('History chart rendered successfully');
    } catch (e) {
        console.error('Error rendering history chart:', e);
    }
}

// Generate AI Suggestions
function generateAISuggestions(currentGrade, projectedGrade, totalWeight) {
    const suggestions = [];
    const today = new Date();

    if (currentGrade >= 90) {
        suggestions.push({
            title: 'Excellent Work',
            text: 'Keep up the great performance! Consider mentoring peers or tackling advanced topics.'
        });
    } else if (currentGrade >= 80) {
        suggestions.push({
            title: 'Solid Performance',
            text: 'You’re doing well! Focus on refining weaker areas to boost your grade further.'
        });
    } else if (currentGrade >= 70) {
        suggestions.push({
            title: 'Room for Improvement',
            text: 'Review key concepts and seek help from instructors to improve your grade.'
        });
    } else {
        suggestions.push({
            title: 'Action Needed',
            text: 'Prioritize studying and consider tutoring or study groups to catch up.'
        });
    }

    if (totalWeight < 100) {
        suggestions.push({
            title: 'Incomplete Weight',
            text: `Your total weight is ${totalWeight.toFixed(1)}%. Add more assignments to reach 100% for accurate projections.`
        });
    }

    const weakCategories = [];
    const categories = {};
    gradeItems.forEach(item => {
        if (!categories[item.category]) {
            categories[item.category] = { count: 0, total: 0 };
        }
        categories[item.category].count++;
        categories[item.category].total += item.percentage;
    });

    for (const cat in categories) {
        const avg = categories[cat].total / categories[cat].count;
        if (avg < 70) {
            weakCategories.push(cat);
        }
    }

    if (weakCategories.length > 0) {
        suggestions.push({
            title: 'Focus Areas',
            text: `Your performance in ${weakCategories.join(', ')} is below 70%. Dedicate extra study time to these categories.`
        });
    }

    const upcomingItems = gradeItems.filter(item => {
        if (!item.dueDate) return false;
        const dueDate = new Date(item.dueDate);
        const diffDays = (dueDate - today) / (1000 * 60 * 60 * 24);
        return diffDays > 0 && diffDays <= 7;
    });

    if (upcomingItems.length > 0) {
        suggestions.push({
            title: 'Upcoming Deadlines',
            text: `You have ${upcomingItems.length} assignment(s) due within the next week. Plan your study schedule accordingly.`
        });
    }

    const studyTechniques = [
        'Try the Pomodoro Technique: 25 minutes of focused study followed by a 5-minute break.',
        'Use Active Recall: Test yourself on key concepts without looking at notes.',
        'Create a study schedule and stick to it to stay organized.',
        'Form a study group to discuss and reinforce difficult topics.'
    ];

    suggestions.push({
        title: 'Study Tip',
        text: studyTechniques[Math.floor(Math.random() * studyTechniques.length)]
    });

    const suggestionsHtml = suggestions.map(s => `
        <div class="suggestion">
            <div class="suggestion-title"><i class="fas fa-lightbulb"></i> ${s.title}</div>
            <p>${s.text}</p>
        </div>
    `).join('');

    document.getElementById('aiSuggestions').innerHTML = suggestionsHtml;
}

refreshSuggestionsBtn.addEventListener('click', () => {
    const currentGrade = parseFloat(document.getElementById('currentGrade').textContent) || 0;
    const projectedGrade = parseFloat(document.getElementById('projectedGrade').textContent) || 0;
    const totalWeight = parseFloat(document.getElementById('totalWeight').textContent) || 0;
    generateAISuggestions(currentGrade, projectedGrade, totalWeight);
});

// What-If Analysis
whatIfBtn.addEventListener('click', () => {
    const whatIfScore = parseFloat(document.getElementById('whatIfScore').value);
    const whatIfWeight = parseFloat(document.getElementById('whatIfWeight').value);
    const calculationMethod = document.getElementById('calculationMethod').value;
    const gradingScale = document.getElementById('gradingScale').value;

    if (isNaN(whatIfScore) || isNaN(whatIfWeight)) {
        alert('Please enter a valid score and weight for the what-if analysis');
        return;
    }

    if (whatIfScore < 0 || whatIfScore > 100 || whatIfWeight < 0) {
        alert('Score must be between 0-100, and weight cannot be negative');
        return;
    }

    let totalWeight = 0;
    let weightedSum = 0;
    let totalPointsEarned = 0;
    let totalPointsPossible = 100;

    gradeItems.forEach(item => {
        totalWeight += item.weight;
        if (item.maxScore > 0) {
            const percentage = ((item.score + item.extraCredit) / item.maxScore) * 100;
            weightedSum += (percentage * item.weight) / 100;
            totalPointsEarned += item.score + item.extraCredit;
            totalPointsPossible += item.maxScore;
        }
    });

    totalWeight += whatIfWeight;
    weightedSum += (whatIfScore * whatIfWeight) / 100;

    if (totalWeight > 100 && calculationMethod === 'weighted') {
        alert('Total weight exceeds 100%. Please adjust the weights.');
        return;
    }

    let projectedGrade;
    if (calculationMethod === 'weighted' || calculationMethod === 'letter') {
        projectedGrade = totalWeight > 0 ? (weightedSum / totalWeight) * 100 : 0;
    } else if (calculationMethod === 'points') {
        totalPointsEarned += whatIfScore;
        totalPointsPossible += 100;
        projectedGrade = totalPointsPossible > 0 ? (totalPointsEarned / totalPointsPossible) * 100 : 0;
    }

    document.getElementById('projectedGrade').textContent = projectedGrade.toFixed(1);
    document.getElementById('projectedLetter').textContent = getLetterGrade(projectedGrade, gradingScale);
    document.getElementById('whatIfResult').style.display = 'block';
    document.getElementById('whatIfResultText').textContent = `If you score ${whatIfScore}% on an assignment with ${whatIfWeight}% weight, your projected grade will be ${projectedGrade.toFixed(1)}% (${getLetterGrade(projectedGrade, gradingScale)}).`;

    updateGradeChart(projectedGrade);
});

// Grade Prediction for Target Grade
document.getElementById('predictGradeBtn')?.addEventListener('click', () => {
    const targetGrade = parseFloat(document.getElementById('targetGrade').value);
    const calculationMethod = document.getElementById('calculationMethod').value;
    const gradingScale = document.getElementById('gradingScale').value;

    if (isNaN(targetGrade) || targetGrade < 0 || targetGrade > 100) {
        alert('Please enter a valid target grade between 0 and 100');
        return;
    }

    let currentTotalWeight = 0;
    let currentWeightedSum = 0;

    gradeItems.forEach(item => {
        currentTotalWeight += item.weight;
        if (item.maxScore > 0) {
            const percentage = ((item.score + item.extraCredit) / item.maxScore) * 100;
            currentWeightedSum += (percentage * item.weight) / 100;
        }
    });

    if (calculationMethod !== 'weighted' && calculationMethod !== 'letter') {
        alert('Grade prediction is only available for weighted grading method');
        return;
    }

    if (currentTotalWeight >= 100) {
        alert('Total weight is already 100% or more. No remaining weight to predict.');
        return;
    }

    const remainingWeight = 100 - currentTotalWeight;
    if (remainingWeight <= 0) {
        alert('No remaining weight to predict a grade for.');
        return;
    }

    const requiredWeightedSum = targetGrade - (currentWeightedSum / 100) * currentTotalWeight;
    const requiredGrade = (requiredWeightedSum / remainingWeight) * 100;

    if (requiredGrade > 100) {
        document.getElementById('gradePredictionResult').style.display = 'block';
        document.getElementById('gradePredictionResultText').textContent = `To achieve a ${targetGrade}% overall, you need more than 100% on remaining assignments, which is not possible. Aim for a lower target.`;
    } else if (requiredGrade < 0) {
        document.getElementById('gradePredictionResult').style.display = 'block';
        document.getElementById('gradePredictionResultText').textContent = `You've already exceeded your target of ${targetGrade}%! Keep up the good work.`;
    } else {
        document.getElementById('gradePredictionResult').style.display = 'block';
        document.getElementById('gradePredictionResultText').textContent = `To achieve a ${targetGrade}% overall, you need to score ${requiredGrade.toFixed(1)}% on the remaining ${remainingWeight.toFixed(1)}% of assignments (${getLetterGrade(requiredGrade, gradingScale)}).`;
    }
});

// Share Results
function getShareText() {
    const currentGrade = document.getElementById('currentGrade').textContent;
    const currentLetter = document.getElementById('currentLetter').textContent;
    const gpa = document.getElementById('gpaValue').textContent;
    return `My current grade is ${currentGrade}% (${currentLetter}) with a GPA of ${gpa}. Check out my progress with Buzz Grade Calculator!`;
}

document.getElementById('shareFacebook')?.addEventListener('click', (e) => {
    e.preventDefault();
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(getShareText());
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}"e=${text}`, '_blank');
});

document.getElementById('shareTwitter')?.addEventListener('click', (e) => {
    e.preventDefault();
    const text = encodeURIComponent(getShareText());
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(window.location.href)}`, '_blank');
});

document.getElementById('shareLinkedIn')?.addEventListener('click', (e) => {
    e.preventDefault();
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(getShareText());
    window.open(`https://www.linkedin.com/shareArticle?mini=true&url=${url}&title=Grade%20Results&summary=${text}`, '_blank');
});

document.getElementById('shareWhatsApp')?.addEventListener('click', (e) => {
    e.preventDefault();
    const text = encodeURIComponent(getShareText() + ' ' + window.location.href);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
});

// Copy Results
document.getElementById('copyResultsBtn')?.addEventListener('click', () => {
    const text = getShareText() + ' ' + window.location.href;
    navigator.clipboard.writeText(text).then(() => {
        alert('Results copied to clipboard!');
    });
});

// Export to PDF
document.getElementById('exportPdfBtn')?.addEventListener('click', () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Buzz Grade Calculator - Report', 10, 10);
    doc.setFontSize(12);
    doc.text(`Current Grade: ${document.getElementById('currentGrade').textContent}% (${document.getElementById('currentLetter').textContent})`, 10, 20);
    doc.text(`Projected Grade: ${document.getElementById('projectedGrade').textContent}% (${document.getElementById('projectedLetter').textContent})`, 10, 30);
    doc.text(`GPA: ${document.getElementById('gpaValue').textContent}`, 10, 40);
    doc.text(`Total Weight: ${document.getElementById('totalWeight').textContent}%`, 10, 50);
    doc.setFontSize(14);
    doc.text('Grade Items:', 10, 60);
    gradeItems.forEach((item, i) => {
        doc.setFontSize(10);
        doc.text(`${item.name} (${item.category}): ${item.score + item.extraCredit}/${item.maxScore} (${item.percentage.toFixed(1)}%), Weight: ${item.weight}%`, 10, 70 + i * 10);
    });
    doc.save('grade_report.pdf');
});

// Export to Excel
document.getElementById('exportExcelBtn')?.addEventListener('click', () => {
    if (gradeItems.length === 0) {
        alert('No grade items to export. Please add some grade items first.');
        return;
    }

    const data = gradeItems.map(item => ({
        'Item Name': item.name,
        'Category': item.category,
        'Score': item.score + item.extraCredit,
        'Max Score': item.maxScore,
        'Percentage (%)': item.percentage.toFixed(1),
        'Weight (%)': item.weight,
        'Due Date': item.dueDate ? formatDate(item.dueDate) : '--'
    }));

    const summary = {
        'Item Name': 'Summary',
        'Category': '',
        'Score': '',
        'Max Score': '',
        'Percentage (%)': document.getElementById('currentGrade').textContent,
        'Weight (%)': document.getElementById('totalWeight').textContent,
        'Due Date': ''
    };
    data.push(summary);

    try {
        const ws = XLSX.utils.json_to_sheet(data, {
            header: ['Item Name', 'Category', 'Score', 'Max Score', 'Percentage (%)', 'Weight (%)', 'Due Date']
        });

        ws['!cols'] = [
            { wch: 20 }, // Item Name
            { wch: 15 }, // Category
            { wch: 10 }, // Score
            { wch: 10 }, // Max Score
            { wch: 12 }, // Percentage
            { wch: 12 }, // Weight
            { wch: 15 }  // Due Date
        ];

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Grade Report');
        XLSX.writeFile(wb, 'grade_report.xlsx');
    } catch (e) {
        console.error('Error exporting to Excel:', e);
        alert('Failed to export to Excel. Please try again.');
    }
});

// Export Grade History to CSV
document.getElementById('exportHistoryCsvBtn')?.addEventListener('click', () => {
    let history = [];
    try {
        const storedHistory = localStorage.getItem('gradeHistory');
        if (storedHistory) {
            history = JSON.parse(storedHistory);
            if (!Array.isArray(history)) {
                console.warn('Grade history is not an array, resetting');
                history = [];
            }
        }
    } catch (e) {
        console.error('Error parsing grade history for export:', e);
        history = [];
    }

    if (history.length === 0) {
        alert('No grade history to export.');
        return;
    }

    const csvData = history.map(entry => ({
        Date: formatDate(entry.date),
        Grade: entry.grade.toFixed(1)
    }));

    try {
        const ws = XLSX.utils.json_to_sheet(csvData, {
            header: ['Date', 'Grade']
        });

        ws['!cols'] = [
            { wch: 15 }, // Date
            { wch: 10 }  // Grade
        ];

        const csv = XLSX.utils.sheet_to_csv(ws);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'grade_history.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (e) {
        console.error('Error exporting grade history to CSV:', e);
        alert('Failed to export grade history to CSV. Please try again.');
    }
});

// Save Session
document.getElementById('saveSessionBtn')?.addEventListener('click', () => {
    const sessionData = {
        gradeItems: gradeItems,
        settings: {
            calculationMethod: document.getElementById('calculationMethod').value,
            gradingScale: document.getElementById('gradingScale').value,
            aThreshold: document.getElementById('aThreshold').value,
            bThreshold: document.getElementById('bThreshold').value,
            cThreshold: document.getElementById('cThreshold').value,
            dThreshold: document.getElementById('dThreshold').value
        }
    };
    localStorage.setItem('gradeSession', JSON.stringify(sessionData));
    alert('Session saved successfully!');
});

// Load Session
window.addEventListener('load', () => {
    console.log('Page loaded, checking saved session and accordion state');
    const savedSession = localStorage.getItem('gradeSession');
    if (savedSession && confirm('A saved session was found. Would you like to load it?')) {
        try {
            const sessionData = JSON.parse(savedSession);
            gradeItems = sessionData.gradeItems || [];
            updateGradeItemsTable();
            document.getElementById('calculationMethod').value = sessionData.settings.calculationMethod || 'weighted';
            document.getElementById('gradingScale').value = sessionData.settings.gradingScale || 'standard';
            document.getElementById('aThreshold').value = sessionData.settings.aThreshold || '';
            document.getElementById('bThreshold').value = sessionData.settings.bThreshold || '';
            document.getElementById('cThreshold').value = sessionData.settings.cThreshold || '';
            document.getElementById('dThreshold').value = sessionData.settings.dThreshold || '';
            if (sessionData.settings.gradingScale === 'custom') {
                customScaleContainer.style.display = 'block';
            }
            console.log('Session loaded, checking accordion for chart update');
            if (document.querySelector('.accordion.active')) {
                updateHistoryChart();
            }
        } catch (e) {
            console.error('Error loading session:', e);
            alert('Failed to load saved session.');
        }
    } else {
        console.log('No session loaded, checking accordion for initial chart render');
        if (document.querySelector('.accordion.active')) {
            updateHistoryChart();
        }
    }
});