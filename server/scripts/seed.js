const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const User = require('../models/User');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/learnpulseDB';
    console.log(`Connecting to MongoDB to seed initial courses and accounts...`);
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 8000 });
    console.log('Connected! Purging old demo records...');

    await User.deleteMany({});
    await Course.deleteMany({});
    await Enrollment.deleteMany({});

    console.log('Creating demo users...');
    const instructor = await User.create({
      name: 'Dr. Sarah Chen',
      email: 'instructor@learnhub.dev',
      password: 'Instructor@123',
      role: 'instructor',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
      headline: 'Principal Full-Stack Architect & Ex-Google Staff Instructor',
      bio: 'Over 12 years of industry experience architecting high-scale distributed systems and mentoring over 40,000 developers worldwide.'
    });

    const student = await User.create({
      name: 'Alex Morgan',
      email: 'student@learnhub.dev',
      password: 'Student@123',
      role: 'student',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      headline: 'Full-Stack Software Engineering Aspirant',
      bio: 'Enthusiastic developer learning modern web engineering, cloud pipelines, and AI integration.'
    });

    const admin = await User.create({
      name: 'Elena Rostova',
      email: 'admin@learnhub.dev',
      password: 'Admin@123',
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80',
      headline: 'LearnPulse Platform Lead Administrator',
      bio: 'Managing platform governance, course quality assurance, and instructor partnerships.'
    });

    console.log('Seeding 4 realistic, high-quality interactive courses with quizzes...');

    const coursesToSeed = [
      {
        title: 'Full-Stack Web Development 2026: React 19, Node.js & Cloud',
        subtitle: 'Build and deploy scalable modern web applications from scratch with modern MERN architecture.',
        description: 'Master full-stack engineering with the latest industry tooling. This curriculum takes you from frontend fundamentals with React 19, modern hooks, and state management, to building robust Express REST APIs, connecting MongoDB Atlas, and shipping to cloud hosting services like Vercel and Render.',
        category: 'Web Development',
        level: 'Beginner',
        thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop&q=80',
        instructor: instructor._id,
        instructorName: instructor.name,
        instructorTitle: instructor.headline,
        duration: '12.5 Hours',
        rating: 4.9,
        reviewsCount: 320,
        enrolledCount: 1420,
        tags: ['React 19', 'Node.js', 'Express', 'MongoDB Atlas', 'Vite', 'REST API'],
        learningOutcomes: [
          'Design Single Page Applications with React 19 and React Router',
          'Build secure RESTful APIs using Express.js and JSON Web Tokens',
          'Model scalable schema structures using Mongoose and MongoDB Atlas',
          'Deploy full-stack applications to Vercel and Render with zero downtime'
        ],
        lessons: [
          {
            title: '1. Welcome & Full-Stack Architecture Roadmap',
            duration: '15 min',
            videoUrl: 'https://www.youtube.com/embed/nu_pCVPKzTk',
            summary: 'Understanding modern client-server relationships, HTTP protocol basics, and the 2026 MERN ecosystem.',
            content: `### Welcome to Full-Stack Web Development!
In this opening module, we establish how a Single Page Application (SPA) communicates with decoupled backend web servers via asynchronous HTTP JSON requests.

#### Core Concepts Covered:
- **Client (Frontend)**: Responsible for UI state, rendering HTML, CSS styling, and handling user gestures.
- **Server (Backend)**: Encapsulates security, business rules, authentication, and data validation.
- **Database (MongoDB Atlas)**: Stores structured documents with indexing and high availability.
- **Deployment**: Linking Vercel frontend with Render backend over HTTPS.`,
            quiz: [
              {
                question: 'What is the primary role of a RESTful API in modern SPA architecture?',
                options: [
                  'To render server-side HTML tables directly to the user display',
                  'To provide a JSON data bridge between client and database over HTTP methods',
                  'To compile React components into WebAssembly bytecode',
                  'To manage browser local storage cookies automatically'
                ],
                correctAnswer: 1,
                explanation: 'REST APIs communicate structured JSON payloads between client and server using standard HTTP verbs like GET, POST, PUT, and DELETE.'
              },
              {
                question: 'Which tool is utilized for lightning-fast modern React development and bundling?',
                options: ['Webpack 1.0', 'Vite', 'Babel CLI', 'Grunt'],
                correctAnswer: 1,
                explanation: 'Vite leverages native ES modules in development to deliver instantaneous hot module replacement (HMR).'
              }
            ]
          },
          {
            title: '2. React 19 Component State & Modern Hooks',
            duration: '25 min',
            videoUrl: 'https://www.youtube.com/embed/bMknfKXIFA8',
            summary: 'Deep dive into React 19, functional components, useState, useEffect, and custom reusable hooks.',
            content: `### React 19 State Dynamics
State is the heart of interactive user interfaces. Whenever state changes in React, the component re-renders efficiently through the Virtual DOM reconciliation algorithm.

\`\`\`jsx
import React, { useState, useEffect } from 'react';

export default function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    document.title = \`You clicked \${count} times\`;
  }, [count]);

  return (
    <button onClick={() => setCount(prev => prev + 1)}>
      Clicked: {count}
    </button>
  );
}
\`\`\`

#### Key Rules of Hooks:
1. Only call hooks at the top level of React functions.
2. Only call hooks from React function components or custom hooks.
3. Always include every dependency in the useEffect dependency array.`,
            quiz: [
              {
                question: 'When does a useEffect with an empty dependency array [] execute?',
                options: [
                  'On every single render of the component',
                  'Only once after the initial component mount',
                  'Only when the parent component unmounts',
                  'Whenever any prop changes'
                ],
                correctAnswer: 1,
                explanation: 'An empty dependency array [] indicates that the effect does not rely on any values from props or state, so it runs once upon mount.'
              },
              {
                question: 'What is the recommended way to update state that depends on the previous state value?',
                options: [
                  'setCount(count + 1)',
                  'setCount(prev => prev + 1)',
                  'count = count + 1',
                  'this.state.count++'
                ],
                correctAnswer: 1,
                explanation: 'Passing an updater function (prev => prev + 1) ensures safe concurrent state transitions based on the latest state snapshot.'
              }
            ]
          },
          {
            title: '3. Connecting MongoDB Atlas Cloud & Mongoose Schemas',
            duration: '30 min',
            videoUrl: 'https://www.youtube.com/embed/ofme2o29ngU',
            summary: 'Setting up a free MongoDB Atlas cluster, configuring connection URIs, and enforcing schema validations.',
            content: `### MongoDB Atlas Cloud Integration
MongoDB Atlas is a multi-cloud database service built by the creators of MongoDB. It offers automated provisioning, elastic scaling, and built-in security.

#### Connecting Mongoose to Atlas:
\`\`\`javascript
const mongoose = require('mongoose');

const connectDB = async () => {
  const conn = await mongoose.connect(process.env.MONGO_URI);
  console.log(\`Atlas Connected: \${conn.connection.host}\`);
};
\`\`\`

#### Critical Atlas Setup Checklist:
- **Database User**: Create a username and password with read/write access.
- **Network Access**: Add IP \`0.0.0.0/0\` to allow serverless hosts like Render to reach your cluster.
- **Connection String**: Choose Node.js driver to obtain the \`mongodb+srv://...\` URI.`,
            quiz: [
              {
                question: 'Which IP whitelist setting allows Render or Vercel cloud servers to access your MongoDB Atlas database?',
                options: [
                  '127.0.0.1 (Localhost only)',
                  '0.0.0.0/0 (Allow Access from Anywhere)',
                  '192.168.1.1 (Local Gateway)',
                  '255.255.255.255 (Broadcast only)'
                ],
                correctAnswer: 1,
                explanation: 'Because cloud providers allocate dynamic outgoing IP addresses for containers, whitelisting 0.0.0.0/0 in Atlas Network Access allows your backend to connect reliably.'
              }
            ]
          }
        ]
      },
      {
        title: 'AI & LLM Application Engineering: From Prompts to Production',
        subtitle: 'Build intelligent applications leveraging OpenAI, Gemini API, RAG vector search, and agentic workflows.',
        description: 'Bridge software engineering with artificial intelligence. Learn how to integrate Large Language Models into modern web platforms. We cover system prompts, structured JSON outputs, embeddings with vector databases, and multi-step autonomous tool-calling agents.',
        category: 'Artificial Intelligence',
        level: 'Intermediate',
        thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&auto=format&fit=crop&q=80',
        instructor: instructor._id,
        instructorName: instructor.name,
        instructorTitle: instructor.headline,
        duration: '9.0 Hours',
        rating: 4.95,
        reviewsCount: 215,
        enrolledCount: 980,
        tags: ['Generative AI', 'Gemini API', 'LLMs', 'Vector Search', 'RAG', 'Agents'],
        learningOutcomes: [
          'Design robust system prompts for predictable structured JSON responses',
          'Implement Retrieval-Augmented Generation (RAG) using document embeddings',
          'Build agentic loops that execute external function calls and tools',
          'Monitor token usage and implement rate limiting for production AI systems'
        ],
        lessons: [
          {
            title: '1. Fundamentals of Large Language Models & Prompt Engineering',
            duration: '20 min',
            videoUrl: 'https://www.youtube.com/embed/jC4v5AS4RIM',
            summary: 'Understanding tokens, temperature, context windows, few-shot prompting, and chain-of-thought.',
            content: `### Large Language Model Foundations
LLMs are statistical autoregressive text prediction models trained on massive corpora of code and natural language.

#### Essential Parameters:
- **Temperature (0.0 to 1.0)**: Controls randomness. Low (0.1) for deterministic factual extraction; high (0.8) for creative tasks.
- **Context Window**: Maximum input + output token budget supported by the model architecture.
- **System Instructions**: Prime the model persona, tone, and guardrails.`,
            quiz: [
              {
                question: 'What temperature setting is recommended for deterministic tasks like JSON schema extraction?',
                options: ['0.0 - 0.2', '0.7 - 0.9', '1.5 - 2.0', '10.0'],
                correctAnswer: 0,
                explanation: 'Low temperature values (0.0 - 0.2) minimize token sampling variance, ensuring consistent and deterministic outputs.'
              }
            ]
          },
          {
            title: '2. Retrieval Augmented Generation (RAG) Architecture',
            duration: '35 min',
            videoUrl: 'https://www.youtube.com/embed/tcqEjkOfc8s',
            summary: 'Chunking text, generating dense vector embeddings, and performing semantic cosine similarity search.',
            content: `### What is RAG?
Retrieval-Augmented Generation enhances LLM prompts with dynamic external ground-truth documents retrieved from a vector database.

#### The RAG Pipeline:
1. **Ingestion**: Documents are chunked into 500-1000 token segments.
2. **Embedding**: Text chunks pass through an embedding model to yield high-dimensional vector representations.
3. **Storage**: Vectors are indexed in vector databases like MongoDB Atlas Vector Search or Pinecone.
4. **Query**: User query vector is matched against document vectors using cosine similarity.
5. **Synthesis**: Top-k relevant chunks are injected into the prompt as context.`,
            quiz: [
              {
                question: 'Why is RAG preferred over fine-tuning for dynamic corporate knowledge bases?',
                options: [
                  'RAG requires training the model weights from scratch every night',
                  'RAG allows immediate updates without expensive re-training and provides verifiable source citations',
                  'RAG completely eliminates the need for an LLM',
                  'RAG only works with binary image files'
                ],
                correctAnswer: 1,
                explanation: 'RAG updates dynamically simply by adding new documents to the vector store, eliminating lengthy and expensive weight re-training cycles.'
              },
              {
                question: 'Which metric measures the orientation and semantic alignment between two vector embeddings?',
                options: ['Cosine Similarity', 'Hamming Distance', 'HTTP Status Code', 'Baud Rate'],
                correctAnswer: 0,
                explanation: 'Cosine similarity evaluates the cosine of the angle between two high-dimensional vectors, measuring directional semantic similarity.'
              }
            ]
          },
          {
            title: '3. Autonomous Multi-Step AI Agents & Function Calling',
            duration: '40 min',
            videoUrl: 'https://www.youtube.com/embed/sal78ACtGTc',
            summary: 'Structuring model tool schemas, executing function call loops, and managing agent memory.',
            content: `### Agentic Loops & Tool Calling
AI Agents extend LLMs from conversational chatbots into autonomous problem solvers capable of calling APIs, querying databases, and executing shell commands.

#### The ReAct (Reason + Act) Loop:
1. **Thought**: The agent analyzes user goals and plans the next logical step.
2. **Action**: The agent triggers a specific structured tool invocation.
3. **Observation**: The runtime environment returns the tool execution output back to the agent.
4. **Conclusion**: The loop repeats until the goal is fully achieved.`,
            quiz: [
              {
                question: 'What is the primary difference between a static chatbot and an AI Agent?',
                options: [
                  'Chatbots have higher token context limits than agents',
                  'Agents have autonomy to call external tools, perceive outcomes, and take iterative follow-up actions',
                  'Chatbots execute machine code directly in the kernel',
                  'Agents cannot generate natural language responses'
                ],
                correctAnswer: 1,
                explanation: 'Agents combine reasoning loops with tool-calling capabilities to actively perform actions in external environments.'
              },
              {
                question: 'What safety mechanism prevents infinite execution loops in autonomous AI agents?',
                options: [
                  'Uncapped recursion loops',
                  'A maximum step iteration limit (maxSteps / budget)',
                  'Disabling all API keys after 1 second',
                  'Formatting every prompt as plain XML'
                ],
                correctAnswer: 1,
                explanation: 'Enforcing a strict maximum iteration step count ensures runaway loops are terminated gracefully.'
              }
            ]
          }
        ]
      },
      {
        title: 'Modern UI/UX Design & Design Systems with Figma',
        subtitle: 'Create polished, human-centered web and mobile experiences with industry-standard design tokens.',
        description: 'Transform rough ideas into captivating user experiences. Learn design hierarchy, responsive auto-layout, atomic design tokens, accessibility (WCAG 2.1), and interactive micro-prototypes in Figma ready for developer handoff.',
        category: 'UI/UX Design',
        level: 'Beginner',
        thumbnail: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800&auto=format&fit=crop&q=80',
        instructor: instructor._id,
        instructorName: instructor.name,
        instructorTitle: instructor.headline,
        duration: '7.0 Hours',
        rating: 4.85,
        reviewsCount: 180,
        enrolledCount: 750,
        tags: ['Figma', 'UI/UX', 'Design Systems', 'Auto Layout', 'Typography', 'Accessibility'],
        learningOutcomes: [
          'Master Figma Auto Layout and responsive constraints for flexible UI',
          'Create reusable design tokens for colors, typography, spacing, and shadows',
          'Conduct usability testing and apply WCAG color contrast standards',
          'Handoff designs seamlessly to front-end developers using inspect mode'
        ],
        lessons: [
          {
            title: '1. Visual Hierarchy, Spacing, and Typography Fundamentals',
            duration: '22 min',
            videoUrl: 'https://www.youtube.com/embed/FTFaQWZBqQ8',
            summary: 'Understanding the 8pt grid system, font pairing, contrast ratios, and visual rhythm.',
            content: `### Visual Design Principles
Good design guides the user's eye effortlessly toward the primary action through deliberate visual weight and spatial rhythm.

#### The 8-Point Grid System:
Standardizing all padding, margins, and component dimensions on multiples of 8 (8px, 16px, 24px, 32px, 48px) ensures mathematical harmony and effortless developer handoff.`,
            quiz: [
              {
                question: 'Why is the 8-point grid widely adopted in modern UI design systems?',
                options: [
                  'Because computer screens can only display numbers divisible by 8',
                  'It provides consistent spacing rhythm and scales cleanly across various screen densities',
                  'It is the only grid supported by CSS',
                  'It reduces font file sizes by 50%'
                ],
                correctAnswer: 1,
                explanation: 'Most modern screen resolutions are divisible by 8, preventing fractional pixel blur and creating balanced spatial consistency.'
              },
              {
                question: 'What is the minimum WCAG 2.1 AA color contrast ratio recommended for normal body text?',
                options: ['1:1', '3:1', '4.5:1', '21:1'],
                correctAnswer: 2,
                explanation: 'WCAG AA requires a 4.5:1 contrast ratio against the background for regular body text to ensure readability for visually impaired users.'
              }
            ]
          },
          {
            title: '2. Figma Auto Layout & Responsive Component Architecture',
            duration: '30 min',
            videoUrl: 'https://www.youtube.com/embed/NrKX46DzkGQ',
            summary: 'Mastering flex-direction, hug vs fill container constraints, padding, and nested frames.',
            content: `### Auto Layout Mastery
Auto Layout in Figma mirrors CSS Flexbox, allowing components to adapt fluidly to varying content lengths and screen dimensions.

#### Core Dimensions:
- **Fixed**: Explicit width/height in pixels.
- **Hug Contents**: Frame sizes dynamically to wrap inner child elements.
- **Fill Container**: Frame expands to consume available parent space.`,
            quiz: [
              {
                question: 'Which Figma Auto Layout property behaves like flex-grow: 1 in CSS?',
                options: ['Fixed Width', 'Hug Contents', 'Fill Container', 'Absolute Position'],
                correctAnswer: 2,
                explanation: 'Fill Container directs a child frame to expand and fill the remaining available space within its parent Auto Layout frame.'
              },
              {
                question: 'Why should buttons be configured with "Hug Contents" for width?',
                options: [
                  'To force the button to be 500px wide',
                  'So the button automatically expands or contracts according to the label text length and padding',
                  'To disable hover states',
                  'To prevent users from clicking the button'
                ],
                correctAnswer: 1,
                explanation: 'Hug Contents ensures padding stays consistent while accommodating translated or variable label text.'
              }
            ]
          },
          {
            title: '3. Design Tokens & Multi-Brand Component Systems',
            duration: '35 min',
            videoUrl: 'https://www.youtube.com/embed/kZd8Y3J1s7k',
            summary: 'Establishing color palettes, typography scales, semantic tokens, and dark mode variants.',
            content: `### Design Tokens as Source of Truth
Design tokens are platform-agnostic variables that store visual design attributes such as colors, typography, spacing, and elevation.

\`\`\`json
{
  "color": {
    "brand": {
      "primary": { "value": "#4f46e5" },
      "secondary": { "value": "#2563eb" }
    }
  }
}
\`\`\`

Using semantic tokens (e.g. \`color-text-primary\`) allows instant theme switching between light and dark modes.`,
            quiz: [
              {
                question: 'What is the key advantage of semantic tokens over literal hex color values?',
                options: [
                  'Semantic tokens abstract the purpose (e.g. surface-primary) allowing painless theming and dark mode swaps',
                  'Semantic tokens require 10x more code',
                  'Hex colors are not supported in modern browsers',
                  'Tokens make designs non-reusable'
                ],
                correctAnswer: 0,
                explanation: 'Semantic tokens capture the intent of a style, allowing underlying values to switch automatically between light and dark modes.'
              }
            ]
          }
        ]
      },
      {
        title: 'Cloud DevOps & Docker Mastery: CI/CD to AWS & Render',
        subtitle: 'Containerize, orchestrate, test, and deploy modern web applications using Docker, GitHub Actions, and Render.',
        description: 'Take your code from localhost to production with enterprise reliability. Learn container fundamentals with Docker, multi-stage builds, continuous integration pipelines, automated zero-downtime rollouts, and environment security.',
        category: 'Cloud & DevOps',
        level: 'Intermediate',
        thumbnail: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=800&auto=format&fit=crop&q=80',
        instructor: instructor._id,
        instructorName: instructor.name,
        instructorTitle: instructor.headline,
        duration: '8.5 Hours',
        rating: 4.9,
        reviewsCount: 195,
        enrolledCount: 890,
        tags: ['Docker', 'DevOps', 'CI/CD', 'Render', 'Vercel', 'Cloud'],
        learningOutcomes: [
          'Write multi-stage Dockerfiles for lean, secure container images',
          'Automate testing and deployment pipelines using GitHub Actions',
          'Configure custom domains, SSL certificates, and environment secrets',
          'Monitor application health and implement automated uptime alerts'
        ],
        lessons: [
          {
            title: '1. Containerizing Applications with Docker Multi-Stage Builds',
            duration: '28 min',
            videoUrl: 'https://www.youtube.com/embed/gAkwW2tuIqE',
            summary: 'Understanding container isolation, Dockerfile instructions, and optimizing image size with multi-stage builds.',
            content: `### Why Containers?
Containers package your code together with its exact runtime, libraries, system dependencies, and environment configuration, eliminating the classic "it works on my machine" problem.

#### Anatomy of a Dockerfile:
\`\`\`dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/dist ./dist
CMD ["node", "dist/index.js"]
\`\`\`

Multi-stage builds leave compiler artifacts behind, resulting in minimal image footprints and heightened security.`,
            quiz: [
              {
                question: 'What is the principal benefit of Docker multi-stage builds?',
                options: [
                  'They allow running multiple operating systems simultaneously in one container',
                  'They separate build tools from the final runtime image, creating much smaller and safer images',
                  'They increase CPU clock speed automatically',
                  'They bypass the need for Docker daemon'
                ],
                correctAnswer: 1,
                explanation: 'Multi-stage builds permit heavy build-time dependencies (like SDKs and compilers) to be discarded, resulting in ultra-compact production images.'
              },
              {
                question: 'Why should base images like "alpine" or "distroless" be prioritized in production?',
                options: [
                  'They contain video games',
                  'They significantly reduce the attack surface and vulnerabilities by omitting unnecessary binaries and package managers',
                  'They disable network requests',
                  'They only run in local development'
                ],
                correctAnswer: 1,
                explanation: 'Minimal base images contain only what is required to execute the process, drastically shrinking security vulnerabilities and CVEs.'
              }
            ]
          },
          {
            title: '2. Continuous Integration & Automated Testing with GitHub Actions',
            duration: '32 min',
            videoUrl: 'https://www.youtube.com/embed/R8_veQiYBjI',
            summary: 'Writing workflow YAML pipelines, caching npm dependencies, running linters, and parallelizing test runners.',
            content: `### Automated CI Pipelines
Continuous Integration guarantees that every pull request meets code quality, linting, and automated test passes before merging to the main branch.

#### GitHub Actions Workflow Structure:
- **Events**: \`on: [push, pull_request]\` triggers workflow runs.
- **Jobs**: Independent tasks that execute on isolated runners (e.g. \`ubuntu-latest\`).
- **Steps**: Sequential actions or commands executed within a job.`,
            quiz: [
              {
                question: 'Where must GitHub Actions workflow definition files be stored in a git repository?',
                options: [
                  '/.github/workflows/*.yml',
                  '/scripts/actions.json',
                  '/public/github.txt',
                  '/node_modules/.github'
                ],
                correctAnswer: 0,
                explanation: 'GitHub automatically discovers and executes workflow pipelines declared inside the .github/workflows directory.'
              },
              {
                question: 'What is the purpose of caching dependencies (like ~/.npm) in CI pipelines?',
                options: [
                  'To delete the node_modules folder',
                  'To speed up pipeline execution by skipping redundant package downloads across runs',
                  'To send telemetry to third-party services',
                  'To encrypt pull request comments'
                ],
                correctAnswer: 1,
                explanation: 'Dependency caching dramatically slashes pipeline run duration by restoring previously downloaded packages.'
              }
            ]
          },
          {
            title: '3. Cloud Deployments, Health Checks, and Zero-Downtime Rollouts',
            duration: '26 min',
            videoUrl: 'https://www.youtube.com/embed/7VnSjN1e5kI',
            summary: 'Deploying full-stack applications to Render and Vercel, managing environment variables, and rolling updates.',
            content: `### Zero-Downtime Deployments
Modern cloud platforms implement rolling zero-downtime updates:
1. Platform provisions new containers with the latest image.
2. Platform queries the HTTP \`/api/health\` endpoint.
3. Once the health check returns HTTP 200 OK, traffic is routed to the new containers.
4. Old containers receive SIGTERM and terminate cleanly.`,
            quiz: [
              {
                question: 'Why are health check endpoints (/api/health) vital in automated container deployments?',
                options: [
                  'They send spam emails to administrators',
                  'They verify that the newly launched container is fully booted and ready to serve traffic before routing real user requests to it',
                  'They format the server hard drive',
                  'They are only used in development environments'
                ],
                correctAnswer: 1,
                explanation: 'Health checks prevent traffic from hitting uninitialized or crashing instances, ensuring uninterrupted 100% uptime for end users.'
              }
            ]
          }
        ]
      }
    ];

    const createdCourses = await Course.create(coursesToSeed);
    console.log(`Successfully created ${createdCourses.length} courses!`);

    // Enroll demo student in the first course with 1 completed lesson & quiz passed
    console.log('Enrolling demo student in Course 1 with active progress...');
    const firstCourse = createdCourses[0];
    const firstLesson = firstCourse.lessons[0];

    await Enrollment.create({
      user: student._id,
      course: firstCourse._id,
      completedLessonIds: [firstLesson._id],
      progressPercentage: 33,
      lastAccessedLessonId: firstLesson._id,
      quizSubmissions: [
        {
          lessonId: firstLesson._id,
          score: 2,
          totalQuestions: 2,
          percentage: 100,
          passed: true,
          submittedAt: new Date()
        }
      ]
    });

    console.log('---------------------------------------------------------');
    console.log('✅ DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('---------------------------------------------------------');
    console.log('Demo Credentials Ready:');
    console.log('  👨‍🎓 Student:    student@learnhub.dev    / Student@123');
    console.log('  👩‍🏫 Instructor: instructor@learnhub.dev / Instructor@123');
    console.log('  🛡️ Admin:      admin@learnhub.dev      / Admin@123');
    console.log('---------------------------------------------------------');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed with error:', error);
    process.exit(1);
  }
};

seedData();
