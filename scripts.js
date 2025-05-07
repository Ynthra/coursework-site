// --- DOM Element Caching ---
const sideNav = document.getElementsByClassName("side-nav")[0];
const welcomeText = document.getElementById('welcome-text');
const quizContainer = document.getElementById('quiz-container');
const answerInput = document.getElementById('answer-input');
const questionElement = document.getElementById('question');
const formulaHintElement = document.getElementById('formula-hint');
const conversionOptionsContainer = document.getElementById('conversion-options-container');
const arithmeticOptionsContainer = document.getElementById('arithmetic-options-container');
const asciiOptionsContainer = document.getElementById('ascii-options-container');
const storageOptionsContainer = document.getElementById('storage-options-container');
const nonIntOptionsContainer = document.getElementById('nonint-options-container');

const optionsContainers = {
    "arithmetic": arithmeticOptionsContainer,
    "ascii": asciiOptionsContainer,
    "conversion": conversionOptionsContainer,
    "storage": storageOptionsContainer,
    "nonint": nonIntOptionsContainer
};

// --- Side Navigation ---
function openNav() {
    sideNav.style.width = "250px";
    document.addEventListener('click', outsideClickListener);
}

function closeNav() {
    sideNav.style.width = "0";
    document.removeEventListener('click', outsideClickListener);
}

function outsideClickListener(event) {
    if (!sideNav.contains(event.target) && !event.target.closest('.hamburger')) {
        closeNav();
    }
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (Math.floor(max) - Math.ceil(min) + 1)) + Math.ceil(min);
}

function convertBase(num, fromBase, toBase) {
    return parseInt(num, Number(fromBase)).toString(Number(toBase));
}

// names some of the bases
function getBaseName(base) {
    const names = { "10": "denary", "2": "binary", "16": "hexadecimal" };
    return names[String(base)] || `base ${base}`;
}

function randomFixedPointWithPoint(totalBits, pointPos) {
    let bits = [];
    for (let i = 0; i < totalBits; i++) bits.push(getRandomInt(0, 1));
    if (bits.slice(0, pointPos).every(b => b === 0)) bits[0] = 1;
    if (bits.slice(pointPos).every(b => b === 0)) bits[pointPos] = 1;
    let bin = bits.join('');
    return bin.slice(0, pointPos) + '.' + bin.slice(pointPos);
}
function fixedToFloat(bin) {
    let [intStr, fracStr] = bin.split('.');
    intStr = intStr || '';
    fracStr = fracStr || '';
    let intVal = intStr === '' ? 0 : parseInt(intStr, 2);
    let fracVal = 0;
    for (let i = 0; i < fracStr.length; i++) {
        if (fracStr[i] === '1') fracVal += 1 / Math.pow(2, i + 1);
    }
    return intVal + fracVal;
}
function floatToFixedWithPoint(val, totalBits, pointPos) {
    let intPart = Math.floor(val);
    let fracPart = val - intPart;
    let intStr = intPart.toString(2);
    let fracStr = '';
    let intBitsArr = intStr.padStart(pointPos, '0').slice(-pointPos).split('');
    let bitsLeft = totalBits - pointPos;
    let fracVal = fracPart;
    for (let i = 0; i < bitsLeft; i++) {
        fracVal *= 2;
        let bit = Math.floor(fracVal);
        fracStr += bit;
        fracVal -= bit;
    }
    if (intBitsArr.every(b => b === '0')) intBitsArr[0] = '1';
    if (fracStr.split('').every(b => b === '0')) fracStr = '1' + fracStr.slice(1);
    return intBitsArr.join('') + '.' + fracStr;
}
function encodeFloatPoint(mantissa, exponent) {
    let mantissaBin = ((mantissa < 0 ? (mantissa + 64) : mantissa)).toString(2).padStart(6, '0');
    let exponentBin = ((exponent < 0 ? (exponent + 16) : exponent)).toString(2).padStart(4, '0');
    return mantissaBin + " " + exponentBin;
}
function decodeFloatPoint(str) {
    let [mantissaBin, exponentBin] = str.split(' ');
    let mantissa = parseInt(mantissaBin, 2);
    if (mantissaBin[0] === '1') mantissa -= 64;
    let exponent = parseInt(exponentBin, 2);
    if (exponentBin[0] === '1') exponent -= 16;
    return { mantissa, exponent };
}
function floatPointToFloat(str) {
    let { mantissa, exponent } = decodeFloatPoint(str);
    return mantissa * Math.pow(2, exponent);
}
function floatToFloatPoint(val) {
    if (val === 0 || !isFinite(val)) return "000000 0000";
    let sign = val < 0 ? -1 : 1;
    val = Math.abs(val);
    let exponent = 0;
    let mantissa = val;
    while (Math.abs(mantissa) > 31 && exponent < 7) {
        mantissa /= 2;
        exponent++;
    }
    while (Math.abs(mantissa) < 16 && exponent > -8) {
        mantissa *= 2;
        exponent--;
    }
    mantissa = Math.round(mantissa) * sign;
    if (mantissa > 31) mantissa = 31;
    if (mantissa < -32) mantissa = -32;
    if (exponent > 7) exponent = 7;
    if (exponent < -8) exponent = -8;
    return encodeFloatPoint(mantissa, exponent);
}
function normaliseFloat(str) {
    let { mantissa, exponent } = decodeFloatPoint(str);
    if (mantissa === 0) return encodeFloatPoint(0, 0);
    let sign = mantissa < 0 ? -1 : 1;
    mantissa = Math.abs(mantissa);
    while (Math.abs(mantissa) < 16 && exponent > -8) {
        mantissa *= 2;
        exponent--;
    }
    while (Math.abs(mantissa) > 31 && exponent < 7) {
        mantissa /= 2;
        exponent++;
    }
    mantissa = Math.round(mantissa) * sign;
    if (mantissa > 31) mantissa = 31;
    if (mantissa < -32) mantissa = -32;
    if (exponent > 7) exponent = 7;
    if (exponent < -8) exponent = -8;
    return encodeFloatPoint(mantissa, exponent);
}

// --- Menu Navigation ---
let previousMenuId = "home";
let currentSection = "main"; // "main", "progress", "tutorials"

function changeMenu(id) {
    // Prompt if leaving a quiz in progress
    if (
        previousMenuId !== "home" &&
        previousMenuId !== id &&
        quizContainer &&
        quizContainer.style.display !== "none"
    ) {
        const confirmLeave = confirm("Are you sure you want to leave this quiz? Your progress will be lost.");
        if (!confirmLeave) return;
    }

    document.querySelectorAll('.nav-item.active').forEach(item => item.classList.remove('active'));
    document.getElementById(id)?.classList.add('active');

    // Reset all quiz states
    [conversionQuiz, arithmeticQuiz, asciiQuiz, storageQuiz, nonIntQuiz].forEach(q => q.reset());

    if (answerInput) answerInput.value = '';
    if (formulaHintElement) formulaHintElement.textContent = '';

    // Hide all main sections
    if (welcomeText) welcomeText.style.display = "none";
    Object.values(optionsContainers).forEach(container => container && (container.style.display = 'none'));
    if (quizContainer) quizContainer.style.display = "none";
    hideProgressSection();
    hideTutorialSection();

    if (id === "home") {
        if (welcomeText) welcomeText.style.display = "block";
        currentSection = "main";
    } else if (optionsContainers[id]) {
        optionsContainers[id].style.display = "flex";
        currentSection = "main";
    } else if (id === "progress") {
        showProgressSection();
        currentSection = "progress";
    } else if (id === "tutorials") {
        showTutorialSection();
        currentSection = "tutorials";
    }

    previousMenuId = id;
}

