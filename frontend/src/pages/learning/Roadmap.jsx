import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, BookOpen, PlayCircle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { learningService } from '../../services/api';
import { toast } from 'react-hot-toast';
import ForceGraph3D from 'react-force-graph-3d';
import * as THREE from 'three';

const Roadmap = () => {
  const { user } = useAuth();
  const [nodes, setNodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const fgRef = useRef();

  useEffect(() => {
    fetchRoadmap();
  }, []);

  const fetchRoadmap = async () => {
    try {
      setLoading(true);
      const res = await learningService.getPaths();
      const pathNodes = res.data?.nodes || res.data || [];
      if (pathNodes.length > 0) {
        setNodes(pathNodes);
      } else {
        // Generate personalized fallback from user profile
        const userSkills = typeof user?.skills === 'string' ? JSON.parse(user.skills) : (user?.skills || []);
        const goal = user?.career_goal || 'Full Stack Developer';
        
        // Build a personalized roadmap based on career goal
        const roadmapTemplates = {
          'Full Stack Developer': [
            { id: '1', title: 'Internet & Web Basics', status: 'completed', description: 'Understand how the web works', estimated_hours: 10, resources: ['https://developer.mozilla.org/en-US/docs/Learn/Getting_started_with_the_web'], skills_gained: ['Web Basics'] },
            { id: '2', title: 'HTML, CSS & JavaScript', status: 'active', description: 'Core web technologies', estimated_hours: 40, resources: ['https://javascript.info/'], skills_gained: ['HTML', 'CSS', 'JavaScript'] },
            { id: '3', title: 'React & Frontend Frameworks', status: 'locked', description: 'Modern UI development', estimated_hours: 60, resources: ['https://react.dev/'], skills_gained: ['React', 'Frontend'] },
            { id: '4', title: 'Version Control (Git)', status: 'locked', description: 'Code management', estimated_hours: 15, resources: ['https://git-scm.com/'], skills_gained: ['Git', 'GitHub'] },
            { id: '5', title: 'Node.js & Express', status: 'locked', description: 'Server-side development', estimated_hours: 50, resources: ['https://nodejs.org/'], skills_gained: ['Node.js', 'Express', 'Backend'] },
            { id: '6', title: 'Databases & SQL', status: 'locked', description: 'Data persistence layer', estimated_hours: 40, resources: ['https://www.postgresql.org/'], skills_gained: ['SQL', 'PostgreSQL', 'Databases'] },
            { id: '7', title: 'API Design & GraphQL', status: 'locked', description: 'Building scalable APIs', estimated_hours: 30, resources: ['https://graphql.org/'], skills_gained: ['REST API', 'GraphQL'] },
            { id: '8', title: 'DevOps & Deployment', status: 'locked', description: 'CI/CD and cloud hosting', estimated_hours: 40, resources: ['https://aws.amazon.com/'], skills_gained: ['AWS', 'Docker', 'CI/CD'] }
          ],
          'Data Scientist': [
            { id: '1', title: 'Math & Statistics', status: 'completed', description: 'Mathematical foundations', estimated_hours: 40, resources: ['https://khanacademy.org/'], skills_gained: ['Statistics', 'Linear Algebra'] },
            { id: '2', title: 'Python Fundamentals', status: 'active', description: 'Core Python programming', estimated_hours: 40, resources: ['https://www.python.org/'], skills_gained: ['Python'] },
            { id: '3', title: 'Pandas & Data Wrangling', status: 'locked', description: 'Data manipulation', estimated_hours: 30, resources: ['https://pandas.pydata.org/'], skills_gained: ['Pandas', 'Data Cleaning'] },
            { id: '4', title: 'Data Visualization', status: 'locked', description: 'Visualizing data', estimated_hours: 20, resources: ['https://matplotlib.org/'], skills_gained: ['Matplotlib', 'Seaborn'] },
            { id: '5', title: 'Machine Learning', status: 'locked', description: 'ML algorithms and models', estimated_hours: 60, resources: ['https://scikit-learn.org/'], skills_gained: ['Machine Learning', 'Scikit-Learn'] },
            { id: '6', title: 'Deep Learning', status: 'locked', description: 'Neural networks', estimated_hours: 50, resources: ['https://pytorch.org/'], skills_gained: ['Deep Learning', 'PyTorch'] },
            { id: '7', title: 'NLP & Text Analytics', status: 'locked', description: 'Natural language processing', estimated_hours: 40, resources: ['https://huggingface.co/'], skills_gained: ['NLP', 'Transformers'] },
            { id: '8', title: 'Data Engineering Basics', status: 'locked', description: 'Data pipelines', estimated_hours: 30, resources: ['https://spark.apache.org/'], skills_gained: ['ETL', 'Spark'] }
          ],
          'DevOps Engineer': [
            { id: '1', title: 'Linux & Shell Scripting', status: 'completed', description: 'System administration', estimated_hours: 30, resources: ['https://linuxjourney.com/'], skills_gained: ['Linux', 'Bash'] },
            { id: '2', title: 'Networking & Security', status: 'active', description: 'Core concepts', estimated_hours: 40, resources: ['https://www.cisco.com/'], skills_gained: ['Networking', 'Security'] },
            { id: '3', title: 'Docker & Containers', status: 'locked', description: 'Containerization', estimated_hours: 30, resources: ['https://www.docker.com/'], skills_gained: ['Docker'] },
            { id: '4', title: 'Kubernetes', status: 'locked', description: 'Container orchestration', estimated_hours: 50, resources: ['https://kubernetes.io/'], skills_gained: ['Kubernetes'] },
            { id: '5', title: 'CI/CD Pipelines', status: 'locked', description: 'Automation and deployment', estimated_hours: 40, resources: ['https://jenkins.io/'], skills_gained: ['Jenkins', 'GitHub Actions'] },
            { id: '6', title: 'Infrastructure as Code', status: 'locked', description: 'Terraform & Ansible', estimated_hours: 40, resources: ['https://www.terraform.io/'], skills_gained: ['Terraform', 'Ansible'] },
            { id: '7', title: 'Cloud Infrastructure', status: 'locked', description: 'AWS/GCP/Azure', estimated_hours: 60, resources: ['https://aws.amazon.com/'], skills_gained: ['AWS', 'Cloud Computing'] },
            { id: '8', title: 'Monitoring & Logging', status: 'locked', description: 'Observability', estimated_hours: 30, resources: ['https://prometheus.io/'], skills_gained: ['Prometheus', 'Grafana'] }
          ],
          'AI/ML Engineer': [
            { id: '1', title: 'Python & Math Foundations', status: 'completed', description: 'Prerequisites', estimated_hours: 40, resources: ['https://www.coursera.org/'], skills_gained: ['Python', 'Calculus'] },
            { id: '2', title: 'Machine Learning Basics', status: 'active', description: 'Supervised & unsupervised learning', estimated_hours: 50, resources: ['https://scikit-learn.org/'], skills_gained: ['Machine Learning'] },
            { id: '3', title: 'Deep Learning & Neural Networks', status: 'locked', description: 'Neural architectures', estimated_hours: 60, resources: ['https://www.deeplearning.ai/'], skills_gained: ['Deep Learning', 'TensorFlow'] },
            { id: '4', title: 'NLP & Computer Vision', status: 'locked', description: 'Specialized domains', estimated_hours: 60, resources: ['https://pytorch.org/'], skills_gained: ['NLP', 'Computer Vision'] },
            { id: '5', title: 'Generative AI', status: 'locked', description: 'LLMs and diffusion models', estimated_hours: 50, resources: ['https://huggingface.co/'], skills_gained: ['LLMs', 'Generative AI'] },
            { id: '6', title: 'MLOps', status: 'locked', description: 'Production ML systems', estimated_hours: 40, resources: ['https://mlflow.org/'], skills_gained: ['MLOps', 'MLflow'] },
            { id: '7', title: 'Model Optimization', status: 'locked', description: 'Quantization & pruning', estimated_hours: 30, resources: ['https://developer.nvidia.com/'], skills_gained: ['Optimization', 'TensorRT'] },
            { id: '8', title: 'Edge AI Deployment', status: 'locked', description: 'Deploying on devices', estimated_hours: 30, resources: ['https://www.tensorflow.org/lite'], skills_gained: ['Edge AI', 'TFLite'] }
          ],
          'Frontend Engineer': [
            { id: '1', title: 'Internet & HTML/CSS', status: 'completed', description: 'Web basics', estimated_hours: 30, resources: ['https://web.dev/'], skills_gained: ['HTML', 'CSS'] },
            { id: '2', title: 'JavaScript & DOM', status: 'active', description: 'Interactivity', estimated_hours: 50, resources: ['https://javascript.info/'], skills_gained: ['JavaScript', 'DOM'] },
            { id: '3', title: 'Version Control', status: 'locked', description: 'Git basics', estimated_hours: 15, resources: ['https://git-scm.com/'], skills_gained: ['Git'] },
            { id: '4', title: 'React Basics', status: 'locked', description: 'Components & State', estimated_hours: 40, resources: ['https://react.dev/'], skills_gained: ['React'] },
            { id: '5', title: 'Advanced React', status: 'locked', description: 'Hooks & Context', estimated_hours: 40, resources: ['https://react.dev/'], skills_gained: ['Hooks', 'State Management'] },
            { id: '6', title: 'CSS Frameworks', status: 'locked', description: 'Tailwind & Styling', estimated_hours: 30, resources: ['https://tailwindcss.com/'], skills_gained: ['Tailwind CSS', 'SASS'] },
            { id: '7', title: 'Testing', status: 'locked', description: 'Unit and E2E testing', estimated_hours: 30, resources: ['https://vitest.dev/'], skills_gained: ['Testing', 'Jest'] },
            { id: '8', title: 'Performance & Build Tools', status: 'locked', description: 'Vite & Webpack', estimated_hours: 40, resources: ['https://vitejs.dev/'], skills_gained: ['Vite', 'Webpack'] }
          ],
          'Backend Engineer': [
            { id: '1', title: 'Programming Fundamentals', status: 'completed', description: 'Core logic', estimated_hours: 40, resources: ['https://www.codecademy.com/'], skills_gained: ['Programming Logic'] },
            { id: '2', title: 'Backend Language (Python/Node/Java)', status: 'active', description: 'Language of choice', estimated_hours: 50, resources: ['https://nodejs.org/'], skills_gained: ['Node.js', 'Python', 'Java'] },
            { id: '3', title: 'Relational Databases', status: 'locked', description: 'SQL & Data Modeling', estimated_hours: 40, resources: ['https://www.postgresql.org/'], skills_gained: ['SQL', 'PostgreSQL'] },
            { id: '4', title: 'APIs & REST', status: 'locked', description: 'Building endpoints', estimated_hours: 30, resources: ['https://restfulapi.net/'], skills_gained: ['REST', 'APIs'] },
            { id: '5', title: 'Authentication & Security', status: 'locked', description: 'OAuth & JWT', estimated_hours: 30, resources: ['https://jwt.io/'], skills_gained: ['Security', 'JWT'] },
            { id: '6', title: 'NoSQL Databases', status: 'locked', description: 'MongoDB & Redis', estimated_hours: 30, resources: ['https://www.mongodb.com/'], skills_gained: ['MongoDB', 'Redis'] },
            { id: '7', title: 'Message Brokers', status: 'locked', description: 'Kafka & RabbitMQ', estimated_hours: 40, resources: ['https://kafka.apache.org/'], skills_gained: ['Kafka', 'RabbitMQ'] },
            { id: '8', title: 'System Design', status: 'locked', description: 'Scalable architectures', estimated_hours: 50, resources: ['https://github.com/donnemartin/system-design-primer'], skills_gained: ['System Design', 'Microservices'] }
          ],
          'Mobile Developer': [
            { id: '1', title: 'Programming Basics', status: 'completed', description: 'Variables, loops, logic', estimated_hours: 30, resources: ['https://www.freecodecamp.org/'], skills_gained: ['Programming Logic'] },
            { id: '2', title: 'Mobile UI/UX Principles', status: 'active', description: 'Design guidelines', estimated_hours: 20, resources: ['https://developer.apple.com/design/'], skills_gained: ['Mobile Design'] },
            { id: '3', title: 'React Native or Flutter', status: 'locked', description: 'Cross-platform framework', estimated_hours: 60, resources: ['https://reactnative.dev/'], skills_gained: ['React Native', 'Flutter'] },
            { id: '4', title: 'State Management', status: 'locked', description: 'Redux or Provider', estimated_hours: 30, resources: ['https://redux.js.org/'], skills_gained: ['State Management'] },
            { id: '5', title: 'Native Device Features', status: 'locked', description: 'Camera, GPS, Sensors', estimated_hours: 40, resources: ['https://docs.expo.dev/'], skills_gained: ['Device APIs'] },
            { id: '6', title: 'Local Storage & SQLite', status: 'locked', description: 'Offline data', estimated_hours: 30, resources: ['https://www.sqlite.org/'], skills_gained: ['SQLite', 'Offline Storage'] },
            { id: '7', title: 'Push Notifications', status: 'locked', description: 'FCM & APNs', estimated_hours: 25, resources: ['https://firebase.google.com/'], skills_gained: ['Push Notifications', 'Firebase'] },
            { id: '8', title: 'App Store Deployment', status: 'locked', description: 'Releasing to stores', estimated_hours: 20, resources: ['https://developer.apple.com/'], skills_gained: ['App Deployment', 'CI/CD'] }
          ],
          'Cloud Architect': [
            { id: '1', title: 'IT Fundamentals', status: 'completed', description: 'Servers, Storage, Network', estimated_hours: 30, resources: ['https://www.comptia.org/'], skills_gained: ['IT Basics'] },
            { id: '2', title: 'Cloud Computing Basics', status: 'active', description: 'IaaS, PaaS, SaaS', estimated_hours: 30, resources: ['https://aws.amazon.com/'], skills_gained: ['Cloud Concepts'] },
            { id: '3', title: 'Compute Services', status: 'locked', description: 'EC2, VMs, Serverless', estimated_hours: 40, resources: ['https://aws.amazon.com/ec2/'], skills_gained: ['EC2', 'Serverless'] },
            { id: '4', title: 'Cloud Storage', status: 'locked', description: 'S3, Block Storage, Databases', estimated_hours: 40, resources: ['https://aws.amazon.com/s3/'], skills_gained: ['S3', 'Cloud Databases'] },
            { id: '5', title: 'Networking (VPC)', status: 'locked', description: 'Subnets, Routing, VPN', estimated_hours: 50, resources: ['https://aws.amazon.com/vpc/'], skills_gained: ['VPC', 'Networking'] },
            { id: '6', title: 'Security & IAM', status: 'locked', description: 'Identity and access', estimated_hours: 40, resources: ['https://aws.amazon.com/iam/'], skills_gained: ['IAM', 'Security'] },
            { id: '7', title: 'Infrastructure as Code', status: 'locked', description: 'CloudFormation or Terraform', estimated_hours: 50, resources: ['https://www.terraform.io/'], skills_gained: ['Terraform', 'IaC'] },
            { id: '8', title: 'Architecture Patterns', status: 'locked', description: 'Well-Architected Framework', estimated_hours: 60, resources: ['https://aws.amazon.com/architecture/well-architected/'], skills_gained: ['Architecture', 'System Design'] }
          ],
          'Cybersecurity Analyst': [
            { id: '1', title: 'IT & Networking Basics', status: 'completed', description: 'OSI Model, TCP/IP', estimated_hours: 40, resources: ['https://www.coursera.org/'], skills_gained: ['Networking', 'TCP/IP'] },
            { id: '2', title: 'Operating Systems', status: 'active', description: 'Linux & Windows internals', estimated_hours: 40, resources: ['https://linuxjourney.com/'], skills_gained: ['Linux', 'Windows OS'] },
            { id: '3', title: 'Security Principles', status: 'locked', description: 'CIA Triad, Risk Management', estimated_hours: 30, resources: ['https://www.sans.org/'], skills_gained: ['Security Principles'] },
            { id: '4', title: 'Network Security', status: 'locked', description: 'Firewalls, IDS/IPS', estimated_hours: 40, resources: ['https://www.paloaltonetworks.com/'], skills_gained: ['Network Security', 'Firewalls'] },
            { id: '5', title: 'Vulnerability Assessment', status: 'locked', description: 'Scanning and mitigation', estimated_hours: 50, resources: ['https://www.tenable.com/'], skills_gained: ['Vulnerability Scanning'] },
            { id: '6', title: 'Incident Response', status: 'locked', description: 'Handling breaches', estimated_hours: 40, resources: ['https://www.incidentresponse.com/'], skills_gained: ['Incident Response'] },
            { id: '7', title: 'SIEM Tools', status: 'locked', description: 'Splunk, ELK Stack', estimated_hours: 50, resources: ['https://www.splunk.com/'], skills_gained: ['SIEM', 'Splunk'] },
            { id: '8', title: 'Penetration Testing Basics', status: 'locked', description: 'Ethical Hacking', estimated_hours: 60, resources: ['https://www.kali.org/'], skills_gained: ['Penetration Testing', 'Kali Linux'] }
          ],
          'UI/UX Designer': [
            { id: '1', title: 'Design Fundamentals', status: 'completed', description: 'Color, Typography, Layout', estimated_hours: 30, resources: ['https://designcode.io/'], skills_gained: ['Design Basics', 'Typography'] },
            { id: '2', title: 'UX Principles', status: 'active', description: 'User-centered design', estimated_hours: 40, resources: ['https://www.nngroup.com/'], skills_gained: ['UX Principles', 'User Research'] },
            { id: '3', title: 'Figma & Tools', status: 'locked', description: 'Mastering design software', estimated_hours: 50, resources: ['https://www.figma.com/'], skills_gained: ['Figma', 'Prototyping'] },
            { id: '4', title: 'Wireframing', status: 'locked', description: 'Low & High Fidelity', estimated_hours: 30, resources: ['https://balsamiq.com/'], skills_gained: ['Wireframing'] },
            { id: '5', title: 'UI Components & Systems', status: 'locked', description: 'Design systems', estimated_hours: 40, resources: ['https://material.io/'], skills_gained: ['Design Systems', 'UI Components'] },
            { id: '6', title: 'Prototyping & Animation', status: 'locked', description: 'Interactive designs', estimated_hours: 30, resources: ['https://www.framer.com/'], skills_gained: ['Prototyping', 'Micro-interactions'] },
            { id: '7', title: 'User Testing', status: 'locked', description: 'Usability testing', estimated_hours: 30, resources: ['https://www.usertesting.com/'], skills_gained: ['Usability Testing'] },
            { id: '8', title: 'Developer Handoff', status: 'locked', description: 'Specs and collaboration', estimated_hours: 20, resources: ['https://zeplin.io/'], skills_gained: ['Handoff', 'Collaboration'] }
          ],
          'Game Developer': [
            { id: '1', title: 'Programming Basics (C#/C++)', status: 'completed', description: 'Core languages for gaming', estimated_hours: 50, resources: ['https://learn.microsoft.com/'], skills_gained: ['C#', 'C++'] },
            { id: '2', title: 'Game Engine (Unity/Unreal)', status: 'active', description: 'Engine basics', estimated_hours: 60, resources: ['https://unity.com/'], skills_gained: ['Unity', 'Unreal Engine'] },
            { id: '3', title: '2D & 3D Math', status: 'locked', description: 'Vectors, Quaternions', estimated_hours: 40, resources: ['https://www.khanacademy.org/'], skills_gained: ['Game Math', 'Physics'] },
            { id: '4', title: 'Physics & Animation', status: 'locked', description: 'Rigidbodies, Collisions', estimated_hours: 40, resources: ['https://docs.unity3d.com/'], skills_gained: ['Game Physics', 'Animation'] },
            { id: '5', title: 'Scripting & Logic', status: 'locked', description: 'Game loops, AI', estimated_hours: 50, resources: ['https://www.coursera.org/'], skills_gained: ['Game Logic', 'Game AI'] },
            { id: '6', title: 'UI & Audio', status: 'locked', description: 'Menus, SFX, Music', estimated_hours: 30, resources: ['https://learn.unity.com/'], skills_gained: ['Game UI', 'Audio Integration'] },
            { id: '7', title: 'Optimization', status: 'locked', description: 'Performance tuning', estimated_hours: 30, resources: ['https://developer.nvidia.com/'], skills_gained: ['Performance Optimization'] },
            { id: '8', title: 'Publishing', status: 'locked', description: 'Steam, Mobile stores', estimated_hours: 20, resources: ['https://partner.steamgames.com/'], skills_gained: ['Game Publishing'] }
          ],
          'Blockchain Developer': [
            { id: '1', title: 'Cryptography Basics', status: 'completed', description: 'Hashes, Signatures', estimated_hours: 30, resources: ['https://www.khanacademy.org/'], skills_gained: ['Cryptography'] },
            { id: '2', title: 'Blockchain Fundamentals', status: 'active', description: 'Consensus, Blocks', estimated_hours: 40, resources: ['https://bitcoin.org/'], skills_gained: ['Blockchain', 'Consensus Algorithms'] },
            { id: '3', title: 'Ethereum & Smart Contracts', status: 'locked', description: 'EVM basics', estimated_hours: 50, resources: ['https://ethereum.org/'], skills_gained: ['Ethereum', 'Smart Contracts'] },
            { id: '4', title: 'Solidity Programming', status: 'locked', description: 'Writing contracts', estimated_hours: 60, resources: ['https://soliditylang.org/'], skills_gained: ['Solidity'] },
            { id: '5', title: 'Web3.js / Ethers.js', status: 'locked', description: 'Frontend integration', estimated_hours: 40, resources: ['https://docs.ethers.io/'], skills_gained: ['Web3.js', 'Ethers.js'] },
            { id: '6', title: 'DeFi & Oracles', status: 'locked', description: 'Chainlink, Tokens', estimated_hours: 40, resources: ['https://chain.link/'], skills_gained: ['DeFi', 'Oracles'] },
            { id: '7', title: 'Security & Auditing', status: 'locked', description: 'Smart contract security', estimated_hours: 50, resources: ['https://consensys.net/'], skills_gained: ['Smart Contract Security'] },
            { id: '8', title: 'L2 Scaling Solutions', status: 'locked', description: 'Rollups, Polygon', estimated_hours: 30, resources: ['https://polygon.technology/'], skills_gained: ['Layer 2', 'Scaling'] }
          ],
          'Data Engineer': [
            { id: '1', title: 'SQL & Database Basics', status: 'completed', description: 'Data querying', estimated_hours: 40, resources: ['https://www.postgresql.org/'], skills_gained: ['SQL', 'Databases'] },
            { id: '2', title: 'Programming (Python/Scala)', status: 'active', description: 'Scripting data pipelines', estimated_hours: 50, resources: ['https://www.python.org/'], skills_gained: ['Python', 'Scala'] },
            { id: '3', title: 'Data Warehousing', status: 'locked', description: 'Snowflake, BigQuery', estimated_hours: 50, resources: ['https://www.snowflake.com/'], skills_gained: ['Data Warehousing'] },
            { id: '4', title: 'ETL / ELT Pipelines', status: 'locked', description: 'Data extraction and loading', estimated_hours: 50, resources: ['https://airflow.apache.org/'], skills_gained: ['ETL', 'Airflow'] },
            { id: '5', title: 'Big Data Processing', status: 'locked', description: 'Hadoop, Spark', estimated_hours: 60, resources: ['https://spark.apache.org/'], skills_gained: ['Apache Spark', 'Hadoop'] },
            { id: '6', title: 'Stream Processing', status: 'locked', description: 'Kafka, Flink', estimated_hours: 50, resources: ['https://kafka.apache.org/'], skills_gained: ['Kafka', 'Stream Processing'] },
            { id: '7', title: 'Cloud Data Platforms', status: 'locked', description: 'AWS/GCP/Azure Data Services', estimated_hours: 40, resources: ['https://aws.amazon.com/big-data/'], skills_gained: ['Cloud Data'] },
            { id: '8', title: 'Data Modeling & Governance', status: 'locked', description: 'Schemas and quality', estimated_hours: 30, resources: ['https://www.dremio.com/'], skills_gained: ['Data Modeling'] }
          ],
          'QA/Test Engineer': [
            { id: '1', title: 'Software Testing Basics', status: 'completed', description: 'Manual testing concepts', estimated_hours: 30, resources: ['https://www.istqb.org/'], skills_gained: ['Manual Testing', 'QA Basics'] },
            { id: '2', title: 'Test Planning & Cases', status: 'active', description: 'Writing effective tests', estimated_hours: 30, resources: ['https://qase.io/'], skills_gained: ['Test Cases', 'Test Planning'] },
            { id: '3', title: 'Programming for QA', status: 'locked', description: 'Python/Java/JS basics', estimated_hours: 40, resources: ['https://www.codecademy.com/'], skills_gained: ['Programming for QA'] },
            { id: '4', title: 'Web Automation', status: 'locked', description: 'Selenium, Cypress, Playwright', estimated_hours: 60, resources: ['https://playwright.dev/'], skills_gained: ['Test Automation', 'Playwright'] },
            { id: '5', title: 'API Testing', status: 'locked', description: 'Postman, REST Assured', estimated_hours: 40, resources: ['https://www.postman.com/'], skills_gained: ['API Testing', 'Postman'] },
            { id: '6', title: 'Performance Testing', status: 'locked', description: 'JMeter, k6', estimated_hours: 40, resources: ['https://k6.io/'], skills_gained: ['Performance Testing', 'k6'] },
            { id: '7', title: 'Mobile Testing', status: 'locked', description: 'Appium', estimated_hours: 40, resources: ['https://appium.io/'], skills_gained: ['Mobile Automation', 'Appium'] },
            { id: '8', title: 'CI/CD Integration', status: 'locked', description: 'Running tests in pipelines', estimated_hours: 30, resources: ['https://github.com/features/actions'], skills_gained: ['CI/CD Testing'] }
          ],
          'Product Manager': [
            { id: '1', title: 'Product Fundamentals', status: 'completed', description: 'What is Product Management', estimated_hours: 30, resources: ['https://www.productschool.com/'], skills_gained: ['Product Management'] },
            { id: '2', title: 'Market & User Research', status: 'active', description: 'Understanding users', estimated_hours: 40, resources: ['https://www.mindtheproduct.com/'], skills_gained: ['User Research', 'Market Analysis'] },
            { id: '3', title: 'Product Strategy & Vision', status: 'locked', description: 'Setting the direction', estimated_hours: 30, resources: ['https://svpg.com/'], skills_gained: ['Product Strategy'] },
            { id: '4', title: 'Agile & Scrum', status: 'locked', description: 'Development methodologies', estimated_hours: 30, resources: ['https://www.scrum.org/'], skills_gained: ['Agile', 'Scrum'] },
            { id: '5', title: 'Roadmapping & Prioritization', status: 'locked', description: 'Planning features', estimated_hours: 40, resources: ['https://www.aha.io/'], skills_gained: ['Roadmapping', 'Prioritization'] },
            { id: '6', title: 'UI/UX & Prototyping Basics', status: 'locked', description: 'Working with designers', estimated_hours: 30, resources: ['https://www.figma.com/'], skills_gained: ['Wireframing', 'UX Principles'] },
            { id: '7', title: 'Data & Metrics', status: 'locked', description: 'KPIs, Analytics', estimated_hours: 40, resources: ['https://mixpanel.com/'], skills_gained: ['Product Analytics', 'KPIs'] },
            { id: '8', title: 'Go-to-Market Strategy', status: 'locked', description: 'Launching products', estimated_hours: 30, resources: ['https://productmarketingalliance.com/'], skills_gained: ['GTM Strategy', 'Product Launch'] }
          ]
        };

        // Match career goal to template or build from skills
        let selectedRoadmap = null;
        const goalLower = goal.toLowerCase();
        
        const synonyms = {
          'frontend': 'Frontend Engineer',
          'front-end': 'Frontend Engineer',
          'backend': 'Backend Engineer',
          'back-end': 'Backend Engineer',
          'mobile': 'Mobile Developer',
          'ios': 'Mobile Developer',
          'android': 'Mobile Developer',
          'cyber': 'Cybersecurity Analyst',
          'security': 'Cybersecurity Analyst',
          'ux': 'UI/UX Designer',
          'ui': 'UI/UX Designer',
          'design': 'UI/UX Designer',
          'game': 'Game Developer',
          'gaming': 'Game Developer',
          'blockchain': 'Blockchain Developer',
          'crypto': 'Blockchain Developer',
          'web3': 'Blockchain Developer',
          'data eng': 'Data Engineer',
          'qa': 'QA/Test Engineer',
          'test': 'QA/Test Engineer',
          'product': 'Product Manager',
          'pm': 'Product Manager',
          'full stack': 'Full Stack Developer',
          'full-stack': 'Full Stack Developer',
          'fullstack': 'Full Stack Developer',
          'data sci': 'Data Scientist',
          'machine learning': 'AI/ML Engineer',
          'ml': 'AI/ML Engineer',
          'ai': 'AI/ML Engineer',
          'devops': 'DevOps Engineer',
          'cloud': 'Cloud Architect'
        };

        // Check exact match or substring match first
        for (const [key, template] of Object.entries(roadmapTemplates)) {
          if (goalLower.includes(key.toLowerCase()) || key.toLowerCase().includes(goalLower)) {
            selectedRoadmap = JSON.parse(JSON.stringify(template)); // deep copy to modify status
            break;
          }
        }

        // If no match, check synonyms
        if (!selectedRoadmap) {
          for (const [synonym, role] of Object.entries(synonyms)) {
            if (goalLower.includes(synonym)) {
              selectedRoadmap = JSON.parse(JSON.stringify(roadmapTemplates[role]));
              break;
            }
          }
        }

        if (selectedRoadmap) {
          // Personalize based on user skills
          if (userSkills.length > 0) {
            let userSkillsLower = userSkills.map(s => (typeof s === 'object' ? s.name : s).toLowerCase());
            
            selectedRoadmap.forEach(node => {
              const nodeSkills = node.skills_gained?.map(s => s.toLowerCase()) || [];
              const nodeTitle = node.title.toLowerCase();
              
              const hasSkill = userSkillsLower.some(us => 
                nodeTitle.includes(us) || 
                nodeSkills.some(ns => ns.includes(us) || us.includes(ns))
              );
              
              if (hasSkill) {
                node.status = 'completed';
              } else {
                node.status = 'locked'; // reset to locked, we'll set active later
              }
            });
            
            // Now set the first non-completed node to active
            let activeSet = false;
            for (let i = 0; i < selectedRoadmap.length; i++) {
              if (selectedRoadmap[i].status !== 'completed' && !activeSet) {
                selectedRoadmap[i].status = 'active';
                activeSet = true;
              } else if (selectedRoadmap[i].status !== 'completed') {
                selectedRoadmap[i].status = 'locked';
              }
            }
          }
        }

        if (!selectedRoadmap && userSkills.length > 0) {
          // Build from skills: mark known skills as completed
          selectedRoadmap = userSkills.slice(0, 8).map((skill, idx) => {
            const name = typeof skill === 'object' ? skill.name : skill;
            return {
              id: String(idx + 1),
              title: name,
              status: idx === 0 ? 'completed' : idx === 1 ? 'active' : 'locked',
              description: `Master ${name} for your career path`,
              estimated_hours: 40,
              resources: [],
              skills_gained: [name]
            };
          });
        }
        
        setNodes(selectedRoadmap || JSON.parse(JSON.stringify(roadmapTemplates['Full Stack Developer'])));
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to load your roadmap');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    try {
      setGenerating(true);
      await learningService.generatePath();
      toast.success('Career Roadmap generated based on your profile!');
      fetchRoadmap();
    } catch (error) {
      toast.error('Failed to generate roadmap');
    } finally {
      setGenerating(false);
    }
  };

  const graphData = useMemo(() => {
    const gNodes = nodes.map((n) => ({
      id: n.id,
      name: n.title,
      status: n.status,
      description: n.description,
      val: 20
    }));
    
    const gLinks = [];
    for (let i = 0; i < nodes.length - 1; i++) {
      gLinks.push({
        source: nodes[i].id,
        target: nodes[i+1].id
      });
    }

    return { nodes: gNodes, links: gLinks };
  }, [nodes]);

  const handleNodeClick = (node) => {
    setSelectedNode(node);
    
    // Aim at node from outside it
    const distance = 100;
    const distRatio = 1 + distance/Math.hypot(node.x, node.y, node.z);

    if (fgRef.current) {
      fgRef.current.cameraPosition(
        { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio },
        node,
        3000
      );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="page-container py-8 max-w-6xl mx-auto h-[90vh] flex flex-col relative">
      <div className="text-center mb-6 z-10">
        <span className="inline-block px-3 py-1 bg-gradient-to-r from-indigo-600 via-fuchsia-600 to-pink-600 text-white rounded-full text-sm font-semibold mb-3 shadow-lg shadow-fuchsia-500/35 animate-glow-pulse">
          3D Skill Galaxy
        </span>
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2">Your Path to {user?.career_goal || 'Success'}</h1>
        <p className="text-slate-500 font-medium mb-4">Explore your personalized skill constellation — click any node to inspect it.</p>
        
        {nodes.length === 0 && (
          <button 
            onClick={handleGenerate}
            disabled={generating}
            className="mt-4 inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/25 hover:opacity-95 transition-all duration-200"
          >
            {generating ? <div className="spinner w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Sparkles className="w-5 h-5" />}
            Generate My Roadmap
          </button>
        )}
      </div>

      {nodes.length > 0 && (
        <div className="skill-galaxy flex-1 relative rounded-2xl border border-indigo-500/30 shadow-inner overflow-hidden">
          {/* Animated starfield overlay */}
          <div className="starfield absolute inset-0 z-0"></div>
          <div className="absolute inset-0 z-0 pointer-events-none">
            <div className="aurora-blob absolute top-0 left-1/4 w-64 h-64 bg-indigo-600/20"></div>
            <div className="aurora-blob absolute bottom-0 right-1/4 w-64 h-64 bg-purple-600/15" style={{ animationDelay: '-6s' }}></div>
          </div>
          <ForceGraph3D
            ref={fgRef}
            graphData={graphData}
            nodeLabel="name"
            nodeColor={(node) => {
              if (node.status === 'completed') return '#22d3ee'; // vibrant cyan glow
              if (node.status === 'active') return '#a855f7'; // vibrant purple glow
              return '#64748b'; // muted slate for locked
            }}
            nodeRelSize={6}
            linkColor={() => 'rgba(129, 140, 248, 0.45)'}
            linkWidth={2}
            onNodeClick={handleNodeClick}
            backgroundColor="#020617"
          />

          <AnimatePresence>
            {selectedNode && (
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                className="absolute top-4 right-4 w-80 bg-white/90 backdrop-blur-xl p-6 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200/90 z-20"
              >
                <button 
                  className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-100 font-bold transition-colors"
                  onClick={() => setSelectedNode(null)}
                >
                  ✕
                </button>
                <div className="mb-2">
                  <span className={`px-2.5 py-1 text-xs rounded-full font-bold uppercase tracking-wide border ${
                    selectedNode.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                    selectedNode.status === 'active' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                    'bg-slate-50 text-slate-500 border-slate-200'
                  }`}>
                    {selectedNode.status}
                  </span>
                </div>
                <h3 className="text-xl font-extrabold tracking-tight mb-2 text-slate-900">{selectedNode.name}</h3>
                <p className="text-slate-500 font-medium text-sm mb-4">{selectedNode.description}</p>
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <button className="w-full text-sm py-2 bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/25 hover:opacity-95 transition-all duration-200">View Modules</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default Roadmap;
