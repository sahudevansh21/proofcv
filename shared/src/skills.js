// Skill dictionary.
// aliases  -> the resume uses the same wording a keyword screener would look for (counts as "matched").
// evidence -> related wording that suggests the skill, but not the JD's term (counts as "worded differently").
// A trailing "*" on a term allows common suffixes (deploy* -> deployed, deployment, deploying).

const s = (name, category, aliases, evidence = []) => ({
  id: name.toLowerCase().replace(/[^a-z0-9+#]+/g, '-'),
  name,
  category,
  aliases,
  evidence,
});

export const SKILLS = [
  // Languages
  s('JavaScript', 'Language', ['javascript', 'js', 'es6'], ['node.js', 'react', 'typescript']),
  s('TypeScript', 'Language', ['typescript', 'ts']),
  s('Python', 'Language', ['python', 'python3'], ['pandas', 'numpy', 'django', 'flask', 'scikit-learn']),
  s('Java', 'Language', ['java', 'core java'], ['spring boot', 'android']),
  s('C++', 'Language', ['c++', 'cpp']),
  s('C#', 'Language', ['c#', 'csharp'], ['.net', 'unity']),
  s('Go', 'Language', ['golang']),
  s('Kotlin', 'Language', ['kotlin']),
  s('Dart', 'Language', ['dart'], ['flutter']),
  s('PHP', 'Language', ['php'], ['laravel', 'wordpress']),
  s('HTML', 'Frontend', ['html', 'html5']),
  s('CSS', 'Frontend', ['css', 'css3'], ['tailwind', 'bootstrap', 'sass', 'scss']),

  // Frontend
  s('React', 'Frontend', ['react', 'react.js', 'reactjs'], ['next.js', 'jsx', 'redux']),
  s('Next.js', 'Frontend', ['next.js', 'nextjs']),
  s('Angular', 'Frontend', ['angular', 'angularjs']),
  s('Vue', 'Frontend', ['vue', 'vue.js', 'vuejs']),
  s('Redux', 'Frontend', ['redux', 'redux toolkit']),
  s('Tailwind CSS', 'Frontend', ['tailwind', 'tailwind css', 'tailwindcss']),
  s('Responsive Design', 'Frontend', ['responsive design', 'responsive'], ['mobile-friendly', 'mobile friendly', 'media quer*', 'tailwind', 'bootstrap', 'works on mobile']),
  s('UI/UX', 'Frontend', ['ui/ux', 'ux', 'user experience', 'user interface'], ['figma', 'wireframe*', 'prototype*']),
  s('Figma', 'Design', ['figma']),

  // Backend
  s('Node.js', 'Backend', ['node.js', 'nodejs', 'node'], ['express', 'npm']),
  s('Express.js', 'Backend', ['express', 'express.js', 'expressjs']),
  s('REST APIs', 'Backend', ['rest api*', 'restful', 'rest-api*'], ['express', 'endpoint*', 'api route*', 'fetch', 'axios', 'postman', 'crud', 'http request*', 'backend api*']),
  s('GraphQL', 'Backend', ['graphql'], ['apollo']),
  s('Django', 'Backend', ['django']),
  s('Flask', 'Backend', ['flask'], ['fastapi']),
  s('FastAPI', 'Backend', ['fastapi']),
  s('Spring Boot', 'Backend', ['spring boot', 'springboot']),
  s('Authentication', 'Backend', ['authentication', 'auth', 'oauth'], ['login', 'sign-up', 'signup', 'jwt', 'firebase auth']),
  s('Microservices', 'Backend', ['microservice*']),

  // Data stores
  s('SQL', 'Database', ['sql'], ['mysql', 'postgresql', 'postgres', 'sqlite', 'oracle', 'joins', 'queries']),
  s('MySQL', 'Database', ['mysql']),
  s('PostgreSQL', 'Database', ['postgresql', 'postgres']),
  s('MongoDB', 'Database', ['mongodb', 'mongo'], ['mongoose']),
  s('NoSQL', 'Database', ['nosql'], ['mongodb', 'firestore', 'dynamodb', 'redis', 'cassandra']),
  s('Firebase', 'Cloud', ['firebase'], ['firestore']),
  s('Redis', 'Database', ['redis']),
  s('Database Design', 'Database', ['database design', 'schema design', 'data model*'], ['schema*', 'er diagram', 'normaliz*']),

  // Cloud / DevOps
  s('Git', 'Tools', ['git'], ['github', 'gitlab', 'bitbucket', 'pull request*']),
  s('GitHub', 'Tools', ['github']),
  s('Version Control', 'Tools', ['version control', 'source control'], ['git', 'github', 'gitlab', 'bitbucket']),
  s('Docker', 'DevOps', ['docker', 'dockerfile'], ['container*']),
  s('Kubernetes', 'DevOps', ['kubernetes', 'k8s']),
  s('CI/CD', 'DevOps', ['ci/cd', 'continuous integration', 'continuous deployment'], ['github actions', 'jenkins', 'pipeline*']),
  s('Linux', 'DevOps', ['linux', 'unix'], ['bash', 'shell script*', 'ubuntu', 'command line']),
  s('AWS', 'Cloud', ['aws', 'amazon web services'], ['ec2', 's3', 'lambda']),
  s('GCP', 'Cloud', ['gcp', 'google cloud'], ['cloud run', 'bigquery', 'firebase']),
  s('Azure', 'Cloud', ['azure']),
  s('Cloud', 'Cloud', ['cloud computing', 'cloud platform*', 'cloud'], ['aws', 'gcp', 'google cloud', 'azure', 'firebase', 'vercel', 'netlify', 'heroku', 'render']),
  s('Deployment', 'DevOps', ['deploy*'], ['hosted', 'vercel', 'netlify', 'heroku', 'render', 'live at', 'live link']),

  // Data / ML
  s('Machine Learning', 'AI/ML', ['machine learning', 'ml'], ['model*', 'scikit-learn', 'sklearn', 'regression', 'classif*', 'predict*', 'train*']),
  s('Deep Learning', 'AI/ML', ['deep learning'], ['neural network*', 'cnn', 'rnn', 'lstm', 'tensorflow', 'pytorch', 'keras']),
  s('TensorFlow', 'AI/ML', ['tensorflow', 'keras']),
  s('PyTorch', 'AI/ML', ['pytorch', 'torch']),
  s('scikit-learn', 'AI/ML', ['scikit-learn', 'sklearn']),
  s('NLP', 'AI/ML', ['nlp', 'natural language processing'], ['text classif*', 'sentiment', 'tokeniz*', 'transformer*', 'bert', 'chatbot']),
  s('Computer Vision', 'AI/ML', ['computer vision'], ['opencv', 'image classif*', 'object detection', 'yolo', 'cnn']),
  s('Generative AI', 'AI/ML', ['generative ai', 'genai', 'llm*', 'large language model*'], ['gemini', 'openai', 'gpt', 'prompt engineering', 'langchain', 'rag']),
  s('Pandas', 'Data', ['pandas'], ['dataframe*']),
  s('NumPy', 'Data', ['numpy']),
  s('Data Analysis', 'Data', ['data analysis', 'data analytics', 'analy* data'], ['pandas', 'excel', 'insight*', 'eda', 'exploratory', 'dashboard*']),
  s('Data Visualization', 'Data', ['data visualization', 'data visualisation', 'visualization*', 'visualisation*'], ['matplotlib', 'seaborn', 'plotly', 'chart*', 'graph*', 'dashboard*', 'power bi', 'tableau']),
  s('Excel', 'Data', ['excel', 'ms excel', 'spreadsheet*'], ['google sheets', 'pivot table*', 'vlookup']),
  s('Power BI', 'Data', ['power bi', 'powerbi']),
  s('Tableau', 'Data', ['tableau']),
  s('Statistics', 'Data', ['statistics', 'statistical'], ['hypothesis test*', 'regression', 'probability', 'a/b test*']),

  // Mobile
  s('Android', 'Mobile', ['android'], ['kotlin', 'android studio']),
  s('Flutter', 'Mobile', ['flutter']),
  s('React Native', 'Mobile', ['react native']),
  s('Mobile Development', 'Mobile', ['mobile app*', 'mobile development'], ['android', 'ios', 'flutter', 'react native']),

  // CS fundamentals
  s('Data Structures & Algorithms', 'CS Fundamentals', ['data structures', 'algorithms', 'dsa'], ['leetcode', 'codeforces', 'codechef', 'hackerrank', 'competitive programming', 'gfg', 'geeksforgeeks']),
  s('OOP', 'CS Fundamentals', ['oop', 'oops', 'object-oriented', 'object oriented'], ['class*', 'inheritance', 'polymorphism', 'encapsulation']),
  s('DBMS', 'CS Fundamentals', ['dbms', 'database management'], ['sql', 'mysql', 'postgresql', 'normaliz*']),
  s('Operating Systems', 'CS Fundamentals', ['operating system*'], ['linux', 'process*', 'thread*', 'scheduling']),
  s('Computer Networks', 'CS Fundamentals', ['computer network*', 'networking'], ['tcp', 'http', 'dns', 'socket*']),
  s('System Design', 'CS Fundamentals', ['system design', 'low level design', 'high level design', 'lld', 'hld'], ['architecture', 'scalab*', 'caching', 'load balanc*']),

  // Practices
  s('Unit Testing', 'Practices', ['unit test*', 'jest', 'mocha', 'pytest', 'junit', 'vitest'], ['test*', 'test case*', 'debug*']),
  s('Agile', 'Practices', ['agile', 'scrum', 'kanban'], ['sprint*', 'jira', 'stand-up*', 'standup*']),
  s('Debugging', 'Practices', ['debug*', 'troubleshoot*'], ['fixed bug*', 'bug fix*', 'resolved issue*']),
  s('Problem Solving', 'Soft Skill', ['problem solving', 'problem-solving'], ['hackathon*', 'competitive programming', 'leetcode', 'codeforces', 'codechef']),
  s('Communication', 'Soft Skill', ['communication', 'communicat*'], ['present*', 'public speaking', 'documentation', 'wrote', 'blog*']),
  s('Teamwork', 'Soft Skill', ['teamwork', 'team player', 'collaborat*'], ['team', 'teammate*', 'cross-functional', 'group project']),
  s('Leadership', 'Soft Skill', ['leadership', 'led', 'lead'], ['captain', 'coordinator', 'head', 'organiz*', 'organis*', 'mentor*', 'president', 'core team']),
  s('Time Management', 'Soft Skill', ['time management'], ['deadline*', 'prioritiz*', 'prioritis*', 'on schedule']),
  s('Critical Thinking', 'Soft Skill', ['critical thinking', 'analytical thinking', 'analytical skills'], ['root cause', 'trade-off*', 'evaluated']),
  s('Adaptability', 'Soft Skill', ['adaptability', 'adaptable', 'quick learner', 'fast learner'], ['self-taught', 'learned', 'picked up']),
  s('Documentation', 'Practices', ['documentation', 'technical writing'], ['readme', 'wiki', 'api docs', 'wrote docs', 'blog*']),
  s('Code Review', 'Practices', ['code review*'], ['pull request*', 'reviewed code', 'pr review*']),
  s('Test-Driven Development', 'Practices', ['test-driven development', 'tdd'], ['unit test*', 'jest', 'pytest', 'junit']),

  // More languages
  s('Swift', 'Language', ['swift'], ['swiftui', 'xcode']),
  s('Rust', 'Language', ['rust'], ['cargo']),
  s('Ruby', 'Language', ['ruby'], ['rails']),
  s('Scala', 'Language', ['scala']),
  s('R', 'Language', ['r programming', 'r language', 'rstudio']),
  s('MATLAB', 'Language', ['matlab'], ['simulink']),
  s('Bash', 'Language', ['bash', 'shell scripting', 'shell script*'], ['linux', 'command line', 'cron']),
  s('Solidity', 'Language', ['solidity'], ['smart contract*', 'ethereum']),

  // More frontend
  s('Svelte', 'Frontend', ['svelte', 'sveltekit']),
  s('jQuery', 'Frontend', ['jquery']),
  s('Sass', 'Frontend', ['sass', 'scss']),
  s('Bootstrap', 'Frontend', ['bootstrap']),
  s('Material UI', 'Frontend', ['material ui', 'mui', 'material design'], ['material components']),
  s('Three.js', 'Frontend', ['three.js', 'threejs'], ['webgl']),
  s('D3.js', 'Frontend', ['d3.js', 'd3']),
  s('Webpack', 'Frontend', ['webpack'], ['bundler', 'babel']),
  s('Vite', 'Frontend', ['vite'], ['bundler']),
  s('Accessibility', 'Frontend', ['accessibility', 'a11y', 'wcag'], ['screen reader*', 'aria', 'keyboard navigation', 'alt text', 'color contrast']),
  s('SEO', 'Frontend', ['seo', 'search engine optimization'], ['meta tag*', 'sitemap', 'lighthouse']),
  s('Progressive Web Apps', 'Frontend', ['progressive web app*', 'pwa'], ['service worker*', 'offline support', 'installable']),
  s('Web Performance', 'Frontend', ['web performance', 'core web vitals'], ['lighthouse', 'lazy load*', 'code splitting', 'page load', 'load time']),

  // More backend
  s('WebSockets', 'Backend', ['websocket*', 'socket.io'], ['real-time', 'realtime', 'live updates', 'chat app']),
  s('Prisma', 'Backend', ['prisma']),
  s('ORM', 'Backend', ['orm'], ['prisma', 'sequelize', 'mongoose', 'hibernate', 'sqlalchemy', 'typeorm']),
  s('Ruby on Rails', 'Backend', ['ruby on rails', 'rails']),
  s('Laravel', 'Backend', ['laravel']),
  s('.NET', 'Backend', ['.net', 'asp.net', 'dotnet']),
  s('Serverless', 'Backend', ['serverless'], ['lambda', 'cloud functions', 'cloud run', 'edge functions', 'vercel functions']),
  s('Payment Integration', 'Backend', ['payment integration', 'payment gateway*'], ['razorpay', 'stripe', 'paytm', 'upi']),
  s('Postman', 'Tools', ['postman'], ['api testing']),

  // More data stores
  s('SQLite', 'Database', ['sqlite']),
  s('Supabase', 'Database', ['supabase']),
  s('DynamoDB', 'Database', ['dynamodb']),
  s('Elasticsearch', 'Database', ['elasticsearch', 'elastic search', 'opensearch'], ['full-text search']),
  s('Oracle Database', 'Database', ['oracle database', 'oracle db', 'pl/sql', 'plsql']),

  // More cloud / DevOps / tools
  s('GitHub Actions', 'DevOps', ['github actions'], ['workflow*', 'ci pipeline*']),
  s('Jenkins', 'DevOps', ['jenkins']),
  s('Terraform', 'DevOps', ['terraform'], ['infrastructure as code', 'iac']),
  s('Nginx', 'DevOps', ['nginx'], ['reverse proxy']),
  s('Vercel', 'Cloud', ['vercel']),
  s('Netlify', 'Cloud', ['netlify']),
  s('Heroku', 'Cloud', ['heroku']),
  s('Jira', 'Tools', ['jira'], ['sprint*', 'ticket*', 'kanban']),
  s('Jupyter', 'Tools', ['jupyter', 'jupyter notebook*', 'google colab', 'colab'], ['notebook*']),

  // More data / ML
  s('Matplotlib', 'Data', ['matplotlib']),
  s('Seaborn', 'Data', ['seaborn']),
  s('Plotly', 'Data', ['plotly', 'dash']),
  s('Data Cleaning', 'Data', ['data cleaning', 'data cleansing', 'data wrangling', 'data preprocessing'], ['missing values', 'outlier*', 'deduplicat*', 'preprocess*']),
  s('ETL', 'Data', ['etl', 'data pipeline*'], ['extract, transform', 'airflow', 'ingest*']),
  s('Apache Spark', 'Data', ['apache spark', 'pyspark', 'spark sql']),
  s('Hadoop', 'Data', ['hadoop', 'hdfs', 'mapreduce']),
  s('Big Data', 'Data', ['big data'], ['spark', 'hadoop', 'kafka', 'millions of rows']),
  s('BigQuery', 'Data', ['bigquery']),
  s('Kafka', 'Data', ['kafka'], ['message queue*', 'event streaming']),
  s('A/B Testing', 'Data', ['a/b test*', 'ab test*', 'split test*'], ['experiment*', 'hypothesis test*']),
  s('Time Series', 'AI/ML', ['time series', 'time-series', 'forecasting'], ['arima', 'lstm', 'prophet', 'forecast*']),
  s('Recommendation Systems', 'AI/ML', ['recommendation system*', 'recommender system*', 'recommendation engine*'], ['recommend*', 'collaborative filtering']),
  s('Keras', 'AI/ML', ['keras']),
  s('OpenCV', 'AI/ML', ['opencv', 'cv2']),
  s('Hugging Face', 'AI/ML', ['hugging face', 'huggingface', 'transformers library'], ['bert', 'fine-tun*']),
  s('LangChain', 'AI/ML', ['langchain', 'llamaindex'], ['rag', 'vector database*', 'embeddings']),
  s('Prompt Engineering', 'AI/ML', ['prompt engineering'], ['prompt*', 'gemini', 'chatgpt', 'gpt']),
  s('MLOps', 'AI/ML', ['mlops', 'model deployment'], ['mlflow', 'model serving', 'docker', 'fastapi']),

  // Hardware, security and other engineering
  s('IoT', 'Hardware', ['iot', 'internet of things'], ['arduino', 'raspberry pi', 'esp32', 'sensor*', 'mqtt']),
  s('Arduino', 'Hardware', ['arduino'], ['esp32', 'microcontroller*']),
  s('Embedded Systems', 'Hardware', ['embedded systems', 'embedded c', 'firmware'], ['microcontroller*', 'arduino', 'esp32', 'stm32']),
  s('Blockchain', 'Web3', ['blockchain', 'web3'], ['ethereum', 'smart contract*', 'solidity']),
  s('Cybersecurity', 'Security', ['cybersecurity', 'cyber security', 'information security', 'network security'], ['owasp', 'penetration test*', 'ctf', 'vulnerabilit*', 'encryption']),
  s('Selenium', 'Practices', ['selenium'], ['browser automation', 'web scraping']),
  s('Cypress', 'Practices', ['cypress', 'playwright'], ['end-to-end test*', 'e2e test*']),
  s('Unity', 'Game Dev', ['unity', 'unity3d'], ['c#', 'game engine']),
  s('Game Development', 'Game Dev', ['game development', 'game dev'], ['unity', 'unreal', 'godot', 'pygame', 'game jam']),
  s('AutoCAD', 'Design', ['autocad'], ['2d drafting', 'technical drawing*']),
  s('SolidWorks', 'Design', ['solidworks', 'fusion 360', 'catia'], ['cad model*', '3d model*']),
  s('Microsoft Office', 'Tools', ['microsoft office', 'ms office', 'powerpoint', 'ms word'], ['excel', 'google docs', 'google slides']),
];

// Weak openers / filler and the stronger, still-truthful alternatives we suggest.
export const WEAK_PHRASES = [
  { phrase: 'worked on', suggest: ['Developed', 'Built', 'Implemented'] },
  { phrase: 'working on', suggest: ['Developing', 'Building'] },
  { phrase: 'helped', suggest: ['Collaborated to', 'Contributed to', 'Supported'] },
  { phrase: 'assisted', suggest: ['Supported', 'Contributed to'] },
  { phrase: 'responsible for', suggest: ['Owned', 'Managed', 'Led'] },
  { phrase: 'involved in', suggest: ['Contributed to', 'Co-developed'] },
  { phrase: 'participated in', suggest: ['Competed in', 'Contributed to'] },
  { phrase: 'tried to', suggest: ['Name what you actually did'] },
  { phrase: 'made', suggest: ['Built', 'Created', 'Designed'] },
  { phrase: 'did', suggest: ['Completed', 'Executed', 'Conducted'] },
  { phrase: 'handled', suggest: ['Managed', 'Coordinated'] },
  { phrase: 'duties included', suggest: ['Start with what you achieved'] },
  { phrase: 'various', suggest: ['Name the specific items'] },
  { phrase: 'etc', suggest: ['List the specific items or drop it'] },
  { phrase: 'stuff', suggest: ['Name the specific items'] },
  { phrase: 'things', suggest: ['Name the specific items'] },
];

export const STRONG_VERBS = new Set(
  `accelerated achieved analyzed analysed architected automated boosted built championed coded collaborated competed
  completed conducted configured contributed coordinated co-developed created debugged decreased delivered deployed designed
  developed devised directed drove engineered enhanced established evaluated executed expanded facilitated founded
  generated grew identified implemented improved increased initiated innovated integrated introduced launched led
  maintained managed mentored migrated modeled modelled monitored optimized optimised orchestrated organized organised
  owned piloted planned presented prototyped published raised redesigned reduced refactored researched resolved
  revamped scaled secured shipped simplified solved spearheaded streamlined strengthened supported taught tested
  trained transformed tuned upgraded validated visualized visualised won wrote`.split(/\s+/).filter(Boolean),
);
