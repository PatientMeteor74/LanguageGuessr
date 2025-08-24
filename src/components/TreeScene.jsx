function TreeScene({ navigateToScene }) 
{
    return (
        <div className="min-h-screen bg-[#85ff93] flex items-center justify-center">
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