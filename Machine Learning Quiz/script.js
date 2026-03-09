let quizData = [];
let currentMode = '';
let currentQIndex = 0;
let userAnswers = [];

const quizEasyData = [
  {
    "id": 1,
    "question": "Apa yang bisa terjadi jika data numerik tidak di-scale terlebih dahulu sebelum training model?",
    "options": {
      "A": "Model menjadi lebih stabil dan akurat.",
      "B": "Fitur dengan skala besar akan mendominasi proses learning, membuat model bias dan performa menurun.",
      "C": "Model otomatis melakukan normalisasi secara internal.",
      "D": "Tidak ada pengaruh terhadap performa model."
    },
    "answer": "B",
    "explanation": "Jika skala fitur berbeda jauh (misalnya income vs latitude), fitur berskala besar akan mendominasi. Tanpa scaling \u2192 model bias terhadap fitur tertentu \u2192 performa menurun."
  },
  {
    "id": 2,
    "question": "Mengapa EDA (Exploratory Data Analysis) penting dilakukan sebelum membuat model machine learning?",
    "options": {
      "A": "Agar model dapat dilatih lebih cepat menggunakan GPU.",
      "B": "Untuk memahami karakteristik data, menemukan missing values, dan menentukan transformasi yang diperlukan.",
      "C": "Untuk otomatis membuat fitur rasio baru.",
      "D": "Agar dataset menjadi lebih besar secara otomatis."
    },
    "answer": "B",
    "explanation": "EDA membantu memahami struktur dataset, tipe fitur, distribusi, missing values, dan korelasi awal \u2014 semua informasi yang dibutuhkan sebelum merancang preprocessing dan memilih algoritma."
  },
  {
    "id": 3,
    "question": "Pada dataset housing, kolom total_bedrooms memiliki masalah apa berdasarkan hasil housing.info()?",
    "options": {
      "A": "Bertipe object sehingga perlu di-encode.",
      "B": "Memiliki nilai negatif yang tidak valid.",
      "C": "Memiliki missing values karena jumlah non-null lebih sedikit dari total entries.",
      "D": "Nilainya selalu nol sehingga tidak berguna."
    },
    "answer": "C",
    "explanation": "Dari housing.info(), total_bedrooms hanya memiliki 16,344 non-null dari 16,512 entries \u2014 artinya terdapat ~168 missing values yang harus ditangani sebelum training."
  },
  {
    "id": 4,
    "question": "Mengapa fitur rasio (seperti rooms_per_household) seringkali lebih informatif dibandingkan fitur mentah (seperti total_rooms)?",
    "options": {
      "A": "Karena nilai numeriknya lebih kecil dan lebih mudah diproses model.",
      "B": "Karena rasio menangkap hubungan proporsi antar fitur sehingga lebih representatif tanpa dipengaruhi skala populasi.",
      "C": "Karena total_rooms memiliki terlalu banyak missing values.",
      "D": "Karena rasio selalu bernilai antara 0 dan 1."
    },
    "answer": "B",
    "explanation": "Fitur mentah total_rooms tidak bermakna tanpa konteks. Dibagi dengan households \u2192 rooms_per_household menangkap kepadatan rumah per household, sinyal yang jauh lebih representatif untuk prediksi harga."
  },
  {
    "id": 5,
    "question": "Mengapa beberapa fitur numerik ditransformasi ke bentuk log sebelum scaling?",
    "options": {
      "A": "Karena log transformation membuat semua nilai menjadi negatif.",
      "B": "Karena log transformation mengurangi skewness, menstabilkan varians, dan mengurangi pengaruh outlier ekstrem.",
      "C": "Karena log transformation mengubah tipe data dari float ke integer.",
      "D": "Karena log transformation meningkatkan jumlah fitur dalam dataset."
    },
    "answer": "B",
    "explanation": "Distribusi yang skewed menyebabkan outlier mendominasi. Log menekan nilai besar dan memperbesar nilai kecil \u2192 distribusi lebih simetris, varians lebih stabil, model bekerja lebih baik."
  },
  {
    "id": 6,
    "question": "Mengapa preprocessing sebaiknya dilakukan menggunakan pipeline terstruktur, bukan secara manual satu per satu?",
    "options": {
      "A": "Agar dataset menjadi lebih besar secara otomatis.",
      "B": "Agar model dapat dilatih lebih cepat.",
      "C": "Agar transformasi data konsisten antara training dan testing, dan menghindari data leakage.",
      "D": "Agar algoritma machine learning berubah secara otomatis."
    },
    "answer": "C",
    "explanation": "Pipeline memastikan semua transformasi (imputation, scaling, encoding) di-fit hanya pada training data lalu diterapkan konsisten ke test data. Ini mencegah data leakage dan menjamin reproducibility."
  },
  {
    "id": 7,
    "question": "Apa perbedaan utama antara Grid Search dan Random Search pada hyperparameter tuning?",
    "options": {
      "A": "Grid Search memilih parameter secara acak; Random Search terstruktur.",
      "B": "Random Search memilih parameter secara terstruktur; Grid Search secara acak.",
      "C": "Grid Search mencoba semua kombinasi parameter yang ditentukan; Random Search memilih kombinasi secara acak.",
      "D": "Tidak ada perbedaan signifikan antara keduanya."
    },
    "answer": "C",
    "explanation": "GridSearchCV mengevaluasi exhaustively semua kombinasi hyperparameter yang ditentukan. RandomizedSearchCV memilih sejumlah kombinasi secara acak dari ruang parameter \u2014 lebih efisien untuk ruang yang besar."
  },
  {
    "id": 8,
    "question": "Mengapa menggunakan cross-validation (misalnya 3-fold) dalam GridSearchCV, bukan hanya satu kali split train-test?",
    "options": {
      "A": "Karena cross-validation selalu menghasilkan RMSE yang lebih kecil.",
      "B": "Karena satu kali split bisa menghasilkan evaluasi yang bias atau kebetulan; cross-validation memberikan estimasi yang lebih stabil.",
      "C": "Karena cross-validation menghilangkan kebutuhan untuk test set.",
      "D": "Karena cross-validation secara otomatis melakukan feature engineering."
    },
    "answer": "B",
    "explanation": "Satu split mungkin beruntung atau tidak beruntung. k-Fold CV memastikan setiap data pernah menjadi validation set sehingga estimasi performa lebih reliabel dan rendah bias."
  },
  {
    "id": 9,
    "question": "GridSearchCV menggunakan scoring='neg_root_mean_squared_error'. Mengapa nilai RMSE dibuat negatif?",
    "options": {
      "A": "Karena nilai error memang selalu negatif dalam statistik.",
      "B": "Karena terjadi kesalahan perhitungan dalam algoritma Scikit-learn.",
      "C": "Karena Scikit-learn didesain untuk memaksimalkan skor; RMSE adalah error (kecil = baik) sehingga dinegasikan agar bisa dimaksimalkan.",
      "D": "Untuk memudahkan proses feature engineering."
    },
    "answer": "C",
    "explanation": "Scikit-learn selalu memaksimalkan skor. Karena RMSE adalah error (lebih kecil = lebih baik), dinegasikan \u2192 neg_RMSE. GridSearch memilih neg_RMSE terbesar = RMSE terkecil = model terbaik. Contoh: \u221230,000 > \u221250,000 \u2192 RMSE 30,000 lebih baik."
  },
  {
    "id": 10,
    "question": "Jika nilai RMSE model masih cukup besar, langkah teknis apa yang dapat dilakukan tanpa mengganti algoritma?",
    "options": {
      "A": "Menghapus seluruh dataset dan mengumpulkan data dari sumber yang berbeda.",
      "B": "Menambah feature engineering, memperbaiki preprocessing, atau memperluas range hyperparameter di GridSearch.",
      "C": "Mengurangi jumlah data training agar model lebih fokus.",
      "D": "Menghentikan training lebih awal untuk menghindari overfitting."
    },
    "answer": "B",
    "explanation": "Performa model dapat diperbaiki dengan: menambah fitur rasio baru, memperluas range hyperparameter, menangani outlier lebih baik, mencoba teknik scaling yang berbeda, atau menambah jumlah fold CV \u2014 semuanya tanpa ganti algoritma."
  }
];

