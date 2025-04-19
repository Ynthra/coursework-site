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

const optionsContainers = {
    "1": arithmeticOptionsContainer,
    "2": asciiOptionsContainer,
    "3": conversionOptionsContainer,
    "4": storageOptionsContainer
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

// --- Utility Functions ---
function getRandomInt(min, max) {
    const ceilMin = Math.ceil(min);
    const floorMax = Math.floor(max);
    return Math.floor(Math.random() * (floorMax - ceilMin + 1)) + ceilMin;
}

// Corrected: Converts a number from one base to another
function convertBase(num, fromBase, toBase) {
    // Ensure bases are numbers
    const from = Number(fromBase);
    const to = Number(toBase);
    // Parse number in the original base and convert to the target base
    return parseInt(num, from).toString(to);
}

function getBaseName(base) {
    switch (String(base)) {
        case "10": return "denary";
        case "2": return "binary";
        case "16": return "hexadecimal";
        default: return `base ${base}`;
    }
}

// --- Menu Navigation ---
let previousMenuId = "0";

function changeMenu(id) {
    const currentNavItem = document.getElementById(id);
    if (currentNavItem && currentNavItem.classList.contains('nav-item')) {
        document.querySelectorAll('.nav-item.active').forEach(item => item.classList.remove('active'));
        currentNavItem.classList.add('active');
    }

    // Reset all quiz states
    conversionQuiz.reset();
    arithmeticQuiz.reset();
    asciiQuiz.reset();
    storageQuiz.reset();

    if (answerInput) {
        answerInput.value = '';
    }
    if (formulaHintElement) {
        formulaHintElement.textContent = '';
    }

    // Hide previously shown elements
    if (previousMenuId === "0") {
        if(welcomeText) welcomeText.style.display = "none";
    } else if (optionsContainers[previousMenuId]) {
        optionsContainers[previousMenuId].style.display = "none";
        if(quizContainer) quizContainer.style.display = "none";
    }

    // Show current elements based on ID
    if (id === "0") {
        if(welcomeText) welcomeText.style.display = "block";
    } else if (optionsContainers[id]) {
        optionsContainers[id].style.display = "flex"; // Or "block" if preferred
    }

    previousMenuId = id;
}

// --- Base Quiz Class ---
class Quiz {
    constructor() {
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.numQuestions = 0;
        this.questions = [];
    }

    reset() {
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.numQuestions = 0;
        this.questions = [];
        if (quizContainer) quizContainer.style.display = 'none';
        // Ensure options containers are hidden on reset too, except for the active one
        Object.values(optionsContainers).forEach(container => {
            if (container && container.id !== `${previousMenuId}-options-container`) { // Check ID carefully
               // container.style.display = 'none'; // Reconsider this, might hide the current options
            }
        });
         // Make sure submit button and answer input are hidden initially after reset
        if (answerInput) answerInput.style.display = 'none';
        const submitBtn = document.getElementById('submit-answer-btn');
        if (submitBtn) submitBtn.style.display = 'none';
         if (formulaHintElement) formulaHintElement.textContent = '';

    }

    displayNext() {
        if (this.currentQuestionIndex < this.numQuestions) {
            this.displayQuestionText();
        } else {
            this.displayResults();
        }
    }

    displayResults() {
        // Abstract method - Implement in derived classes
        if (questionElement) questionElement.innerHTML = `Quiz completed! Your score: ${this.score}/${this.questions.length}`;
        if (answerInput) answerInput.style.display = 'none';
        const submitBtn = document.getElementById('submit-answer-btn');
        if (submitBtn) submitBtn.style.display = 'none'; // Hide submit button
        if (formulaHintElement) formulaHintElement.textContent = '';
    }

    displayQuestionText() {
        // Abstract method - Implement in derived classes
        if (answerInput) {
            answerInput.style.display = 'block';
            answerInput.value = ''; // Clear previous answer
        }
        const submitBtn = document.getElementById('submit-answer-btn');
        if(submitBtn) submitBtn.style.display = 'inline-block'; // Show submit button
    }

    generateQuestions() {
        // Abstract method - Implement in derived classes
    }

    checkAnswer() {
        if (this.isCorrect()) {
            this.score++;
            alert('Correct!');
        } else {
             // Make sure correctAnswer exists before accessing it
             const correctAnswer = this.questions[this.currentQuestionIndex]?.correctAnswer;
             alert(`Incorrect.${correctAnswer !== undefined ? ' The correct answer was ' + correctAnswer + '.' : ''}`);
        }
        this.currentQuestionIndex++;
        this.displayNext();
    }

    isCorrect(){
         // Abstract method - Implement in derived classes
         return false;
    }

    startQuiz() {
        // Common logic to hide options and show quiz area
        if (optionsContainers[previousMenuId]) {
            optionsContainers[previousMenuId].style.display = 'none';
        }
        if(quizContainer) quizContainer.style.display = 'flex';
        this.generateQuestions(); // Generate questions first
        this.displayQuestionText(); // Then display the first one
    }
}

// --- Conversion Quiz ---
class ConversionQuiz extends Quiz {
    constructor() {
        super();
        this.baseFrom = 10;
        this.baseTo = 2;
    }

    displayResults() {
        super.displayResults(); // Call base class method
    }

    displayQuestionText() {
        super.displayQuestionText();
        if (this.currentQuestionIndex < this.questions.length) {
            const q = this.questions[this.currentQuestionIndex];
            const fromName = getBaseName(this.baseFrom);
            const toName = getBaseName(this.baseTo);
            if (questionElement) questionElement.textContent = `Convert ${q.question} from ${fromName} to ${toName}.`;
        }
    }

    generateQuestions() {
        this.numQuestions = Number(document.getElementById('num-conversion-questions')?.value) || 5;
        this.baseFrom = Number(document.getElementById('base-from')?.value) || 10;
        this.baseTo = Number(document.getElementById('base-to')?.value) || 2;
        this.questions = [];
        this.currentQuestionIndex = 0;
        this.score = 0;

        for (let i = 0; i < this.numQuestions; i++) {
            const decimalValue = getRandomInt(24, 255);
            // Use the corrected convertBase function
            const questionValue = convertBase(decimalValue, 10, this.baseFrom);
            const correctAnswerValue = convertBase(decimalValue, 10, this.baseTo);
            this.questions.push({ question: questionValue, correctAnswer: correctAnswerValue });
        }
    }

    isCorrect() {
        if (this.currentQuestionIndex >= this.questions.length || !answerInput) return false;
        const userAnswer = answerInput.value.trim().toLowerCase();
        const correctAnswer = String(this.questions[this.currentQuestionIndex].correctAnswer).toLowerCase();
        return userAnswer === correctAnswer;
    }

    checkAnswer() {
         // Override to provide specific feedback format if needed, or use base implementation
         if (this.isCorrect()) {
            this.score++;
            alert('Correct!');
        } else {
             const correctAnswer = this.questions[this.currentQuestionIndex]?.correctAnswer;
             alert(`Incorrect.${correctAnswer !== undefined ? ' The answer was ' + correctAnswer + '.' : ''}`);
        }
        this.currentQuestionIndex++;
        this.displayNext();
    }

    submit() {
       this.startQuiz();
    }
}

// --- Arithmetic Quiz ---
class ArithmeticQuiz extends Quiz {
    constructor() {
        super();
        this.operations = ['+', '-'];
        this.isSigned = false;
        this.bits = 8; // Default to 8 bits
    }

    displayResults() {
        super.displayResults();
    }

    displayQuestionText() {
        super.displayQuestionText();
        if (this.currentQuestionIndex < this.questions.length) {
            const q = this.questions[this.currentQuestionIndex];
             if (questionElement) questionElement.textContent = `Calculate: ${q.num1Binary} ${q.operation} ${q.num2Binary}` +
                                        (this.isSigned ? ` (using ${this.bits}-bit two's complement)` : ` (in binary)`);
        }
    }

    generateQuestions() {
        this.numQuestions = Number(document.getElementById('num-arithmetic-questions')?.value) || 5;
        this.isSigned = document.getElementById('signed')?.checked || false;
        this.bits = this.isSigned ? 8 : 8; // Currently fixed at 8-bit
        this.questions = [];
        this.currentQuestionIndex = 0;
        this.score = 0;

        const maxVal = this.isSigned ? Math.pow(2, this.bits - 1) - 1 : Math.pow(2, this.bits) - 1;
        const minVal = this.isSigned ? -Math.pow(2, this.bits - 1) : 0;

        for (let i = 0; i < this.numQuestions; i++) {
            const num1Dec = getRandomInt(minVal, maxVal);
            const num2Dec = getRandomInt(minVal, maxVal);
            const operation = this.operations[Math.floor(Math.random() * this.operations.length)];

            let resultDec;
            if (operation === '+') {
                resultDec = num1Dec + num2Dec;
            } else {
                resultDec = num1Dec - num2Dec;
            }

            // Basic overflow/underflow clamping for signed results
            if (this.isSigned) {
                if (resultDec > maxVal) resultDec = maxVal; 
                if (resultDec < minVal) resultDec = minVal; 
            }
             // Ensure result is not negative for unsigned
            if (!this.isSigned && resultDec < 0) {
                 resultDec = 0; // Or handle as error/regenerate question
            }

            const num1Binary = this.toBinaryString(num1Dec);
            const num2Binary = this.toBinaryString(num2Dec);
             // Handle potential negative result for unsigned before converting
            const resultToConvert = (!this.isSigned && resultDec < 0) ? 0 : resultDec;
            const resultBinary = this.toBinaryString(resultToConvert);


            this.questions.push({
                num1Binary: num1Binary,
                num2Binary: num2Binary,
                operation: operation,
                correctAnswer: resultBinary,
                num1Dec: num1Dec,
                num2Dec: num2Dec,
                resultDec: resultDec // Store the calculated decimal result
            });
        }
    }

    toBinaryString(num) {
        if (this.isSigned) {
            if (num < 0) {
                // Calculate two's complement for the specified number of bits
                num = Math.pow(2, this.bits) + num;
            }
             // Pad to the specified number of bits
            return num.toString(2).padStart(this.bits, '0');
        } else {
            // For unsigned, ensure it's non-negative and convert
             // No padding needed typically for unsigned answers unless specified
            return Math.max(0, num).toString(2);
        }
    }

    isCorrect() {
        if (this.currentQuestionIndex >= this.questions.length || !answerInput) return false;
        const userAnswer = answerInput.value.trim().replace(/\s/g, ''); // Remove all whitespace
        const correctAnswer = this.questions[this.currentQuestionIndex].correctAnswer;

        // Direct binary string comparison might be problematic if padding differs
        // Optional: Convert both back to decimal for robust comparison
        // return this.fromBinaryString(userAnswer) === this.questions[this.currentQuestionIndex].resultDec;
        
        return userAnswer === correctAnswer; // Rely on consistent generation for now
    }

    checkAnswer() {
         // Override to show expected binary format
         if (this.isCorrect()) {
            this.score++;
            alert('Correct!');
        } else {
             const correctAnswer = this.questions[this.currentQuestionIndex]?.correctAnswer;
             alert(`Incorrect.${correctAnswer !== undefined ? ' The answer was ' + correctAnswer : ''}`);
        }
        this.currentQuestionIndex++;
        this.displayNext();
    }

    submit() {
       this.startQuiz();
    }
}

// --- ASCII Quiz ---
class AsciiQuiz extends Quiz {
    constructor() {
        super();
        this.direction = 'toAscii'; // 'toAscii' or 'toChar'
    }

    displayResults() {
        super.displayResults();
    }

    displayQuestionText() {
        super.displayQuestionText();
         if (this.currentQuestionIndex < this.questions.length) {
            const q = this.questions[this.currentQuestionIndex];
            if (questionElement) {
                if (this.direction === 'toAscii') {
                    questionElement.textContent = `Convert the character '${q.question}' to its ASCII value.`;
                } else {
                    questionElement.textContent = `Convert the ASCII value ${q.question} to its character representation.`;
                }
            }
        }
    }

    generateQuestions() {
        this.numQuestions = Number(document.getElementById('num-ascii-questions')?.value) || 5;
        this.direction = document.getElementById('ascii-direction')?.value || 'toAscii';
        this.questions = [];
        this.currentQuestionIndex = 0;
        this.score = 0;

        for (let i = 0; i < this.numQuestions; i++) {
            const asciiValue = getRandomInt(32, 126); // Printable ASCII range
            if (this.direction === 'toAscii') {
                this.questions.push({
                    question: String.fromCharCode(asciiValue),
                    correctAnswer: asciiValue // Answer is the number
                });
            } else { // toChar
                this.questions.push({
                    question: asciiValue,
                    correctAnswer: String.fromCharCode(asciiValue) // Answer is the character
                });
            }
        }
    }

    isCorrect() {
        if (this.currentQuestionIndex >= this.questions.length || !answerInput) return false;
        const userAnswer = answerInput.value.trim();
        // Correct answer needs to be treated as a string for comparison
        const correctAnswer = String(this.questions[this.currentQuestionIndex].correctAnswer);

        return userAnswer === correctAnswer;
    }

     checkAnswer() {
        super.checkAnswer(); // Use base class implementation
    }

    submit() {
        this.startQuiz();
    }
}

// --- Storage Units Quiz ---
class StorageUnitsQuiz extends Quiz {
    constructor() {
        super();
        this.units = ['B', 'KB', 'MB', 'GB', 'TB'];
        // Using base 1000 for simplicity as often used in storage marketing
        // Could switch to 1024 (KiB, MiB, etc.) if needed
        this.unitValues = { 'B': 1, 'KB': 1000, 'MB': 1000**2, 'GB': 1000**3, 'TB': 1000**4 };
        this.questionTypes = ['unit_conversion', 'sound_file', 'image_file', 'text_file'];
    }

    displayResults() {
        super.displayResults();
    }

    displayQuestionText() {
        super.displayQuestionText();
        if (this.currentQuestionIndex < this.questions.length) {
            const q = this.questions[this.currentQuestionIndex];
            if (questionElement) {
                questionElement.innerHTML = q.question.replace(/
/g, '<br>'); // Use innerHTML to render <br>
            }
            if (formulaHintElement) {
                 formulaHintElement.textContent = q.formula || '';
            }
        }
    }

    generateQuestions() {
        this.numQuestions = Number(document.getElementById('num-storage-questions')?.value) || 5;
        this.questions = [];
        this.currentQuestionIndex = 0;
        this.score = 0;

        for (let i = 0; i < this.numQuestions; i++) {
            const questionType = this.questionTypes[getRandomInt(0, this.questionTypes.length - 1)];
            switch (questionType) {
                case 'unit_conversion': this.addUnitConversionQuestion(); break;
                case 'sound_file': this.addSoundFileQuestion(); break;
                case 'image_file': this.addImageFileQuestion(); break;
                case 'text_file': this.addTextFileQuestion(); break;
            }
        }
    }

    addUnitConversionQuestion() {
        const fromUnit = this.units[getRandomInt(0, this.units.length - 1)];
        let toUnit;
        do {
            toUnit = this.units[getRandomInt(0, this.units.length - 1)];
        } while (toUnit === fromUnit);

        const value = getRandomInt(1, 1000);
        const question = `Convert ${value} ${fromUnit} to ${toUnit}`; // Answer should be a number
        const correctAnswer = this.convertStorage(value, fromUnit, toUnit);

        this.questions.push({
            question: question,
            correctAnswer: correctAnswer,
            type: 'unit_conversion',
            formula: `Value in ${toUnit} = Value in ${fromUnit} * (Multiplier for ${fromUnit} / Multiplier for ${toUnit})`
        });
    }

    addSoundFileQuestion() {
        const sampleRates = [44100, 48000, 96000];
        const bitDepths = [16, 24, 32];
        const sampleRate = sampleRates[getRandomInt(0, sampleRates.length - 1)];
        const bitDepth = bitDepths[getRandomInt(0, bitDepths.length - 1)];
        const duration = getRandomInt(1, 10); // seconds

        const fileSizeInBits = sampleRate * duration * bitDepth;
        const fileSizeInBytes = Math.ceil(fileSizeInBits / 8);

        this.questions.push({
            question: `Calculate the file size in bytes for an audio file with:
` +
                      `Sample rate: ${sampleRate} Hz
` +
                      `Duration: ${duration} seconds
` +
                      `Bit depth: ${bitDepth} bits`,
            correctAnswer: fileSizeInBytes,
            type: 'sound_file',
            formula: 'File size (bytes) = sample rate (Hz) × duration (s) × bit depth (bits) / 8'
        });
    }

    addImageFileQuestion() {
        const colorDepths = [8, 16, 24]; // bits per pixel
        const colorDepth = colorDepths[getRandomInt(0, colorDepths.length - 1)];
        const width = getRandomInt(100, 1920);
        const height = getRandomInt(100, 1080);

        const fileSizeInBits = colorDepth * height * width;
        const fileSizeInBytes = Math.ceil(fileSizeInBits / 8);

        this.questions.push({
            question: `Calculate the uncompressed file size in bytes for an image with:
` +
                      `Resolution: ${width} × ${height} pixels
` +
                      `Color depth: ${colorDepth}-bit`,
            correctAnswer: fileSizeInBytes,
            type: 'image_file',
            formula: 'File size (bytes) = color depth (bits) × height (px) × width (px) / 8'
        });
    }

    addTextFileQuestion() {
        const encodings = [
            { name: 'ASCII', bits: 8 },
            { name: 'UTF-8 (Simple)', bits: 8 } // Simplified assumption for common chars
        ];
        const encoding = encodings[getRandomInt(0, encodings.length - 1)];
        const numCharacters = getRandomInt(100, 1000);

        const fileSizeInBits = encoding.bits * numCharacters;
        const fileSizeInBytes = Math.ceil(fileSizeInBits / 8);

        this.questions.push({
            question: `Calculate the file size in bytes for a text file with:
` +
                      `Number of characters: ${numCharacters}
` +
                      `Encoding: ${encoding.name} (${encoding.bits} bits/char assumed)`,
            correctAnswer: fileSizeInBytes,
            type: 'text_file',
            formula: 'File size (bytes) = bits per character × number of characters / 8'
        });
    }

    convertStorage(value, fromUnit, toUnit) {
        const fromMultiplier = this.unitValues[fromUnit];
        const toMultiplier = this.unitValues[toUnit];
        if (!fromMultiplier || !toMultiplier) return NaN; // Invalid unit

        const result = value * (fromMultiplier / toMultiplier);
        // Round to avoid long decimals in conversion, adjust precision as needed
        return Number(result.toFixed(3));
    }

    isCorrect() {
        if (this.currentQuestionIndex >= this.questions.length || !answerInput) return false;
        // Attempt to convert user input to a number
        const userAnswer = Number(answerInput.value.trim());
        const correctAnswer = this.questions[this.currentQuestionIndex].correctAnswer;

        // Check if userAnswer is a valid number
        if (isNaN(userAnswer)) {
            return false;
        }
        // Allow for small floating point differences in calculations
        return Math.abs(userAnswer - correctAnswer) < 0.01;
    }

     checkAnswer() {
         // Override to show formula in alert
         if (this.isCorrect()) {
            this.score++;
            const q = this.questions[this.currentQuestionIndex];
            let message = 'Correct!';
            if (q.formula) {
                // Ensure formula replaces newlines if needed for alert display
                message += `
Formula: ${q.formula.replace(/
/g, ' ')}`;
            }
            alert(message);
        } else {
             const correctAnswer = this.questions[this.currentQuestionIndex]?.correctAnswer;
             alert(`Incorrect.${correctAnswer !== undefined ? ' The answer was ' + correctAnswer : ''}`);
        }
        this.currentQuestionIndex++;
        this.displayNext();
    }

    submit() {
        this.startQuiz();
    }
}

// --- Initialization ---
const conversionQuiz = new ConversionQuiz();
const arithmeticQuiz = new ArithmeticQuiz();
const asciiQuiz = new AsciiQuiz();
const storageQuiz = new StorageUnitsQuiz();

// --- Global Event Listeners / Functions ---

// Add event listener to the main submit answer button
const submitButton = document.getElementById('submit-answer-btn');
if (submitButton) {
    submitButton.addEventListener('click', checkAnswer);
} else {
    console.error("Submit answer button not found!");
}

// Helper function to add listeners to quiz start buttons
function addQuizSubmitListener(buttonId, quizInstance) {
    const button = document.getElementById(buttonId);
    if (button) {
        button.addEventListener('click', () => quizInstance.submit());
    } else {
        console.error(`Button with ID ${buttonId} not found!`);
    }
}

// Add event listeners to quiz option submit buttons
addQuizSubmitListener('start-conversion-quiz', conversionQuiz);
addQuizSubmitListener('start-arithmetic-quiz', arithmeticQuiz);
addQuizSubmitListener('start-ascii-quiz', asciiQuiz);
addQuizSubmitListener('start-storage-quiz', storageQuiz);

// Add event listeners for nav items
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => changeMenu(item.id));
});

// Hamburger menu listener
document.querySelector('.hamburger')?.addEventListener('click', openNav);
// Close button listener for side nav
document.querySelector('.close-btn')?.addEventListener('click', closeNav);


// Function to determine which quiz is active and call its checkAnswer
function checkAnswer() {
    // previousMenuId holds the ID of the currently active menu/quiz
    switch (previousMenuId) {
        case "1": arithmeticQuiz.checkAnswer(); break;
        case "2": asciiQuiz.checkAnswer(); break;
        case "3": conversionQuiz.checkAnswer(); break;
        case "4": storageQuiz.checkAnswer(); break;
        default: console.warn('No active quiz found for checking answer.'); break;
    }
}

// --- Initial Page Setup ---

// Ensure the DOM is fully loaded before running initial setup
document.addEventListener('DOMContentLoaded', (event) => {
    // Ensure initial state hides quiz and options containers
    if (quizContainer) quizContainer.style.display = 'none';
    Object.values(optionsContainers).forEach(container => {
        if (container) container.style.display = 'none';
    });
    // Select the welcome/home menu item initially and display welcome text
    changeMenu("0"); 
});
