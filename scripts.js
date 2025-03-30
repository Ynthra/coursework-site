// Function to open the side navigation
function openNav() {
    document.getElementsByClassName("side-nav")[0].style.width = "250px";
    document.addEventListener('click', outsideClickListener);
}

// Function to close the side navigation
function closeNav() {
    document.getElementsByClassName("side-nav")[0].style.width = "0";
    document.removeEventListener('click', outsideClickListener);
}

// Function to close the side navigation if clicking outside of it
function outsideClickListener(event) {
    const sideNav = document.getElementsByClassName("side-nav")[0];
    if (!sideNav.contains(event.target) && !event.target.closest('.hamburger')) {
        closeNav();
    }
}

let currentQuestion = 0; // Index of the current question
let score = 0; // User's score

// Function to generate a random integer between min and max
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (Math.floor(max) - Math.ceil(min) + 1)) + Math.ceil(min);
}

// Function to convert a number between bases
function toBase(num,from,to) {
    return parseInt(num,Number(to)).toString(Number(from));
}

prev = "0"
// Function to change the active menu item and display the appropriate content
function changeMenu(id) {
    if(document.getElementById(id).className == 'nav-item'){
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => item.classList.remove('active'));
        document.getElementById(id).classList.add('active');
    }
    
    // Reset quiz states
    conversionQuiz.reset();
    arithmeticQuiz.reset();
    asciiQuiz.reset();
    storageQuiz.reset();
    
    const answerInput = document.getElementById('answer-input');
    if (answerInput) {
        answerInput.value = '';
    }

    switch (prev)
    {
        case "0":
            document.getElementById('welcome-text').style.display = "none";
            break;
        case "1":
            document.getElementById('arithmetic-options-container').style.display = "none";
            document.getElementById('quiz-container').style.display = "none";
            break;
        case "2":
            document.getElementById('ascii-options-container').style.display = "none";
            document.getElementById('quiz-container').style.display = "none";
            break;
        case "3":
            document.getElementById('conversion-options-container').style.display = "none";
            document.getElementById('quiz-container').style.display = "none";
            break;
        case "4":
            document.getElementById('storage-options-container').style.display = "none";
            document.getElementById('quiz-container').style.display = "none";
            break;
        default:
            document.getElementById('welcome-text').style.display = "none";
            break;
    }
    prev = id;
    switch (id)
    {
        case "0":
            document.getElementById('welcome-text').style.display = "block";
            break;
        case "1":
            document.getElementById('arithmetic-options-container').style.display = "flex";
            break;
        case "2":
            document.getElementById('ascii-options-container').style.display = "flex";
            break;
        case "3":
            document.getElementById('conversion-options-container').style.display = "flex";
            break;
        case "4":
            document.getElementById('storage-options-container').style.display = "flex";
            break;
        default:
            document.getElementById('welcome-text').style.display = "block";
            break;
    }
}

class Quiz {
    constructor() {
        this.currentQuestion = 0; 
        this.score = 0;
        this.numQuestions = 0;
        this.questions = [];
    }

    reset() {
        this.currentQuestion = 0;
        this.score = 0;
        this.numQuestions = 0;
        this.questions = [];
    }
    
    displayNext() { 
        if (this.currentQuestion < this.numQuestions) {
            const question = this.questions[this.currentQuestion].question;
            this.displayQuestionText(question);
        } else {
            this.displayResults();
        }
    }
    displayResults() {
        //implement on derived class
    }
    displayQuestionText(question) {
        //implement on derived class
    }
    generateQuestions(){
        //implement on derived class
    }
    isCorrect(userAnswer, currentQuestion) {
        return userAnswer == questions[i].correctAnswer;
    }
    checkAnswer(userAnswer) {
        if (this.isCorrect(userAnswer, this.currentQuestion)) {
            this.score++;
        } else {

        }
        this.currentQuestion++;
        this.displayNext();
    }

}
class ConversionQuiz extends Quiz {
    constructor() {
        super(); // calls the constructor from the base class
    }

    displayResults(){
        const questionElement = document.getElementById('question');
        questionElement.textContent = `Quiz completed! Your score: ${this.score}/${this.questions.length}`;
    }

    displayQuestionText(){
        const questionElement = document.getElementById('question');
        let to = "";
        switch (this.baseTo){
            case "10":
                to = "denary"
                break;
            case "2":
                to = "binary"
                break;
            case "16":
                to = "hexadecimal"
                break;
            default:
                to = "base " + this.baseTo;
                break;
        }
        let from = "";
        switch (this.baseFrom){
            case "10":
                from = "denary"
                break;
            case "2":
                from = "binary"
                break;
            case "16":
                from = "hexadecimal"
                break;
            default:
                from = "base " + this.baseFrom;
                break;
        }
        questionElement.textContent = "Convert " + this.questions[this.currentQuestion].question + " from " + from + " to " + to;
    }

