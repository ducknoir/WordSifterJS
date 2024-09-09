import WordSifter from './WordSifter.js';

const { createApp, ref, computed, onMounted } = Vue;

createApp({
    setup() {
        const sifter = ref({
            guesses: [],
            feedbacks: [],
            filteredWords: []
        });
        const guessInput = ref('');
        const feedbackInput = ref('');
        const excludeUsed = ref(false);

        const wordCountText = computed(() => {
            const count = sifter.value.filteredWords.length;
            return `${count} Word${count !== 1 ? "s" : ""}:`;
        });

        const isInputValid = computed(() => {
            return validateInputs(guessInput.value, feedbackInput.value);
        });

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

        function handleUpdate() {
            if (isInputValid.value) {
                sifter.value.update(guessInput.value, feedbackInput.value);
                guessInput.value = '';
                feedbackInput.value = '';
            }
        }

        function handleExcludeUsed() {
            sifter.value.excludeUsedWords = excludeUsed.value;
        }

        function resetApp() {
            sifter.value.reset();
            guessInput.value = '';
            feedbackInput.value = '';
        }

        function getSquareColor(guessIndex, letterIndex) {
            const feedback = sifter.value.feedbacks[guessIndex][letterIndex];
            return feedback === 'G' ? 'green' :
                   feedback === 'Y' ? 'yellow' : 'gray';
        }

        onMounted(async () => {
            try {
                // Fetch and load the dictionary JSON file
                const dictionaryResponse = await fetch('dictionary.json');
                const dictionaryData = await dictionaryResponse.json();

                // Fetch and load the used words JSON file
                const usedWordsResponse = await fetch('used_words.json');
                const usedWordsData = await usedWordsResponse.json();
                const usedWords = usedWordsData.map((item) => item.w);

                sifter.value = new WordSifter(dictionaryData.words, usedWords);
            } catch (error) {
                console.error('Error during initialization:', error);
            }
        });

        return {
            sifter,
            guessInput,
            feedbackInput,
            excludeUsed,
            wordCountText,
            isInputValid,
            handleUpdate,
            handleExcludeUsed,
            resetApp,
            getSquareColor
        };
    }
}).mount('#app');
