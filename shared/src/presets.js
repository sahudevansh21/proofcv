// Demo data: 30 job postings (top early-career roles in India) and 30 parody sample resumes.
// The names belong to well-known actors and are used for fun only. Every resume is fictional:
// it is not about, written by, affiliated with or endorsed by the person named.
// Each resume is written so all three skill buckets appear (matched / worded differently / not found)
// and several bullets are weak, so the audit has something honest to say.

export const PARODY_NOTICE =
  'Parody samples. These resumes are fictional and use celebrity names for fun. They are not about, written by, or endorsed by the people named.';

const posting = (id, role, track, jd) => ({ id, role, track, jd: jd.trim() });

export const PRESETS = [
  posting('sde', 'Software Developer', 'tech', `
Software Development Engineer Intern - Summer 2027

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
- Unit testing experience`),

  posting('ml', 'AI/ML Engineer', 'tech', `
AI/ML Engineer Intern

Requirements:
- Python, NumPy and Pandas
- Machine learning fundamentals and scikit-learn
- Deep learning with TensorFlow or PyTorch
- Statistics and data analysis
- Git

Bonus:
- NLP or computer vision projects
- Generative AI / LLM experience
- Deployment of models with Docker or FastAPI`),

  posting('data-science', 'Data Scientist', 'tech', `
Data Scientist - Graduate Trainee

What you'll do
Build models that predict customer churn and test them with the product team.

Requirements:
- Strong Python with Pandas and scikit-learn
- Statistics, hypothesis testing and A/B testing
- SQL for pulling and joining data
- Machine learning: regression, classification and model evaluation
- Data visualization and clear communication of results

Nice to have:
- Time series forecasting
- Big data tools such as Apache Spark
- Experience with Jupyter and Git`),

  posting('data', 'Data Analyst', 'tech', `
Data Analyst Intern

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
- Experience with Google Cloud (BigQuery)`),

  posting('cloud-devops', 'Cloud / DevOps Engineer', 'tech', `
Cloud / DevOps Engineer - Fresher

Requirements:
- Linux and Bash scripting
- Docker and containers
- CI/CD pipelines (GitHub Actions or Jenkins)
- At least one cloud platform: AWS, Azure or GCP
- Git and version control
- Computer networks basics (DNS, HTTP, load balancing)

Nice to have:
- Kubernetes
- Terraform
- Nginx`),

  posting('cybersecurity', 'Cybersecurity Specialist', 'tech', `
Cybersecurity Analyst - Associate

Requirements:
- Network security fundamentals and firewalls
- Vulnerability assessment and the OWASP Top 10
- Linux command line
- Log analysis with a SIEM such as Splunk
- Computer networks (TCP/IP, DNS)
- Clear report writing

Nice to have:
- Penetration testing certifications or CTF experience
- Python scripting
- Wireshark`),

  posting('fullstack-mobile', 'Full-Stack / Mobile App Developer', 'tech', `
Full-Stack / Mobile App Developer Intern

Must have:
- JavaScript or TypeScript
- React for web, and React Native or Flutter for mobile
- Node.js and Express
- REST APIs and authentication
- MongoDB or PostgreSQL
- Git and GitHub

Good to have:
- Firebase
- Deployment on Vercel or AWS
- Unit testing`),

  posting('qa', 'QA / Test Engineer', 'tech', `
QA / Test Engineer - Trainee

Requirements:
- Manual testing and writing test cases
- Bug tracking with Jira
- Regression testing
- API testing with Postman
- Basic SQL
- Attention to detail and communication

Nice to have:
- Automation testing with Selenium or Cypress
- Java or Python
- Agile / Scrum`),

  posting('product', 'Product Manager', 'tech', `
Associate Product Manager

Requirements:
- User research and customer interviews
- Writing a PRD and user stories
- Building a product roadmap and prioritising features
- Product analytics and SQL
- Strong communication and stakeholder management

Nice to have:
- Figma wireframes
- A/B testing
- Agile and Jira`),

  posting('uiux', 'UI/UX Designer', 'tech', `
UI/UX Designer Intern

Must have:
- Figma
- Wireframing and prototyping
- User research and usability testing
- Design systems and components
- Responsive design for mobile and web

Good to have:
- Accessibility (WCAG)
- Adobe XD or Photoshop
- Basic HTML and CSS`),

  posting('business-analyst', 'Business Analyst', 'tech', `
Business Analyst - Graduate

Requirements:
- Requirements gathering and writing a BRD
- Stakeholder management
- Process mapping
- SQL and Excel
- Data visualization with Power BI or Tableau
- Communication

Nice to have:
- Agile and Jira
- Market research`),

  posting('digital-marketing', 'Digital Marketing Specialist', 'non-tech', `
Digital Marketing Specialist - Fresher

Requirements:
- Social media marketing on Instagram and LinkedIn
- SEO and content marketing
- Google Ads and Meta Ads campaigns
- Google Analytics reporting
- Copywriting
- Excel

Nice to have:
- Email marketing
- Canva for creatives
- A/B testing`),

  posting('sales-bd', 'Sales / Business Development Executive', 'non-tech', `
Business Development Executive

Requirements:
- Lead generation and prospecting
- B2B sales
- Negotiation and communication
- CRM such as Salesforce, HubSpot or Zoho CRM
- Managing a sales pipeline

Nice to have:
- Market research
- Excel
- Microsoft Office`),

  posting('ca', 'Chartered Accountant', 'non-tech', `
Article Assistant / Chartered Accountant Trainee

Requirements:
- Accounting and bookkeeping
- GST and income tax returns
- Statutory audit and internal audit
- Financial reporting under Ind AS
- Tally
- Excel

Nice to have:
- SAP
- Communication with clients`),

  posting('finance', 'Financial Analyst / Banker', 'non-tech', `
Financial Analyst - Graduate Program

Requirements:
- Financial modelling in Excel
- Valuation (DCF and comparables)
- Financial statement analysis
- Credit analysis
- Communication and presentation

Nice to have:
- Bloomberg
- SQL or Python
- Power BI`),

  posting('doctor', 'Doctor / Surgeon', 'non-tech', `
Junior Resident - General Surgery

Requirements:
- MBBS with completed internship
- Patient care on wards and in OPD
- Clinical diagnosis and case presentation
- Emergency medicine and trauma care
- BLS and ACLS certification
- Surgical assistance in the operation theatre

Nice to have:
- Electronic health records
- Research publications
- Communication with patients and families`),

  posting('nurse', 'Nurse / Healthcare Worker', 'non-tech', `
Staff Nurse - Fresher (B.Sc Nursing)

Requirements:
- Patient care and bedside care
- Vital signs monitoring
- Medication administration
- Infection control
- BLS certification
- Communication with patients and families

Nice to have:
- Electronic health records (EMR)
- Emergency care experience
- Teamwork across shifts`),

  posting('civil-services', 'Civil Services Officer (IAS/IPS)', 'non-tech', `
District Administration Fellowship (for Civil Services aspirants)

Requirements:
- Understanding of public administration and governance
- Policy analysis of government schemes
- Current affairs
- Report writing and drafting
- Community outreach
- Communication in English and Hindi

Nice to have:
- Data analysis with Excel
- Leadership in NSS or NCC`),

  posting('teacher', 'Teacher / Professor', 'non-tech', `
Teaching Fellow - Secondary School

Requirements:
- Lesson planning
- Classroom management
- Student assessment and feedback
- Curriculum development
- Communication

Nice to have:
- EdTech tools such as Google Classroom
- Mentoring students
- Excel for maintaining grade records`),

  posting('mech-civil', 'Mechanical / Civil Engineer', 'non-tech', `
Graduate Engineer Trainee - Mechanical / Civil

Requirements:
- AutoCAD
- SolidWorks or STAAD Pro
- Site execution and supervision
- Quantity estimation and BOQ
- Quality control
- Manufacturing processes

Nice to have:
- ANSYS
- Lean Six Sigma
- Microsoft Office`),

  posting('electrical', 'Electrical / Electronics Engineer', 'non-tech', `
Graduate Engineer Trainee - Electrical / Electronics

Requirements:
- Circuit design and analysis
- Power systems and electrical machines
- PLC programming
- Electrical safety standards
- MATLAB

Nice to have:
- PCB design
- Embedded systems
- IoT`),

  posting('hr', 'HR Executive / Recruiter', 'non-tech', `
HR Executive / Recruiter - Fresher

Requirements:
- End-to-end recruitment
- Candidate sourcing on Naukri and LinkedIn
- Onboarding
- Employee engagement
- Excel
- Communication

Nice to have:
- HRIS such as Darwinbox or Zoho People
- Payroll basics`),

  posting('operations', 'Operations / Logistics Manager', 'non-tech', `
Operations / Logistics Management Trainee

Requirements:
- Logistics and last-mile delivery operations
- Inventory management
- Vendor management
- Excel
- Leadership and time management

Nice to have:
- SAP or another ERP
- Lean Six Sigma
- SQL`),

  posting('supply-chain', 'Supply Chain Analyst', 'non-tech', `
Supply Chain Analyst - Graduate

Requirements:
- Supply chain management fundamentals
- Demand forecasting
- Inventory management
- Excel and SQL
- Data analysis

Nice to have:
- SAP
- Power BI
- Python`),

  posting('content', 'Content Writer / Video Creator', 'non-tech', `
Content Writer / Video Creator

Requirements:
- Content writing for blogs and social media
- Copywriting
- Video editing in Premiere Pro or DaVinci Resolve
- Storytelling
- SEO basics

Nice to have:
- Canva
- Social media marketing
- Google Analytics`),

  posting('support', 'Customer Support Executive', 'non-tech', `
Customer Support Executive

Requirements:
- Customer service over phone, chat and email
- Ticketing tools such as Zendesk or Freshdesk
- Conflict resolution and escalation handling
- Communication in English and Hindi
- CSAT focus

Nice to have:
- CRM
- Excel`),

  posting('legal', 'Lawyer / Company Secretary', 'non-tech', `
Legal Associate / Company Secretary Trainee

Requirements:
- Legal research
- Contract drafting
- Corporate law and the Companies Act
- Legal compliance and ROC filings
- Report writing

Nice to have:
- Litigation exposure
- Microsoft Office`),

  posting('pharma', 'Pharma Professional / Researcher', 'non-tech', `
Research Associate - Pharma

Requirements:
- HPLC and analytical techniques
- GMP and GLP
- Clinical trials basics
- Pharmacovigilance
- Documentation

Nice to have:
- Regulatory affairs
- Excel
- Statistics`),

  posting('ecommerce', 'E-commerce Manager', 'non-tech', `
E-commerce Executive / Manager Trainee

Requirements:
- Marketplace management (Amazon Seller Central, Flipkart)
- Catalog management
- Shopify
- Google Analytics
- Conversion rate optimization
- Excel

Nice to have:
- Google Ads
- Inventory management`),

  posting('founder', 'Entrepreneur / Startup Founder', 'non-tech', `
Founder's Office Associate / Incubator Cohort

Requirements:
- Business planning
- Go-to-market
- Fundraising
- P&L management and unit economics
- Market research
- Leadership

Nice to have:
- Sales
- Digital marketing`),
];

