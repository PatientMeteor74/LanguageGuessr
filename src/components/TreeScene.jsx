import LanguageTree from './Tree'
import languageData from '../language-tree.json'

function TreeScene({ navigateToScene , guessLanguage, correctLanguage }) {
    return (
        <div className="min-h-screen bg-[#85ff93] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-6">
                <h1 className="text-8xl font-bold text-white">TREE</h1>
                <button 
                    onClick={() => navigateToScene("game")}
                    className="px-6 py-3 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors text-xl"
                >
                    Back to Game
                </button>
            </div>
            
            <div className="flex-1">
                <LanguageTree languageData={languageData} guessLanguage={guessLanguage} correctLanguage={correctLanguage}/>
            </div>
        </div>
    );
}

export default TreeScene;