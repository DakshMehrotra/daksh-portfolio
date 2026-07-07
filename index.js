// Client-side Interactivity for Daksh Mehrotra's Portfolio

document.addEventListener('DOMContentLoaded', () => {
  setupPagePreloader();
  setupThemeToggle();
  setupFloatingNavVisibility();
  setupProjectAccordions();
  setupRecruiterModal();
  setupDaxChatbot();
  setupScrollSpy();
  setupContactForm();
  setupProjectSliders();
});

/* ==========================================================================
   0. Theme Toggle System (Light / Dark)
   ========================================================================== */
function setupThemeToggle() {
  const toggleBtn = document.getElementById('theme-toggle');
  if (!toggleBtn) return;

  // Check stored theme preference
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-theme');
  }

  toggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark-theme');
    if (document.body.classList.contains('dark-theme')) {
      localStorage.setItem('theme', 'dark');
    } else {
      localStorage.setItem('theme', 'light');
    }
  });
}

/* ==========================================================================
   1. Floating Nav visibility (Scroll Triggered)
   ========================================================================== */
function setupFloatingNavVisibility() {
  const nav = document.querySelector('.floating-nav');
  const recruiterBtn = document.querySelector('.recruiter-floating-trigger');
  if (!nav && !recruiterBtn) return;

  const handleScroll = () => {
    // Show only when scrolled down more than 150px
    if (window.scrollY > 150) {
      if (nav) nav.classList.add('visible');
      if (recruiterBtn) recruiterBtn.classList.add('visible');
    } else {
      if (nav) nav.classList.remove('visible');
      if (recruiterBtn) recruiterBtn.classList.remove('visible');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll(); // Initial check
}

/* ==========================================================================
   2. Project Accordion Deep Dives
   ========================================================================== */
function setupProjectAccordions() {
  const triggers = document.querySelectorAll('.accordion-trigger');

  triggers.forEach(trigger => {
    trigger.addEventListener('click', () => {
      const targetId = trigger.getAttribute('aria-controls');
      const targetContent = document.getElementById(targetId);
      const isExpanded = trigger.getAttribute('aria-expanded') === 'true';

      // Toggle state
      trigger.setAttribute('aria-expanded', !isExpanded);
      if (targetContent) {
        targetContent.hidden = isExpanded;
      }
    });
  });
}

/* ==========================================================================
   3. Recruiter Dialog (Cmd+K Modal)
   ========================================================================== */
function setupRecruiterModal() {
  const modal = document.getElementById('recruiter-modal');
  const triggers = document.querySelectorAll('.recruiter-trigger');
  
  if (!modal) return;

  const openModal = () => {
    modal.showModal();
    // Focus first link inside modal for accessibility
    const firstLink = modal.querySelector('#trigger-scheduler');
    if (firstLink) firstLink.focus();
  };

  const closeModal = () => {
    modal.close();
  };

  // Keyboard shortcut listener (Cmd/Ctrl + K)
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (modal.open) {
        closeModal();
      } else {
        openModal();
      }
    }
  });

  // Trigger click listeners
  triggers.forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      openModal();
    });
  });

  // Light-dismiss fallback logic for browsers that don't support closedby
  if (!('closedBy' in HTMLDialogElement.prototype)) {
    modal.addEventListener('click', (event) => {
      // If clicking directly on the dialog wrapper backdrop
      if (event.target === modal) {
        const rect = modal.getBoundingClientRect();
        const isClickInside = (
          rect.top <= event.clientY &&
          event.clientY <= rect.top + rect.height &&
          rect.left <= event.clientX &&
          event.clientX <= rect.left + rect.width
        );
        if (!isClickInside) {
          closeModal();
        }
      }
    });
  }

  // Handle Close Button via code fallback in case declarative actions fail
  const closeBtn = modal.querySelector('.modal-close-btn');
  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }

  // Initialize interactive scheduler
  setupRecruiterScheduler(modal);
}

