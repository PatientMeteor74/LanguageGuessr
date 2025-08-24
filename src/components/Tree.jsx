import { useState, useRef, useEffect } from 'react'
import TreeNode from './TreeNode'

// Draggable Container Component
function DraggableTreeContainer({ children }) {
    const containerRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [scrollStart, setScrollStart] = useState({ x: 0, y: 0 });

    const handleMouseDown = (e) => {
        setIsDragging(true);
        setDragStart({ x: e.clientX, y: e.clientY });
        setScrollStart({ 
            x: containerRef.current.scrollLeft, 
            y: containerRef.current.scrollTop 
        });
        e.preventDefault();
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;
        
        const deltaX = dragStart.x - e.clientX;
        const deltaY = dragStart.y - e.clientY;
        
        containerRef.current.scrollLeft = scrollStart.x + deltaX;
        containerRef.current.scrollTop = scrollStart.y + deltaY;
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = 'grabbing';
            
            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
                document.body.style.cursor = 'default';
            };
        }
    }, [isDragging, dragStart, scrollStart]);

    return (
        <div 
            ref={containerRef}
            className="w-full h-full overflow-hidden"
            style={{ 
                cursor: isDragging ? 'grabbing' : 'grab',
                userSelect: 'none'
            }}
            onMouseDown={handleMouseDown}
        >
            <div style={{ 
                minWidth: '20000px',
                minHeight: '3000px',
                padding: '400px'
            }}>
                {children}
            </div>
        </div>
    );
}

function LanguageTree({ languageData }) {
    // Recursive function to find all languages with dictionaries
    const getAllLanguages = (data) => {
        const languages = []
        
        const traverse = (obj, path) => {
            if (obj && typeof obj === 'object') {
                if (obj.dictionary && Array.isArray(obj.dictionary) && obj.dictionary.length > 0) {
                    languages.push({
                        path: path.join(", "),
                        name: path[path.length - 1],
                        dictionary: obj.dictionary
                    })
                }

                const objectKeys = Object.keys(obj)
                for (let i = 0; i < objectKeys.length; i++) {
                    const currentKey = objectKeys[i]
                    const currentValue = obj[currentKey]
                    if (currentKey !== 'dictionary') {
                        const newPath = [...path, currentKey]
                        traverse(currentValue, newPath)
                    }
                }
            }
        }
        
        const rootKeys = Object.keys(data)
        for (let i = 0; i < rootKeys.length; i++) {
            const rootKey = rootKeys[i]
            const rootValue = data[rootKey]
            traverse(rootValue, [rootKey])
        }
        return languages
    }

    const allLanguages = getAllLanguages(languageData)
    console.log('All languages found:', allLanguages)
    
    return (
        <DraggableTreeContainer>
            <div className="flex justify-center" style={{ gap: '200px' }}>
                {Object.entries(languageData).map(([rootName, rootData]) => (
                    <TreeNode 
                        key={rootName}
                        name={rootName} 
                        data={rootData} 
                        level={0}
                    />
                ))}
            </div>
        </DraggableTreeContainer>
    );
}

export default LanguageTree;