const sample = (id, name, persona, presetId, focus, resume) => ({ id, name, persona, presetId, focus, resume: resume.trim() });

export const SAMPLES = [
  sample('srk', 'Shah Rukh Khan', '2nd year · B.Tech CSE', 'sde', 'Full-stack projects, vague bullets', `
Shah Rukh Khan
B.Tech CSE, 2nd Year | shahrukh.khan@example.com | github.com/example-srk

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
- Solved 150+ problems on LeetCode`),

  sample('amitabh', 'Amitabh Bachchan', '3rd year · B.Tech AI & ML', 'ml', 'One strong bullet, rest vague', `
Amitabh Bachchan
B.Tech CSE (AI & ML), 3rd Year | amitabh.bachchan@example.com | github.com/example-ab

EDUCATION
Acropolis Institute of Technology and Research, Indore
B.Tech CSE - AI & ML (2024 - 2028), CGPA 8.1

SKILLS
Python, NumPy, Pandas, scikit-learn, Keras, OpenCV, Git

PROJECTS
Plant Disease Detector
- Trained a CNN in Keras on 4,000 leaf images to classify 6 plant diseases with 91% accuracy
- Worked on data augmentation to improve results

Spam Classifier
- Made a spam classifier with scikit-learn and TF-IDF features
- Tried different models and picked the best one

Voice Notes Summariser
- Involved in building a chatbot that summarises lecture notes using the Gemini API

ACHIEVEMENTS
- Participated in a college ML hackathon`),

  sample('salman', 'Salman Khan', 'Final year · B.Sc Statistics', 'data-science', 'Strong stats, light on ML wording', `
Salman Khan
B.Sc Statistics, Final Year | salman.khan@example.com

EDUCATION
Holkar Science College, Indore
B.Sc Statistics and Computer Science (2023 - 2026), 81%

SKILLS
Python, Pandas, NumPy, Matplotlib, Seaborn, MySQL, Excel, Jupyter

PROJECTS
Gym Membership Churn
- Worked on predicting which gym members would leave using logistic regression in Python
- Cleaned 12,000 rows of membership data and removed duplicates and outliers
- Made charts in Seaborn to show which plans people quit most

Exam Score Study
- Did hypothesis testing on 2 years of exam scores to check if extra classes helped

INTERNSHIPS
Analytics Intern, Local Retail Chain (May - July 2025)
- Responsible for pulling weekly sales with SQL queries and joins
- Helped present the findings to the store managers

CERTIFICATIONS
- IBM Data Science Professional Certificate (Coursera)`),

  sample('aamir', 'Aamir Khan', '2nd year · B.Tech CSE (Data Science)', 'data', 'Analysis work, weak openers', `
Aamir Khan
B.Tech CSE (Data Science), 2nd Year | aamir.khan@example.com

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
- Google Data Analytics (Coursera)`),

  sample('akshay', 'Akshay Kumar', 'Final year · B.Tech IT', 'cloud-devops', 'Hands-on deploys, little cloud wording', `
Akshay Kumar
B.Tech IT, Final Year | akshay.kumar@example.com | github.com/example-akshay

EDUCATION
Acropolis Institute of Technology and Research, Indore
B.Tech Information Technology (2023 - 2027), CGPA 7.9

SKILLS
Linux, Bash, Docker, Git, Python, Nginx, Ubuntu

PROJECTS
College Club Server
- Responsible for setting up an Ubuntu server for the coding club with Nginx as a reverse proxy
- Wrote shell scripts that back up the club database every night with cron

Auto Deploy for Hackathon App
- Made a GitHub Actions workflow that builds a Docker image and deploys it on every push
- Hosted the app on an EC2 instance and S3 for images

ACHIEVEMENTS
- Kept the club server running for 2 semesters with no data loss
- Participated in a DevOps bootcamp`),

  sample('hrithik', 'Hrithik Roshan', '3rd year · B.Tech CSE (Cyber Security)', 'cybersecurity', 'CTF-heavy, few formal terms', `
Hrithik Roshan
B.Tech CSE (Cyber Security), 3rd Year | hrithik.roshan@example.com

EDUCATION
Acropolis Institute of Technology and Research, Indore
B.Tech CSE - Cyber Security (2024 - 2028), CGPA 8.3

SKILLS
Python, Linux, Kali, Burp Suite, Nmap, Wireshark

PROJECTS
Home Lab
- Worked on a home lab with Kali and a vulnerable VM to practise attacks
- Did packet capture with Wireshark to see how DNS and HTTP requests travel

College Portal Review
- Helped the college IT team find vulnerabilities in the student portal using the OWASP checklist
- Wrote a report with 7 issues and how to fix each one

ACHIEVEMENTS
- Ranked in the top 10% on TryHackMe
- Participated in 3 CTF events`),

  sample('ranveer', 'Ranveer Singh', '3rd year · B.Tech CSE', 'fullstack-mobile', 'Lots of apps, unclear impact', `
Ranveer Singh
B.Tech CSE, 3rd Year | ranveer.singh@example.com | github.com/example-ranveer

EDUCATION
Acropolis Institute of Technology and Research, Indore
B.Tech Computer Science (2024 - 2028), CGPA 7.6

SKILLS
JavaScript, React, Flutter, Node.js, Express, MongoDB, Firebase, Git

PROJECTS
Hostel Mess Feedback App
- Made a Flutter app where students rate daily meals, with Firebase login
- Worked on the admin dashboard in React

Event Ticketing
- Built a ticket booking site with React, Express and MongoDB and Razorpay payments
- Responsible for the backend endpoints and sign-up flow

ACTIVITIES
- Helped run the college app development club`),

  sample('ranbir', 'Ranbir Kapoor', 'Final year · BCA', 'qa', 'Careful tester, vague results', `
Ranbir Kapoor
BCA, Final Year | ranbir.kapoor@example.com

EDUCATION
Prestige Institute of Management, Indore
Bachelor of Computer Applications (2023 - 2026), 78%

SKILLS
Manual Testing, Java, Selenium, Postman, MySQL, Excel

PROJECTS
Library App Testing
- Wrote test cases for the college library app and found bugs before release
- Did retesting after each fix

Shopping Site Automation
- Worked on Selenium scripts in Java to check the login and cart pages

INTERNSHIPS
QA Intern, Local Software Studio (Jan - Mar 2026)
- Responsible for checking APIs with Postman
- Reported bugs on the team's tracker with screenshots and steps

CERTIFICATIONS
- ISTQB Foundation Level (preparing)`),

  sample('ajay', 'Ajay Devgn', 'MBA 1st year · ex-engineer', 'product', 'Built things, light on product words', `
Ajay Devgn
MBA, 1st Year | ajay.devgn@example.com

EDUCATION
Institute of Management Studies, Indore
MBA (2025 - 2027)
B.Tech Mechanical Engineering (2019 - 2023)

SKILLS
Excel, SQL, Figma, Notion, Google Analytics

PROJECTS
Campus Food Pre-Order
- Talked to users in 3 hostels to understand why lunch queues were long
- Worked on a spec for a pre-order feature and made mockups in Figma
- Helped the dev team decide which features to build first

EXPERIENCE
Graduate Engineer, Auto Parts Manufacturer (2023 - 2025)
- Responsible for coordinating between the design and shop floor teams
- Did weekly reports on production delays

ACTIVITIES
- Product club member`),

  sample('deepika', 'Deepika Padukone', '3rd year · B.Des', 'uiux', 'Good visuals, few research words', `
Deepika Padukone
B.Des Communication Design, 3rd Year | deepika.padukone@example.com | behance.net/example-deepika

EDUCATION
School of Design, Indore
B.Des Communication Design (2024 - 2028)

SKILLS
Figma, Adobe XD, Photoshop, Illustrator, Canva

PROJECTS
Metro Ticket App Redesign
- Worked on a redesign of a metro ticket app in Figma
- Made low-fidelity sketches, then a clickable mockup
- Observed users trying to book tickets and changed the flow

Clinic Booking Website
- Designed reusable components and a colour palette for a clinic website
- Helped the developer make it work on mobile

ACHIEVEMENTS
- Shortlisted in a national UI design challenge`),

  sample('alia', 'Alia Bhatt', 'Final year · B.Com (Hons)', 'business-analyst', 'Analytical, missing BA vocabulary', `
Alia Bhatt
B.Com (Hons), Final Year | alia.bhatt@example.com

EDUCATION
Devi Ahilya University, Indore
B.Com (Hons) Business Analytics (2023 - 2026), 84%

SKILLS
Excel, SQL, Power BI, Google Sheets, PowerPoint

PROJECTS
Fee Collection Process
- Worked on understanding the fee collection process with the accounts office
- Made a flowchart of each step and found 2 steps that could be removed

Sales Dashboard
- Built a Power BI dashboard for a family shop's monthly sales

INTERNSHIPS
Business Intern, Local Logistics Company (May - June 2025)
- Helped collect user needs from the dispatch team for a new tracking sheet
- Responsible for presenting weekly updates to the manager`),

  sample('priyanka', 'Priyanka Chopra Jonas', 'Final year · BBA (Marketing)', 'digital-marketing', 'Grew pages, little analytics', `
Priyanka Chopra Jonas
BBA Marketing, Final Year | priyanka.chopra@example.com

EDUCATION
Institute of Business Management, Indore
BBA Marketing (2023 - 2026), 80%

SKILLS
Instagram, Canva, SEO, Excel, Google Sheets

PROJECTS
College Fest Instagram
- Handled the fest's Instagram page and posted reels every day
- Worked on boosted posts before the fest

Bakery Blog
- Wrote 12 blog posts for a local bakery's website with keywords for search

INTERNSHIPS
Marketing Intern, D2C Skincare Brand (Dec 2025 - Feb 2026)
- Responsible for captions and posts for the brand page
- Helped track website traffic every week

CERTIFICATIONS
- Google Digital Marketing Fundamentals`),

  sample('katrina', 'Katrina Kaif', 'Final year · BBA', 'sales-bd', 'Real deals, weak verbs', `
Katrina Kaif
BBA, Final Year | katrina.kaif@example.com

EDUCATION
Institute of Business Management, Indore
BBA (2023 - 2026), 76%

SKILLS
Excel, Google Sheets, PowerPoint, Zoho CRM

EXPERIENCE
Sponsorship Head, College Fest (2025)
- Responsible for getting sponsors for the college fest
- Did cold calls and cold emails to 60 local businesses
- Convinced 9 shop owners to sponsor stalls

Sales Intern, EdTech Startup (Summer 2025)
- Worked on following up with leads from webinars
- Helped update the lead tracker in Google Sheets

ACTIVITIES
- Member of the college E-Cell`),

  sample('kareena', 'Kareena Kapoor Khan', 'CA Intermediate · B.Com', 'ca', 'Real articleship, generic bullets', `
Kareena Kapoor Khan
CA Intermediate (both groups cleared), B.Com | kareena.kapoor@example.com

EDUCATION
Institute of Chartered Accountants of India
CA Intermediate (2025)
B.Com, Devi Ahilya University, Indore (2022 - 2025), 82%

SKILLS
Tally Prime, Excel, GST, Income Tax

EXPERIENCE
Article Assistant, Mid-size CA Firm (2025 - present)
- Worked on GST returns (GSTR-1 and GSTR-3B) for 15 clients every month
- Did vouching and verification of expenses for audits
- Helped prepare balance sheets for small businesses
- Responsible for filing ITRs for salaried clients

ACHIEVEMENTS
- All India Rank under 500 in CA Foundation`),

  sample('anushka', 'Anushka Sharma', 'MBA Finance · Final year', 'finance', 'Good models, vague outcomes', `
Anushka Sharma
MBA Finance, Final Year | anushka.sharma@example.com

EDUCATION
Institute of Management Studies, Indore
MBA Finance (2024 - 2026)
B.Com (2021 - 2024), 85%

SKILLS
Excel, PowerPoint, Python, Capital IQ

PROJECTS
Equity Research on an FMCG Company
- Worked on a DCF of a listed FMCG company using 5 years of annual reports
- Did ratio analysis and compared it with 3 peers

INTERNSHIPS
Summer Intern, Regional Bank (Apr - Jun 2025)
- Helped the loans team check the creditworthiness of small business loan applicants
- Responsible for preparing projections in Excel for 2 clients

ACHIEVEMENTS
- Finalist, inter-college stock pitch competition
- CFA Level 1 candidate`),

  sample('kangana', 'Kangana Ranaut', 'MBBS · Intern', 'doctor', 'Solid rotations, generic duties', `
Kangana Ranaut
MBBS, Compulsory Rotating Internship | kangana.ranaut@example.com

EDUCATION
Government Medical College, Indore
MBBS (2020 - 2025), Internship (2025 - 2026)

SKILLS
History taking, Clinical examination, Suturing, CPR

EXPERIENCE
Surgery Rotation (3 months)
- Worked in the general surgery ward and OPD
- Assisted in surgeries and scrubbed in for appendectomies and hernia repairs
- Did dressings and sutures for minor wounds

Casualty Rotation (1 month)
- Involved in triage of trauma patients in the emergency department

ACHIEVEMENTS
- Presented a case report at the college surgical society
- Volunteered at 4 rural health camps`),

  sample('vidya', 'Vidya Balan', 'B.Sc Nursing · Final year', 'nurse', 'Caring work, weak wording', `
Vidya Balan
B.Sc Nursing, Final Year | vidya.balan@example.com

EDUCATION
College of Nursing, Indore
B.Sc Nursing (2022 - 2026), 79%

SKILLS
Patient care, IV cannulation, Blood pressure monitoring, CPR

CLINICAL EXPERIENCE
Medical Ward Posting
- Worked in a 30-bed medical ward under the staff nurse
- Did blood pressure, pulse and temperature checks every 4 hours
- Helped give injections and IV fluids as ordered

Paediatric Ward Posting
- Responsible for hand hygiene audits and biomedical waste segregation

ACTIVITIES
- Volunteered at a school health check-up camp`),

  sample('madhuri', 'Madhuri Dixit', 'BA Political Science · UPSC aspirant', 'civil-services', 'Strong service record, few policy terms', `
Madhuri Dixit
BA Political Science, Graduate | madhuri.dixit@example.com

EDUCATION
Government Arts and Commerce College, Indore
BA Political Science (2022 - 2025), 83%

SKILLS
English, Hindi, Excel, Essay writing

EXPERIENCE
NSS Volunteer Leader (2023 - 2025)
- Led a team of 25 NSS volunteers for awareness drives in 6 villages
- Worked on helping families register for government schemes

INTERNSHIPS
Intern, District Collector's Office (Summer 2024)
- Responsible for compiling reports on scheme coverage across 3 blocks
- Did data entry and helped prepare notes for review meetings

ACHIEVEMENTS
- Cleared UPSC Prelims (2025)
- Reads two newspapers daily and writes weekly essays`),

  sample('aishwarya', 'Aishwarya Rai Bachchan', 'B.Ed · Final year', 'teacher', 'Natural teacher, light on terms', `
Aishwarya Rai Bachchan
B.Ed, Final Year | aishwarya.rai@example.com

EDUCATION
College of Education, Indore
B.Ed (2024 - 2026)
M.Sc Physics (2022 - 2024)

SKILLS
Physics, Mathematics, Google Classroom, Google Meet, PowerPoint, Kahoot

TEACHING EXPERIENCE
Student Teacher, Government Higher Secondary School (2025)
- Taught physics to a class of 42 students in Class 9
- Made worksheets and weekly quizzes for each chapter
- Worked on keeping the class engaged with simple experiments

Online Tutor (2023 - present)
- Responsible for teaching maths to 8 students over Zoom

ACHIEVEMENTS
- Qualified CTET (2025)`),

  sample('rani', 'Rani Mukerji', 'Final year · B.Tech Civil', 'mech-civil', 'Site exposure, weak verbs', `
Rani Mukerji
B.Tech Civil Engineering, Final Year | rani.mukerji@example.com

EDUCATION
Acropolis Institute of Technology and Research, Indore
B.Tech Civil Engineering (2023 - 2027), CGPA 8.0

SKILLS
AutoCAD, STAAD Pro, MS Excel, Total Station

INTERNSHIPS
Site Intern, Residential Builder (May - July 2025)
- Worked on a G+4 residential building construction site
- Helped the site engineer with inspection of concrete cube tests and slump tests
- Did estimates of steel and cement quantities for 2 floors

PROJECTS
Hostel Block Design
- Made the structural design of a 3-storey hostel block in STAAD Pro

ACHIEVEMENTS
- Participated in a national bridge design competition`),

  sample('kajol', 'Kajol', 'Final year · B.Tech EEE', 'electrical', 'Good lab work, missing PLC', `
Kajol
B.Tech Electrical and Electronics, Final Year | kajol@example.com

EDUCATION
Acropolis Institute of Technology and Research, Indore
B.Tech Electrical and Electronics (2023 - 2027), CGPA 8.6

SKILLS
MATLAB, Simulink, Proteus, Arduino, KiCad

PROJECTS
Solar Charge Controller
- Worked on a solar charge controller using Arduino and an MPPT algorithm
- Designed the PCB in KiCad and did the soldering

Motor Speed Control
- Made a Simulink model of a DC motor speed controller

INTERNSHIPS
Intern, State Power Distribution Company (June 2025)
- Visited 2 substations and learned about transformers and earthing
- Helped the team with safety checks during maintenance`),

  sample('shraddha', 'Shraddha Kapoor', 'MBA HR · Final year', 'hr', 'Hiring help, unclear numbers', `
Shraddha Kapoor
MBA Human Resources, Final Year | shraddha.kapoor@example.com

EDUCATION
Institute of Management Studies, Indore
MBA HR (2024 - 2026)
BBA (2021 - 2024)

SKILLS
Excel, Naukri, LinkedIn, Google Forms, PowerPoint

INTERNSHIPS
HR Intern, IT Services Company (Apr - Jun 2025)
- Worked on shortlisting resumes for 3 developer roles
- Helped schedule interviews with candidates and panels
- Responsible for joining formalities and welcome kits for new hires

ACTIVITIES
- Organised Fun Friday events for the department
- Placement committee member`),

  sample('kiara', 'Kiara Advani', 'MBA Operations · Final year', 'operations', 'Ran real ops, few ops terms', `
Kiara Advani
MBA Operations, Final Year | kiara.advani@example.com

EDUCATION
Institute of Management Studies, Indore
MBA Operations (2024 - 2026)
B.Tech Mechanical (2019 - 2023)

SKILLS
Excel, Google Sheets, SQL, PowerPoint

INTERNSHIPS
Operations Intern, Quick-Commerce Startup (Apr - Jun 2025)
- Worked on reducing late deliveries from one dark store
- Helped the store manager track stock of the top 200 items every day
- Responsible for coordinating with 4 vendors for daily restocking

PROJECTS
Hostel Mess Inventory
- Made a Google Sheet to track mess stock and cut food waste`),

  sample('tiger', 'Tiger Shroff', 'Final year · B.Tech Industrial', 'supply-chain', 'Good analysis, missing SCM words', `
Tiger Shroff
B.Tech Industrial and Production, Final Year | tiger.shroff@example.com

EDUCATION
Acropolis Institute of Technology and Research, Indore
B.Tech Industrial and Production (2023 - 2027), CGPA 7.8

SKILLS
Excel, Python, Pandas, MySQL

PROJECTS
Seasonal Sales Forecast
- Worked on forecasting monthly sales for a local distributor using 3 years of sales data
- Did seasonal analysis in Excel and Python

INTERNSHIPS
Intern, FMCG Distributor (May - June 2025)
- Helped the warehouse team count stock and find slow-moving items
- Responsible for making weekly reports on dispatch delays

CERTIFICATIONS
- Supply Chain Fundamentals (NPTEL)`),

  sample('varun', 'Varun Dhawan', 'Final year · BA Journalism', 'content', 'Big channel, vague results', `
Varun Dhawan
BA Journalism and Mass Communication, Final Year | varun.dhawan@example.com | youtube.com/@example-varun

EDUCATION
School of Journalism, Indore
BA Journalism and Mass Communication (2023 - 2026)

SKILLS
CapCut, Canva, WordPress, Google Docs

PROJECTS
Campus YouTube Channel
- Made YouTube videos about campus life and edited them in CapCut
- Wrote scripts for a 6-part series on hostel life

Freelance Blogging
- Wrote 20 articles for a travel blog with keywords for search

INTERNSHIPS
Content Intern, Food Delivery Brand (Summer 2025)
- Responsible for captions and taglines for social posts
- Helped with reels for the brand page`),

  sample('ayushmann', 'Ayushmann Khurrana', 'Graduate · B.Com', 'support', 'Calm with customers, no tools named', `
Ayushmann Khurrana
B.Com, Graduate | ayushmann.khurrana@example.com

EDUCATION
Devi Ahilya University, Indore
B.Com (2022 - 2025), 72%

SKILLS
English, Hindi, Excel, Google Sheets, Typing 45 wpm

EXPERIENCE
Customer Care Intern, Telecom Retailer (Jan - Apr 2025)
- Worked on customer queries on phone and WhatsApp
- Handled angry customers and resolved complaints about bills
- Responsible for logging every complaint in the help desk sheet

Part-time Sales Associate, Electronics Store (2023 - 2024)
- Helped customers choose phones and set up their accounts

ACHIEVEMENTS
- Store employee of the month twice`),

  sample('vicky', 'Vicky Kaushal', 'BA LLB · Final year', 'legal', 'Real drafting, generic phrasing', `
Vicky Kaushal
BA LLB (Hons), Final Year | vicky.kaushal@example.com

EDUCATION
Law School, Indore
BA LLB (Hons) (2021 - 2026), CGPA 7.9
CS Executive (cleared)

SKILLS
SCC Online, Manupatra, MS Word, Legal drafting

INTERNSHIPS
Intern, Corporate Law Firm (Dec 2025)
- Worked on drafting NDAs and service agreements for startup clients
- Did research on case laws for a contract dispute

Intern, District Court Advocate (June 2025)
- Helped prepare petitions and attended hearings

ACHIEVEMENTS
- Semi-finalist, national moot court competition`),

  sample('kartik', 'Kartik Aaryan', 'M.Pharm · Final year', 'pharma', 'Lab skills, missing compliance words', `
Kartik Aaryan
M.Pharm Pharmaceutics, Final Year | kartik.aaryan@example.com

EDUCATION
College of Pharmacy, Indore
M.Pharm Pharmaceutics (2024 - 2026)
B.Pharm (2020 - 2024), 81%

SKILLS
HPLC, UV spectroscopy, Dissolution testing, MS Excel

PROJECTS
Fast-Dissolving Tablet
- Worked on a fast-dissolving tablet formulation and did dissolution testing
- Did assay of 6 batches using HPLC

INTERNSHIPS
Intern, Generic Drug Manufacturer (May - June 2025)
- Helped in the quality control lab and followed SOPs
- Responsible for documentation of batch records
- Involved in collecting side effect reports during a hospital pharmacy posting

ACHIEVEMENTS
- Qualified GPAT (2024)`),

  sample('sidharth', 'Sidharth Malhotra', 'BBA · Final year', 'ecommerce', 'Ran an online store, few platform terms', `
Sidharth Malhotra
BBA, Final Year | sidharth.malhotra@example.com

EDUCATION
Institute of Business Management, Indore
BBA (2023 - 2026), 77%

SKILLS
Excel, Canva, Instagram, WooCommerce

PROJECTS
Family Saree Store Online
- Worked on taking the family saree store online with a WooCommerce site
- Made product photos and wrote product descriptions for 120 sarees
- Helped list the bestsellers on Amazon and Meesho

INTERNSHIPS
E-commerce Intern, Home Decor Brand (Summer 2025)
- Responsible for updating listings and prices every week
- Did a study of why people left at checkout`),

  sample('shahid', 'Shahid Kapoor', 'Final year · B.Tech + E-Cell lead', 'founder', 'Started things, vague traction', `
Shahid Kapoor
B.Tech CSE, Final Year | shahid.kapoor@example.com

EDUCATION
Acropolis Institute of Technology and Research, Indore
B.Tech Computer Science (2023 - 2027), CGPA 7.4

SKILLS
Excel, Canva, Notion, Pitch decks, Google Sheets

EXPERIENCE
Co-founder, Campus Laundry Pickup (2025 - present)
- Started a laundry pickup service for 2 hostels with a friend
- Worked on pricing and costs for each pickup
- Did a pilot with first customers in the boys' hostel

E-Cell Lead (2024 - 2025)
- Responsible for organising a startup pitch event
- Helped teams prepare pitch decks for an incubator

ACHIEVEMENTS
- Finalist, state startup pitch competition`),
];

/** The first sample, used by tests and the agent's examples. */
export const SAMPLE_RESUME = SAMPLES[0].resume;
