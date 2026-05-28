# VedaAI-Assignment

Full Stack Engineering Assignment Submission

This project was built as part of a Full Stack Engineering assignment focused on creating an AI-powered assessment generation platform for schools and educators.

The goal of the assignment was to design and develop a production-ready system where teachers can create assignments, upload reference material, generate AI-based question papers, and download professionally formatted PDFs.

I implemented the complete full-stack workflow including frontend, backend APIs, AI integration, realtime updates, PDF generation, background workers, and deployment-ready architecture.

🔗 Project Links
Repository: https://github.com/RashmiAg27/Veda-AI-Assignment
Deployed Application: https://veda-ai-assignment-two.vercel.app/
---

## ✨ Features Implemented

### 🧠 AI-Powered Question Generation

* Integrated Google Gemini AI for dynamic question paper generation
* Built context-aware paper generation using uploaded reference material
* Implemented automatic answer key generation
* Added support for custom instructions and difficulty levels

### 📝 Flexible Exam Structure

Implemented support for multiple question formats:

* MCQs
* Short Answer Questions
* Long Answer Questions
* Custom section-wise marks distribution
* Dynamic question count configuration

### 📄 Professional PDF Export

* Built printable exam-style PDF generation using Puppeteer
* Implemented school-style formatting and layouts
* Added downloadable ready-to-print PDFs
* Structured clean and readable paper formatting

### ⚡ Real-Time Experience

* Implemented live generation updates using Socket.io
* Added section-wise regeneration without regenerating the full paper
* Built async generation workflows using BullMQ + Redis
* Improved responsiveness with realtime progress tracking

### 🏫 Teacher Workflow Management

* Developed assignment management dashboard
* Implemented class/group management system
* Added paper history and retrieval APIs
* Built responsive interfaces for desktop and mobile devices
* Implemented dark/light mode support

### 🎨 Modern UI/UX

* Built fully responsive UI using Next.js and Tailwind CSS
* Added smooth animations using Framer Motion
* Designed clean and intuitive user flows
* Focused on accessibility and user experience
---


## 🛠 Tech Stack

| Layer                  | Technology                                 |
| ---------------------- | ------------------------------------------ |
| Frontend               | Next.js 16, Tailwind CSS v4, Framer Motion |
| State Management       | Zustand                                    |
| Realtime Communication | Socket.io                                  |
| Queue & Background Job | BullMQ + Redis                             |
| Backend                | Express.js + TypeScript                    |
| Database               | MongoDB Atlas                              |
| AI Integration         | Google Gemini API                          |
| PDF Generation         | Puppeteer                                  |
| Validation             | Zod                                        |


---

## 📁 Project Structure

```bash
Veda-AI-Assignment/
│
├── backend/        # Express + TypeScript API
├── frontend/       # Next.js frontend
└── README.md
```

---

# 🔌 API Endpoints

## Assignments

| Method | Endpoint               | Description                          |
| ------ | ---------------------- | ------------------------------------ |
| GET    | `/api/assignments`     | Get all assignments                  |
| POST   | `/api/assignments`     | Create assignment and generate paper |
| DELETE | `/api/assignments/:id` | Delete assignment                    |

---

## Papers

| Method | Endpoint                                       | Description                |
| ------ | ---------------------------------------------- | -------------------------- |
| GET    | `/api/papers/:assignmentId`                    | Get generated paper        |
| POST   | `/api/papers/:assignmentId/pdf`                | Generate and download PDF  |
| POST   | `/api/papers/:assignmentId/regenerate-section` | Regenerate a paper section |

---

## Groups

| Method | Endpoint          | Description    |
| ------ | ----------------- | -------------- |
| GET    | `/api/groups`     | Get all groups |
| POST   | `/api/groups`     | Create group   |
| DELETE | `/api/groups/:id` | Delete group   |

---

## Miscellaneous

| Method | Endpoint     | Description           |
| ------ | ------------ | --------------------- |
| GET    | `/api/stats` | Dashboard statistics  |
| GET    | `/health`    | Health check endpoint |

---

# ☁️ Deployment

| Service  | Platform      |
| -------- | ------------- |
| Frontend | Vercel        |
| Backend  | Railway       |
| Database | MongoDB Atlas |

### Deployment Notes

* Set frontend root directory to: `frontend`
* Set backend root directory to: `backend`
* Configure environment variables on both platforms before deployment

---

# 🔮 Future Improvements

* Role-based authentication
* Multi-language paper generation
* Teacher collaboration features
* AI difficulty tuning
* Question bank storage and reuse

---


# 📜 License

This project is licensed under the MIT License.

---

# 👩‍💻 Author

Developed by **Rashmi Agrawal**

If you found this project helpful, consider giving it a ⭐ on GitHub.