const quizHardData = [
  {
    "id": 1,
    "question": "Sebuah dataset memiliki fitur median_income (range 0\u201315) dan total_rooms (range 100\u201340,000). Model Linear Regression dilatih tanpa scaling. Apa yang paling mungkin terjadi?",
    "options": {
      "A": "Model gagal dilatih karena Scikit-learn tidak bisa memproses fitur dengan rentang nilai yang sangat berbeda.",
      "B": "Model berhasil dilatih, namun bobot (weight) untuk total_rooms akan dikompensasi sangat kecil sehingga median_income mendominasi prediksi secara tidak proporsional.",
      "C": "Model berhasil dilatih, namun gradient descent akan memberikan pembaruan bobot yang jauh lebih besar pada total_rooms, sehingga median_income relatif diabaikan.",
      "D": "Model menghasilkan performa identik karena Linear Regression secara internal melakukan normalisasi sebelum menghitung bobot."
    },
    "answer": "C",
    "explanation": "Tanpa scaling, fitur dengan nilai besar (total_rooms hingga 40,000) menghasilkan gradient yang jauh lebih besar dibanding median_income (0\u201315). Gradient descent memperbarui bobot total_rooms lebih agresif \u2192 model bias, tidak stabil, dan konvergensi lambat."
  },
  {
    "id": 2,
    "question": "Seorang data scientist menjalankan housing.info() dan mendapati total_bedrooms memiliki 16,344 non-null dari 16,512 total entries. Manakah langkah preprocessing yang paling tepat untuk menangani ini?",
    "options": {
      "A": "Hapus seluruh kolom total_bedrooms karena data tidak lengkap dan akan mengganggu training.",
      "B": "Isi missing values dengan nilai 0 karena distrik tanpa data kemungkinan tidak memiliki kamar tidur.",
      "C": "Gunakan SimpleImputer dengan strategy='median' agar missing values diisi dengan nilai tengah yang robust terhadap outlier.",
      "D": "Biarkan saja karena sebagian besar algoritma modern seperti Random Forest secara otomatis menangani missing values."
    },
    "answer": "C",
    "explanation": "Median lebih robust dibanding mean karena tidak terpengaruh outlier ekstrem. Mengisi dengan 0 salah secara semantik. Menghapus kolom membuang informasi penting. Random Forest di Scikit-learn tidak secara otomatis handle missing values."
  },
  {
    "id": 3,
    "question": "Dua distrik memiliki data berikut \u2014 Distrik A: total_rooms=500, households=100 dan Distrik B: total_rooms=5,000, households=1,000. Nilai rooms_per_household keduanya adalah 5. Apa kesimpulan yang paling tepat?",
    "options": {
      "A": "Fitur rasio tidak berguna di sini karena menghasilkan nilai yang sama untuk dua distrik dengan ukuran sangat berbeda.",
      "B": "Distrik B memiliki kondisi perumahan lebih baik karena secara absolut memiliki lebih banyak kamar.",
      "C": "Kedua distrik memiliki kepadatan ruang per household yang identik \u2014 ini justru menunjukkan kekuatan fitur rasio dalam menghilangkan bias akibat perbedaan skala populasi.",
      "D": "Fitur rasio harus dikombinasikan dengan total_rooms agar menghasilkan informasi yang bermakna."
    },
    "answer": "C",
    "explanation": "Ini kekuatan fitur rasio \u2014 meskipun total_rooms sangat berbeda (500 vs 5,000), kepadatan per household sama (5). Model yang menggunakan total_rooms mentah akan memperlakukan Distrik B sebagai 'lebih baik' padahal kondisi per rumah tangga identik."
  },
  {
    "id": 4,
    "question": "Fitur total_rooms memiliki distribusi right-skewed ekstrem \u2014 sebagian besar distrik 1,000\u20133,000 namun beberapa mencapai 40,000. Seorang mahasiswa langsung menerapkan StandardScaler tanpa log transform. Apa dampaknya?",
    "options": {
      "A": "Tidak ada dampak karena StandardScaler dirancang untuk menangani distribusi apapun termasuk yang sangat skewed.",
      "B": "Mean dan std yang dihitung akan sangat dipengaruhi outlier 40,000 \u2014 hasil scaling menjadi tidak representatif dan sebagian besar nilai terpusat di sekitar \u22120.1 hingga 0.1 saja.",
      "C": "StandardScaler akan otomatis mendeteksi skewness dan menerapkan log transform secara internal sebelum standarisasi.",
      "D": "Dampaknya minimal karena setelah scaling, semua nilai tetap berada dalam range yang wajar untuk model."
    },
    "answer": "B",
    "explanation": "Outlier 40,000 menarik mean ke atas dan memperbesar std secara drastis. Hasilnya: nilai 'normal' (1,000\u20133,000) setelah scaling akan sangat terkompresi mendekati nol, sementara outlier tetap jauh. Log transform sebelum scaling mencegah ini."
  },
  {
    "id": 5,
    "question": "Seorang mahasiswa melakukan pipeline preprocessing manual: fit scaler pada X_train, transform X_train, lalu transform X_test. Ia kemudian menyadari bahwa ia juga memasukkan X_test ke dalam fit scaler di awal. Apa konsekuensi dari kesalahan ini?",
    "options": {
      "A": "Tidak ada konsekuensi signifikan \u2014 perbedaan mean/std antara train dan test set biasanya sangat kecil.",
      "B": "Model akan mengalami underfitting karena test data ikut mempengaruhi parameter scaler.",
      "C": "Terjadi data leakage: statistik test set bocor ke training \u2192 evaluasi pada test set menjadi terlalu optimis dan tidak mencerminkan performa model di dunia nyata.",
      "D": "Model akan overfit pada training set karena scaler yang di-fit pada lebih banyak data menghasilkan transformasi yang lebih akurat."
    },
    "answer": "C",
    "explanation": "Ini adalah data leakage klasik. Ketika scaler di-fit pada train+test, mean dan std mencerminkan distribusi gabungan \u2014 informasi test set bocor ke training. Akibatnya evaluasi pada test set terlalu optimis, dan model tampak lebih baik dari sebenarnya."
  },
  {
    "id": 6,
    "question": "GridSearchCV dijalankan dengan param_grid = {'n_estimators': [50, 100, 200], 'max_depth': [5, 10, None], 'max_features': [4, 6, 8, 10]} dan cv=3. Berapa total model yang dilatih?",
    "options": {
      "A": "10 model (3 + 3 + 4, jumlah semua nilai dari setiap parameter).",
      "B": "36 model (3 \u00d7 3 \u00d7 4 kombinasi, tanpa menghitung fold).",
      "C": "108 model (3 \u00d7 3 \u00d7 4 kombinasi \u00d7 3 fold CV).",
      "D": "12 model (3 fold \u00d7 4 parameter, karena GridSearch tidak mengevaluasi semua kombinasi)."
    },
    "answer": "C",
    "explanation": "GridSearch exhaustively mencoba semua kombinasi: 3 \u00d7 3 \u00d7 4 = 36 kombinasi. Setiap kombinasi dievaluasi dengan 3-fold CV \u2192 36 \u00d7 3 = 108 total training. Ini mengapa ruang parameter yang besar membuat GridSearch sangat lambat."
  },
  {
    "id": 7,
    "question": "Dua model dievaluasi dengan 3-fold cross-validation. Model A: scores [48,000, 51,000, 49,000] dan Model B: scores [35,000, 62,000, 43,000] (RMSE dalam USD). Model mana yang sebaiknya dipilih?",
    "options": {
      "A": "Model B, karena memiliki RMSE terendah (35,000) di salah satu fold \u2014 menunjukkan potensi performa terbaik.",
      "B": "Model A, karena rata-rata RMSE lebih rendah (49,333 vs 46,667) sehingga secara keseluruhan lebih akurat.",
      "C": "Model A, karena meskipun rata-rata Model B sedikit lebih baik (46,667 vs 49,333), varians Model B sangat tinggi menandakan model tidak stabil dan tidak dapat diandalkan.",
      "D": "Keduanya setara \u2014 perbedaan rata-rata hanya $2,667 dan tidak signifikan secara statistik."
    },
    "answer": "C",
    "explanation": "Rata-rata Model B (46,667) memang lebih kecil, tetapi rentangnya ekstrem (35k\u201362k). Model A jauh lebih stabil (48k\u201351k). Dalam praktik, model yang konsisten lebih dapat diandalkan daripada model dengan rata-rata sedikit lebih baik tapi sangat tidak stabil."
  },
  {
    "id": 8,
    "question": "Hasil GridSearchCV menunjukkan best_score_ = -47,523.4 dan best_params_ = {'max_depth': 10, 'n_estimators': 200}. Interpretasi mana yang paling tepat?",
    "options": {
      "A": "Model terbaik menghasilkan prediksi rata-rata $47,523 di bawah nilai aktual, menandakan model cenderung underestimate.",
      "B": "Terjadi error dalam GridSearch karena skor valid tidak mungkin bernilai negatif \u2014 perlu dicek ulang konfigurasi scoring.",
      "C": "RMSE terbaik yang ditemukan adalah sekitar $47,523 menggunakan max_depth=10 dan n_estimators=200; nilai negatif karena konvensi Scikit-learn untuk error metrics.",
      "D": "Model dengan parameter ini menghasilkan akurasi \u221247,523% yang berarti prediksinya lebih buruk dari random guess."
    },
    "answer": "C",
    "explanation": "neg_RMSE = \u2212RMSE, jadi best_score_ = \u221247,523.4 berarti RMSE terbaik \u2248 $47,523. GridSearch memaksimalkan \u221247,523 (lebih besar dari \u221250,000 misalnya), yang ekuivalen dengan meminimalkan RMSE. Parameter best adalah max_depth=10, n_estimators=200."
  },
  {
    "id": 9,
    "question": "Setelah menambah fitur rooms_per_household, bedrooms_per_room, dan population_per_household, RMSE turun dari 52,000 menjadi 47,000. Tim mempertimbangkan langkah berikut untuk menurunkan RMSE lebih lanjut. Mana yang paling tepat?",
    "options": {
      "A": "Hapus fitur asli (total_rooms, total_bedrooms, population) karena sudah terwakili oleh fitur rasio \u2014 mengurangi dimensi dapat memperbaiki performa.",
      "B": "Perluas range hyperparameter di GridSearch dan tambah jumlah data training, lalu lakukan EDA ulang untuk menemukan pola baru yang mungkin terlewat.",
      "C": "Ganti algoritma dari Random Forest ke Neural Network karena RMSE $47,000 menandakan model yang ada sudah mencapai batas kemampuannya.",
      "D": "Kurangi jumlah fold cross-validation dari 3 menjadi 2 agar GridSearch bisa mencoba lebih banyak kombinasi dalam waktu yang sama."
    },
    "answer": "B",
    "explanation": "Memperluas hyperparameter search dan menambah data adalah langkah valid tanpa ganti algoritma. Menghapus fitur asli berisiko \u2014 fitur mentah dan rasio bisa saling melengkapi. Mengurangi fold CV justru membuat evaluasi kurang reliable, bukan lebih banyak kombinasi yang dicoba."
  },
  {
    "id": 10,
    "question": "Pernyataan mana yang paling tepat menggambarkan perbedaan antara GridSearchCV dan RandomizedSearchCV dalam skenario hyperparameter tuning dengan 5 parameter, masing-masing memiliki 10 nilai kandidat?",
    "options": {
      "A": "GridSearchCV lebih cocok karena selalu menemukan kombinasi terbaik yang pasti, sementara RandomizedSearchCV hanya cocok untuk dataset kecil.",
      "B": "GridSearchCV akan menjalankan 50 kombinasi (5 \u00d7 10), sedangkan RandomizedSearchCV menjalankan jumlah yang ditentukan n_iter \u2014 keduanya menggunakan strategi pencarian yang identik.",
      "C": "GridSearchCV akan menjalankan 100,000 kombinasi (10\u2075), menjadikannya tidak praktis; RandomizedSearchCV dengan n_iter=50 hanya menjalankan 50 kombinasi sambil mengeksplorasi ruang parameter yang jauh lebih luas.",
      "D": "RandomizedSearchCV selalu menghasilkan model yang lebih baik karena eksplorasi acak menghindari local optima yang sering ditemukan GridSearchCV."
    },
    "answer": "C",
    "explanation": "Dengan 5 parameter \u00d7 10 nilai, GridSearch harus mencoba 10\u2075 = 100,000 kombinasi \u2014 tidak praktis. RandomizedSearchCV dengan n_iter=50 hanya 50 kombinasi, namun karena mengambil sampel dari seluruh ruang (bukan grid tetap), sering menemukan kombinasi yang hampir optimal dengan biaya jauh lebih kecil."
  }
];

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

    quizData = mode === 'easy' ? quizEasyData : quizHardData;

    loadQuestion();
}