// --- Mistake Analysis Helper ---
function analyseMistake(userAnswer, correctAnswer, context = {}) {
    // context: { type: 'number'|'string'|'3sf'|'ascii'|'binary'|'hex'|'char'|'base', base: n, ... }
    if (userAnswer === '') return "Your answer is empty.";
    if (context.type === 'number' || typeof correctAnswer === 'number') {
        if (isNaN(Number(userAnswer))) return "Your answer is not a valid number.";
        if (context.sf && !isThreeSigFigs(userAnswer)) return "Your answer is not rounded to 3 significant figures.";
    }
    if (context.type === 'base' && context.base) {
        let base = Number(context.base);
        let allowedChars = '';
        if (base <= 10) {
            allowedChars = Array.from({length: base}, (_, i) => i).join(',');
        } else {
            // 0-9, then a-f for base 16, etc.
            let chars = [];
            for (let i = 0; i < base; i++) {
                if (i < 10) chars.push(i);
                else chars.push(String.fromCharCode(87 + i)); // 10->a, 11->b, etc.
            }
            allowedChars = chars.join(',');
        }
        let regex = base <= 10
            ? new RegExp(`^-?[0-${base-1}]+$`) // Matches numbers in the specified base (0 to base-1) with an optional leading negative sign.
            : new RegExp(`^-?[0-9a-${String.fromCharCode(86 + base)}A-${String.fromCharCode(54 + base)}]+$`, 'i'); // Matches numbers in bases > 10, including digits and letters (case-insensitive).
        if (!regex.test(userAnswer)) {
            return `Your answer contains invalid characters for base ${base}, it may only contain the following characters; ${allowedChars}`;
        }
    }
    if (context.type === 'ascii') {
        if (isNaN(Number(userAnswer))) return "Your answer is not a valid ASCII code (should be a number).";
        if (Number(userAnswer) < 0 || Number(userAnswer) > 127) return "Your answer is not a valid ASCII code (should be between 0 and 127).";
    }
    if (context.type === 'char') {
        if (userAnswer.length !== 1) return "Your answer should be a single character.";
    }
    // Default
    return "Your answer is incorrect.";
}

function isThreeSigFigs(val) {
    // Accepts numbers or strings
    let str = String(val).trim();
    // Remove commas
    str = str.replace(/[\s,]/g, '');
    // Expand scientific notation if present
    if (/e/i.test(str)) {
        let num = Number(str);
        if (!isFinite(num)) return false;
        str = num.toString();
    }
    // Remove decimal point
    str = str.replace('.', '');
    // Remove leading zeros
    str = str.replace(/^0+/, '');
    // Remove trailing zeros
    str = str.replace(/0+$/, '');
    // Check that the length is <= 3
    return str.length <= 3 && str.length > 0;
}

// --- Skip Logic ---
let wrongAttempt = false;
const skipBtn = document.getElementById('skip-question-btn');
let hintBtn; // Will be initialized on DOMContentLoaded

if (skipBtn) {
    skipBtn.onclick = function() {
        if (window.activeQuizInstance && typeof window.activeQuizInstance.skipQuestion === 'function') {
            window.activeQuizInstance.skipQuestion();
        }
    };
}

// --- Base Quiz Class ---
class Quiz {
    constructor(questionClasses, options = {}) {
        this.questionClasses = questionClasses;
        this.options = options;
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.numQuestions = 0;
        this.questions = [];
        this.isTypeEnabled = options.isTypeEnabled || (() => true);
        this.getMarkContext = options.getMarkContext || (() => ({}));
        this.renderQuestion = options.renderQuestion || (q => q.question);
        this.questionArgs = typeof options.questionArgs === 'function' ? options.questionArgs : undefined;
    }

    reset() {
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.numQuestions = 0;
        this.questions = [];
        if (quizContainer) quizContainer.style.display = 'none';
        if (answerInput) answerInput.style.display = 'none';
        const submitBtn = document.getElementById('submit-answer-btn');
        if (submitBtn) submitBtn.style.display = 'none';
        if (skipBtn) skipBtn.style.display = 'none';
        if (hintBtn) hintBtn.style.display = 'none';
        this._questionResults = {}; // { [type]: {score, total} }
    }

    displayNext() {
        if (skipBtn) skipBtn.style.display = 'none';
        if (hintBtn) hintBtn.style.display = 'none';
        if (this.currentQuestionIndex < this.numQuestions) {
            this.displayQuestionText();
        } else {
            this.displayResults();
        }
    }

    displayResults() {
        if (questionElement) questionElement.innerHTML = `Quiz completed! Your score: ${this.score}/${this.questions.length}`;
        if (answerInput) answerInput.style.display = 'none';
        const submitBtn = document.getElementById('submit-answer-btn');
        if (submitBtn) submitBtn.style.display = 'none';
        if (skipBtn) skipBtn.style.display = 'none';
        if (hintBtn) hintBtn.style.display = 'none';
        if (this.options.quizName) {
            // Track per-question-type scores
            const typeScores = {};
            this.questions.forEach((q, i) => {
                const type = q.constructor.name;
                if (!typeScores[type]) typeScores[type] = { score: 0, total: 0 };
            });
            if (this._questionResults) {
                const typeList = Object.keys(this._questionResults);
                const scores = typeList.map(type => this._questionResults[type].score);
                const totals = typeList.map(type => this._questionResults[type].total);
                saveQuizScore(this.options.quizName, scores, totals, typeList);
            }
        }
    }

    displayQuestionText() {
        if (answerInput) {
            answerInput.style.display = 'block';
            answerInput.value = '';
        }
        const submitBtn = document.getElementById('submit-answer-btn');
        if (submitBtn) submitBtn.style.display = 'inline-block';
        if (skipBtn) skipBtn.style.display = 'none';
        if (hintBtn) hintBtn.style.display = 'none';
        if (this.currentQuestionIndex < this.questions.length) {
            const q = this.questions[this.currentQuestionIndex];
            if (questionElement) {
                questionElement.innerHTML = this.renderQuestion(q);
            }
        }
    }

