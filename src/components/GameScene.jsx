import { useState, useEffect } from 'react'

function GameScene({ navigateToScene, score, setScore})
{
    const [guess, setGuess] = useState("")
    const [currentWord, setCurrentWord] = useState("RATER")
    const [currentDefinition, setCurrentDefinition] = useState("")
    const [currentTranslation, setCurrentTranslation] = useState("")
    const [wordNumber, setWordNumber] = useState(1)
    const [totalWords, setTotalWords] = useState(6)
    
    const wordBank = [
        { 
            word: 'RATER', 
            language: 'French', 
            translation: "Fail", 
            meaning: "to be unsuccessful in achieving one's goal; to not succeed" 
        },
        { 
            word: 'GIFT', 
            language: 'German', 
            translation: "Poison", 
            meaning: "a toxic substance that causes harm or death when ingested or absorbed" 
        },
        { 
            word: 'БРАТ', 
            language: 'Russian', 
            translation: "Brother", 
            meaning: "a male sibling; a male who shares the same parents" 
        },
        { 
            word: 'PIE', 
            language: 'Spanish', 
            translation: "Foot", 
            meaning: "the lower extremity of the leg below the ankle; used for standing and walking" 
        },
        { 
            word: 'ARM', 
            language: 'German', 
            translation: "Poor", 
            meaning: "lacking sufficient money or resources; having little wealth" 
        },
        { 
            word: 'CHEF', 
            language: 'French', 
            translation: "Boss/Chief", 
            meaning: "a person in charge; a leader or head of an organization or group" 
        }
    ]

    useEffect(() => 
    {
        enterGame()
    }, [])

    const enterGame = () => 
    {
        const currentWordData = wordBank[wordNumber - 1]
        if (currentWordData) 
        {
            setCurrentWord(currentWordData.word)
            setCurrentTranslation(`${currentWordData.translation}` + ":")
            setCurrentDefinition(`${currentWordData.meaning}`)
        }
    }

    const handleGuess = (e) =>
    {
        if (e) e.preventDefault()
        // guess checking logic here

        console.log("Guessed:", guess)
        setGuess("")
    }

    const nextWord = () =>
    {
        if (wordNumber < totalWords) 
        {
        setWordNumber(wordNumber + 1)
        setCurrentWord(wordBank[wordNumber]?.word || 'NEXT')
        setCurrentTranslation(wordBank[wordNumber]?.translation  + ": "|| 'NEXT')
        setCurrentDefinition(wordBank[wordNumber]?.meaning || 'NEXT')
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
                    Meaning <span className="font-semibold text-[#5e814c]">{currentTranslation}</span> {currentDefinition}. 
                </div>

                {/* Input field */}
                <div className="flex items-center w-full max-w-md mb-30 ml-20 space-x-2">
                    <input
                        type="text"
                        value={guess}
                        onChange={(e) => setGuess(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleGuess(e)}
                        placeholder="  Guess a language"
                        className="w-full px-2 py-1 text-lg bg-[#5e814c] text-[#81d177] rounded-lg border-none outline-none focus:ring-1 focus:ring-[#81d177] font-serif placeholder:italic"
                        style={{ caretColor: '#70a861' }}
                    />
                        {/* Button to confirm guess in input field */}
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
                
                {/* Debug button for development */}
                <button 
                    onClick={nextWord}
                    className="mt-20 px-2 py-1 mr-10 bg-[#5e814c] text-[#70a861] rounded-lg hover:bg-[#7f8f5f] transition-colors"
                >
                Next Word [DEBUG]
                </button>

                {/* Debug button for development */}
                <button 
                    onClick={() => navigateToScene("tree")}
                    className="mt-20 px-2 py-1 bg-[#5e814c] text-[#70a861] rounded-lg hover:bg-[#7f8f5f] transition-colors"
                >
                Change to Tree Scene [DEBUG]
                </button>

            </div>
        </div>
    )
}

export default GameScene