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

const ARJUN_RESUME = `Arjun Mehta
B.Tech IT, 1st Year | arjun.mehta@example.com | arjunmehta.dev

EDUCATION
Acropolis Institute of Technology and Research, Indore
B.Tech Information Technology (2026 - 2030)

SKILLS
HTML, CSS, JavaScript, React, Bootstrap, Figma, Git

PROJECTS
Portfolio Website
- Made my personal portfolio website with React and Bootstrap
- Worked on the design in Figma and made it look good on phones

Weather App
- Built a weather app that calls the OpenWeather API with fetch and shows a 5-day forecast
- Responsible for handling errors and loading states

ACTIVITIES
- Helped organise the coding club's web dev workshop`;

const SANA_RESUME = `Sana Qureshi
B.Tech CSE (Data Science), 2nd Year | sana.q@example.com

EDUCATION
Acropolis Institute of Technology and Research, Indore
B.Tech CSE - Data Science (2025 - 2029), CGPA 8.9

SKILLS
Python, Pandas, NumPy, Matplotlib, MySQL, Excel, Google Sheets

PROJECTS
Canteen Sales Analysis
- Worked on canteen sales data in Excel and made charts for the committee
- Wrote MySQL queries with joins to find the top selling items each month

Student Attendance Insights
- Did exploratory analysis of attendance records using Pandas and Matplotlib
- Involved in presenting the findings to the department

CERTIFICATIONS
- Google Data Analytics (Coursera)`;

const KABIR_RESUME = `Kabir Singh
B.Tech CSE (AI & ML), 2nd Year | kabir.singh@example.com | github.com/kabirsingh

EDUCATION
Acropolis Institute of Technology and Research, Indore
B.Tech CSE - AI & ML (2025 - 2029), CGPA 8.1

SKILLS
Python, NumPy, Pandas, scikit-learn, Keras, OpenCV, Git

PROJECTS
Plant Disease Detector
- Trained a CNN in Keras on 4,000 leaf images to classify 6 plant diseases with 91% accuracy
- Worked on data augmentation to improve results

Spam Classifier
- Made a spam classifier with scikit-learn and TF-IDF features
- Tried different models and picked the best one

ACHIEVEMENTS
- Participated in a college ML hackathon`;

/** Gallery samples. `image` is optional: drop a PNG at client/public/samples/<id>.png to show it. */
export const SAMPLES = [
  { id: 'riya-sde', name: 'Riya Verma', persona: '2nd year · CSE', presetId: 'sde', focus: 'Full-stack projects, vague bullets', resume: SAMPLE_RESUME },
  { id: 'arjun-frontend', name: 'Arjun Mehta', persona: '1st year · IT', presetId: 'frontend', focus: 'Frontend beginner, few metrics', resume: ARJUN_RESUME },
  { id: 'sana-data', name: 'Sana Qureshi', persona: '2nd year · Data Science', presetId: 'data', focus: 'Analysis work, weak openers', resume: SANA_RESUME },
  { id: 'kabir-ml', name: 'Kabir Singh', persona: '2nd year · AI & ML', presetId: 'ml', focus: 'One strong bullet, rest vague', resume: KABIR_RESUME },
];
