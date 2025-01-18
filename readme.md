# GoalFlow - Goal Tracking Application

A modern web application for tracking goals, visualizing deadlines with a calendar, and creating mind maps for better goal planning.

## Features

- **Calendar View**
  - Monthly calendar display
  - Visual goal tracking on specific dates
  - Progress indicators for each goal

- **Goal Management**
  - Create and track goals
  - Set deadlines and progress
  - Filter goals by status (All/In Progress/Completed)
  - Progress tracking with visual indicators

- **Mind Mapping**
  - Create concept nodes
  - Connect related ideas
  - Drag and drop interface
  - Visual connections between nodes

## Installation

1. Clone the repository:
```bash
git clone [repository-url]
```

# Study Case: Challenges & Solutions

### Challenge 1: Mind Map Connections Not Showing
**Problem:** When connecting two nodes, the lines weren't appearing.
**Solution:** 
- Found that SVG elements needed proper namespace
- Added z-index to ensure connections appear below nodes
- Fixed path calculation for proper positioning

### Challenge 2: Data Persistence Issues
**Problem:** Goals and mind map data disappeared on page refresh.
**Solution:**
- Implemented localStorage to save data
- Added automatic save on every change
- Created backup/restore functionality

### Challenge 3: Drag & Drop Bugs
**Problem:** Nodes jumped to wrong positions when dragging.
**Solution:**
- Calculated correct offset positions
- Added mouse position tracking
- Updated connection lines in real-time

### Challenge 4: Calendar Integration
**Problem:** Goals weren't syncing with calendar view.
**Solution:**
- Created date-based indexing
- Added visual indicators for goal dates
- Implemented proper date filtering