    generateQuestions(numQuestions, from, to){
        this.currentQuestion = 0;
        this.numQuestions = numQuestions;
        this.baseTo = to;
        this.baseFrom = from;
        for (var i = 0; i < this.numQuestions; i++) { //generates a random number between 24 and 255 and convert to binary
            let rand = getRandomInt(24, 255);
            this.questions.push({question : toBase(rand, from, to), correctAnswer: rand});
        }
    }

    isCorrect(){
        if (this.currentQuestion >= this.questions.length) return false;
        const element = document.getElementById('answer-input');
        const value = element.value.trim(); // removes whitespace
        return Number(value) == this.questions[this.currentQuestion].correctAnswer; //converts from string to float and compares
    }

    checkAnswer() {
        if (this.isCorrect(this.currentQuestion)) {
            this.score++;
            alert(`Correct!`);
        } else {
            alert(`Sorry, that's incorrect. The answer was ${this.questions[this.currentQuestion].correctAnswer}.`);
        }
        this.currentQuestion++;
        this.displayNext();
    }

    submit() {
        document.getElementById('conversion-options-container').style.display = 'none';
        document.getElementById('quiz-container').style.display = 'flex';
        this.generateQuestions(
            document.getElementById('num-conversion-questions').value,
            document.getElementById('base-from').value,
            document.getElementById('base-to').value
        );
        this.displayQuestionText();
    }
}

class ArithmeticQuiz extends Quiz {
    constructor() {
        super();
        this.operations = ['+', '-'];
        this.isSigned = false;
    }

    displayResults() {
        const questionElement = document.getElementById('question');
        questionElement.textContent = `Quiz completed! Your score: ${this.score}/${this.questions.length}`;
    }

    displayQuestionText() {
        const questionElement = document.getElementById('question');
        const q = this.questions[this.currentQuestion];
        questionElement.textContent = `Calculate: ${q.num1} ${q.operation} ${q.num2} in binary` + 
                                    (this.isSigned ? " (using two's complement)" : "");
    }

    generateQuestions() {
        this.currentQuestion = 0;
        this.numQuestions = Number(document.getElementById('num-arithmetic-questions').value);
        this.isSigned = document.getElementById('signed').checked;
        this.questions = [];

        const maxVal = this.isSigned ? 127 : 255;  // 8-bit signed vs unsigned
        const minVal = this.isSigned ? -128 : 0;

        for (let i = 0; i < this.numQuestions; i++) {
            const num1 = getRandomInt(minVal, maxVal);
            const num2 = getRandomInt(minVal, maxVal);
            const operation = this.operations[Math.floor(Math.random() * this.operations.length)];
            
            let result;
            if (operation === '+') {
                result = num1 + num2;
            } else {
                result = num1 - num2;
            }

            // Convert to binary representation
            const num1Binary = this.toBinaryString(num1);
            const num2Binary = this.toBinaryString(num2);
            const resultBinary = this.toBinaryString(result);

            this.questions.push({
                num1: num1Binary,
                num2: num2Binary,
                operation: operation,
                correctAnswer: resultBinary
            });
        }
    }

    toBinaryString(num) {
        if (this.isSigned) {
            // Handle two's complement for 8-bit numbers
            if (num < 0) {
                num = 256 + num; // Convert to two's complement
            }
            return num.toString(2).padStart(8, '0');
        } else {
            return num.toString(2);
        }
    }

    fromBinaryString(binary) {
        if (this.isSigned) {
            // Handle two's complement
            let num = parseInt(binary, 2);
            if (num > 127) { // If the number is negative in two's complement
                num = num - 256;
            }
            return num;
        } else {
            return parseInt(binary, 2);
        }
    }

    isCorrect() {
        if (this.currentQuestion >= this.questions.length) return false;
        const element = document.getElementById('answer-input');
        const userAnswer = element.value.trim().replace(/\s/g, ''); // Remove all whitespace
        const correctAnswer = this.questions[this.currentQuestion].correctAnswer;
        
        // Convert both answers to decimal and compare
        try {
            const userDecimal = this.fromBinaryString(userAnswer);
            const correctDecimal = this.fromBinaryString(correctAnswer);
            return userDecimal === correctDecimal;
        } catch (e) {
            return false; // Invalid binary input
        }
    }

    checkAnswer() {
        if (this.isCorrect()) {
            this.score++;
            alert('Correct!');
        } else {
            alert(`Incorrect. The answer was ${this.questions[this.currentQuestion].correctAnswer}`);
        }
        this.currentQuestion++;
        this.displayNext();
    }