    generateQuestions() {
        this.numQuestions = Number(document.getElementById(this.options.numQuestionsId)?.value) || 5;
        const enabledClasses = this.questionClasses.filter(qClass => this.isTypeEnabled(qClass));
        if (enabledClasses.length === 0) {
            alert('Please select at least one question type.');
            this.questions = [];
            return;
        }
        this.questions = [];
        this.currentQuestionIndex = 0;
        this.score = 0;
        for (let i = 0; i < this.numQuestions; i++) {
            const QClass = enabledClasses[getRandomInt(0, enabledClasses.length - 1)];
            const args = this.questionArgs ? this.questionArgs() : undefined;
            this.questions.push(args ? new QClass(args) : new QClass());
        }
    }

    checkAnswer() {
        if (this.currentQuestionIndex >= this.questions.length || !answerInput) return;
        const userAnswer = answerInput.value.trim();
        const q = this.questions[this.currentQuestionIndex];
        const correctAnswer = q.correctAnswer;
        const context = this.getMarkContext(q);
        let isCorrect = false;
        if (typeof q.checkAnswer === 'function') {
            isCorrect = q.checkAnswer(userAnswer);
        } else if (typeof correctAnswer === "number") {
            isCorrect = !isNaN(Number(userAnswer)) && Math.abs(Number(userAnswer) - correctAnswer) <= Math.abs(correctAnswer) * 0.0001;
        } else {
            isCorrect = userAnswer === String(correctAnswer);
        }
        // Track per-question-type results
        const type = q.constructor.name;
        if (!this._questionResults) this._questionResults = {};
        if (!this._questionResults[type]) this._questionResults[type] = { score: 0, total: 0 };
        if (isCorrect) {
            this._questionResults[type].score++;
            this._questionResults[type].total++; // Only increment total when moving to next question
            this.score++;
            let message = 'Correct!';
            if (q.formula) {
                message += ` Formula: ${q.formula.replace(/\n/g, ' ')}`;
            }
            alert(message);
            this.currentQuestionIndex++;
            this.displayNext();
            if (hintBtn) hintBtn.style.display = 'none';
            wrongAttempt = false;
        } else {
            // Do NOT increment total here, only on skip or correct
            const mistake = analyseMistake(userAnswer, correctAnswer, context);
            alert(mistake + " Try again or press Skip.");
            if (skipBtn) skipBtn.style.display = 'inline-block';
            wrongAttempt = true;
            if (hintBtn) hintBtn.style.display = 'inline-block';
        }
    }

    startQuiz() {
        if (optionsContainers[previousMenuId]) {
            optionsContainers[previousMenuId].style.display = 'none';
        }
        if (quizContainer) quizContainer.style.display = 'flex';
        this.generateQuestions();
        if (this.questions.length === 0) return;
        this.displayQuestionText();
        window.activeQuizInstance = this;
    }

    skipQuestion() {
        const q = this.questions[this.currentQuestionIndex];
        const type = q.constructor.name;
        if (!this._questionResults) this._questionResults = {};
        if (!this._questionResults[type]) this._questionResults[type] = { score: 0, total: 0 };
        this._questionResults[type].total++;
        const correctAnswer = q?.correctAnswer;
        alert(`Skipped. The correct answer was ${correctAnswer}.`);
        this.currentQuestionIndex++;
        this.displayNext();
    }
}

// --- Storage Question Types ---
class UnitConversionQuestion {
    constructor() {
        this.units = ['B', 'KB', 'MB', 'GB', 'TB'];
        this.unitValues = { 'B': 1, 'KB': 1000, 'MB': 1000 ** 2, 'GB': 1000 ** 3, 'TB': 1000 ** 4 };
        const fromUnit = this.units[getRandomInt(0, this.units.length - 1)];
        let toUnit;
        do {
            toUnit = this.units[getRandomInt(0, this.units.length - 1)];
        } while (toUnit === fromUnit);
        const value = getRandomInt(1, 1000);
        this.question = `Convert ${value} ${fromUnit} to ${toUnit} (round your answer to 3 significant figures)`;
        this.correctAnswer = UnitConversionQuestion.roundToSigFigs(
            value * (this.unitValues[fromUnit] / this.unitValues[toUnit]), 3
        );
        this.formula = `Multiply by ${this.unitValues[fromUnit] / this.unitValues[toUnit]} to convert from ${fromUnit} to ${toUnit}.`;
    }
    static roundToSigFigs(num, sigFigs) {
        if (num === 0) return 0;
        const mult = Math.pow(10, sigFigs - Math.floor(Math.log10(Math.abs(num))) - 1);
        return Math.round(num * mult) / mult;
    }
    checkAnswer(userAnswer) {
        return Math.abs(Number(userAnswer) - Number(this.correctAnswer)) < 1e-6;
    }
}

class SoundFileQuestion {
    constructor() {
        const sampleRates = [44100, 48000, 96000];
        const bitDepths = [16, 24, 32];
        const sampleRate = sampleRates[getRandomInt(0, sampleRates.length - 1)];
        const bitDepth = bitDepths[getRandomInt(0, bitDepths.length - 1)];
        const duration = getRandomInt(1, 10);
        const fileSizeInBits = sampleRate * duration * bitDepth;
        const fileSizeInBytes = Math.ceil(fileSizeInBits / 8);
        this.question = `Calculate the file size in bytes for an audio file with: Sample rate:`+
        ` ${sampleRate} Hz Duration: ${duration} seconds Bit depth: ${bitDepth} bits (round your answer `+
        `to 3 significant figures)`;
        this.correctAnswer = UnitConversionQuestion.roundToSigFigs(fileSizeInBytes, 3);
        this.formula = 'File size (bytes) = sample rate (Hz) × duration (s) × bit depth (bits) / 8';
    }
    checkAnswer(userAnswer) {
        return Math.abs(Number(userAnswer) - Number(this.correctAnswer)) < 1e-6;
    }
}

class ImageFileQuestion {
    constructor() {
        const colorDepths = [8, 16, 24];
        const colorDepth = colorDepths[getRandomInt(0, colorDepths.length - 1)];
        const width = getRandomInt(100, 1920);
        const height = getRandomInt(100, 1080);
        const fileSizeInBits = colorDepth * height * width;
        const fileSizeInBytes = Math.ceil(fileSizeInBits / 8);
        this.question = `Calculate the uncompressed file size in bytes for an image with: `+
        `Resolution: ${width} × ${height} pixels Color depth: ${colorDepth}-bit (round your answer `+
        `to 3 significant figures)`;
        this.correctAnswer = UnitConversionQuestion.roundToSigFigs(fileSizeInBytes, 3);
        this.formula = 'File size (bytes) = color depth (bits) × height (px) × width (px) / 8';
    }
    checkAnswer(userAnswer) {
        return Math.abs(Number(userAnswer) - Number(this.correctAnswer)) < 1e-6;
    }
}

