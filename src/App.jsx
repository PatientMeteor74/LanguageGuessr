import { useState, useEffect } from 'react'
import GameScene from './components/GameScene.jsx'
import TreeScene from './components/TreeScene.jsx'
import FinalScoreScene from './components/FinalScoreScene.jsx'
import languageData from './language-tree.json'

const API_BASE = "https://lingo-guess.onrender.com"

function App() 
{
  const [currentScene, setCurrentScene] = useState("game")
  
  // Shared state that multiple scenes might need
  const [score, setScore] = useState(0)
  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [serverError, setServerError] = useState(null);
  const [guess, setGuess] = useState("")
  const [language, setLanguage] = useState("")
  const [roundScore, setRoundScore] = useState(0)
  const [progress, setProgress] = useState(0)
  const [traversals, setTraversals] = useState(0)
  const [shouldAdvanceWord, setShouldAdvanceWord] = useState(false)

  // Recursive function to find all languages with dictionaries
  const getAllLanguages = (data) => 
  {
    const languages = []
    const traverse = (obj, path) => 
    {
      if (!obj || typeof obj !== 'object')
      {
        return;
      }
      if (obj.dictionary && Array.isArray(obj.dictionary) && obj.dictionary.length > 0) 
      {
        languages.push({
          path: path.join(", "),
          name: path[path.length - 1],
          dictionary: obj.dictionary
        })
      }
      Object.keys(obj).forEach(key => 
      {
        if (key === 'dictionary') return
        traverse(obj[key], [...path, key])
      })
    }
    Object.keys(data).forEach(root => traverse(data[root], [root]))
    return languages
  }

  const getLanguageNames = (languages) => 
  {
    // Map all languages to an array of their names, sorting by name such that there are no duplicates
    return languages.map(lang => lang.name).sort().filter((name, index, arr) => arr.indexOf(name) === index)
  }

  const allLanguages = getAllLanguages(languageData)
  const allLanguageNames = getLanguageNames(allLanguages)

  // Helper to create a new user on the server
  const createNewUser = async () => 
  {
    const res = await fetch(`${API_BASE}/api/new-user`, { method: "POST" })
    if (!res.ok) 
    {
      throw new Error(`Server returned ${res.status}`)
    }
    const data = await res.json()
    return data.id
  }

  // Helper to verify a user exists on the server
  const verifyUser = async (id) => 
  {
    const res = await fetch(`${API_BASE}/api/user/${id}`)
    if (res.status === 404) 
    {
      return null // User doesn't exist
    }
    if (!res.ok) 
    {
      throw new Error(`Server returned ${res.status}`)
    }
    return await res.json()
  }

  // Initialize or restore userId on mount
  useEffect(() => 
  {
    console.log("Attempting to init user.")
    const initUser = async () => 
    {
      setIsLoading(true)
      setServerError(null)
      
      let id = localStorage.getItem("userId")
      const lastPlayedDate = localStorage.getItem("lastPlayedDate")
      const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD
      const isNewDay = lastPlayedDate !== today

      try 
      {
        // Case 1: No stored userId - create new user
        if (!id || id === "undefined" || id.startsWith("local-")) 
        {
          console.log("Creating new user...")
          id = await createNewUser()
          localStorage.setItem("userId", id)
          localStorage.setItem("lastPlayedDate", today)
          console.log("New user created:", id)
        } 
        else 
        {
          // Case 2: Have stored userId - verify it exists on server
          console.log("Verifying existing user:", id)
          const userData = await verifyUser(id)
          
          if (!userData) 
          {
            // User doesn't exist in DB (maybe was client-generated or deleted)
            console.log("Stored user not found in DB, creating new user...")
            id = await createNewUser()
            localStorage.setItem("userId", id)
            localStorage.setItem("lastPlayedDate", today)
            console.log("New user created:", id)
          } 
          else if (isNewDay) 
          {
            // User exists, but it's a new day - reset progress
            console.log("Resetting progress for new day...")
            await fetch(`${API_BASE}/api/reset-daily-progress`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ id })
            })
            localStorage.setItem("lastPlayedDate", today)
            console.log("Reset progress for new day:", id)
          } 
          else 
          {
            console.log("Existing user verified, same day:", id)
          }
        }
        
        setUserId(id)
        setServerError(null)
      } 
      catch (err) 
      {
        console.error("Failed to initialize user:", err)
        setServerError("Unable to connect to server. Please try again later.")
        // Don't set userId - this prevents broken state
      } 
      finally 
      {
        setIsLoading(false)
      }
    }
    
    initUser()
  }, [])

  // Update server score when score changes (and userId is available)
  useEffect(() => 
  {
    if (!userId || userId === 'undefined') 
    {
      return;
    }
    
    // Only update if score is a valid number (including 0)
    if (typeof score !== 'number' || isNaN(score)) 
    {
      return;
    }

    const updateServerScore = async () => 
    {
      const payload = { id: userId, newScore: score }
      
      try 
      {
        const response = await fetch(`${API_BASE}/api/update-score`, 
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        })

        const data = await response.json()
        if (!response.ok) 
        {
          throw new Error(data.error || 'Server error')
        }
        
        console.log("Server score updated:", data)
      } catch (err) {
        console.error("Error updating score:", err)
      }
    }

    // Only update score if it's greater than 0
    if (score > 0) 
    {
      updateServerScore()
    }
  }, [score, userId])

  // Check if user has already completed today's game (only on initial load)
  useEffect(() => 
  {
    const checkCompletion = async () => 
    {
      if (!userId || userId === 'undefined') 
      {
        return;
      }
      
      try 
      {
        const response = await fetch(`${API_BASE}/api/user/${userId}`);
        if (!response.ok) return;
        
        const userData = await response.json();
        
        // If user has completed all 5 words, redirect to end screen
        if (userData && userData.progress_today >= 4 && userData.played_today) 
        {
          console.log('User has already completed today, redirecting to final screen');
          setCurrentScene('end');
        }
      } catch (error) {
        console.error('Failed to check user completion:', error);
      }
    };

    checkCompletion();
  }, [userId]);

  // Scene navigation functions
  const navigateToScene = (sceneName) => 
  {
    // When going from tree back to game, signal that word should advance
    if (currentScene === "tree" && sceneName === "game") 
    {
      setShouldAdvanceWord(true)
    }
    // if going from tree to game but it's the final word (5/5), go to end instead
    if (currentScene === "tree" && sceneName === "game" && shouldAdvanceWord) 
    {
      // Check if we're completing the last word by looking at current progress
      fetch(`${API_BASE}/api/user/${userId}`)
        .then(res => res.json())
        .then(userData => 
        {
          // If progress_today will be 4 after advancement (meaning 5 words completed)
          if (userData && userData.progress_today >= 4) 
          {
            setShouldAdvanceWord(false) // Reset the flag
            setCurrentScene("end")
            return
          }
          setCurrentScene(sceneName)
        })
        .catch(err => 
        {
          console.error('Error checking completion:', err)
          setCurrentScene(sceneName) // Fallback to normal navigation
        })
      return
    }
    setCurrentScene(sceneName)
  }

  // Props to pass to scenes
  const sceneProps = 
  {
    navigateToScene,
    score,
    setScore,
    guess,
    setGuess,
    language,
    setLanguage,
    allLanguages,
    allLanguageNames,
    roundScore,
    setRoundScore,
    traversals,
    setTraversals,
    userId,
    shouldAdvanceWord,
    setShouldAdvanceWord
  }

  /*(useEffect(() => 
  {
    fetch('https://lingo-guess.onrender.com/api/users')
      .then(res => res.json())
      .then(data => console.log(data))
      .catch(err => console.error(err));
  }, []);*/

  // Show loading state while initializing user
  if (isLoading) 
  {
    return (
      <div className="min-h-screen bg-[url(/src/assets/background.png)] flex items-center justify-center bg-cover bg-no-repeat">
        <div className="text-center">
          <h1 className="text-4xl font-light text-[#5e814c] mb-4 font-serif">
            Loading...
          </h1>
          <p className="text-[#70a861] font-serif">
            Connecting to server (this may take up to 50 seconds on first load)
          </p>
        </div>
      </div>
    )
  }

  // Show error state if server connection failed
  if (serverError) 
  {
    return (
      <div className="min-h-screen bg-[url(/src/assets/background.png)] flex items-center justify-center bg-cover bg-no-repeat">
        <div className="text-center max-w-md">
          <h1 className="text-4xl font-light text-[#5e814c] mb-4 font-serif">
            Connection Error
          </h1>
          <p className="text-[#70a861] font-serif mb-6">
            {serverError}
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 border-4 border-[#5e814c] bg-transparent text-[#5e814c] rounded-lg hover:bg-[#5e814c] hover:text-[#81d177] transition-colors font-serif font-semibold"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      {currentScene === "game" && <GameScene {...sceneProps} />}
      {currentScene === "tree" && <TreeScene {...sceneProps} />}
      {currentScene === "end" && <FinalScoreScene {...sceneProps} />}
    </>
  )

  
}

export default App