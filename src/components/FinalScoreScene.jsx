import { useState, useEffect } from 'react'

const API_BASE = "https://lingo-guess.onrender.com"

function FinalScoreScene({ score, userId })
{

    const [displayScore, setDisplayScore] = useState(score)
    const [shortcutEnabled, setShortcutEnabled] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const waitTimeMS = 200;
    
    useEffect(() => 
    {
        // Enable shortcut after delay and after loading is complete
        if (!isLoading) 
        {
            const timer = setTimeout(() => 
            {
                setShortcutEnabled(true)
            }, waitTimeMS)

            return () => clearTimeout(timer)
        }
    }, [isLoading])

    // Load the actual score from server if we don't have it (e.g., after refresh)
    useEffect(() => 
    {
        const loadScoreFromServer = async () => 
        {
            // If we already have a valid score, use it
            if (score > 0) 
            {
                setDisplayScore(score)
                setIsLoading(false)
                return
            }
            
            // If no userId, we can't fetch from server
            if (!userId || userId === 'undefined') 
            {
                setDisplayScore(0)
                setIsLoading(false)
                return
            }
            
            try 
            {
                const response = await fetch(`${API_BASE}/api/user/${userId}`)
                
                if (!response.ok) 
                {
                    console.warn('Failed to fetch user score');
                    setDisplayScore(0);
                    return;
                }
                
                const userData = await response.json()
                
                // Validate response
                if (!userData || userData.error) 
                {
                    console.warn('Invalid user data:', userData);
                    setDisplayScore(0);
                    return;
                }
                
                // Use the daily_score from the server
                const serverScore = userData.daily_score || 0
                setDisplayScore(Number(serverScore))
                console.log('Loaded score from server:', serverScore)
            } catch (error) {
                console.error('Failed to load score from server:', error)
                setDisplayScore(0)
            } finally {
                setIsLoading(false)
            }
        }
        
        loadScoreFromServer()
    }, [score, userId])

    const getFlavorText = (score) => 
    {
        if (score <= 0)
        {
            return "You've got to be kidding me..."
        } else if (score < 20) {
            return "Better luck next time..."
        } else if (score < 50) {
            return "Not bad."
        } else if(score < 80) {
            return "Nicely done!"
        } else {
            return "Absolutely perfect!"
        }
    }
    const flavorText = getFlavorText(score)
    return (
        <div className="min-h-screen bg-[url(/src/assets/background.png)] flex items-center justify-center bg-cover bg-no-repeat">
            <div className="text-center max-w-md w-full">
                {/* Title */}
                <h1 className={`text-6xl font-light text-[#5e814c] mb-8  font-serif transition-all duration-100 ${
                    shortcutEnabled ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
                >
                    Final Score
                </h1>
                <div className={`text-5xl font-light text-[#5e814c] mb-8 font-serif transition-all duration-300 ${
                    shortcutEnabled ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
                >
                    {displayScore} / 100
                </div>
                <div className={`text-xl text-[#70a861] font-serif mb-8 transition-all duration-500 ${
                    shortcutEnabled ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
                >
                    {flavorText}
                </div>
            </div>
        </div>
    )
}

export default FinalScoreScene