class TextFileQuestion {
    constructor() {
        const encodings = [
            { name: 'ASCII', bits: 8 },
            { name: 'UTF-8 (Simple)', bits: 8 }
        ];
        const encoding = encodings[getRandomInt(0, encodings.length - 1)];
        const numCharacters = getRandomInt(100, 1000);
        const fileSizeInBits = encoding.bits * numCharacters;
        const fileSizeInBytes = Math.ceil(fileSizeInBits / 8);
        this.question = `Calculate the file size in bytes for a text file with: Number of characters:`+
        ` ${numCharacters} Encoding: ${encoding.name} (${encoding.bits} bits/char assumed) (round `+
        `your answer to 3 significant figures)`;
        this.correctAnswer = UnitConversionQuestion.roundToSigFigs(fileSizeInBytes, 3);
        this.formula = 'File size (bytes) = bits per character × number of characters / 8';
    }
    checkAnswer(userAnswer) {
        return Math.abs(Number(userAnswer) - Number(this.correctAnswer)) < 1e-6;
    }
}

// --- Non-Integer Binary Question Types ---

class FixedAddQuestion {
    constructor() {
        const totalBits = 8;
        const pointPos = getRandomInt(1, totalBits - 1);
        this.num1 = randomFixedPointWithPoint(totalBits, pointPos);
        this.num2 = randomFixedPointWithPoint(totalBits, pointPos);
        const n1 = fixedToFloat(this.num1);
        const n2 = fixedToFloat(this.num2);
        let result = n1 + n2;
        if (result < 0) result = 0;
        this.correctAnswer = floatToFixedWithPoint(result, totalBits, pointPos);
        this.formula = "Add the two fixed-point binary numbers column by column in base 2, carrying as needed";
        this.mode = 'add';
        this.type = 'fixed';
        this.question = `Calculate: ${this.num1} + ${this.num2} (fixed point, unsigned)`;
    }
    checkAnswer(userAnswer) {
        return userAnswer.replace(/\s/g, '') === this.correctAnswer.replace(/\s/g, '');
    }
}

class FixedSubQuestion {
    constructor() {
        const totalBits = 8;
        const pointPos = getRandomInt(1, totalBits - 1);
        this.num1 = randomFixedPointWithPoint(totalBits, pointPos);
        this.num2 = randomFixedPointWithPoint(totalBits, pointPos);
        const n1 = fixedToFloat(this.num1);
        const n2 = fixedToFloat(this.num2);
        let result = n1 - n2;
        if (result < 0) result = 0;
        this.correctAnswer = floatToFixedWithPoint(result, totalBits, pointPos);
        this.formula = "Subtract the two fixed-point binary numbers column by column in base 2, borrowing as needed";
        this.mode = 'sub';
        this.type = 'fixed';
        this.question = `Calculate: ${this.num1} - ${this.num2} (fixed point, unsigned)`;
    }
    checkAnswer(userAnswer) {
        return userAnswer.replace(/\s/g, '') === this.correctAnswer.replace(/\s/g, '');
    }
}

class FixedBase10Question {
    constructor() {
        this.value = randomFixedPointWithPoint(8, getRandomInt(1, 7));
        this.correctAnswer = fixedToFloat(this.value).toString();
        this.formula = "Each digit after the binary point represents 0.5, 0.25, 0.125, etc. Add up the values to get the decimal number.";
        this.mode = 'base10';
        this.type = 'fixed';
        this.question = `Convert the following binary to base 10: ${this.value} (fixed point)`;
    }
    checkAnswer(userAnswer) {
        return Math.abs(Number(userAnswer) - Number(this.correctAnswer)) < 1e-6;
    }
}

// --- Floating point helpers ---
// Encode mantissa (6-bit two's complement) and exponent (4-bit two's complement)
function encodeFloatPoint(mantissa, exponent) {
    // Mantissa: 6 bits, two's complement (-32 to 31)
    // Exponent: 4 bits, two's complement (-8 to 7)
    let mantissaVal = mantissa < 0 ? (mantissa + 64) : mantissa;
    let exponentVal = exponent < 0 ? (exponent + 16) : exponent;
    let mantissaBin = mantissaVal.toString(2).padStart(6, '0');
    let exponentBin = exponentVal.toString(2).padStart(4, '0');
    return mantissaBin + " " + exponentBin;
}

function decodeFloatPoint(str) {
    let [mantissaBin, exponentBin] = str.split(' ');
    let mantissa = parseInt(mantissaBin, 2);
    if (mantissa >= 32) mantissa -= 64; // 6-bit two's complement
    let exponent = parseInt(exponentBin, 2);
    if (exponent >= 8) exponent -= 16; // 4-bit two's complement
    return { mantissa, exponent };
}

function floatPointToFloat(str) {
    let { mantissa, exponent } = decodeFloatPoint(str);
    return mantissa * Math.pow(2, exponent);
}

function floatToFloatPoint(val) {
    if (val === 0 || !isFinite(val)) return "000000 0000";
    let sign = val < 0 ? -1 : 1;
    val = Math.abs(val);
    let exponent = 0;
    let mantissa = val;
    // Normalise so that mantissa fits in 6 bits (-32 to 31) and exponent in 4 bits (-8 to 7)
    while (Math.abs(mantissa) > 31 && exponent < 7) {
        mantissa /= 2;
        exponent++;
    }
    while (Math.abs(mantissa) < 16 && exponent > -8) {
        mantissa *= 2;
        exponent--;
    }
    mantissa = Math.round(mantissa) * sign;
    // Clamp to representable range
    if (mantissa > 31) mantissa = 31;
    if (mantissa < -32) mantissa = -32;
    if (exponent > 7) exponent = 7;
    if (exponent < -8) exponent = -8;
    return encodeFloatPoint(mantissa, exponent);
}

function normaliseFloat(str) {
    let { mantissa, exponent } = decodeFloatPoint(str);
    if (mantissa === 0) return encodeFloatPoint(0, 0);
    let sign = mantissa < 0 ? -1 : 1;
    mantissa = Math.abs(mantissa);
    // Normalise so that mantissa fits in 6 bits (-32 to 31) and exponent in 4 bits (-8 to 7)
    while (mantissa < 16 && exponent > -8) {
        mantissa *= 2;
        exponent--;
    }
    while (mantissa > 31 && exponent < 7) {
        mantissa /= 2;
        exponent++;
    }
    mantissa = Math.round(mantissa) * sign;
    // Clamp to representable range
    if (mantissa > 31) mantissa = 31;
    if (mantissa < -32) mantissa = -32;
    if (exponent > 7) exponent = 7;
    if (exponent < -8) exponent = -8;
    return encodeFloatPoint(mantissa, exponent);
}

// Generate a random 6-bit two's complement mantissa and 4-bit two's complement exponent
function randomFloatPoint() {
    let mantissa, exponent;
    do {
        mantissa = getRandomInt(-32, 31); // 6-bit two's complement: -32 to 31
    } while (mantissa === 0);
    exponent = getRandomInt(-8, 7); // 4-bit two's complement: -8 to 7
    return encodeFloatPoint(mantissa, exponent);
}

