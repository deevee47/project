class GoalTracker {
  constructor() {
    this.goals = JSON.parse(localStorage.getItem('goals')) || [];
    this.mindmap = JSON.parse(localStorage.getItem('mindmap')) || {
      nodes: [],
      connections: []
    };
    this.currentDate = new Date();
    this.currentView = 'calendar';
    this.currentFilter = 'all';
    this.initializeUI();
    this.setupEventListeners();
    this.renderCalendar();
    this.renderGoalsList();
    this.initializeMindMap();
  }

  initializeUI() {
    this.goalForm = document.getElementById('goalForm');
    this.calendarGrid = document.getElementById('calendarGrid');
    this.monthDisplay = document.getElementById('monthDisplay');
    this.prevMonthBtn = document.getElementById('prevMonth');
    this.nextMonthBtn = document.getElementById('nextMonth');
    this.goalsListElement = document.getElementById('goalsList');
    this.navItems = document.querySelectorAll('.nav-item');
    this.filterBtns = document.querySelectorAll('.filter-btn');
    this.views = {
      calendar: document.getElementById('calendarView'),
      goals: document.getElementById('goalsView'),
      mindmap: document.getElementById('mindmapView')
    };

    this.mindmapCanvas = document.getElementById('mindmapCanvas');
    this.addNodeBtn = document.getElementById('addNode');
    this.addConnectionBtn = document.getElementById('addConnection');
    this.clearMindmapBtn = document.getElementById('clearMindmap');
  }

  setupEventListeners() {
    this.goalForm.addEventListener('submit', (e) => this.handleGoalSubmit(e));
    this.prevMonthBtn.addEventListener('click', () => this.changeMonth(-1));
    this.nextMonthBtn.addEventListener('click', () => this.changeMonth(1));
    this.navItems.forEach(item => {
      item.addEventListener('click', () => this.switchView(item.dataset.view));
    });
    this.filterBtns.forEach(btn => {
      btn.addEventListener('click', () => this.filterGoals(btn.dataset.filter));
    });

    // Mind Map event listeners
    this.addNodeBtn.addEventListener('click', () => this.addMindMapNode());
    this.addConnectionBtn.addEventListener('click', () => this.toggleConnectionMode());
    this.clearMindmapBtn.addEventListener('click', () => this.clearMindMap());
  }

  switchView(view) {
    this.currentView = view;
    this.navItems.forEach(item => {
      item.classList.toggle('active', item.dataset.view === view);
    });
    Object.entries(this.views).forEach(([key, element]) => {
      element.classList.toggle('hidden', key !== view);
    });
  }

  filterGoals(filter) {
    this.currentFilter = filter;
    this.filterBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.filter === filter);
    });
    this.renderGoalsList();
  }

  handleGoalSubmit(e) {
    e.preventDefault();
    const title = document.getElementById('goalTitle').value;
    const description = document.getElementById('goalDescription').value;
    const deadline = document.getElementById('goalDeadline').value;
    const progress = parseInt(document.getElementById('goalProgress').value);

    const goal = {
      id: Date.now(),
      title,
      description,
      deadline: new Date(deadline).toISOString(),
      progress,
      status: progress >= 100 ? 'completed' : 'in-progress'
    };

    this.goals.push(goal);
    this.saveGoals();
    this.renderCalendar();
    this.renderGoalsList();
    this.goalForm.reset();
  }

  saveGoals() {
    localStorage.setItem('goals', JSON.stringify(this.goals));
  }

  saveMindMap() {
    localStorage.setItem('mindmap', JSON.stringify(this.mindmap));
  }

  updateGoalProgress(goalId, progress) {
    const goal = this.goals.find(g => g.id === goalId);
    if (goal) {
      goal.progress = Math.min(100, Math.max(0, progress));
      goal.status = goal.progress >= 100 ? 'completed' : 'in-progress';
      this.saveGoals();
      this.renderCalendar();
      this.renderGoalsList();
    }
  }

  changeMonth(delta) {
    this.currentDate.setMonth(this.currentDate.getMonth() + delta);
    this.renderCalendar();
  }

  renderCalendar() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    
    this.monthDisplay.textContent = new Date(year, month, 1)
      .toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDayOfWeek = firstDay.getDay();
    const totalDays = lastDay.getDate();

    this.calendarGrid.innerHTML = '';

    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const dayElement = this.createDayElement(prevMonthLastDay - i, true);
      this.calendarGrid.appendChild(dayElement);
    }

    for (let day = 1; day <= totalDays; day++) {
      const date = new Date(year, month, day);
      const dayElement = this.createDayElement(day, false, date);
      this.calendarGrid.appendChild(dayElement);
    }

    const remainingDays = 42 - (startingDayOfWeek + totalDays);
    for (let day = 1; day <= remainingDays; day++) {
      const dayElement = this.createDayElement(day, true);
      this.calendarGrid.appendChild(dayElement);
    }
  }

  createDayElement(day, isOtherMonth, date) {
    const dayElement = document.createElement('div');
    dayElement.className = `calendar-day${isOtherMonth ? ' other-month' : ''}`;
    
    const dateDisplay = document.createElement('div');
    dateDisplay.className = 'date';
    dateDisplay.textContent = day;
    dayElement.appendChild(dateDisplay);

    if (date && !isOtherMonth) {
      const dayGoals = this.goals.filter(goal => {
        const goalDate = new Date(goal.deadline);
        return goalDate.getDate() === date.getDate() &&
               goalDate.getMonth() === date.getMonth() &&
               goalDate.getFullYear() === date.getFullYear();
      });

      dayGoals.forEach(goal => {
        const goalElement = document.createElement('div');
        goalElement.className = `goal ${goal.status}`;
        goalElement.textContent = goal.title;
        goalElement.title = `${goal.description}\nProgress: ${goal.progress}%`;
        dayElement.appendChild(goalElement);
      });
    }

    return dayElement;
  }

  renderGoalsList() {
    this.goalsListElement.innerHTML = '';
    
    let filteredGoals = this.goals;
    if (this.currentFilter !== 'all') {
      filteredGoals = this.goals.filter(goal => goal.status === this.currentFilter);
    }

    const sortedGoals = filteredGoals.sort((a, b) => 
      new Date(a.deadline) - new Date(b.deadline)
    );

    sortedGoals.forEach(goal => {
      const goalElement = document.createElement('div');
      goalElement.className = 'goal-item';
      
      const deadline = new Date(goal.deadline);
      const formattedDate = deadline.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      goalElement.innerHTML = `
        <h3>
          ${goal.title}
          <span class="goal-status ${goal.status}">${goal.status === 'completed' ? 'Completed' : 'In Progress'}</span>
        </h3>
        <p>${goal.description}</p>
        <div class="goal-progress">
          <div class="progress-bar" style="width: ${goal.progress}%"></div>
        </div>
        <div class="goal-details">
          <span class="goal-deadline">Deadline: ${formattedDate}</span>
          <span> <span>Progress: ${goal.progress}%</span>
        </div>
      `;

      this.goalsListElement.appendChild(goalElement);
    });
  }

  initializeMindMap() {
    this.isConnectingNodes = false;
    this.selectedNode = null;
    this.renderMindMap();
    this.setupMindMapEventListeners();
  }

  setupMindMapEventListeners() {
    this.mindmapCanvas.addEventListener('mousedown', (e) => {
      if (e.target.classList.contains('mindmap-node')) {
        this.startDragging(e.target, e);
      }
    });

    document.addEventListener('mousemove', (e) => {
      if (this.draggedNode) {
        this.dragNode(e);
      }
    });

    document.addEventListener('mouseup', () => {
      if (this.draggedNode) {
        this.stopDragging();
      }
    });
  }

  startDragging(node, event) {
    if (this.isConnectingNodes) {
      if (!this.selectedNode) {
        // First node selection
        this.selectedNode = node;
        node.style.boxShadow = '0 0 0 3px var(--primary-color)';
        node.classList.add('node-selected');
      } else if (this.selectedNode !== node) {
        // Second node selection - create connection
        this.createConnection(this.selectedNode, node);
        this.selectedNode.style.boxShadow = '';
        this.selectedNode.classList.remove('node-selected');
        this.selectedNode = null;
        this.isConnectingNodes = false;
        this.addConnectionBtn.classList.remove('active');
        // Remove connectable state from all nodes
        document.querySelectorAll('.mindmap-node').forEach(node => {
          node.classList.remove('node-connectable');
        });
      }
      return;
    }

    // Normal drag behavior
    this.draggedNode = node;
    this.dragOffset = {
      x: event.clientX - node.offsetLeft,
      y: event.clientY - node.offsetTop
    };
  }

  dragNode(event) {
    if (!this.draggedNode) return;

    const x = event.clientX - this.dragOffset.x;
    const y = event.clientY - this.dragOffset.y;

    this.draggedNode.style.left = `${x}px`;
    this.draggedNode.style.top = `${y}px`;

    const nodeId = this.draggedNode.dataset.id;
    const node = this.mindmap.nodes.find(n => n.id === nodeId);
    if (node) {
      node.x = x;
      node.y = y;
      this.updateConnections();
    }
  }

  stopDragging() {
    if (this.draggedNode) {
      this.draggedNode = null;
      this.saveMindMap();
    }
  }

  addMindMapNode() {
    const title = prompt('Enter node title:');
    if (!title) return;

    const node = {
      id: Date.now().toString(),
      title,
      x: this.mindmapCanvas.clientWidth / 2 - 60,
      y: this.mindmapCanvas.clientHeight / 2 - 20
    };

    this.mindmap.nodes.push(node);
    this.renderMindMap();
    this.saveMindMap();
  }

  toggleConnectionMode() {
    this.isConnectingNodes = !this.isConnectingNodes;
    this.addConnectionBtn.classList.toggle('active');
    
    if (!this.isConnectingNodes) {
      if (this.selectedNode) {
        this.selectedNode.style.boxShadow = '';
        this.selectedNode = null;
      }
      document.querySelectorAll('.mindmap-node').forEach(node => {
        node.classList.remove('node-connectable');
      });
    } else {
      document.querySelectorAll('.mindmap-node').forEach(node => {
        node.classList.add('node-connectable');
      });
    }
  }

  createConnection(fromNode, toNode) {
    const exists = this.mindmap.connections.some(conn => 
      (conn.fromId === fromNode.dataset.id && conn.toId === toNode.dataset.id) ||
      (conn.fromId === toNode.dataset.id && conn.toId === fromNode.dataset.id)
    );

    if (!exists) {
      const connection = {
        id: Date.now().toString(),
        fromId: fromNode.dataset.id,
        toId: toNode.dataset.id
      };

      this.mindmap.connections.push(connection);
      this.renderMindMap();
      this.saveMindMap();
    }
  }

  updateConnections() {
    requestAnimationFrame(() => {
      const connections = this.mindmapCanvas.querySelectorAll('.mindmap-connection path');
      connections.forEach(connection => {
        const fromId = connection.parentElement.dataset.from;
        const toId = connection.parentElement.dataset.to;
        const fromNode = this.mindmapCanvas.querySelector(`[data-id="${fromId}"]`);
        const toNode = this.mindmapCanvas.querySelector(`[data-id="${toId}"]`);

        if (fromNode && toNode) {
          const path = this.calculateConnectionPath(fromNode, toNode);
          connection.setAttribute('d', path);
        }
      });
    });
  }

  calculateConnectionPath(fromNode, toNode) {
    const from = {
      x: fromNode.offsetLeft + fromNode.offsetWidth / 2,
      y: fromNode.offsetTop + fromNode.offsetHeight / 2
    };

    const to = {
      x: toNode.offsetLeft + toNode.offsetWidth / 2,
      y: toNode.offsetTop + toNode.offsetHeight / 2
    };

    const dx = Math.abs(to.x - from.x);
    const dy = Math.abs(to.y - from.y);
    const curve = Math.min(dx / 2, 100); // Limit curve size

    return `M ${from.x} ${from.y} 
            C ${from.x + curve} ${from.y}
              ${to.x - curve} ${to.y}
              ${to.x} ${to.y}`;
  }

  renderMindMap() {
    this.mindmapCanvas.innerHTML = '';

    const svgContainer = document.createElement('div');
    svgContainer.className = 'mindmap-connection';
    svgContainer.innerHTML = '<svg><defs><marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor"/></marker></defs></svg>';
    this.mindmapCanvas.appendChild(svgContainer);

    // Draw connections between nodes
    this.mindmap.connections.forEach(connection => {
      const fromNode = this.mindmap.nodes.find(n => n.id === connection.fromId);
      const toNode = this.mindmap.nodes.find(n => n.id === connection.toId);
      
      if (fromNode && toNode) {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        svgContainer.querySelector('svg').appendChild(path);
        path.setAttribute('stroke', 'currentColor');
        path.setAttribute('stroke-width', '2');
      }
    });

   
    this.mindmap.nodes.forEach(node => {
      const nodeElement = document.createElement('div');
      nodeElement.className = 'mindmap-node';
      nodeElement.dataset.id = node.id;
      nodeElement.textContent = node.title;
      nodeElement.style.left = `${node.x}px`;
      nodeElement.style.top = `${node.y}px`;
      this.mindmapCanvas.appendChild(nodeElement);
    });

    this.updateConnections();
  }

  clearMindMap() {
    if (confirm('Are you sure you want to clear the mind map?')) {
      this.mindmap = { nodes: [], connections: [] };
      this.renderMindMap();
      this.saveMindMap();
    }
  }
}

const goalTracker = new GoalTracker();