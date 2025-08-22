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
  const nextWord = () => {
    if (wordNumber < totalWords) {
      setWordNumber(wordNumber + 1)
      setCurrentWord(wordBank[wordNumber]?.word || 'NEXT')
    }
  }

  return (
    <div className="min-h-screen bg-green-400 flex items-center justify-center">
      <div className="text-center">
        {/* Title */}
        <h1 className="text-6xl font-light text-gray-700 mb-2 underline font-times">
          ¿Lin•go•Guess?
        </h1>
        
        {/* Subtitle */}
        <div className="text-gray-700 text-lg mb-12 flex justify-center space-x-8 font-times">
          <span>/ˈliNGɡō/</span>
          <span>ges</span>
        </div>
        
        {/* Word counter */}
        <div className="text-gray-700 text-lg mb-4 font-times">
          word {wordNumber} of {totalWords} is
        </div>
        
        {/* Current word */}
        <div className="text-6xl md:text-7xl font-bold text-gray-800 mb-8 tracking-widest font-times">
          {currentWord}
        </div>
        
        {/* Input field */}
        <div className="w-full max-w-md mb-8">
          <input
            type="text"
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGuess(e)}
            placeholder="Guess a language"
            className="w-full px-5 py-4 text-lg bg-green-700 text-green-100 green-200 rounded-lg border-none outline-none focus:ring-1 focus:ring-green-300 font-times"
          />
        </div>
        
        {/* Score */}
        <div className="text-gray-700 text-lg font-times">
          Your score today is <span className="font-semibold">{score} pt.</span>
        </div>
        
        {/* Debug button for development */}
        <button 
          onClick={nextWord}
          className="mt-8 px-6 py-2 bg-gray-700 text-green-100 rounded-lg hover:bg-gray-600 transition-colors"
        >
          Next Word [DEV]
        </button>
      </div>
    </div>
  )
}

export default App