function setupRecruiterScheduler(modal) {
  const defaultView = modal.querySelector('#modal-default-view');
  const schedulerView = modal.querySelector('#modal-scheduler-view');
  const triggerBtn = modal.querySelector('#trigger-scheduler');
  const backBtn = modal.querySelector('#scheduler-back-btn');
  const form = modal.querySelector('#scheduler-form');
  const dateInput = modal.querySelector('#sched-date');
  const timeInput = modal.querySelector('#sched-time');
  const typeSelector = modal.querySelector('#sched-type-selector');
  const status = modal.querySelector('#scheduler-status');

  if (!defaultView || !schedulerView || !triggerBtn || !form) return;

  // Set default date & time values
  const setupDefaults = () => {
    if (dateInput) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const yyyy = tomorrow.getFullYear();
      const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
      const dd = String(tomorrow.getDate()).padStart(2, '0');
      dateInput.value = `${yyyy}-${mm}-${dd}`;
      dateInput.min = `${yyyy}-${mm}-${dd}`; // Restrict past dates
    }
    if (timeInput) {
      timeInput.value = "10:00"; // default 10:00 AM
    }
  };
  setupDefaults();

  // View switches
  triggerBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    defaultView.style.display = 'none';
    schedulerView.style.display = 'block';
  });

  if (backBtn) {
    backBtn.addEventListener('click', (e) => {
      e.preventDefault();
      schedulerView.style.display = 'none';
      defaultView.style.display = 'block';
      form.reset();
      setupDefaults();
      const customGroup = modal.querySelector('#sched-custom-focus-group');
      const customInput = modal.querySelector('#sched-custom-focus');
      if (customGroup) customGroup.style.display = 'none';
      if (customInput) customInput.required = false;
      if (status) {
        status.className = 'scheduler-status';
        status.textContent = '';
      }
    });
  }

  // Type Selector pills toggle
  if (typeSelector) {
    const typePills = typeSelector.querySelectorAll('.type-pill');
    const customGroup = modal.querySelector('#sched-custom-focus-group');
    const customInput = modal.querySelector('#sched-custom-focus');

    typePills.forEach(pill => {
      pill.addEventListener('click', (ev) => {
        ev.preventDefault();
        typePills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');

        const focusType = pill.getAttribute('data-type');
        if (focusType === 'Custom') {
          if (customGroup) customGroup.style.display = 'block';
          if (customInput) {
            customInput.required = true;
            customInput.focus();
          }
        } else {
          if (customGroup) customGroup.style.display = 'none';
          if (customInput) customInput.required = false;
        }
      });
    });
  }

  // Form submission handler
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const nameInput = modal.querySelector('#sched-name');
    const emailInput = modal.querySelector('#sched-email');
    const orgInput = modal.querySelector('#sched-org');
    const name = nameInput ? nameInput.value.trim() : '';
    const email = emailInput ? emailInput.value.trim() : '';
    const org = orgInput ? orgInput.value.trim() : '';
    const rawDate = dateInput ? dateInput.value : '';
    const rawTime = timeInput ? timeInput.value : '';

    if (!name || !email || !org || !rawDate || !rawTime) {
      if (status) {
        status.className = 'scheduler-status error';
        status.textContent = 'All fields are mandatory.';
      }
      return;
    }
    
    const activeTypeBtn = typeSelector ? typeSelector.querySelector('.type-pill.active') : null;
    let focus = activeTypeBtn ? activeTypeBtn.getAttribute('data-type') : 'Technical';
    if (focus === 'Custom') {
      const customInput = modal.querySelector('#sched-custom-focus');
      if (!customInput || !customInput.value.trim()) {
        if (status) {
          status.className = 'scheduler-status error';
          status.textContent = 'All fields are mandatory.';
        }
        return;
      }
      focus = `Custom: ${customInput.value.trim()}`;
    }

    // Format Date beautifully: "Mon, Jul 7, 2026"
    let formattedDate = rawDate;
    if (rawDate) {
      const d = new Date(rawDate + 'T00:00:00'); // prevent timezone shift issues
      formattedDate = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    }

    // Format Time beautifully: "10:00 AM"
    let formattedTime = rawTime;
    if (rawTime) {
      const [hours, minutes] = rawTime.split(':');
      let h = parseInt(hours);
      const ampm = h >= 12 ? 'PM' : 'AM';
      h = h % 12;
      h = h ? h : 12; // the hour '0' should be '12'
      formattedTime = `${h}:${minutes} ${ampm}`;
    }

    // Clean recruiter name and company for a professional, customized Jitsi Meet URL
    const cleanForUrl = (str) => {
      return str.toLowerCase().trim()
        .replace(/[^a-z0-9\s-]/g, '') // remove special characters
        .replace(/\s+/g, '-');        // replace spaces with hyphens
    };
    const cleanName = cleanForUrl(name) || 'recruiter';
    const cleanOrg = cleanForUrl(org) || 'company';
    const randSuffix = Math.floor(100 + Math.random() * 900); // 3-digit suffix for uniqueness
    const meetLink = `https://meet.jit.si/Daksh-Interview-${cleanName}-${cleanOrg}-${randSuffix}`;

    const submitBtn = form.querySelector('#scheduler-submit-btn');
    const originalBtnText = submitBtn ? submitBtn.textContent : 'Confirm Interview';

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Scheduling Interview...';
    }
    if (status) {
      status.className = 'scheduler-status';
      status.textContent = '';
    }

    fetch("https://formsubmit.co/ajax/mehrotradaksh2005@gmail.com", {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        "Recruiter Name": name,
        "Recruiter Email": email,
        "Company / Org": org,
        "Meeting Focus": focus,
        "Selected Date": formattedDate,
        "Selected Time Slot": formattedTime,
        "Video Meeting Link": meetLink,
        "_subject": `[INTERVIEW BOOKING] ${name} (${org})`,
        "_template": "box",
        "_captcha": "false",
        "_cc": email,
        "_replyto": email
      })
    })
    .then(response => {
      if (response.ok) {
        if (status) {
          status.className = 'scheduler-status success';
          status.textContent = 'Interview scheduled successfully!';
        }
        form.reset();
        setupDefaults();
        
        // Return to standard view after delay
        setTimeout(() => {
          schedulerView.style.display = 'none';
          defaultView.style.display = 'block';
          if (status) {
            status.className = 'scheduler-status';
            status.textContent = '';
          }
        }, 4000);
      } else {
        throw new Error();
      }
    })
    .catch(() => {
      // Fallback: Mailto client
      const mailtoUrl = `mailto:mehrotradaksh2005@gmail.com,${encodeURIComponent(email)}?subject=Interview Booking Request&body=Hi,%0A%0AAn interview has been booked.%0A%0AMeeting Focus: ${encodeURIComponent(focus)}%0ADate: ${encodeURIComponent(formattedDate)}%0ATime: ${encodeURIComponent(formattedTime)}%0AVideo Meeting Link: ${encodeURIComponent(meetLink)}%0A%0ASender: ${encodeURIComponent(name)} (${encodeURIComponent(org)})`;
      window.location.href = mailtoUrl;
      if (status) {
        status.className = 'scheduler-status success';
        status.textContent = 'Mail client opened.';
      }
    })
    .finally(() => {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;
      }
    });
  });
}

