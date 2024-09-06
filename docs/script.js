// script.js

import WordSifter from './WordSifter.js';

const App = (function() {
    'use strict';

    let sifter;

    const elements = {
        guessInput: null,
        feedbackInput: null,
        updateButton: null,
        resetButton: null,
        guessGrid: null,
        filteredWords: null,
        wordCountHeading: null
    };

    function updateGuessGrid(wordSifter) {
        elements.guessGrid.innerHTML = ''; // Clear previous entries

        const {guesses, feedbacks} = wordSifter;
        guesses.forEach((guess, index) => {
            const rowDiv = document.createElement('div');
            rowDiv.classList.add('guess-row');
            guess.forEach((letter, i) => {
                const square = document.createElement('div');
                square.classList.add('grid-square');
                square.textContent = letter;
                const color = feedbacks[index][i] === 'G' ? 'green' :
                              feedbacks[index][i] === 'Y' ? 'yellow' : 'gray';
                square.classList.add(color);
                rowDiv.appendChild(square);
            });
            elements.guessGrid.appendChild(rowDiv);
        });
    }

    function handleUpdate(wordSifter) {
        const guess = elements.guessInput.value;
        const feedback = elements.feedbackInput.value;

        wordSifter.update(guess, feedback);
        updateGuessGrid(wordSifter);

        displayWords(wordSifter.filteredWords);
        elements.guessInput.focus();
    }

    function handleExcludeUsed(wordSifter) {
        wordSifter.excludeUsedWords = elements.excludeUsedCheckbox.checked;
        displayWords(wordSifter.filteredWords);
    }

    function displayWords(words) {
        elements.wordCountHeading.textContent = `${words.length} Word${words.length != 1 ? "s" : ""}:`;

        elements.filteredWords.innerHTML = '';
        words.forEach(word => {
            const listItem = document.createElement('li');
            listItem.textContent = word;
            elements.filteredWords.appendChild(listItem);
        });
    }

    function resetApp(wordSifter) {
        elements.guessGrid.innerHTML = '';
        elements.guessInput.value = '';
        elements.feedbackInput.value = '';
        elements.updateButton.disabled = true;

        wordSifter.reset();
        displayWords(wordSifter.filteredWords);
    }

    function validateInputs(guess, feedback) {
        const guessArr = guess.trim().toUpperCase().split('');
        const feedbackArr = feedback.trim().toUpperCase().split('');

        const ASCII_CODE_A = 65;
        const guessAllowed = Array.from({ length: 26 }, (_, i) => String.fromCharCode(ASCII_CODE_A + i));
        const feedbackAllowed = ['B', 'Y', 'G'];

        return guess.length === 5
            && feedback.length === 5
            && guessArr.every(char => guessAllowed.includes(char))
            && feedbackArr.every(char => feedbackAllowed.includes(char));
    }

    function setupEventListeners() {
        elements.guessInput.addEventListener('keypress', event => {
            if (event.key === 'Enter') handleUpdate(sifter);
        });
        elements.guessInput.addEventListener('focus', function() { this.select(); });

        elements.feedbackInput.addEventListener('keypress', event => {
            if (event.key === 'Enter') handleUpdate(sifter);
        });
        elements.feedbackInput.addEventListener('focus', function() { this.select(); });

        function validateInputsHandler() {
            const guessValue = elements.guessInput.value.trim();
            const feedbackValue = elements.feedbackInput.value.trim();

            elements.updateButton.disabled = !validateInputs(guessValue, feedbackValue);
        }

        elements.guessInput.addEventListener('input', validateInputsHandler);
        elements.feedbackInput.addEventListener('input', validateInputsHandler);

        elements.updateButton.addEventListener('click', () => handleUpdate(sifter));
        elements.resetButton.addEventListener('click', () => resetApp(sifter));
        elements.excludeUsedCheckbox.addEventListener('change', () => handleExcludeUsed(sifter));

        window.addEventListener('focus', function() {
            elements.guessInput.focus();
        });
    }

    function initializeElements() {
        const elementIds = {
            guessInput: 'guess-input',
            feedbackInput: 'feedback-input',
            updateButton: 'update-button',
            resetButton: 'reset-button',
            excludeUsedCheckbox: 'exclude-used',
            guessGrid: 'guess-grid',
            filteredWords: 'filtered-words',
            wordCountHeading: 'word-count'
        };

        for (const [key, id] of Object.entries(elementIds)) {
            elements[key] = document.getElementById(id);
            if (!elements[key]) {
                console.error(`Element with id "${id}" not found. Check your HTML.`);
            }
        }
    }

    async function initializeApp() {
        try {
            initializeElements();

            // Fetch and load the dictionary JSON file
            const dictionaryResponse = await fetch('dictionary.json');
            const dictionaryData = await dictionaryResponse.json();

            // Fetch and load the used words JSON file
            const usedWordsResponse = await fetch('used_words.json');
            const usedWordsData = await usedWordsResponse.json();

            sifter = new WordSifter(dictionaryData.words, usedWordsData.words);

            displayWords(sifter.filteredWords);
            setupEventListeners();
        } catch (error) {
            console.error('Error during initialization:', error);
        }
    }

    function init() {
        initializeApp();
    }

    return { init };
})();

document.addEventListener('DOMContentLoaded', App.init);