    submit() {
        document.getElementById('arithmetic-options-container').style.display = 'none';
        document.getElementById('quiz-container').style.display = 'flex';
        this.generateQuestions();
        this.displayQuestionText();
    }
}

class AsciiQuiz extends Quiz {
    constructor() {
        super();
        this.direction = 'toAscii';
    }

    displayResults() {
        const questionElement = document.getElementById('question');
        questionElement.textContent = `Quiz completed! Your score: ${this.score}/${this.questions.length}`;
    }

    displayQuestionText() {
        const questionElement = document.getElementById('question');
        const q = this.questions[this.currentQuestion];
        if (this.direction === 'toAscii') {
            questionElement.textContent = `Convert the character '${q.question}' to its ASCII value`;
        } else {
            questionElement.textContent = `Convert the ASCII value ${q.question} to its character representation`;
        }
    }

    generateQuestions() {
        this.currentQuestion = 0;
        this.numQuestions = Number(document.getElementById('num-ascii-questions').value);
        this.direction = document.getElementById('ascii-direction').value;
        this.questions = [];

        for (let i = 0; i < this.numQuestions; i++) {
            const asciiValue = getRandomInt(32, 126); // Printable ASCII range
            if (this.direction === 'toAscii') {
                this.questions.push({
                    question: String.fromCharCode(asciiValue),
                    correctAnswer: asciiValue
                });
            } else {
                this.questions.push({
                    question: asciiValue,
                    correctAnswer: String.fromCharCode(asciiValue)
                });
            }
        }
    }

    isCorrect() {
        if (this.currentQuestion >= this.questions.length) return false;
        const element = document.getElementById('answer-input');
        const userAnswer = element.value.trim();
        const correctAnswer = this.questions[this.currentQuestion].correctAnswer;
        
        if (this.direction === 'toAscii') {
            return Number(userAnswer) === correctAnswer;
        } else {
            return userAnswer === correctAnswer;
        }
    }

    checkAnswer() {
        if (this.isCorrect()) {
            this.score++;
            alert('Correct!');
        } else {
            alert(`Incorrect. The answer was ${this.questions[this.currentQuestion].correctAnswer}`);
        }
        this.currentQuestion++;
        this.displayNext();
    }

    submit() {
        document.getElementById('ascii-options-container').style.display = 'none';
        document.getElementById('quiz-container').style.display = 'flex';
        this.generateQuestions();
        this.displayQuestionText();
    }
}

class StorageUnitsQuiz extends Quiz {
    constructor() {
        super();
        this.units = ['B', 'KB', 'MB', 'GB', 'TB'];
        this.questionTypes = ['unit_conversion', 'sound_file', 'image_file', 'text_file'];
    }

    displayResults() {
        const questionElement = document.getElementById('question');
        questionElement.textContent = `Quiz completed! Your score: ${this.score}/${this.questions.length}`;
    }

    displayQuestionText() {
        const questionElement = document.getElementById('question');
        const q = this.questions[this.currentQuestion];
        questionElement.textContent = q.question;
        
        // Display formula hint if it exists
        const formulaElement = document.getElementById('formula-hint');
        if (formulaElement) {
            formulaElement.textContent = q.formula || '';
        }
    }

    generateQuestions() {
        this.currentQuestion = 0;
        this.numQuestions = Number(document.getElementById('num-storage-questions').value);
        this.questions = [];

        for (let i = 0; i < this.numQuestions; i++) {
            const questionType = this.questionTypes[getRandomInt(0, this.questionTypes.length - 1)];
            
            switch(questionType) {
                case 'unit_conversion':
                    this.addUnitConversionQuestion();
                    break;
                case 'sound_file':
                    this.addSoundFileQuestion();
                    break;
                case 'image_file':
                    this.addImageFileQuestion();
                    break;
                case 'text_file':
                    this.addTextFileQuestion();
                    break;
            }
        }
    }

    addUnitConversionQuestion() {
        const fromUnit = this.units[getRandomInt(0, 4)];
        let toUnit;
        do {
            toUnit = this.units[getRandomInt(0, 4)];
        } while (toUnit === fromUnit);

        const value = getRandomInt(1, 1000);
        const question = `Convert ${value} ${fromUnit} to ${toUnit}`;
        const correctAnswer = this.convertStorage(value, fromUnit, toUnit);

        this.questions.push({
            question: question,
            correctAnswer: correctAnswer,
            type: 'unit_conversion'
        });
    }