class FloatAddQuestion {
    constructor() {
        const num1 = randomFloatPoint();
        const num2 = randomFloatPoint();
        const n1 = floatPointToFloat(num1);
        const n2 = floatPointToFloat(num2);
        let result = n1 + n2;
        this.num1 = num1;
        this.num2 = num2;
        this.correctAnswer = floatToFloatPoint(result);
        this.formula = "Align the exponents, add the mantissas in binary (6-bit two's complement), then normalise the result if needed. Exponent is 4-bit two's complement.";
        this.mode = 'add';
        this.type = 'float';
        this.question = `Calculate: ${num1} + ${num2} (floating point, two's complement: 6-bit mantissa, 4-bit exponent)`;
    }
    checkAnswer(userAnswer) {
        return userAnswer.replace(/\s+/g, ' ').trim() === this.correctAnswer;
    }
}

class FloatSubQuestion {
    constructor() {
        const num1 = randomFloatPoint();
        const num2 = randomFloatPoint();
        const n1 = floatPointToFloat(num1);
        const n2 = floatPointToFloat(num2);
        let result = n1 - n2;
        this.num1 = num1;
        this.num2 = num2;
        this.correctAnswer = floatToFloatPoint(result);
        this.formula = "Align the exponents, subtract the mantissas in binary (6-bit two's complement), then normalise the result if needed. Exponent is 4-bit two's complement.";
        this.mode = 'sub';
        this.type = 'float';
        this.question = `Calculate: ${num1} - ${num2} (floating point, two's complement: 6-bit mantissa, 4-bit exponent)`;
    }
    checkAnswer(userAnswer) {
        return userAnswer.replace(/\s+/g, ' ').trim() === this.correctAnswer;
    }
}

class FloatNormQuestion {
    constructor() {
        const value = randomFloatPoint();
        this.value = value;
        this.correctAnswer = normaliseFloat(value);
        this.formula = "Shift the mantissa (6-bit two's complement) until the first and second digit are different, adjust exponent (4-bit two's complement) accordingly.";
        this.mode = 'norm';
        this.type = 'float';
        this.question = `Normalise the following floating point number using 6-bit two's complement mantissa and 4-bit two's complement exponent: ${value}`;
    }
    checkAnswer(userAnswer) {
        return userAnswer.replace(/\s+/g, ' ').trim() === this.correctAnswer;
    }
}

class FloatBase10Question {
    constructor() {
        const value = randomFloatPoint();
        this.value = value;
        this.correctAnswer = floatPointToFloat(value).toString();
        this.formula = "the digits in the mantissa represent -1, 0.5, 0.25, etc. Add up the values to get the decimal number. Then multiply by 2^exponent.";
        this.mode = 'base10';
        this.type = 'float';
        this.question = `Convert the following binary to base 10: ${value} (floating point, 6-bit mantissa, 4-bit exponent)`;
    }
    checkAnswer(userAnswer) {
        return Math.abs(Number(userAnswer) - Number(this.correctAnswer)) < 1e-6;
    }
}

// --- Initialization ---
class ConversionQuestion {
    constructor({ baseFrom = 10, baseTo = 2 } = {}) {
        const decimalValue = getRandomInt(24, 255);
        this.baseFrom = baseFrom;
        this.baseTo = baseTo;
        this.question = convertBase(decimalValue, 10, baseFrom);
        this.correctAnswer = convertBase(decimalValue, 10, baseTo);
        this.formula = `Convert from ${getBaseName(baseFrom)} to ${getBaseName(baseTo)}`;
    }

    checkAnswer(userAnswer) {
        // Ignore leading zeros in the user's answer
        return userAnswer.replace(/^0+/, '') === this.correctAnswer;
    }
}

const conversionQuiz = new Quiz(
    [ConversionQuestion],
    {
        numQuestionsId: 'num-conversion-questions',
        quizName: 'conversion',
        renderQuestion: q => {
            const fromName = getBaseName(q.baseFrom);
            const toName = getBaseName(q.baseTo);
            return `Convert ${q.question} from ${fromName} to ${toName}.`;
        },
        getMarkContext: q => ({ type: 'base', base: q.baseTo }),
        questionArgs: () => ({
            baseFrom: Number(document.getElementById('base-from')?.value) || 10,
            baseTo: Number(document.getElementById('base-to')?.value) || 2
        })
    }
);

class ArithmeticQuestion {
    constructor({ isSigned = false, bits = 8 } = {}) {
        const maxVal = isSigned ? Math.pow(2, bits - 1) - 1 : Math.pow(2, bits) - 1;
        const minVal = isSigned ? -Math.pow(2, bits - 1) : 0;
        const operations = ['+', '-'];
        let num1Dec, num2Dec, operation, resultDec;
        do {
            num1Dec = getRandomInt(minVal, maxVal);
            num2Dec = getRandomInt(minVal, maxVal);
            operation = operations[Math.floor(Math.random() * operations.length)];
            resultDec = operation === '+' ? num1Dec + num2Dec : num1Dec - num2Dec;
            if (isSigned) {
                if (resultDec > maxVal) resultDec = maxVal;
                if (resultDec < minVal) resultDec = minVal;
            }
        } while (!isSigned && resultDec < 0);
        function toBinaryString(num) {
            if (isSigned) {
                if (num < 0) num = Math.pow(2, bits) + num;
                return num.toString(2).padStart(bits, '0');
            } else {
                return Math.max(0, num).toString(2);
            }
        }
        this.num1Binary = toBinaryString(num1Dec);
        this.num2Binary = toBinaryString(num2Dec);
        this.operation = operation;
        this.correctAnswer = toBinaryString(resultDec);
        this.num1Dec = num1Dec;
        this.num2Dec = num2Dec;
        this.resultDec = resultDec;
        this.isSigned = isSigned;
        this.bits = bits;
        if(!this.isSigned) this.formula = "Add or subtract each pair of bits from right to left, carrying or borrowing as needed.";
        else this.formula = "Add or subtract each pair of bits from right to left, carrying or borrowing as needed."+ 
        " If the number starts with 1, it is negative. to make it positive, flip all bits and add 1.";
    }
    checkAnswer(userAnswer) {
        // Remove whitespace and leading zeros from user's answer
        return userAnswer.replace(/\s/g, '').replace(/^0+/, '') === this.correctAnswer;
    }
}

const arithmeticQuiz = new Quiz(
    [ArithmeticQuestion],
    {
        numQuestionsId: 'num-arithmetic-questions',
        quizName: 'arithmetic',
        renderQuestion: q =>
            `Calculate: ${q.num1Binary} ${q.operation} ${q.num2Binary}` +
            (q.isSigned ? ` (using ${q.bits}-bit two's complement)` : ` (in binary)`),
        getMarkContext: () => ({ type: 'base', base: 2  }),
        questionArgs: () => ({
            isSigned: document.getElementById('signed')?.checked || false,
            bits: 8
        })
    }
);

