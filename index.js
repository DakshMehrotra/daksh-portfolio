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
    const firstLink = modal.querySelector('.btn-primary');
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

  // Bot Database responses
  const daxDatabase = {
    projects: "Daksh has built three main featured projects: **NETRA** (a GNN emergency traffic perception system), **CRM Form Builder** (a full-stack React 19 / Express 5 workflow intelligence platform), and **Rakshaka** (a machine learning network intrusion detection pipeline). He also co-invented a patent for an AI Hardware Recommendation System.",
    netra: "**NETRA** (Next-gen Emergency-aware Traffic Response Architecture) is a smart traffic perception project. It uses YOLOv8 for vehicle/emergency vehicle detection, NetworkX for road network modeling as a graph, and GNNs for adaptive traffic light control. It reduces emergency response times by prioritizing signal triggers.",
    crm: "**CRM Form Builder** is a workflow intelligence platform built with React 19, TypeScript, Express 5, and SQLite 3. It features a drag-and-drop form canvas, a visual rule node graph, in-browser document OCR using Tesseract.js (WebAssembly), webcam KYC photo capture, drawn signatures, role-based access control, and automated lead routing.",
    raksha: "**Rakshaka** is an end-to-end machine learning-powered network intrusion detection system (IDS). It normalizes connection telemetry logs, resolves class imbalances, and trains/ranks 7 models (Logistic Regression, Decision Trees, Random Forests, XGBoost, SVM, KNN, and Gradient Boosting) to achieve maximum recall and block threat vectors.",
    patent: "Daksh co-invented an **AI Hardware Recommendation System Patent**. The system models component compatibilities and performance profiles dynamically to advise on optimal hardware assemblies.",
    internships: "Daksh has completed several engineering internships:\n\n1. **Xebia** (Project Intern, Jun 2026 - Present): Working on **Agentic AI** frameworks and integrating autonomous AI models.\n\n2. **Groove Innovations** (Data Engineering Intern, May 2026 - Present): Developed and successfully deployed a dynamic **CRM form builder** for the company's internal CRM workflows.\n\n3. **Innoventory Solutions** (Software Development Intern, Sep 2025 - Mar 2026): Led testing, usability analysis, and patent coordination.\n\n4. **Fouses** (Software Development Intern, Jul 2025 - Aug 2025): Streamlined client communications and contract workflows.\n\n5. **My Trick International** (Software Intern, Jun 2025 - Jul 2025): Assisted in building custom front-end features.\n\n6. **IIT Roorkee** (R&D Intern, May 2025 - Jun 2025): Researched memristors for brain-inspired neuromorphic computing hardware.",
    education: "Daksh is pursuing a B.Tech in Computer Science and Engineering (with Cloud Computing specialization) at **UPES Dehradun**. He has an **8.71 CGPA** (Aug 2023 - Present).",
    skills: "Daksh's core stack includes C, C++, Python, and SQL. On the cloud and DevOps side, he works with AWS, Docker, GitHub Actions, and Git/GitLab. He's also proficient in PyTorch, NetworkX, and testing methodologies.",
    contact: "You can reach Daksh via email at **mehrotradaksh2005@gmail.com** or call him at **+91 70070 46198**.\n\nAlternatively, you can connect on [LinkedIn](https://www.linkedin.com/in/mehrotradaksh/) or explore his repositories on [GitHub](https://github.com/DakshMehrotra).",
    linkedin: "You can view Daksh's professional network, accomplishments, and updates on his LinkedIn profile here: [LinkedIn Profile](https://www.linkedin.com/in/mehrotradaksh/).",
    github: "Check out Daksh's open-source projects, contributions, and code repositories on his GitHub profile here: [GitHub Profile](https://github.com/DakshMehrotra).",
  };

  // Process user input
  const processInput = (text) => {
    const cleaned = text.toLowerCase().trim();
    
    // Add user message to UI
    appendMessage(text, 'user-msg');
    chatInput.value = '';
    
    // Show typing indicator
    const typingId = showTypingIndicator();
    
    // Match response
    let response = "";
    if (cleaned.includes('linkedin')) {
      response = daxDatabase.linkedin;
    } else if (cleaned.includes('github') || cleaned.includes('git ') || cleaned.includes('open source') || cleaned.includes('repository') || cleaned.includes('repo')) {
      response = daxDatabase.github;
    } else if (cleaned.includes('project') || cleaned.includes('build')) {
      response = daxDatabase.projects;
    } else if (cleaned.includes('netra') || cleaned.includes('traffic')) {
      response = daxDatabase.netra;
    } else if (cleaned.includes('crm') || cleaned.includes('form') || cleaned.includes('builder') || cleaned.includes('auraflow') || cleaned.includes('formflow')) {
      response = daxDatabase.crm;
    } else if (cleaned.includes('raksha') || cleaned.includes('rakshaka') || cleaned.includes('intrusion') || cleaned.includes('cyber') || cleaned.includes('shipstack') || cleaned.includes('devops') || cleaned.includes('pipeline')) {
      response = daxDatabase.raksha;
    } else if (cleaned.includes('patent') || cleaned.includes('hardware')) {
      response = daxDatabase.patent;
    } else if (cleaned.includes('intern') || cleaned.includes('experience') || cleaned.includes('work') || cleaned.includes('job')) {
      response = daxDatabase.internships;
    } else if (cleaned.includes('education') || cleaned.includes('college') || cleaned.includes('upes') || cleaned.includes('cgpa')) {
      response = daxDatabase.education;
    } else if (cleaned.includes('skill') || cleaned.includes('stack') || cleaned.includes('tech') || cleaned.includes('languages')) {
      response = daxDatabase.skills;
    } else if (cleaned.includes('contact') || cleaned.includes('email') || cleaned.includes('phone') || cleaned.includes('number')) {
      response = daxDatabase.contact;
    } else {
      response = "I can help you with Daksh's projects (NETRA, CRM Form Builder, Rakshaka), internships (Groove, Xebia, IIT Roorkee), patent, skills, or academics. Alternatively, ask for his GitHub or LinkedIn profile link!";
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
    
    // Auto-advance every 10 seconds (10000ms)
    let autoTimer = setInterval(nextSlide, 10000);
    
    const resetTimer = () => {
      clearInterval(autoTimer);
      autoTimer = setInterval(nextSlide, 10000);
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


