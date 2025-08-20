document.addEventListener('DOMContentLoaded', function() {
    const smoothScrollToAction = function(e) { e.preventDefault(); document.querySelector(this.getAttribute('href')).scrollIntoView({ behavior: 'smooth' }); };

    document.getElementById('start-learning-btn').addEventListener('click', smoothScrollToAction);
    document.querySelectorAll('.scroll-down-arrow, .journey-item').forEach(el => el.addEventListener('click', smoothScrollToAction));

    const sections = document.querySelectorAll('.page');
    const journeyItems = document.querySelectorAll('.journey-item');
    const scrollArrows = document.querySelectorAll('.scroll-down-arrow');
    const animatedElements = document.querySelectorAll('.animate-on-scroll');

    const scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const sectionId = entry.target.id;

            if (entry.isIntersecting) {
                if (entry.target.classList.contains('animate-on-scroll')) entry.target.classList.add('visible');
                if (entry.intersectionRatio >= 0.5) {
                    journeyItems.forEach(item => item.classList.toggle('active', item.dataset.section === sectionId));
                    scrollArrows.forEach(arrow => {
                        const arrowSection = arrow.closest('.page').id;
                        arrow.classList.toggle('visible', arrowSection === sectionId);
                    });
                }
            } else {
                 const scrollArrow = entry.target.querySelector('.scroll-down-arrow');
                 if (scrollArrow) scrollArrow.classList.remove('visible');
            }
        });
    }, { threshold: [0.1, 0.5, 0.9] });

    sections.forEach(section => scrollObserver.observe(section));
    animatedElements.forEach(el => { el.classList.contains('visible') ? null : scrollObserver.observe(el); });

    const highlightObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && entry.target.dataset.target) {
                const el = entry.target; // This is the .highlight-value div
                const target = +el.dataset.target; // Should be 10000 for TPS

                // IMPORTANT: Ensure the span exists before trying to access its textContent
                const targetSpan = el.querySelector('span');
                if (!targetSpan) {
                    console.error(`Error: <span> not found inside highlight-value for target ${target}`);
                    return; // Exit if the span element isn't found
                }

                // If target is 1 (for <1s), just set the value and unobserve
                if (target === 1) {
                    targetSpan.textContent = '<1s'; // Set it directly as it's not a numeric animation
                    highlightObserver.unobserve(el);
                    return;
                }

                targetSpan.textContent = '0'; // Initialize to 0 for the animation
                let current = 0;
                const increment = Math.max(target / 100, 1);

                const interval = setInterval(() => {
                    current += increment;
                    if (current >= target) {
                        targetSpan.textContent = target.toLocaleString();
                        clearInterval(interval);
                    }
                    else {
                        targetSpan.textContent = Math.ceil(current).toLocaleString();
                    }
                }, 20);
                highlightObserver.unobserve(el);
            }
        });
    }, { threshold: 0.5 });
    document.querySelectorAll('.highlight-value[data-target]').forEach(card => highlightObserver.observe(card));

    const tabContainer = document.querySelector('.problem-tabs');
    tabContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('tab-btn')) {
            tabContainer.querySelector('.active').classList.remove('active');
            e.target.classList.add('active');
            document.querySelectorAll('.problem-content').forEach(c => c.classList.remove('active'));
            const newActiveContent = document.getElementById(e.target.dataset.target);
            newActiveContent.classList.add('active');
            newActiveContent.querySelectorAll('.animate-on-scroll').forEach(el => { el.classList.remove('visible'); scrollObserver.observe(el); });
        }
    });

    document.querySelectorAll('.accordion-item .accordion-header').forEach(header => {
        header.addEventListener('click', () => {
            const item = header.parentElement;
            const content = item.querySelector('.accordion-content');
            const isActive = item.classList.contains('active');
            document.querySelectorAll('.accordion-item').forEach(i => { i.classList.remove('active'); i.querySelector('.accordion-content').style.maxHeight = null; });
            if (!isActive) { item.classList.add('active'); content.style.maxHeight = content.scrollHeight + 'px'; }
        });
    });

    const playPauseBtn = document.getElementById('play-pause-btn');
    if (playPauseBtn) {
        const resetBtn = document.getElementById('reset-btn'), privacyToggle = document.getElementById('privacy-toggle'), playIcon = document.getElementById('play-icon'), pauseIcon = document.getElementById('pause-icon'), playPauseText = playPauseBtn.querySelector('span'), timelineSteps = document.querySelectorAll('.timeline-step');
        let currentDemoStep = 1, totalDemoSteps = 4, isDemoPlaying = false, demoInterval;
        const goToStep = (stepNumber) => { currentDemoStep = stepNumber; document.querySelectorAll('.demo-step').forEach(s => s.classList.remove('active')); document.getElementById(`demo-step-${currentDemoStep}`).classList.add('active'); timelineSteps.forEach(ts => ts.classList.toggle('active', parseInt(ts.dataset.step) <= currentDemoStep)); document.getElementById('timeline-progress').style.width = `${((currentDemoStep - 1) / (totalDemoSteps - 1)) * 100}%`; if (currentDemoStep === totalDemoSteps) pauseDemo(); };
        const advanceStep = () => currentDemoStep < totalDemoSteps ? goToStep(currentDemoStep + 1) : pauseDemo();
        const pauseDemo = () => { isDemoPlaying = false; playPauseText.textContent = 'Play'; playIcon.style.display = 'inline-block'; pauseIcon.style.display = 'none'; clearInterval(demoInterval); };
        const resetDemo = () => { pauseDemo(); goToStep(1); };
        const playDemo = () => { if (currentDemoStep === totalDemoSteps) resetDemo(); isDemoPlaying = true; playPauseText.textContent = 'Pause'; playIcon.style.display = 'none'; pauseIcon.style.display = 'inline-block'; demoInterval = setInterval(advanceStep, 3000); };
        playPauseBtn.addEventListener('click', () => isDemoPlaying ? pauseDemo() : playDemo());
        resetBtn.addEventListener('click', resetDemo);
        timelineSteps.forEach(ts => ts.addEventListener('click', () => { pauseDemo(); goToStep(parseInt(ts.dataset.step)); }));
        privacyToggle.addEventListener('change', () => document.querySelectorAll('.private-data-value').forEach(el => el.classList.toggle('blur', !privacyToggle.checked)));
        document.querySelectorAll('.private-data-value').forEach(el => el.classList.add('blur'));
    }
    const quizBox = document.getElementById('quiz-box');
    if (quizBox) {
        const quizData = [
            { question: "What is the primary benefit of using USDC as the native gas token on Arc?", options: ["It makes transactions faster.", "It provides predictable, stable operational costs.", "It increases network decentralization.", "It's required for smart contract execution."], answer: "It provides predictable, stable operational costs.", explanation: "By using a stablecoin like USDC for gas, Arc eliminates the price volatility of typical gas tokens (like ETH), making financial planning and accounting much simpler for enterprises." }, { question: "What does 'Deterministic Settlement Finality' mean on Arc?", options: ["Transactions might be reversed if a better block is found.", "Transactions are confirmed after about 15 minutes.", "Transactions are 100% final and irreversible in under a second.", "Finality depends on the economic value of the transaction."], answer: "Transactions are 100% final and irreversible in under a second.", explanation: "Unlike probabilistic finality (like on Bitcoin or Ethereum), Arc's BFT consensus ensures that once a transaction is included in a block, it cannot be reverted. This certainty is crucial for high-value finance." }, { question: "How does Arc's 'Opt-In Privacy' support institutional compliance?", options: ["It makes all transaction data completely anonymous and untraceable.", "It allows institutions to grant selective, read-only access to auditors via 'view keys'.", "It automatically reports all transactions to regulatory bodies.", "It hides the sender and receiver addresses from the public."], answer: "It allows institutions to grant selective, read-only access to auditors via 'view keys'.", explanation: "Arc balances privacy with compliance. While transaction amounts are shielded from the public, 'view keys' create a compliant audit trail for authorized parties without exposing sensitive data publicly." }, { question: "What is the consensus engine used by Arc?", options: ["Proof-of-Work (PoW)", "Proof-of-Stake (PoS)", "Malachite (a Tendermint BFT implementation)", "Proof-of-Authority (PoA)"], answer: "Malachite (a Tendermint BFT implementation)", explanation: "Arc is built on Malachite, a high-performance implementation of the Tendermint BFT protocol, which enables its high throughput and fast, deterministic finality." }, { question: "Which of the following is NOT a core feature of Arc?", options: ["Support for tokenized Real-World Assets (RWAs).", "An institutional-grade Foreign Exchange (FX) engine.", "Complete anonymity for all users and transactions.", "Cross-chain liquidity hub via Circle's CCTP."], answer: "Complete anonymity for all users and transactions.", explanation: "Arc provides *confidentiality* for transaction values with *compliant auditability*, not complete anonymity. This distinction is vital for its focus on regulated financial services." }
        ];
        let currentQuestionIndex = 0, score = 0;
        const loadQuiz = () => {
            if (currentQuestionIndex < quizData.length) {
                const q = quizData[currentQuestionIndex];
                quizBox.innerHTML = `
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;"><span>Question ${currentQuestionIndex + 1}/${quizData.length}</span><span>Score: ${score}/${quizData.length}</span></div>
                    <div class="quiz-question">${q.question}</div><div class="quiz-options">${q.options.map(o => `<div class="quiz-option">${o}</div>`).join('')}</div>
                    <div class="quiz-feedback"></div><div class="quiz-controls"><button class="btn btn-primary" id="next-btn" style="display: none;">Next</button></div>`;
                quizBox.querySelectorAll('.quiz-option').forEach(o => o.addEventListener('click', () => selectAnswer(o)));
            } else { showResults(); }
        };
        const selectAnswer = (selectedOption) => {
            const options = quizBox.querySelectorAll('.quiz-option'), answer = quizData[currentQuestionIndex].answer, feedbackBox = quizBox.querySelector('.quiz-feedback');
            options.forEach(o => o.style.pointerEvents = 'none');
            if (selectedOption.textContent === answer) { score++; selectedOption.classList.add('correct'); feedbackBox.innerHTML = `<strong>Correct!</strong> ${quizData[currentQuestionIndex].explanation}`; feedbackBox.classList.add('correct'); } else { selectedOption.classList.add('incorrect'); options.forEach(opt => { if (opt.textContent === answer) opt.classList.add('correct'); }); feedbackBox.innerHTML = `<strong>Incorrect.</strong> ${quizData[currentQuestionIndex].explanation}`; feedbackBox.classList.add('incorrect'); }
            feedbackBox.style.display = 'block';
            const nextBtn = quizBox.querySelector('#next-btn'); nextBtn.style.display = 'inline-block'; nextBtn.addEventListener('click', () => { currentQuestionIndex++; loadQuiz(); });
        };
        const showResults = () => {
            let message = score === quizData.length ? "Excellent! You have a perfect understanding of Arc." : (score >= 3 ? "Great job! You have a solid grasp of how Arc works." : "Good start! Feel free to review the sections and try again.");
            const resultCard = document.getElementById('quiz-result-card');
            resultCard.innerHTML = `<div style="text-align: center;"><h2 style="font-size: 2.2rem; font-weight: 700; margin: 0; color: var(--text-primary);">Arc Knowledge Quiz</h2><p style="font-size: 1.2rem; color: var(--text-secondary); margin-top: 10px;">I scored</p><div style="font-size: 5rem; font-weight: 700; margin: 20px 0; background: linear-gradient(90deg, var(--accent-secondary), var(--accent-primary)); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">${score} / ${quizData.length}</div><p style="font-size: 1.1rem; color: var(--text-secondary);">Test your knowledge at garc.fun</p><p style="margin-top: 30px; font-size: 1.5rem; font-weight: 600; color: var(--accent-primary);">Arc<span>.</span>Explained</p></div>`;
            quizBox.innerHTML = `
                <div class="quiz-result"><div class="trophy">🏆</div><h2>Quiz Complete!</h2><p>Your Score: ${score}/${quizData.length}</p><p>${message}</p>
                <button class="btn btn-primary" id="retry-btn">Take Quiz Again</button>
                <div class="share-container"><h3>Share Your Result!</h3><div class="share-preview" id="share-preview-container"><p>Generating your shareable image...</p></div>
                <div class="share-buttons"><a href="#" class="btn btn-download" id="download-btn" style="display:none;">Download Image</a><a href="#" class="btn btn-twitter" id="twitter-share-btn" target="_blank">Share on X</a></div>
                <p style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 15px;">We recommend downloading the image to attach to your tweet!</p></div></div>`;

            if (typeof html2canvas !== 'undefined') {
                html2canvas(resultCard, { backgroundColor: null }).then(canvas => {
                    const imageUrl = canvas.toDataURL('image/png');
                    document.getElementById('share-preview-container').innerHTML = `<img src="${imageUrl}" alt="Quiz Result Score ${score} out of ${quizData.length}">`;
                    const downloadBtn = document.getElementById('download-btn');
                    downloadBtn.href = imageUrl; downloadBtn.download = `arc_quiz_result_${score}_of_${quizData.length}.png`; downloadBtn.style.display = 'inline-block';

                    // UPDATED TWEET TEXT HERE
                    const tweetText = encodeURIComponent(
                        `I just scored ${score}/${quizData.length} on the Arc Explained quiz!\n\n` +
                        `Learning how @arc is building the future of stablecoin finance with instant finality & compliant privacy\n\n` +
                        `Test your knowledge: https://garc.fun #ArcCoded`
                    );
                    document.getElementById('twitter-share-btn').href = `https://twitter.com/intent/tweet?text=${tweetText}`;
                    // Removed the &url parameter as it's now part of the tweetText
                });
            } else {
                document.getElementById('share-preview-container').innerHTML = `<p style="color: var(--accent-error);">Image generation not available. Ensure html2canvas.min.js is loaded.</p>`;
                console.error("html2canvas library not loaded.");
            }

            document.getElementById('retry-btn').addEventListener('click', () => { currentQuestionIndex = 0; score = 0; loadQuiz(); });
        };
        loadQuiz();
    }
});