class AsciiQuestion {
    constructor({ direction = 'toAscii' } = {}) {
        const asciiValue = getRandomInt(32, 126);
        if (direction === 'toAscii') {
            this.question = String.fromCharCode(asciiValue);
            this.correctAnswer = asciiValue;
            this.direction = 'toAscii';
        } else {
            this.question = asciiValue;
            this.correctAnswer = String.fromCharCode(asciiValue);
            this.direction = 'toChar';
        }
    }
    checkAnswer(userAnswer) {
        return String(userAnswer) === String(this.correctAnswer);
    }
}

const asciiQuiz = new Quiz(
    [AsciiQuestion],
    {
        numQuestionsId: 'num-ascii-questions',
        quizName: 'ascii',
        renderQuestion: q =>
            q.direction === 'toAscii'
                ? `Convert the character '${q.question}' to its ASCII value.`
                : `Convert the ASCII value ${q.question} to its character representation.`,
        getMarkContext: q => q.direction === 'toAscii' ? { type: 'ascii' } : { type: 'char' },
        questionArgs: () => ({
            direction: document.getElementById('ascii-direction')?.value
        })
    }
);

const storageQuiz = new Quiz(
    [UnitConversionQuestion, SoundFileQuestion, ImageFileQuestion, TextFileQuestion],
    {
        numQuestionsId: 'num-storage-questions',
        quizName: 'storage',
        isTypeEnabled: qClass => {
            // Derive id: UnitConversionQuestion -> unit_conversion, etc.
            const id = qClass.name
                .replace(/([A-Z])/g, '_$1')
                .replace(/^_/, '')
                .replace(/_Question$/, '')
                .toLowerCase();
            const checkbox = document.getElementById(`storage-type-${id}`);
            return checkbox ? checkbox.checked : true;
        },
        getMarkContext: () => ({ type: 'number', sf: true }),
        renderQuestion: q => q.question.replace(/\n/g, '<br>')
    }
);
const nonIntQuiz = new Quiz(
    [
        FixedAddQuestion,
        FixedSubQuestion,
        FixedBase10Question,
        FloatAddQuestion,
        FloatSubQuestion,
        FloatNormQuestion,
        FloatBase10Question
    ],
    {
        numQuestionsId: 'num-nonint-questions',
        quizName: 'nonint',
        isTypeEnabled: qClass => {
            // Derive id: FixedAddQuestion -> add, FloatNormQuestion -> norm, etc.
            const type = document.getElementById('nonint-type')?.value || 'fixed';
            const name = qClass.name;
            let mode = name.replace(/^(Fixed|Float)/, '').replace(/Question$/, '').toLowerCase();
            if (name.startsWith('Fixed') && type !== 'fixed') return false;
            if (name.startsWith('Float') && type !== 'float') return false;
            return document.getElementById(`nonint-type-${mode}`)?.checked;
        },
        getMarkContext: q => ({ type: 'base', base: 2 }),
        renderQuestion: q => q.question
    }
);

// --- Global Event Listeners / Functions ---

// Add event listener to the main submit answer button
document.getElementById('submit-answer-btn')?.addEventListener('click', checkAnswer);

// Helper function to add listeners to quiz start buttons
function addQuizSubmitListener(buttonId, quizInstance) {
    document.getElementById(buttonId)?.addEventListener('click', () => {
        quizInstance.startQuiz();
    });
}

// Add event listeners to quiz option submit buttons
[
    ['start-conversion-quiz', conversionQuiz],
    ['start-arithmetic-quiz', arithmeticQuiz],
    ['start-ascii-quiz', asciiQuiz],
    ['start-storage-quiz', storageQuiz],
    ['start-nonint-quiz', nonIntQuiz]
].forEach(([id, quiz]) => addQuizSubmitListener(id, quiz));

// Add event listeners for nav items
document.querySelectorAll('.nav-item').forEach(item =>
    item.addEventListener('click', () => handleTopNavClick(item))
);

// Hamburger menu listeners
document.querySelector('.hamburger')?.addEventListener('click', openNav);
document.querySelector('.closebtn')?.addEventListener('click', closeNav);

// Function to determine which quiz is active and call its checkAnswer
function checkAnswer() {
    switch (previousMenuId) {
        case "arithmetic": arithmeticQuiz.checkAnswer(); break;
        case "ascii": asciiQuiz.checkAnswer(); break;
        case "conversion": conversionQuiz.checkAnswer(); break;
        case "storage": storageQuiz.checkAnswer(); break;
        case "nonint": nonIntQuiz.checkAnswer(); break;
        default: console.warn('No active quiz found for checking answer.');
    }
}

// Ensure the DOM is fully loaded before running initial setup
document.addEventListener('DOMContentLoaded', () => {
    // Initial UI setup
    if (quizContainer) quizContainer.style.display = 'none';
    Object.values(optionsContainers).forEach(container => container && (container.style.display = 'none'));
    hideProgressSection();
    changeMenu("home");

    // Quiz start buttons
    [
        ['start-conversion-quiz', conversionQuiz],
        ['start-arithmetic-quiz', arithmeticQuiz],
        ['start-ascii-quiz', asciiQuiz],
        ['start-storage-quiz', storageQuiz],
        ['start-nonint-quiz', nonIntQuiz]
    ].forEach(([id, quiz]) => addQuizSubmitListener(id, quiz));

    // Nav items
    document.querySelectorAll('.nav-item').forEach(item =>
        item.addEventListener('click', () => handleTopNavClick(item))
    );

    // Hamburger menu listeners
    document.querySelector('.hamburger')?.addEventListener('click', openNav);
    document.querySelector('.closebtn')?.addEventListener('click', closeNav);

    // Export/import progress
    document.getElementById('export-progress-btn').onclick = exportProgress;
    document.getElementById('import-progress-btn').onclick = () => {
        document.getElementById('import-progress-file').click();
    };
    document.getElementById('import-progress-file').onchange = function() {
        if (this.files && this.files[0]) {
            importProgressFile(this.files[0]);
        }
    };

    // Non-integer binary quiz: disable 'norm' if fixed point is selected
    updateNonIntTypeCheckboxes();
    document.getElementById('nonint-type')?.addEventListener('change', updateNonIntTypeCheckboxes);

    // Site title click-to-homepage logic
    document.getElementById('site-title')?.addEventListener('click', () => changeMenu("home"));

    // Hint button
    hintBtn = document.createElement('button');
    hintBtn.textContent = 'Show Hint';
    hintBtn.className = 'button';
    hintBtn.style.display = 'none';
    hintBtn.onclick = function() {
        const q = window.activeQuizInstance?.questions[window.activeQuizInstance.currentQuestionIndex];
        if (q?.formula) {
            alert(`Hint: ${q.formula}`);
        } else {
            alert('No hint available for this question.');
        }
    };
    document.querySelector('.quiz-action-buttons')?.appendChild(hintBtn);

    // Home link: always close sidebar and go to welcome text
    document.getElementById('home')?.addEventListener('click', function(e) {
        e.preventDefault();
        goHomeAndCloseSidebar();
    });

    // Progress link
    document.getElementById('progress')?.addEventListener('click', function(e) {
        e.preventDefault();
        closeNav();
        changeMenu("progress");
    });

    // Add event listener for Tutorials link in sidebar
    document.getElementById('tutorials')?.addEventListener('click', function(e) {
        e.preventDefault();
        closeNav();
        changeMenu("tutorials");
    });
});

