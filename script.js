let quizData = [];
let currentMode = '';
let currentQIndex = 0;
let userAnswers = [];

window.onload = loadHistory;

function startQuiz(mode) {
    currentMode = mode;
    currentQIndex = 0;
    userAnswers = [];

    // Update mode badge
    const label = document.getElementById('mode-label');
    label.innerText = mode.toUpperCase();
    label.className = 'badge ' + (mode === 'easy' ? 'badge-easy' : 'badge-hard');

    showScreen('quiz-screen');

    const file = mode === 'easy' ? 'quiz_easy.json' : 'quiz_hard.json';
    fetch(file)
        .then(res => res.json())
        .then(data => {
            quizData = data;
            loadQuestion();
        });
}

function loadQuestion() {
    const qData = quizData[currentQIndex];
    const total = quizData.length;

    document.getElementById('progress-label').innerText = (currentQIndex + 1) + ' / ' + total;
    document.getElementById('progress-bar').style.width = ((currentQIndex) / total * 100) + '%';
    document.getElementById('question-number').innerText = 'Soal ' + (currentQIndex + 1);
    document.getElementById('question-text').innerText = qData.question;

    const imgContainer = document.getElementById('question-image-container');
    const imgEl = document.getElementById('question-image');
    if (qData.image) {
        imgEl.src = qData.image;
        imgContainer.classList.remove('hidden');
    } else {
        imgEl.src = '';
        imgContainer.classList.add('hidden');
    }

    const optsContainer = document.getElementById('options-container');
    optsContainer.innerHTML = '';

    const optKeys = Object.keys(qData.options);
    optKeys.forEach((key) => {
        const btn = document.createElement('button');
        btn.className = 'option-btn w-full p-3.5 rounded-xl bg-white border border-[#e2e5ea] text-left flex items-center gap-3 text-[#334155] text-sm leading-relaxed';
        btn.innerHTML = '<span class="opt-letter">' + key + '</span><span>' + qData.options[key] + '</span>';
        btn.onclick = () => selectOption(key, btn);
        optsContainer.appendChild(btn);
    });

    const nextBtn = document.getElementById('next-btn');
    nextBtn.classList.add('hidden');
    nextBtn.classList.remove('flex');
    document.getElementById('next-btn-text').innerText = (currentQIndex === total - 1) ? 'Selesai' : 'Selanjutnya';
}

function selectOption(key, btnClicked) {
    const opts = document.querySelectorAll('.option-btn');
    opts.forEach(btn => btn.classList.remove('selected'));
    btnClicked.classList.add('selected');
    userAnswers[currentQIndex] = key;

    const nextBtn = document.getElementById('next-btn');
    nextBtn.classList.remove('hidden');
    nextBtn.classList.add('flex');
    nextBtn.onclick = () => {
        if (currentQIndex < quizData.length - 1) {
            currentQIndex++;
            loadQuestion();
        } else {
            document.getElementById('progress-bar').style.width = '100%';
            finishQuiz();
        }
    };
}

function finishQuiz() {
    let score = 0;
    let explHTML = '';

    quizData.forEach((q, i) => {
        const isCorrect = userAnswers[i] === q.answer;
        if (isCorrect) score++;

        let html = '<div class="mb-4 pb-4 border-b border-[#e9ecef] last:border-0">';
        html += '<p class="font-semibold text-sm ' + (isCorrect ? 'result-correct' : 'result-wrong') + ' mb-1">Q' + (i + 1) + ': ' + q.question + '</p>';
        if (q.image) {
            html += '<img src="' + q.image + '" alt="Gambar soal ' + (i + 1) + '" class="w-full rounded-lg border border-[#e2e5ea] my-2 cursor-pointer hover:opacity-90 transition-opacity" onclick="openImageModal(this.src)">';
        }
        html += '<p class="text-xs text-slate-500 mb-1">Jawaban Anda: <strong class="text-[#1a1a2e]">' + q.options[userAnswers[i]] + '</strong></p>';
        if (!isCorrect) {
            html += '<p class="text-xs mb-1"><span class="text-slate-500">Jawaban Benar:</span> <strong class="result-correct">' + q.options[q.answer] + '</strong></p>';
        }
        html += '<div class="explanation-box mt-2">' + q.explanation + '</div>';
        html += '</div>';
        explHTML += html;
    });

    const percentage = Math.round((score / quizData.length) * 100);

    showScreen('results-screen');
    document.getElementById('final-score-text').innerText = percentage + '%';
    setTimeout(() => { document.getElementById('final-progress-bar').style.width = percentage + '%'; }, 100);

    document.getElementById('explanations-container').innerHTML = explHTML;
    saveScore(currentMode, percentage);
}

