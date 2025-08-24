import { useState } from 'react'
import GameScene from './components/GameScene.jsx'
import TreeScene from './components/TreeScene.jsx'

function App() {
  const [currentScene, setCurrentScene] = useState("game")
  
  // Shared state that multiple scenes might need
  const [score, setScore] = useState(0)
  
  // Scene navigation functions
  const navigateToScene = (sceneName) => 
  {
    setCurrentScene(sceneName)
  }

  // Props to pass to scenes
  const sceneProps = 
  {
    navigateToScene,
    score,
    setScore
  }

  return (
    <>
      {currentScene === "game" && <GameScene {...sceneProps} />}
      {currentScene === "tree" && <TreeScene {...sceneProps} />}
    </>
  )
}

export default App