function loadQuestion() {
    const qData = quizData[currentQIndex];
    const total = quizData.length;

    document.getElementById('progress-label').innerText = (currentQIndex + 1) + ' / ' + total;
    document.getElementById('progress-bar').style.width = ((currentQIndex) / total * 100) + '%';
    document.getElementById('question-number').innerText = 'Soal ' + (currentQIndex + 1);
    document.getElementById('question-text').innerText = qData.question;

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
    history.push({ mode: mode, score: percentage, date: new Date().toLocaleDateString() });
    localStorage.setItem('ml_quiz_history', JSON.stringify(history));
    loadHistory();
}

function loadHistory() {
    const list = document.getElementById('score-history');
    let history = JSON.parse(localStorage.getItem('ml_quiz_history') || '[]');
    list.innerHTML = '';

    if (history.length === 0) {
        list.innerHTML = '<li class="text-slate-400 italic text-xs">Belum ada riwayat...</li>';
        return;
    }

    history.slice().reverse().slice(0, 5).forEach(h => {
        const badgeClass = h.mode === 'easy' ? 'badge-easy' : 'badge-hard';
        list.innerHTML += '<li class="flex justify-between items-center"><span class="badge ' + badgeClass + ' text-xs">' + h.mode.toUpperCase() + '</span><span class="text-[#1a1a2e] font-bold text-sm">' + h.score + '%</span><span class="text-slate-400 text-xs">' + h.date + '</span></li>';
    });
}

function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

function resetQuiz() {
    showScreen('start-screen');
}