function saveScore(mode, percentage) {
    let history = JSON.parse(localStorage.getItem('ml_quiz_history') || '[]');
    history.push({
        mode: mode,
        score: percentage,
        date: new Date().toLocaleDateString(),
        questions: quizData,
        answers: userAnswers.slice()
    });
    localStorage.setItem('ml_quiz_history', JSON.stringify(history));
    loadHistory();
}

function loadHistory() {
    const list = document.getElementById('score-history');
    let history = JSON.parse(localStorage.getItem('ml_quiz_history') || '[]');
    list.innerHTML = '';

    const clearBtn = document.getElementById('clear-history-btn');

    if (history.length === 0) {
        list.innerHTML = '<li class="text-slate-400 italic text-xs">Belum ada riwayat...</li>';
        if (clearBtn) clearBtn.classList.add('hidden');
        return;
    }

    if (clearBtn) clearBtn.classList.remove('hidden');

    const reversed = history.slice().reverse().slice(0, 5);
    reversed.forEach((h, idx) => {
        const realIdx = history.length - 1 - idx;
        const badgeClass = h.mode === 'easy' ? 'badge-easy' : 'badge-hard';
        const hasDetail = h.questions && h.answers;
        const clickAttr = hasDetail ? ' onclick="reviewHistory(' + realIdx + ')"' : '';
        const hoverClass = hasDetail ? ' hover:bg-[#f0f2f5] rounded-lg transition-colors' : '';
        list.innerHTML += '<li class="flex justify-between items-center px-2 -mx-2 rounded-lg' + hoverClass + '"' + (hasDetail ? ' style="cursor:pointer"' : '') + clickAttr + '>'
            + '<span class="badge ' + badgeClass + ' text-xs">' + h.mode.toUpperCase() + '</span>'
            + '<span class="text-[#1a1a2e] font-bold text-sm">' + h.score + '%</span>'
            + '<span class="flex items-center gap-2"><span class="text-slate-400 text-xs">' + h.date + '</span>'
            + '<button onclick="event.stopPropagation(); deleteHistory(' + realIdx + ')" class="text-slate-300 hover:text-red-500 transition-colors" title="Hapus">'
            + '<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>'
            + '</button></span></li>';
    });
}

function deleteHistory(index) {
    let history = JSON.parse(localStorage.getItem('ml_quiz_history') || '[]');
    history.splice(index, 1);
    localStorage.setItem('ml_quiz_history', JSON.stringify(history));
    loadHistory();
}

function clearHistory() {
    localStorage.removeItem('ml_quiz_history');
    loadHistory();
}

function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

function reviewHistory(index) {
    let history = JSON.parse(localStorage.getItem('ml_quiz_history') || '[]');
    const entry = history[index];
    if (!entry || !entry.questions || !entry.answers) return;

    let score = 0;
    let explHTML = '';

    entry.questions.forEach((q, i) => {
        const isCorrect = entry.answers[i] === q.answer;
        if (isCorrect) score++;

        let html = '<div class="mb-4 pb-4 border-b border-[#e9ecef] last:border-0">';
        html += '<p class="font-semibold text-sm ' + (isCorrect ? 'result-correct' : 'result-wrong') + ' mb-1">Q' + (i + 1) + ': ' + q.question + '</p>';
        if (q.image) {
            html += '<img src="' + q.image + '" alt="Gambar soal ' + (i + 1) + '" class="w-full rounded-lg border border-[#e2e5ea] my-2 cursor-pointer hover:opacity-90 transition-opacity" onclick="openImageModal(this.src)">';
        }
        html += '<p class="text-xs text-slate-500 mb-1">Jawaban Anda: <strong class="text-[#1a1a2e]">' + (entry.answers[i] ? q.options[entry.answers[i]] : '-') + '</strong></p>';
        if (!isCorrect) {
            html += '<p class="text-xs mb-1"><span class="text-slate-500">Jawaban Benar:</span> <strong class="result-correct">' + q.options[q.answer] + '</strong></p>';
        }
        html += '<div class="explanation-box mt-2">' + q.explanation + '</div>';
        html += '</div>';
        explHTML += html;
    });

    const percentage = Math.round((score / entry.questions.length) * 100);

    showScreen('results-screen');
    document.getElementById('final-score-text').innerText = percentage + '%';
    setTimeout(() => { document.getElementById('final-progress-bar').style.width = percentage + '%'; }, 100);
    document.getElementById('explanations-container').innerHTML = explHTML;
}

function resetQuiz() {
    showScreen('start-screen');
}

function openImageModal(src) {
    const modal = document.getElementById('image-modal');
    document.getElementById('modal-image').src = src;
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function closeImageModal() {
    const modal = document.getElementById('image-modal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}