/* ==========================================================================
   4. Dax Interactive Chatbot
   ========================================================================== */
function setupDaxChatbot() {
  const chatForm = document.getElementById('chat-form');
  const chatInput = document.getElementById('chat-input');
  const chatMessages = document.getElementById('chat-messages');
  const suggestionsBox = document.getElementById('chat-suggestions');
  const askDaxProjectButtons = document.querySelectorAll('.ask-dax-project');

  if (!chatForm || !chatInput || !chatMessages) return;

  // Clear / Reset chat history listener
  const resetBtn = document.getElementById('chat-reset');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      chatMessages.innerHTML = `
        <div class="message system-msg">
          <div class="msg-avatar">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide-sparkles"><path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"/><path d="M20 2v4"/><path d="M22 4h-4"/><circle cx="4" cy="20" r="2"/></svg>
          </div>
          <div class="msg-bubble">
            Hi, I'm <strong>Dax</strong>, Daksh's portfolio assistant. I can guide you through his work, patent details, or technical skills. Select a prompt or type below!
          </div>
        </div>
      `;
    });
  }

  // Bot Database responses (structured corpus for full text indexing & semantic search)
  const portfolioData = [
    {
      category: "Executive Board Member (UPES ACM)",
      keywords: ["acm", "board", "executive", "board member", "upes acm"],
      content: "Daksh is an Executive Board Member at the UPES ACM Student Chapter (May 2026 - Present). In this role, he advises on strategic initiatives, tech community events, and collaborative engineering assemblies."
    },
    {
      category: "Secretary (UPES ACM)",
      keywords: ["secretary", "acm secretary"],
      content: "Daksh was the Secretary of the UPES ACM Student Chapter (May 2025 - May 2026). He managed operational frameworks, workshop schedules, and cross-university technology symposiums."
    },
    {
      category: "Student Placement Representative",
      keywords: ["placement", "cell", "representative", "placement rep", "placement cell"],
      content: "Daksh is a Student Placement Representative at the UPES Placement Cell (May 2026 - Present). He coordinates between corporate recruiters and student candidates, driving campus placement logistics."
    },
    {
      category: "Unstop Campus Ambassador",
      keywords: ["ambassador", "campus ambassador", "unstop"],
      content: "Daksh was an Unstop Campus Ambassador (Aug 2025 - Jan 2026). In this role, he fostered collaborative technical learning and represented external tech initiatives on campus."
    },
    {
      category: "Patent Co-Inventor",
      keywords: ["patent", "hardware", "inventor", "co-inventor", "utility patent", "filing", "recommendation", "co-invent", "invent"],
      content: "Daksh is a Patent Co-Inventor for a hardware-related utility patent titled **AI Hardware Recommendation System** (filed Nov 2025). The system dynamically models component compatibilities and performance profiles to advise on optimal hardware assemblies."
    },
    {
      category: "Event Head (ACM-W)",
      keywords: ["event head", "acm-w", "workshops", "hackathons"],
      content: "Daksh was the Event Head for the UPES ACM-W Student Chapter (May 2024 - May 2025). He led the planning and implementation of workshops, expert speaker panels, and diversity in engineering hackathons."
    },
    {
      category: "IBM ICE Day Runner Up",
      keywords: ["ibm", "ice day", "runner up", "first runner up", "cloud architectures"],
      content: "Daksh was the First Runner Up at **IBM ICE Day 2024**, recognized at the national level for designing high-performance cloud application architectures."
    },
    {
      category: "UPES Global Game Jam Winner",
      keywords: ["ggj", "game jam", "global game jam", "winner", "game development"],
      content: "Daksh won the **UPES Global Game Jam (GGJ) 2024**, recognized for championing a 48-hour game development competition."
    },
    {
      category: "Xebia Internship",
      keywords: ["xebia", "agentic ai", "llm", "frameworks", "autonomous"],
      content: "Daksh is a Project Intern at **Xebia** (Jun 2026 - Present), where he is working on Agentic AI frameworks and integrating autonomous AI models."
    },
    {
      category: "Groove Innovations Internship",
      keywords: ["groove", "groove innovations", "data engineering", "crm form builder", "deployed"],
      content: "Daksh is a Data Engineering Intern at **Groove Innovations** (May 2026 - Jun 2026). He developed and successfully deployed a dynamic CRM form builder for the company's internal CRM workflows."
    },
    {
      category: "Innoventory Solutions Internship",
      keywords: ["innoventory", "software development intern", "testing", "usability", "patent coordination"],
      content: "Daksh was a Software Development Intern at **Innoventory Solutions** (Sep 2025 - Mar 2026). He led testing, usability analysis, and patent coordination."
    },
    {
      category: "Fouses Internship",
      keywords: ["fouses", "intern", "communications", "workflows"],
      content: "Daksh was a Software Development Intern at **Fouses** (Jul 2025 - Aug 2025). He streamlined client communications and contract workflows."
    },
    {
      category: "My Trick International Internship",
      keywords: ["my trick", "business analyst", "requirements", "modeling", "analyst"],
      content: "Daksh was a Business Analyst Intern at **My Trick International** (Jun 2025). He assisted in requirements gathering, business process modeling, and functional specification drafting, analyzing workflows to find bottlenecks."
    },
    {
      category: "IIT Roorkee Internship",
      keywords: ["iit roorkee", "iit", "roorkee", "memristors", "neuromorphic", "computing", "brain-inspired"],
      content: "Daksh was an R&D Intern at **IIT Roorkee** (May 2025 - Jun 2025). He researched memristors for brain-inspired neuromorphic computing hardware."
    },
    {
      category: "NETRA Project",
      keywords: ["netra", "traffic", "gnn", "graph", "signal", "yolov8", "networkx", "emergency"],
      content: "**NETRA** (Next-gen Emergency-aware Traffic Response Architecture) is a smart traffic perception system. It uses YOLOv8 for vehicle/emergency vehicle detection, NetworkX for road network modeling as a graph, and GNNs for adaptive traffic light control. It reduces emergency response times by prioritizing signal triggers."
    },
    {
      category: "CRM Form Builder Project",
      keywords: ["crm form builder", "react 19", "ocr", "kyc", "tesseract.js", "signatures", "lead routing"],
      content: "**CRM Form Builder** is a workflow intelligence platform built with React 19, TypeScript, Express 5, and SQLite 3. It features a drag-and-drop form canvas, a visual rule node graph, in-browser document OCR using Tesseract.js (WebAssembly), webcam KYC photo capture, drawn signatures, role-based access control, and automated lead routing."
    },
    {
      category: "Rakshaka Project",
      keywords: ["rakshaka", "intrusion", "cyber", "ids", "telemetry", "xgboost", "gradient boosting"],
      content: "**Rakshaka** is an end-to-end machine learning-powered network intrusion detection system (IDS). It normalizes connection telemetry logs, resolves class imbalances, and trains/ranks 7 models (Logistic Regression, Decision Trees, Random Forests, XGBoost, SVM, KNN, and Gradient Boosting) to achieve maximum recall and block threat vectors."
    },
    {
      category: "Education",
      keywords: ["education", "college", "upes", "cgpa", "grade", "academics", "university", "b.tech", "cse", "cloud computing"],
      content: "Daksh is pursuing a B.Tech in Computer Science and Engineering (with Cloud Computing specialization) at **UPES Dehradun**. He has an **8.7 CGPA** (Aug 2023 - Present)."
    },
    {
      category: "Skills",
      keywords: ["skill", "skills", "stack", "tech", "languages", "c++", "python", "sql", "docker", "aws", "pytorch", "networkx"],
      content: "Daksh's core stack includes C, C++, Python, and SQL. On the cloud and DevOps side, he works with AWS, Docker, GitHub Actions, and Git/GitLab. He's also proficient in PyTorch, NetworkX, and testing methodologies."
    },
    {
      category: "Certifications",
      keywords: ["certifications", "certification", "cert", "certs", "aws", "credential", "credentials", "ecs", "cdk"],
      content: "Daksh holds several professional AWS cloud certifications:\n1. **Working with Amazon ECS** (AWS - Jun 2026)\n2. **Deploying a CI/CD Pipeline with AWS CDK** (AWS - Jun 2026)\n3. **Amazon ECS Getting Started** (AWS - May 2026)"
    },
    {
      category: "Resume",
      keywords: ["resume", "cv", "download", "pdf"],
      content: "You can download Daksh's latest professional resume here: [Download Resume](resume.pdf)"
    },
    {
      category: "Contact Info",
      keywords: ["contact", "email", "phone", "number", "gmail", "call", "message", "write", "location", "address", "reach"],
      content: "You can reach Daksh via email at **mehrotradaksh2005@gmail.com** or call him at **+91 70070 46198**.\n\nAlternatively, you can connect on [LinkedIn](https://www.linkedin.com/in/mehrotradaksh/) or explore his repositories on [GitHub](https://github.com/DakshMehrotra)."
    },
    {
      category: "Internships Overview",
      keywords: ["intern", "internship", "internships", "experience", "work", "job", "jobs", "employment"],
      content: "Daksh has completed 6 engineering internships:\n\n1. **Xebia** (Project Intern, Jun 2026 - Present): Working on Agentic AI frameworks.\n2. **Groove Innovations** (Data Engineering Intern, May 2026 - Jun 2026): Developed and deployed a dynamic CRM form builder.\n3. **IIT Roorkee** (R&D Intern, May 2025 - Jun 2025): Neuromorphic computing R&D.\n4. **Innoventory Solutions** (Software Intern, Sep 2025 - Mar 2026): Testing and patent coordination.\n5. **Fouses** (Software Intern, Jul 2025 - Aug 2025): Streamlined client contracts.\n6. **My Trick International** (Business Analyst Intern, Jun 2025): Requirements gathering, process modeling, and workflow analysis."
    },
    {
      category: "Projects Overview",
      keywords: ["projects", "project", "build", "portfolio", "creations"],
      content: "Daksh has built several key engineering projects:\n\n1. **NETRA**: Next-gen Emergency-aware Traffic Response Architecture (YOLOv8 + GNN).\n2. **CRM Form Builder**: A React 19 / Express 5 workflow intelligence platform.\n3. **Rakshaka**: An ML-powered network intrusion detection system.\n4. **Facefunda**: A real-time multi-person mood detection ML model.\n5. **ShipStack**: A cloud-native automated DevOps CI/CD pipeline.\n6. **AI Finance**: An ML model designed to predict stock rates.\n\nAll of these are detailed on his GitHub (https://github.com/DakshMehrotra)."
    },
    {
      category: "Facefunda Project",
      keywords: ["facefunda", "mood", "detection", "emotion", "mood detection", "face", "ml model"],
      content: "**Facefunda** is a real-time mood detection machine learning model that can analyze and classify facial expressions/emotions for multiple people simultaneously. Detailed on [GitHub](https://github.com/DakshMehrotra)."
    },
    {
      category: "ShipStack Project",
      keywords: ["shipstack", "devops", "pipeline", "cicd", "aws", "docker", "github actions", "automated"],
      content: "**ShipStack** is an end-to-end cloud-native DevOps CI/CD deployment pipeline. It automates testing, Docker image building/versioning, and zero-manual-intervention deployments to AWS EC2 using GitHub Actions. Detailed on [GitHub](https://github.com/DakshMehrotra)."
    },
    {
      category: "AI Finance Project",
      keywords: ["ai finance", "finance", "predict", "stock", "stock rates", "rates", "ml model"],
      content: "**AI Finance** is an ML-powered financial prediction engine designed to forecast stock rates and market trends. Detailed on [GitHub](https://github.com/DakshMehrotra)."
    }
  ];

  // Process user input using structured search scorer
  const processInput = (text) => {
    const cleaned = text.toLowerCase().trim();
    
    // Add user message to UI
    appendMessage(text, 'user-msg');
    chatInput.value = '';
    
    // Show typing indicator
    const typingId = showTypingIndicator();
    
    // Greeting check
    const greetings = ['hi', 'hello', 'hey', 'greetings', 'dax', 'sup', 'yo'];
    const words = cleaned.split(/[^a-z0-9+#\-]/);
    const isGreeting = words.some(w => greetings.includes(w));
    
    let response = "";
    
    if (isGreeting && words.length <= 2) {
      response = "Hi! I'm Dax, Daksh's portfolio AI assistant. I can tell you about his projects, engineering internships, education, skills, certifications, recognition milestones, and details about his hardware patent. Feel free to ask anything!";
    } else {
      // Score each section of our portfolio corpus
      const scoredResults = portfolioData.map(entry => {
        let score = 0;
        
        // 1. Check exact matches for keywords (high weight)
        entry.keywords.forEach(kw => {
          if (kw.includes(' ')) {
            if (cleaned.includes(kw)) score += 3.0; // Phrase match
          } else {
            if (words.includes(kw)) score += 2.0; // Exact word match
            else if (cleaned.includes(kw)) score += 0.5; // Substring match
          }
        });
        
        // 2. Check matches in content text (lower weight)
        const entryWords = entry.content.toLowerCase().split(/[^a-z0-9+#\-]/);
        words.forEach(w => {
          if (w.length > 2 && entryWords.includes(w)) {
            score += 0.5;
          }
        });
        
        return { entry, score };
      });
      
      // Sort and filter results
      const matches = scoredResults
        .filter(r => r.score >= 1.0)
        .sort((a, b) => b.score - a.score);
        
      if (matches.length > 0) {
        // Compile matching sections up to top 2 results
        const topMatches = matches.slice(0, 2);
        response = topMatches.map(m => m.entry.content).join("\n\n");
      } else {
        response = "I can help you with Daksh's projects (NETRA, CRM Form Builder, Rakshaka), internships (Groove, Xebia, IIT Roorkee), patent, certifications, recognition, skills, or academics. Alternatively, ask for his resume, GitHub, or LinkedIn profile link!";
      }
    }

    // Delay response slightly to simulate AI processing
    setTimeout(() => {
      removeTypingIndicator(typingId);
      streamResponse(response);
    }, 1000);
  };

  // UI helpers
  const appendMessage = (text, senderClass) => {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${senderClass}`;

    const avatarDiv = document.createElement('div');
    avatarDiv.className = 'msg-avatar';
    
    if (senderClass === 'system-msg') {
      avatarDiv.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide-sparkles"><path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"/><path d="M20 2v4"/><path d="M22 4h-4"/><circle cx="4" cy="20" r="2"/></svg>`;
    } else {
      avatarDiv.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide-user"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;
    }

    const bubbleDiv = document.createElement('div');
    bubbleDiv.className = 'msg-bubble';
    
    // Parse basic markdown-style strong tags & links
    bubbleDiv.innerHTML = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" class="chat-link">$1</a>')
      .replace(/\n/g, '<br>');

    msgDiv.appendChild(avatarDiv);
    msgDiv.appendChild(bubbleDiv);
    chatMessages.appendChild(msgDiv);
    
    // Scroll chat area
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return msgDiv;
  };

  const showTypingIndicator = () => {
    const indicatorDiv = document.createElement('div');
    indicatorDiv.id = 'typing-indicator';
    indicatorDiv.className = 'message system-msg';
    
    const avatarDiv = document.createElement('div');
    avatarDiv.className = 'msg-avatar';
    avatarDiv.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide-sparkles"><path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"/><path d="M20 2v4"/><path d="M22 4h-4"/><circle cx="4" cy="20" r="2"/></svg>`;
    
    const bubbleDiv = document.createElement('div');
    bubbleDiv.className = 'msg-bubble';
    bubbleDiv.innerHTML = `<div class="typing-dots"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div>`;
    
    indicatorDiv.appendChild(avatarDiv);
    indicatorDiv.appendChild(bubbleDiv);
    chatMessages.appendChild(indicatorDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    return indicatorDiv;
  };

  const removeTypingIndicator = (indicatorEl) => {
    if (indicatorEl) indicatorEl.remove();
  };

  const streamResponse = (response) => {
    const words = response.split(' ');
    let wordIndex = 0;
    
    // Add empty message bubble
    const msgDiv = appendMessage('', 'system-msg');
    const bubble = msgDiv.querySelector('.msg-bubble');
    
    const interval = setInterval(() => {
      if (wordIndex < words.length) {
        const textSegment = words.slice(0, wordIndex + 1).join(' ');
        
        // Parse basic markdown strong tags, links & newlines
        bubble.innerHTML = textSegment
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" class="chat-link">$1</a>')
          .replace(/\n/g, '<br>');
        
        chatMessages.scrollTop = chatMessages.scrollHeight;
        wordIndex++;
      } else {
        clearInterval(interval);
      }
    }, 45); // milliseconds per word for high quality streaming effect
  };

  // Submit trigger
  chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!chatInput.value.trim()) return;
    processInput(chatInput.value);
  });

  // Suggestion click listeners
  suggestionsBox.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-suggestion')) {
      processInput(e.target.textContent);
    }
  });

  // Project details click listeners
  askDaxProjectButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const project = btn.getAttribute('data-project');
      // Scroll to chat
      document.getElementById('chat').scrollIntoView({ behavior: 'smooth' });
      // Trigger question
      setTimeout(() => {
        processInput(`Tell me about the ${project} project`);
      }, 500);
    });
  });
}

/* ==========================================================================
   5. ScrollSpy Active Links
   ========================================================================== */
function setupScrollSpy() {
  const sections = document.querySelectorAll('section');
  const navLinks = document.querySelectorAll('.floating-nav .nav-link');

  const onScroll = () => {
    let scrollPos = window.scrollY + 180;
    let activeId = null;

    sections.forEach(section => {
      if (scrollPos >= section.offsetTop && scrollPos < section.offsetTop + section.offsetHeight) {
        activeId = section.getAttribute('id');
      }
    });

    // Fallback: If scrolled to the absolute bottom of the page, force 'contact' to be active
    if ((window.innerHeight + window.scrollY) >= document.documentElement.scrollHeight - 20) {
      activeId = 'contact';
    }

    // Special override to ignore the Hero section on floating nav
    if (activeId === 'hero') {
      activeId = 'chat'; // Dax chatbot acts as the first item on the floating menu
    }

    if (activeId) {
      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${activeId}`) {
          link.classList.add('active');
        }
      });
    }
  };

  window.addEventListener('scroll', onScroll);
}

