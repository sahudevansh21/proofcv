// Demo data. The sample resume is deliberately written so all three skill buckets appear
// (matched / worded differently / not found) and several bullets are weak.

export const SAMPLE_RESUME = `Riya Verma
B.Tech CSE, 2nd Year | riya.verma@example.com | github.com/riyaverma

EDUCATION
Acropolis Institute of Technology and Research, Indore
B.Tech Computer Science (2025 - 2029), CGPA 8.4

SKILLS
JavaScript, HTML, CSS, React, Node.js, Express, MongoDB, Python, C++, GitHub

PROJECTS
College Fest Website
- Worked on a website for the college tech fest using React and Tailwind
- Made the site mobile-friendly and added a registration form
- Helped the team connect the frontend to Express endpoints for registrations

Expense Tracker
- Responsible for building an expense tracker with Node.js and MongoDB
- Did testing of various features etc.

Movie Recommender
- Involved in training a model in Python using Pandas to recommend movies

ACHIEVEMENTS
- Participated in Smart India Hackathon internal round
- Solved 150+ problems on LeetCode`;

export const PRESETS = [
  {
    id: 'sde',
    role: 'Software Engineering Intern',
    jd: `Software Development Engineer Intern - Summer 2027

About the role
You will work with our platform team to build and ship backend features used by thousands of customers.

Requirements:
- Strong fundamentals in Data Structures and Algorithms and OOP
- Proficiency in at least one of Java, C++ or Python
- Experience building REST APIs with Node.js or a similar framework
- Familiarity with SQL databases
- Working knowledge of version control (Git)

Nice to have:
- Exposure to Docker and cloud platforms (AWS or GCP)
- Experience with React and responsive design
- Unit testing experience`,
  },
  {
    id: 'frontend',
    role: 'Frontend Developer Intern',
    jd: `Frontend Developer Intern

What you'll do
Build fast, accessible interfaces for our web dashboard with the design team.

Must have:
- Strong JavaScript, HTML and CSS
- Experience with React (hooks, state management with Redux is a plus)
- Responsive design across mobile and desktop
- Consuming REST APIs
- Git and GitHub workflow

Good to have:
- TypeScript
- Next.js
- Tailwind CSS
- Figma and basic UI/UX sense
- Unit testing with Jest`,
  },
  {
    id: 'data',
    role: 'Data Analyst Intern',
    jd: `Data Analyst Intern

Responsibilities
Turn raw business data into dashboards and insights for the operations team.

Requirements:
- Strong SQL skills
- Python with Pandas and NumPy
- Excel (pivot tables, lookups)
- Data visualization using Power BI or Tableau
- Basic statistics
- Clear communication of findings

Preferred:
- Machine learning basics
- Experience with Google Cloud (BigQuery)`,
  },
  {
    id: 'ml',
    role: 'Machine Learning Intern',
    jd: `Machine Learning Intern

Requirements:
- Python, NumPy and Pandas
- Machine learning fundamentals and scikit-learn
- Deep learning with TensorFlow or PyTorch
- Statistics and data analysis
- Git

Bonus:
- NLP or computer vision projects
- Generative AI / LLM experience
- Deployment of models with Docker or FastAPI`,
  },
];
