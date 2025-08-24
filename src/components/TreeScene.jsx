import { useState } from 'react'
//import data from './language-tree.json'

function TreeNode({ name, data})
{
    const hasChildren = data && typeof data === "object" && Object.keys(data).some(key => key === 'dictionary')
    const hasDictionary = data && data.dictionary && Array.isArray(data.dictionary) && data.dictionary.length > 0

    return (
        <div className="text-center">
            <h1 className="text-8xl font-bold text-green-900 mb-8">name</h1>
        </div>
    )
}

function TreeScene({ navigateToScene }) 
{
    return (
        <div className="min-h-screen bg-[#81d177] flex items-center justify-center">
            <div className="text-center">
                <h1 className="text-8xl font-bold text-white mb-8">TREE</h1>
                <button 
                onClick={() => navigateToScene("game")}
                className="px-6 py-3 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors text-xl"
                >
                Back to Game
                </button>
            </div>
        </div>
    )
}

export default TreeScene