/* ==========================================================================
   6. Contact Form handler
   ========================================================================== */
function setupContactForm() {
  const form = document.getElementById('contact-form');
  const status = document.getElementById('form-status');

  if (!form || !status) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('form-name').value;
    const email = document.getElementById('form-email').value;
    const msg = document.getElementById('form-msg').value;
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.textContent;

    // Set loading state
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';
    status.className = 'form-status';
    status.textContent = '';

    fetch("https://formsubmit.co/ajax/mehrotradaksh2005@gmail.com", {
      method: "POST",
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        "Sender Name": name,
        "Sender Email": email,
        "Message": msg,
        "_subject": `[Portfolio Message] from ${name}`,
        "_template": "box",
        "_captcha": "false"
      })
    })
    .then(response => {
      if (response.ok) {
        status.className = 'form-status success';
        status.textContent = 'Thank you! Your message has been sent successfully. Daksh will reply within 24 hours.';
        form.reset();
      } else {
        throw new Error();
      }
    })
    .catch(() => {
      // Fallback: Mailto client
      const mailtoUrl = `mailto:mehrotradaksh2005@gmail.com?subject=New Portfolio Message from ${encodeURIComponent(name)}&body=Sender: ${encodeURIComponent(name)} (${encodeURIComponent(email)})%0A%0A${encodeURIComponent(msg)}`;
      window.location.href = mailtoUrl;
      status.className = 'form-status success';
      status.textContent = 'Message prepared in your default mail app!';
    })
    .finally(() => {
      submitBtn.disabled = false;
      submitBtn.textContent = originalBtnText;
    });
  });
}

