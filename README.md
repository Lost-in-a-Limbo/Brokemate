# Brokemate 💰# Brokemate# Brokemate



**Your comprehensive personal finance companion** - A full-stack expense management application with AI-powered insights.



## ✨ FeaturesYour personal finance companion - helping you make smart financial decisions.Your personal finance companion - helping you make smart financial decisions.



### 🎨 Beautiful Landing Page

- Modern React-based design with financial-focused styling

- Responsive layout that works on all devices## Features---

- Smooth animations and transitions

- Professional color scheme (Navy, Teal, Green, Gold)



### 💼 Complete Expense Management- Modern React-based landing page## 🚀 Features

- **Add, Edit, Delete Expenses** - Full CRUD operations

- **Category-based Organization** - Food, Transport, Shopping, Utilities, etc.- Responsive design with financial-focused styling

- **Visual Analytics** - Beautiful pie charts showing spending distribution

- **Smart Flagging** - Mark expenses as good (green) or concerning (red)- User authentication system- **Tailored Financial Assistance**  

- **Real-time Overview** - Total expenses, transaction count, averages

- Clean and intuitive interface  Personalized guidance to manage finances according to each user’s unique goals and situation.

### 🤖 AI-Powered Insights

- **Expense Analysis** - Get personalized spending insights

- **Interactive Chat** - Ask questions about your finances

- **Smart Recommendations** - Budgeting tips and financial advice## Tech Stack- **Monthly Budget Consideration**  

- **Category Breakdown** - Understand your spending patterns

  Budget-aware recommendations that align with users' financial capabilities and help with future planning.

### 🔐 Secure Authentication

- User registration and login system- **Frontend:** React 18.2.0 with Vite

- JWT token-based security

- Protected routes and API endpoints- **Styling:** CSS Modules- **Comprehensive Expense Tracking**  

- Session management

- **Routing:** React Router DOM  Robust tools to log and analyze expenses, ensuring users remain within budget.

## 🛠️ Tech Stack



### Frontend

- **React 18.2.0** with Vite for fast development## Installation- **Personalized Investment Suggestions**  

- **Recharts** for beautiful data visualization

- **Lucide React** for modern icons  Investment opportunities tailored to user preferences and objectives, enhancing their financial journey.

- **CSS Modules** with custom color variables

- **React Router DOM** for navigation1. Clone the repository:



### Backend   ```bash---

- **FastAPI** - Modern Python web framework

- **JWT Authentication** - Secure user sessions   git clone https://github.com/Lost-in-a-Limbo/Brokemate.git

- **Pydantic** - Data validation and serialization

- **Uvicorn** - High-performance ASGI server   cd Brokemate## 🛠️ Tech Stack

- **CORS enabled** - Frontend-backend communication

   ```

## 🚀 Quick Start

- **Frontend:** [React / HTML, CSS, JS] *(adjust based on what you’re actually using)*  

### 1. Clone the Repository

```bash2. Install dependencies:- **Backend:** [Node.js / Express / Django / etc.]  

git clone https://github.com/Lost-in-a-Limbo/Brokemate.git

cd Brokemate   ```bash- **Database:** [MongoDB / MySQL / PostgreSQL]  

```

   npm install- **APIs:** [List any financial APIs if applicable]  

### 2. Setup Frontend

```bash   ```

# Install dependencies

npm install*(Update these with your actual stack.)*



# Start development server3. Start the development server:

npm run dev

```   ```bash---

Frontend will be available at `http://localhost:5173`

   npm run dev

### 3. Setup Backend

```bash   ```## 📦 Installation

# Navigate to backend directory

cd backend



# Run setup script (creates venv and installs dependencies)4. Open your browser and navigate to `http://localhost:5173`1. Clone the repository:

./setup.sh

   ```bash

# Or manual setup:

python3 -m venv venv## Project Structure   git clone https://github.com/your-username/brokemate.git

source venv/bin/activate

pip install -r requirements.txt   cd brokemate



# Start the backend server```

python main.pysrc/

```├── components/

Backend API will be available at `http://localhost:8000`│   ├── Header/

│   ├── Hero/

### 4. Access the Application│   ├── Features/

- **Landing Page**: `http://localhost:5173`│   ├── Stats/

- **Expense Manager**: `http://localhost:5173/expenses`│   ├── CTA/

- **API Documentation**: `http://localhost:8000/docs`│   ├── Footer/

│   └── Login/

## 📁 Project Structure├── pages/

│   └── LandingPage/

```└── App.jsx

Brokemate/```

├── src/                          # React frontend

│   ├── components/               # Reusable components## Available Scripts

│   │   ├── Header.jsx           # Navigation header

│   │   ├── Hero.jsx             # Landing page hero- `npm run dev` - Start development server

│   │   ├── Features.jsx         # Feature showcase- `npm run build` - Build for production

│   │   ├── AuthPage.jsx         # Login/Register- `npm run preview` - Preview production build

│   │   ├── ExpenseComponents.jsx # Expense management UI

│   │   └── ...## Contributing

│   ├── styles/                  # CSS modules & global styles

│   │   ├── global.css           # Color scheme & base styles1. Fork the repository

│   │   ├── ExpenseManager.module.css2. Create your feature branch (`git checkout -b feature/AmazingFeature`)

│   │   └── ...3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)

│   └── App.jsx                  # Main app component4. Push to the branch (`git push origin feature/AmazingFeature`)

├── backend/                     # FastAPI backend5. Open a Pull Request

│   ├── main.py                 # API server & endpoints

│   ├── requirements.txt        # Python dependencies## License

│   └── setup.sh               # Backend setup script

├── package.json               # Frontend dependenciesThis project is licensed under the MIT License.
└── README.md                 # This file
```

## 🎨 Color Scheme

The application uses a carefully crafted financial color palette:

- **Primary Navy**: `#1a365d` - Headers, primary text
- **Primary Blue**: `#2563eb` - Accents, buttons
- **Primary Teal**: `#0891b2` - Highlights, links
- **Secondary Green**: `#10b981` - Success, positive actions
- **Accent Gold**: `#f59e0b` - Important metrics, warnings
- **Neutral Grays**: Professional backgrounds and text

## 🔧 Available Scripts

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Backend
- `python main.py` - Start FastAPI server
- `./setup.sh` - Setup backend environment

## 🚀 API Endpoints

### Authentication
- `POST /register` - Create new user account
- `POST /token` - Login and get access token

### Expense Management
- `GET /expenses` - Get all user expenses
- `POST /add-expense` - Add new expense
- `PUT /edit-expense/{id}` - Update expense
- `DELETE /delete-expense/{id}` - Delete expense
- `POST /flag-expense` - Flag expense as good/bad

### AI Features
- `POST /analyze` - Get AI expense analysis
- `POST /chat` - Chat with AI assistant

## 🔒 Security

- JWT token-based authentication
- Password hashing with bcrypt
- CORS protection configured
- Protected API routes
- Secure session management

## 🌟 Key Features Demo

1. **Beautiful Landing Page** - Professional design showcasing features
2. **Seamless Navigation** - Smooth transitions between pages
3. **Expense Tracking** - Add expenses with categories and descriptions
4. **Visual Analytics** - Pie charts showing spending distribution
5. **AI Insights** - Get personalized financial advice
6. **Responsive Design** - Works perfectly on mobile and desktop

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

---

**Built with ❤️ for better financial management**