import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
//import './App.css'

function App() 
{
  const [guess, setGuess] = useState("")
  const [score, setScore] = useState(0)
  const [currentWord, setCurrentWord] = useState("RATER")
  const [wordNumber, setWordNumber] = useState(1)
  const [totalWords, setTotalWords] = useState(6)

  const wordBank = 
  [
    { word: 'RATER', language: 'French', meaning: 'to miss/fail' },
    { word: 'GIFT', language: 'German', meaning: 'poison' },
    { word: 'БРАТ', language: 'Russian', meaning: 'brother' },
    { word: 'PIE', language: 'Spanish', meaning: 'foot' },
    { word: 'ARM', language: 'German', meaning: 'poor' },
    { word: 'CHEF', language: 'French', meaning: 'boss/chief' }
  ]

  const handleGuess = (e) =>
  {
    if (e) e.preventDefault()
      // guess checking logic here

    console.log("Guessed:", guess)
    setGuess("")
  }
  const nextWord = () =>
    {
    if (wordNumber < totalWords) {
      setWordNumber(wordNumber + 1)
      setCurrentWord(wordBank[wordNumber]?.word || 'NEXT')
    }
  }

  return (
    <div className="min-h-screen bg-[#85ff93] flex items-center justify-center">
      <div className="text-center max-w-md w-full">
        {/* Title */}
        <h1 className="text-6xl font-light text-[#59915f] mb-2 underline font-serif">
          ¿Lin•go•Guess?
        </h1>
        
        {/* Subtitle */}
        <div className="text-[#8cd49f] text-lg ml-5 mb-12 flex space-x-40 font-serif text-left">
          <span>/ˈliNGɡō/</span>
          <span>ges</span>
        </div>
        
        {/* Word counter */}
        <div className="text-[#8cd49f] text-lg font-serif text-left">
          word {wordNumber} of {totalWords} is
        </div>
        
        {/* Current word */}
        <div className="mb-2">
          <div className="md:text-3xl font-bold text-[#59915f] mb-0 tracking-widest font-serif text-left">
            {currentWord}.
          </div>
          <div className="w-[527px] h-[2px] bg-[#59915f] mx-auto"></div>
        </div>
        {/* Input field */}
        <div className="w-full max-w-md mb-4 ml-20">
          <input
            type="text"
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGuess(e)}
            placeholder="  Guess a language"
            className="w-full px-2 py-1 text-lg bg-[#59915f] text-[#85ff93] rounded-lg border-none outline-none focus:ring-1 focus:ring-[#85ff93] font-serif italic"
            style={{ caretColor: '#8cd49f' }}
          />
        </div>
        
        {/* Score */}
        <div className="text-[#8cd49f] text-lg font-serif mr-20">
          Your score today is <span className="font-semibold text-[#59915f]">{score} pt.</span>
        </div>
        
        {/* Debug button for development */}
        <button 
          onClick={nextWord}
          className="mt-20 px-2 py-1 bg-[#59915f] text-[#8cd49f] rounded-lg hover:bg-[#7f8f5f] transition-colors"
        >
          Next Word [DEV]
        </button>
      </div>
    </div>
  )
}

export default App