// --- Progress Save/Load/Export/Import ---

const PROGRESS_KEY = 'quizProgress';

function getProgress() {
    return JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}');
}

function setProgress(progress) {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
}

function saveQuizScore(quizName, score, total, questionTypes) {
    const progress = getProgress();
    questionTypes.forEach((type, idx) => {
        if (!progress[type]) {
            progress[type] = [];
        }
        // For each question type, push the score and total for that type
        progress[type].push({ score: score[idx], total: total[idx], date: new Date().toISOString() });
    });
    setProgress(progress);
}

// Example: Load quiz score (for displaying progress)
// Returns array of results or empty array if none
function getQuizScore(questionType) {
    const progress = getProgress();
    return progress[questionType] || [];
}

// Export progress as JSON file
function exportProgress() {
    const data = JSON.stringify(getProgress(), null, 2);
    const blob = new Blob([data], {type: "application/json"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'progress.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Import progress from JSON file
function importProgressFile(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const imported = JSON.parse(e.target.result);
            if (typeof imported === 'object' && imported !== null) {
                setProgress(imported);
                alert('Progress imported successfully!');
                changeMenu('progress');
                renderProgressTypeFilters();
                showProgressSection();
            } else {
                alert('Invalid progress file.');
            }
        } catch {
            alert('Invalid progress file.');
        }
    };
    reader.readAsText(file);
}

// --- Hook up export/import buttons ---
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('export-progress-btn').onclick = exportProgress;
    document.getElementById('import-progress-btn').onclick = () => {
        document.getElementById('import-progress-file').click();
    };
    document.getElementById('import-progress-file').onchange = function() {
        if (this.files && this.files[0]) {
            importProgressFile(this.files[0]);
        }
    };
});

// --- UI logic for enabling/disabling question type checkboxes ---

// Storage quiz: (all types always enabled, so nothing to do)

// Non-integer binary quiz: disable 'norm' if fixed point is selected
function updateNonIntTypeCheckboxes() {
    const type = document.getElementById('nonint-type')?.value;
    const normCheckbox = document.getElementById('nonint-type-norm');
    if (!normCheckbox) return;
    if (type === 'fixed') {
        normCheckbox.disabled = true;
        normCheckbox.checked = false;
    } else {
        normCheckbox.disabled = false;
        normCheckbox.checked = true;
    }
}
document.getElementById('nonint-type')?.addEventListener('change', updateNonIntTypeCheckboxes);

// --- Add site title click-to-homepage logic ---
document.getElementById('site-title')?.addEventListener('click', () => changeMenu("home"));

document.addEventListener('DOMContentLoaded', () => {
    // Add hint button to quiz-action-buttons
    hintBtn = document.createElement('button');
    hintBtn.textContent = 'Show Hint';
    hintBtn.className = 'button';
    hintBtn.style.display = 'none';
    hintBtn.onclick = function() {
        const q = window.activeQuizInstance?.questions[window.activeQuizInstance.currentQuestionIndex];
        if (q?.formula) {
            alert(`Hint: ${q.formula}`);
        } else {
            alert('No hint available for this question.');
        }
    };
    document.querySelector('.quiz-action-buttons')?.appendChild(hintBtn);
});

// Home link: always close sidebar and go to welcome text
function goHomeAndCloseSidebar() {
    const sideNav = document.getElementsByClassName("side-nav")[0];
    if (sideNav) {
        sideNav.style.width = "0";
        // Remove the outside click listener if present
        if (typeof window.outsideClickListener === "function") {
            document.removeEventListener('click', window.outsideClickListener);
        }
    }
    changeMenu('home');
}


function showProgressSection() {
    // Hide all main sections
    if (welcomeText) welcomeText.style.display = "none";
    Object.values(optionsContainers).forEach(container => container && (container.style.display = 'none'));
    if (quizContainer) quizContainer.style.display = 'none';

    // Show progress section
    const progressSection = document.getElementById('progress-section');
    if (progressSection) {
        progressSection.style.display = 'block';
        renderProgressTypeFilters();
        drawProgressGraph();
    }
}

// --- Progress Type Filter UI ---
function renderProgressTypeFilters() {
    let filterContainer = document.getElementById('progress-type-filters');
    if (!filterContainer) {
        filterContainer = document.createElement('div');
        filterContainer.id = 'progress-type-filters';
        filterContainer.style.position = 'absolute';
        // Center vertically within the progress section
        filterContainer.style.top = '50%';
        filterContainer.style.transform = 'translateY(-50%)';
        filterContainer.style.right = '30px';
        filterContainer.style.background = '#fff';
        filterContainer.style.border = '1px solid #ccc';
        filterContainer.style.padding = '10px 16px';
        filterContainer.style.borderRadius = '8px';
        filterContainer.style.boxShadow = '0 2px 8px rgba(0,0,0,0.07)';
        filterContainer.style.zIndex = 10;
        filterContainer.style.minWidth = '180px';
        filterContainer.style.fontSize = '14px';
        filterContainer.style.maxHeight = '300px';
        filterContainer.style.overflowY = 'auto';
        filterContainer.innerHTML = "<b>Filter by Question Type:</b><br>";
        document.getElementById('progress-section')?.appendChild(filterContainer);
    } else {
        filterContainer.innerHTML = "<b>Filter by Question Type:</b><br>";
    }

    const progress = getProgress();
    const allTypes = Object.keys(progress);
    // If no types, hide
    if (allTypes.length === 0) {
        filterContainer.style.display = 'none';
        return;
    }
    filterContainer.style.display = 'block';

    // Get or set checked types from localStorage
    let checkedTypes = [];
    try {
        checkedTypes = JSON.parse(localStorage.getItem('progressTypeFilters') || '[]');
    } catch { checkedTypes = []; }
    if (!Array.isArray(checkedTypes) || checkedTypes.length === 0) checkedTypes = allTypes.slice();

    // Create checkboxes
    allTypes.forEach(type => {
        const id = `progress-type-filter-${type}`;
        const label = document.createElement('label');
        label.style.display = 'block';
        label.style.cursor = 'pointer';
        label.style.margin = '2px 0';
        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.id = id;
        cb.value = type;
        cb.checked = checkedTypes.includes(type);
        cb.style.marginRight = '6px';
        cb.onchange = function() {
            // Save checked types to localStorage
            const newChecked = Array.from(filterContainer.querySelectorAll('input[type=checkbox]:checked')).map(x => x.value);
            localStorage.setItem('progressTypeFilters', JSON.stringify(newChecked));
            drawProgressGraph();
        };
        label.appendChild(cb);
        // Prettify type name
        let pretty = type.replace(/([A-Z])/g, ' $1').replace(/^ /, '').replace(/Question$/, '').replace(/_/g, ' ');
        label.appendChild(document.createTextNode(pretty));
        filterContainer.appendChild(label);
    });
}

