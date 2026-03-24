# Basic Functionality Test Plan

## Core Workflow Test

### 1. Authentication Test

- [ ] User can sign up with email/password
- [ ] User can sign in with existing credentials
- [ ] User session persists after login

### 2. Week Management Test

- [ ] User can start a new week
- [ ] Week shows 7 days (Monday-Sunday)
- [ ] Current day is highlighted as "today"
- [ ] User can navigate between weeks
- [ ] Week status shows "In Progress" when active

### 3. Skill Management Test

- [ ] User can add a skill with target days per week (1-7)
- [ ] Skill appears in the skills list
- [ ] User can edit skill name and frequency
- [ ] User can remove skills
- [ ] After adding/editing skills, they are distributed across the current week

### 4. Daily Tracking Test

- [ ] Today's tasks appear in the "Today's Tasks" section
- [ ] User can mark skills as completed for today
- [ ] Day status updates when skills are marked complete:
  - All skills complete → "completed"
  - Some skills complete → "today"
  - No skills complete → "empty" or "today" (if current day)
- [ ] Day dots change color based on status:
  - Green = completed
  - Red = missed
  - Blue = today
  - Gray = empty

### 5. Data Persistence Test

- [ ] Skills persist after page refresh
- [ ] Week progress persists after page refresh
- [ ] Task completion status persists after page refresh
- [ ] User can navigate to previous weeks and see historical data

## Expected Behavior

### Week Creation

1. When user clicks "Start New Week", a new 7-day week is created
2. Days are created from Monday to Sunday
3. Current day is marked as "today", others as "empty"
4. User state is updated with current week ID

### Skill Distribution

1. When skills are added/edited, `distributeSkills` mutation runs
2. Skills are distributed across the 7 days based on target frequency
3. Each skill appears on the specified number of days
4. Distribution is even across the week

### Task Completion

1. When user checks a task, `toggleSkill` mutation runs
2. Day status updates based on completion of all skills for that day
3. Day dots update color to reflect new status
4. UI reflects the change immediately

### Day Updates

1. When user clicks "Update Day", missed days are processed
2. Days with incomplete skills become "missed"
3. Days with all skills complete become "completed"
4. Today's status is set to "today"

## Edge Cases to Handle

1. **Multiple Skills**: Ensure skills don't overlap incorrectly
2. **Skill Removal**: Removing skills should clean up daySkills entries
3. **Week Completion**: What happens when a week ends?
4. **Concurrent Updates**: Multiple users or rapid clicks
5. **Invalid Data**: Handle edge cases gracefully

## Success Criteria

- [ ] All core functions work without errors
- [ ] Data is properly stored and retrieved
- [ ] UI updates reflect backend changes
- [ ] No data loss during normal usage
- [ ] Application handles edge cases gracefully
