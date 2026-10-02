# Examify — Online Exam Management System

A complete frontend-only online examination management project using HTML, CSS and vanilla JavaScript.

## Features

### Student
- Login
- Dashboard
- Available exams
- Exam instructions
- Question palette
- Previous/Next navigation
- Countdown timer
- Automatic submission when timer ends
- Automatic scoring
- Results
- Result history
- Profile
- LocalStorage persistence

### Admin
- Admin login
- Dashboard statistics
- Create and publish exams
- Add multiple-choice questions
- Delete questions while creating an exam
- Manage exams
- Delete exams
- Student list
- Result monitoring

## Demo Login

Student:
- Email: student@example.com
- Password: student123

Admin:
- Email: admin@example.com
- Password: admin123

## Run

Open `index.html` in a browser.

No backend is required for this version. Browser localStorage is used as the data layer.

## Backend Extension

The frontend can later be connected to Node.js/Express, Java/Spring Boot, PHP/Laravel, Firebase, MySQL, PostgreSQL or MongoDB.


## Added in the department/performance update
- Student registration with department/branch selection (CSE, ECE, EEE, Mechanical, Civil, IT).
- Department-specific exams plus an All Departments option for administrators.
- Students only see exams assigned to their department.
- Each student can submit a particular exam only once; completed exams are locked.
- Admin student management now shows department, attempts, average score, and passed count.
- Admin department performance table shows student count, attempts, average score, and pass rate.
- Existing v1 localStorage data is migrated automatically.
