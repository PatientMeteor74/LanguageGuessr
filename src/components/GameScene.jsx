import { useState, useEffect } from 'react'
import AutoCompleteInput from './AutocompleteInputField'

function GameScene({ navigateToScene, score, setScore, guess, setGuess, language, setLanguage, allLanguages, allLanguageNames, userId, shouldAdvanceWord, setShouldAdvanceWord})
{
    const [currentWord, setCurrentWord] = useState("...")
    const [currentDefinition, setCurrentDefinition] = useState("...")
    const [currentTranslation, setCurrentTranslation] = useState("...")
    const [wordNumber, setWordNumber] = useState(1)
    const [totalWords, setTotalWords] = useState(5)
    const [wordBank, setWordBank] = useState([])
    const [isInitialized, setIsInitialized] = useState(false)
    const [isValidGuess, setIsValidGuess] = useState(false)
    const [userProgress, setUserProgress] = useState(null)
    
    const getRandomElement = (arr) =>
    {
        const randomIndex = Math.floor(Math.random() * arr.length);
        return arr[randomIndex];
    }

    const getWordBank = (languages) => 
    {
        /* 
        allLanguages structure:
        [
            {
                "path": "Indo, Indo-Iranian, Indic, ...", 
                "name": "Bengali", 
                "dictionary": [
                    {"word": "খুশি", "translation": "Happy", "definition_1": "feeling or showing pleasure..."},
                    ...
                ]
            },
            ...
        ]
        */
        const words = []
        
        // Create word bank from available languages
        const wordsToGenerate = Math.min(totalWords, languages.length)
        
        for (let i = 0; i < wordsToGenerate; i++)
        {
            if (languages.length > 0)
            {
                const randomLanguage = getRandomElement(languages)
                const randomWord = getRandomElement(randomLanguage.dictionary)
                
                words.push({
                    word: randomWord.word,
                    language: randomLanguage.name,
                    translation: randomWord.translation,
                    meaning: randomWord.definition_1 || "No definition available"
                })
            }
        }
        return words
    }

    // Load user progress from server
    useEffect(() => 
    {
        const loadUserProgress = async () => 
        {
            if (!userId || userId === 'undefined') {
                console.warn('userId not set; skipping progress load');
                return;
            }
            
            try 
            {
                const response = await fetch(`https://lingo-guess.onrender.com/api/user/${userId}`);
                const userData = await response.json();
                setUserProgress(userData);
                
                // Set word number based on progress
                // progress_today is stored as 0-based index of how many words have been completed (0 = none done).
                // To show the current word number to the user we want a 1-based value:
                const currentWordNumber = (userData && typeof userData.progress_today === 'number') ? (userData.progress_today + 1) : 1;
                setWordNumber(currentWordNumber);
                
                console.log('Loaded user progress:', userData);
            } catch (error) {
                console.error('Failed to load user progress:', error);
            }
        };

        loadUserProgress();
    }, [userId]);

    // Initialize word bank only once when allLanguages is available
    /*useEffect(() => 
        
    {
        if (allLanguages && allLanguages.length > 0 && !isInitialized) 
        {
            const newWordBank = getWordBank(allLanguages)
            setWordBank(newWordBank)
            setIsInitialized(true)
        }
    }, [allLanguages, isInitialized])*/

    useEffect(() => 
    {
        if (allLanguages && allLanguages.length > 0 && !isInitialized) 
        {
            const fetchDailyWords = async () => 
            {
                try 
                {
                    const response = await fetch('https://lingo-guess.onrender.com/api/daily-words', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ languages: allLanguages, totalWords: 5 })
                    });
                    if (!response.ok)
                    {
                        throw new Error(`Server error: ${response.status}`);
                    }
                    const data = await response.json();
                    setWordBank(data);
                    setIsInitialized(true);
                } catch (error) {
                    console.error('Daily words fetch failed:', error);
                    // Fallback to local
                    const fallback = getWordBank(allLanguages);
                    setWordBank(fallback);
                    setIsInitialized(true);
                }
            };
            fetchDailyWords();
        }
    }, [allLanguages, isInitialized]);

    // Set up the first word when wordBank is ready
    useEffect(() => 
    {
        if (wordBank.length > 0 && wordNumber >= 1) 
        {
            enterGame(wordBank)
        }
    }, [wordBank, wordNumber])
    

    // Clear input field when component mounts (when returning to game scene)
    useEffect(() => 
    {
        setGuess("")
    }, [])

    const enterGame = (bank = wordBank) => 
    {
        const idx = Math.max(0, Math.min(bank.length - 1, wordNumber - 1)); // Convert 1-indexed to 0-indexed
        const currentWordData = bank[idx];
        if (currentWordData) 
        {
            setLanguage(currentWordData.language)
            setCurrentWord(currentWordData.word)
            setCurrentTranslation(currentWordData.translation)
            setCurrentDefinition(currentWordData.meaning)
        }
    }

    const updateProgressOnServer = async (newWordNumber) => 
    {
        try 
        {
            await fetch("https://lingo-guess.onrender.com/api/update-progress", 
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: userId,
                    wordNumber: newWordNumber - 1 // Convert to 0-based progress
                })
            });
        } catch (error) {
            console.error('Failed to update progress:', error);
        }
    };


    const normalizeGuess = (inputGuess) => 
    {
        if (!inputGuess || !allLanguageNames)
        {
            return inputGuess
        }
        // Find the exact case insensitive match
        const normalizedGuess = allLanguageNames.find(lang => lang.toLowerCase() === inputGuess.toLowerCase());
    
        return normalizedGuess || inputGuess;
    }

    // Handle word advancement when returning from tree scene
    useEffect(() => 
    {
        if (shouldAdvanceWord && wordBank.length > 0) 
        {
            const newWordNumber = wordNumber + 1
            setWordNumber(newWordNumber)
            setShouldAdvanceWord(false)
            console.log(`Advanced to word ${newWordNumber} after tree scene`)
        }
    }, [shouldAdvanceWord, wordBank, wordNumber, setShouldAdvanceWord])

    const handleGuess = async (e) =>
    {
        if (e) 
        {
            e.preventDefault();
        }
        if (!isValidGuess)
        {
            return;
        }

        const normalizedGuess = normalizeGuess(guess);
        setGuess(normalizedGuess);
        await updateProgressOnServer(wordNumber);
        navigateToScene("tree");
    }

    const nextWord = () => 
    {
        const newWordNumber = wordNumber + 1
        
        if (newWordNumber <= (totalWords) && (newWordNumber - 1) < wordBank.length) 
        {
            const nextWordIndex = newWordNumber - 1 // Convert to 0-based index
            const nextWordData = wordBank[nextWordIndex]
            
            if (nextWordData) 
            {
                setWordNumber(newWordNumber)
                setLanguage(nextWordData.language)
                setCurrentWord(nextWordData.word)
                setCurrentTranslation(nextWordData.translation)
                setCurrentDefinition(nextWordData.meaning)
                
                console.log(`Prepared word ${newWordNumber}: ${nextWordData.word} (${nextWordData.language})`)
            }
        }
    }

    return (
        <div className="min-h-screen bg-[url(/src/assets/background.png)] flex items-center justify-center bg-cover bg-no-repeat">
            <div className="text-center max-w-md w-full">
                {/* Title */}
                <h1 className="text-6xl font-light text-[#5e814c] mb-2 underline font-serif">
                    ¿Lin•go•Guess?
                </h1>
                
                {/* Subtitle */}
                <div className="text-[#70a861] text-lg ml-5 mb-12 flex space-x-40 font-serif text-left">
                    <span>/ˈliNGɡō/</span>
                    <span>ges</span>
                </div>
                
                {/* Word counter */}
                <div className="text-[#70a861] text-lg font-serif text-left">
                    word {wordNumber} of {totalWords} is 
                </div>
                
                {/* Current word */}
                <div className="mb-2">
                    <div className="md:text-3xl font-bold text-[#5e814c] mb-0 tracking-widest font-serif text-left">
                        {currentWord}.
                    </div>
                    <div className="w-[527px] h-[2px] bg-[#5e814c] mx-auto"></div>
                </div>

                {/*English translation & definition subtitle */}
                <div className="text-[#70a861] text-lg font-serif text-left mb-2">
                    Meaning <span className="font-semibold text-[#5e814c]">{currentTranslation}, </span> {currentDefinition} 
                </div>

                {/* Input field */}
                <div className="flex items-center w-full max-w-md mb-30 ml-20 space-x-2">
                    <AutoCompleteInput
                        value={guess}
                        onChange={setGuess}
                        onSubmit={handleGuess}
                        onValidationChange={setIsValidGuess}
                        languageNames={allLanguageNames}
                        placeholder="  Guess a language"
                        className="w-full px-2 py-1 text-lg bg-[#5e814c] text-[#81d177] rounded-lg border-none outline-none focus:ring-1 focus:ring-[#81d177] font-serif placeholder:italic"
                    />
                    <button 
                        onClick={() => handleGuess()}
                        className="px-2 py-0.75 border-4 border-[#5e814c] bg-transparent text-[#5e814c] rounded-lg hover:bg-[#5e814c] hover:text-[#81d177] transition-colors font-serif font-semibold"
                    >
                        Enter
                    </button>
                </div>


                {/* Score */}
                <div className="text-[#70a861] text-lg font-serif mr-20">
                    Your score today is <span className="font-semibold text-[#5e814c]">{score} pt.</span>
                </div>
                
                {/* Vercel wind-down disclaimer */}
                <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 max-w-2xl mx-auto">
                    <div className="bg-[#5e814c]/10 border border-[#5e814c]/30 rounded-lg px-4 py-2 text-center">
                        <p className="text-[#5e814c] text-sm font-serif">
                            <span className="font-semibold">Note:</span> Due to server wind-down policies, 
                            initial responses after periods of inactivity may take up to 50 seconds longer.
                        </p>
                    </div>
                </div>
                {/*
                {/* Debug reset button
                <div className="mt-4">
                <button
                    onClick={async () => 
                    {
                        if (!window.confirm("⚠ This will delete ALL users and reset your local data. Continue?")) 
                        {
                            return;
                        }

                        try 
                        {
                            const res = await fetch("https://lingo-guess.onrender.com/api/debug/reset-users", { method: "DELETE" });
                            const data = await res.json();

                            // Clear localStorage userId
                            localStorage.removeItem("userId");

                            console.log("Reset result:", data);
                            alert("All users reset + local data cleared. Reload the page to reinitialize.");
                        } catch (err) {
                            console.error("Reset failed:", err);
                            alert("Reset failed. Check console.");
                        }
                    }}
                    className="px-3 py-1 border-2 border-red-600 text-red-600 rounded hover:bg-red-600 hover:text-white transition-colors"
                >
                    Reset All Users (Debug)
                </button>
                </div>
                {/* Debug populate button
                <div className="mt-2">
                <button
                    onClick={async () => 
                    {
                        const count = parseInt(prompt("How many fake users?"), 10) || 5;
                        try 
                        {
                            const res = await fetch("https://lingo-guess.onrender.com/api/debug/populate-users", 
                            {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ count })
                            });
                            const data = await res.json();
                            console.log("Populate result:", data);
                            alert(`Inserted ${data.inserted} fake users.`);
                        } catch (err) {
                            console.error("Populate failed:", err);
                            alert("Populate failed. Check console.");
                        }
                    }}
                    className="px-3 py-1 border-2 border-blue-600 text-blue-600 rounded hover:bg-blue-600 hover:text-white transition-colors"
                >
                    Populate Fake Users (Debug)
                </button>
                {/* Debug final score button
                <div className="mt-2">
                <button
                    onClick={() =>
                    {
                        const newScore = parseInt(prompt("What's the fake score?"), 10) || 0;
                        setScore(newScore)
                        navigateToScene("end")
                    }}
                    className="px-3 py-1 border-2 border-yellow-600 text-yellow-600 rounded hover:bg-yellow-600 hover:text-white transition-colors"
                >
                    Go to Final Score (Debug)
                </button>
                
                </div>
                </div>
                */}
            </div>
        </div>
    )
}

export default GameScene