function drawProgressGraph() {
    const canvas = document.getElementById('progress-graph');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // --- Filter logic ---
    let checkedTypes = [];
    try {
        checkedTypes = JSON.parse(localStorage.getItem('progressTypeFilters') || '[]');
    } catch { checkedTypes = []; }
    const progress = getProgress();
    let allEntries = [];
    Object.entries(progress).forEach(([type, arr]) => {
        if (checkedTypes.length === 0 || checkedTypes.includes(type)) {
            allEntries = allEntries.concat(arr.map(e => ({...e, _type: type})));
        }
    });

    allEntries.sort((a, b) => new Date(a.date) - new Date(b.date));
    if (allEntries.length === 0) {
        ctx.font = "16px sans-serif";
        ctx.fillText("No progress data yet.", 20, 40);
        return;
    }

    // Collapse entries with the same timestamp to only the last one
    const uniqueEntries = [];
    let lastTime = null;
    for (let i = 0; i < allEntries.length; i++) {
        const t = new Date(allEntries[i].date).getTime();
        if (lastTime !== t) {
            uniqueEntries.push(allEntries[i]);
            lastTime = t;
        } else {
            uniqueEntries[uniqueEntries.length - 1] = allEntries[i];
        }
    }

    let runningSum = 0;
    let runningCount = 0;
    const timeScorePairs = [];
    uniqueEntries.forEach(entry => {
        const t = new Date(entry.date).getTime();
        const pct = entry.score / (entry.total || 1);
        runningSum += pct;
        runningCount++;
        const runningAvg = runningSum / runningCount;
        timeScorePairs.push({ time: t, score: pct, runningAvg });
    });

    const w = canvas.width, h = canvas.height;
    const padding = 50;
    const graphW = w - 2 * padding, graphH = h - 2 * padding;

    // Find min/max for y axis
    const minY = 0;
    const maxY = 1;

    // X axis: min/max time
    const minTime = timeScorePairs[0].time;
    const maxTime = timeScorePairs[timeScorePairs.length - 1].time;
    const timeRange = maxTime - minTime || 1;

    // Draw axes
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, h - padding);
    ctx.lineTo(w - padding, h - padding);
    ctx.stroke();

    // Draw y-axis labels (0 to 1)
    ctx.font = "12px sans-serif";
    ctx.textAlign = "right";
    for (let i = 0; i <= 5; i++) {
        const yVal = minY + (maxY - minY) * (i / 5);
        const y = h - padding - (graphH * (yVal - minY) / (maxY - minY));
        ctx.fillText((yVal * 100).toFixed(0) + "%", padding - 5, y + 4);
        ctx.strokeStyle = "#eee";
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(w - padding, y);
        ctx.stroke();
    }

    ctx.textAlign = "center";
    ctx.strokeStyle = "#ccc";
    // Always show first and last, and only show others if not overlapping any already-placed label
    let labelMinDist = 100;
    let labelXs = [];
    let labelIndices = [];

    // Always add first and last
    labelIndices.push(0);
    if (timeScorePairs.length > 1) labelIndices.push(timeScorePairs.length - 1);

    // Check all other indices for spacing
    for (let i = 1; i < timeScorePairs.length - 1; i++) {
        const t = timeScorePairs[i].time;
        const x = padding + ((t - minTime) / timeRange) * graphW;
        // Check against all already-placed label x positions
        let tooClose = false;
        for (const idx of labelIndices) {
            const tPlaced = timeScorePairs[idx].time;
            const xPlaced = padding + ((tPlaced - minTime) / timeRange) * graphW;
            if (Math.abs(x - xPlaced) < labelMinDist) {
                tooClose = true;
                break;
            }
        }
        if (!tooClose) labelIndices.push(i);
    }
    // Sort labelIndices so they are in order
    labelIndices.sort((a, b) => a - b);

    // Draw labels and grid lines
    for (const i of labelIndices) {
        const t = timeScorePairs[i].time;
        const dateObj = new Date(t);
        const x = padding + ((t - minTime) / timeRange) * graphW;
        let label = dateObj.toISOString().slice(0, 10);
        if (timeScorePairs.length > 7 || (maxTime - minTime) < 1000 * 60 * 60 * 24) {
            label += " " + dateObj.toISOString().slice(11, 16);
        }
        ctx.fillText(label, x, h - padding + 18);
        // vertical grid line
        ctx.beginPath();
        ctx.moveTo(x, h - padding);
        ctx.lineTo(x, padding);
        ctx.stroke();
    }

    // Draw running average line, scaled by time
    ctx.strokeStyle = "#0074d9";
    ctx.lineWidth = 2;
    ctx.beginPath();
    timeScorePairs.forEach(({ time, runningAvg }, i) => {
        const x = padding + ((time - minTime) / timeRange) * graphW;
        const y = h - padding - (graphH * (runningAvg - minY) / (maxY - minY));
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Draw points for running average
    ctx.fillStyle = "#0074d9";
    timeScorePairs.forEach(({ time, runningAvg }) => {
        const x = padding + ((time - minTime) / timeRange) * graphW;
        const y = h - padding - (graphH * (runningAvg - minY) / (maxY - minY));
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 2 * Math.PI);
        ctx.fill();
    });

    // Title
    ctx.font = "bold 16px sans-serif";
    ctx.textAlign = "center";
    ctx.fillStyle = "#222";
    ctx.fillText("Average Score Over Time", w / 2, padding - 18);
}

function hideProgressSection() {
    const progressSection = document.getElementById('progress-section');
    if (progressSection) progressSection.style.display = 'none';
}

function showTutorialSection(topicId = "home") {
    // Hide all main sections
    if (welcomeText) welcomeText.style.display = "none";
    Object.values(optionsContainers).forEach(container => container && (container.style.display = 'none'));
    if (quizContainer) quizContainer.style.display = 'none';
    hideProgressSection();

    // Show tutorials section
    const tutorialsSection = document.getElementById('tutorials-section');
    if (tutorialsSection) {
        tutorialsSection.style.display = 'block';
        // Hide all topic divs
        tutorialsSection.querySelectorAll('.tutorials-topic').forEach(div => div.style.display = 'none');
        // Show the requested topic
        const topicDiv = document.getElementById(`tutorial-${topicId}`) || document.getElementById('tutorials-home');
        if (topicDiv) topicDiv.style.display = 'block';
    }
}

function hideTutorialSection() {
    const tutorialsSection = document.getElementById('tutorials-section');
    if (tutorialsSection) tutorialsSection.style.display = 'none';
}

function handleTopNavClick(item) {
    // If currently in progress or tutorials section, show tutorial for that topic
    if (currentSection === "progress" || currentSection === "tutorials") {
        let topicId = item.id;
        showTutorialSection(topicId);
        currentSection = "tutorials";
        // Highlight nav item
        document.querySelectorAll('.nav-item.active').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
    } else {
        changeMenu(item.id);
    }
}