    addSoundFileQuestion() {
        // Common sample rates: 44.1kHz, 48kHz, 96kHz
        const sampleRates = [44100, 48000, 96000];
        // Common bit depths: 16-bit, 24-bit, 32-bit
        const bitDepths = [16, 24, 32];
        
        const sampleRate = sampleRates[getRandomInt(0, sampleRates.length - 1)];
        const bitDepth = bitDepths[getRandomInt(0, bitDepths.length - 1)];
        const duration = getRandomInt(1, 10); // 1-10 seconds
        
        const fileSizeInBits = sampleRate * duration * bitDepth;
        const fileSizeInBytes = Math.ceil(fileSizeInBits / 8);

        this.questions.push({
            question: `Calculate the file size in bytes for an audio file with:\n` +
                     `Sample rate: ${sampleRate} Hz\n` +
                     `Duration: ${duration} seconds\n` +
                     `Bit depth: ${bitDepth} bits`,
            correctAnswer: fileSizeInBytes,
            type: 'sound_file',
            formula: 'File size = sample rate × duration × bit depth ÷ 8'
        });
    }

    addImageFileQuestion() {
        // Common color depths: 8-bit (256 colors), 24-bit (True color)
        const colorDepths = [8, 24];
        const colorDepth = colorDepths[getRandomInt(0, colorDepths.length - 1)];
        
        // Generate reasonable image dimensions
        const width = getRandomInt(800, 1920);
        const height = getRandomInt(600, 1080);
        
        const fileSizeInBits = colorDepth * height * width;
        const fileSizeInBytes = Math.ceil(fileSizeInBits / 8);

        this.questions.push({
            question: `Calculate the uncompressed file size in bytes for an image with:\n` +
                     `Resolution: ${width}×${height} pixels\n` +
                     `Color depth: ${colorDepth}-bit`,
            correctAnswer: fileSizeInBytes,
            type: 'image_file',
            formula: 'File size = color depth × height × width ÷ 8'
        });
    }

    addTextFileQuestion() {
        // Using ASCII (8 bits per character) or UTF-8 (8-32 bits per character)
        const encodings = [
            { name: 'ASCII', bits: 8 },
            { name: 'UTF-8', bits: 8 } // Simplified to 8 bits for basic Latin characters
        ];
        
        const encoding = encodings[getRandomInt(0, encodings.length - 1)];
        const numCharacters = getRandomInt(100, 1000);
        
        const fileSizeInBits = encoding.bits * numCharacters;
        const fileSizeInBytes = Math.ceil(fileSizeInBits / 8);

        this.questions.push({
            question: `Calculate the file size in bytes for a text file with:\n` +
                     `Number of characters: ${numCharacters}\n` +
                     `Encoding: ${encoding.name} (${encoding.bits} bits per character)`,
            correctAnswer: fileSizeInBytes,
            type: 'text_file',
            formula: 'File size = bits per character × number of characters ÷ 8'
        });
    }

    convertStorage(value, fromUnit, toUnit) {
        const fromIndex = this.units.indexOf(fromUnit);
        const toIndex = this.units.indexOf(toUnit);
        const difference = fromIndex - toIndex;
        return value * Math.pow(1000, difference);
    }

    isCorrect() {
        if (this.currentQuestion >= this.questions.length) return false;
        const element = document.getElementById('answer-input');
        const userAnswer = Number(element.value.trim());
        return userAnswer === this.questions[this.currentQuestion].correctAnswer;
    }

    checkAnswer() {
        if (this.isCorrect()) {
            this.score++;
            const q = this.questions[this.currentQuestion];
            let message = 'Correct!';
            if (q.formula) {
                message += `\nFormula used: ${q.formula}`;
            }
            alert(message);
        } else {
            alert(`Incorrect. The answer was ${this.questions[this.currentQuestion].correctAnswer}`);
        }
        this.currentQuestion++;
        this.displayNext();
    }

    submit() {
        document.getElementById('storage-options-container').style.display = 'none';
        document.getElementById('quiz-container').style.display = 'flex';
        this.generateQuestions();
        this.displayQuestionText();
    }
}

// Initialize quiz instances
const conversionQuiz = new ConversionQuiz();
const arithmeticQuiz = new ArithmeticQuiz();
const asciiQuiz = new AsciiQuiz();
const storageQuiz = new StorageUnitsQuiz();

function checkAnswer() {
    const navItems = document.querySelectorAll('.nav-item');
    let id = "";
    navItems.forEach(item => {
        if (item.classList.contains('active')) {
            id = item.id;
        }
    });

    switch (id) {
        case "1":
            arithmeticQuiz.checkAnswer();
            break;
        case "2":
            asciiQuiz.checkAnswer();
            break;
        case "3":
            conversionQuiz.checkAnswer();
            break;
        case "4":
            storageQuiz.checkAnswer();
            break;
        default:
            break;
    }
}