/* ==========================================================================
   7. Interactive Project Sliders
   ========================================================================== */
function setupProjectSliders() {
  const sliders = document.querySelectorAll('.project-slider');
  
  sliders.forEach(slider => {
    const slides = slider.querySelectorAll('.slide');
    const dots = slider.querySelectorAll('.slider-dot');
    
    let currentIndex = 0;
    
    const showSlide = (index) => {
      slides.forEach(slide => slide.classList.remove('active'));
      dots.forEach(dot => dot.classList.remove('active'));
      
      slides[index].classList.add('active');
      dots[index].classList.add('active');
      currentIndex = index;
    };
    
    const nextSlide = () => {
      let newIndex = currentIndex + 1;
      if (newIndex >= slides.length) newIndex = 0;
      showSlide(newIndex);
    };
    
    // Auto-advance every 3 seconds (3000ms)
    let autoTimer = setInterval(nextSlide, 3000);
    
    const resetTimer = () => {
      clearInterval(autoTimer);
      autoTimer = setInterval(nextSlide, 3000);
    };
    
    // Click anywhere on the slider container to advance to the next slide
    slider.addEventListener('click', (e) => {
      // Avoid triggering when user clicks on navigation dots specifically
      if (e.target.closest('.slider-dots')) return;
      
      e.preventDefault();
      nextSlide();
      resetTimer();
    });
    
    dots.forEach(dot => {
      dot.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const index = parseInt(dot.getAttribute('data-index'));
        showSlide(index);
        resetTimer();
      });
    });
  });
}

/* ==========================================================================
   8. Page Preloader & Reveal Stagger Animation
   ========================================================================== */
function setupPagePreloader() {
  const animatedElements = document.querySelectorAll('.hero-animated-element');
  
  // Trigger staggered reveal entrance immediately on page load
  setTimeout(() => {
    animatedElements.forEach((el, index) => {
      setTimeout(() => {
        el.classList.add('revealed');
      }, index * 80); // Stagger element entrances by 80ms for an ultra-fluid feel
    });
  }, 100);
}


