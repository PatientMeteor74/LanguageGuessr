import { useState, useRef, useEffect } from 'react'
import TreeNode from './TreeNode'

// Draggable Container Component
function DraggableTreeContainer({ children }) 
{
    const containerRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [scrollStart, setScrollStart] = useState({ x: 0, y: 0 });

    const handleMouseDown = (e) => 
    {
        setIsDragging(true);
        setDragStart({ x: e.clientX, y: e.clientY });
        setScrollStart({ 
            x: containerRef.current.scrollLeft, 
            y: containerRef.current.scrollTop 
        });
        e.preventDefault();
    };

    const handleMouseMove = (e) => 
    {
        if (!isDragging) return;
        
        const deltaX = dragStart.x - e.clientX;
        const deltaY = dragStart.y - e.clientY;
        
        containerRef.current.scrollLeft = scrollStart.x + deltaX;
        containerRef.current.scrollTop = scrollStart.y + deltaY;
    };

    const handleMouseUp = () => 
    {
        setIsDragging(false);
    };

    useEffect(() => 
    {
        if (isDragging) 
        {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = 'grabbing';
            
            return () => 
            {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
                document.body.style.cursor = 'default';
            };
        }
    }, [isDragging, dragStart, scrollStart]);

    return (
        <div 
            ref={containerRef}
            className="w-full h-full overflow-hidden overflow-y-hidden"
            style={{ 
                cursor: isDragging ? 'grabbing' : 'grab',
                userSelect: 'none'
            }}
            onMouseDown={handleMouseDown}
        >
            <div style={{ 
                minWidth: '20000px',
                minHeight: '2500px',
                padding: '200px'
            }}>
                {children}
            </div>
        </div>
    );
}

function LanguageTree({ languageData, correctLanguage, guessLanguage }) 
{

    // Recursive function to find all languages with dictionaries
    const getAllLanguages = (data) => 
    {
        const languages = []
        
        const traverse = (obj, path) => 
        {
            if (obj && typeof obj === 'object') 
            {
                if (obj.dictionary && Array.isArray(obj.dictionary) && obj.dictionary.length > 0) 
                {
                    languages.push({
                        path: path.join(", "),
                        name: path[path.length - 1],
                        dictionary: obj.dictionary
                    })
                }

                const objectKeys = Object.keys(obj)
                for (let i = 0; i < objectKeys.length; i++) 
                {
                    const currentKey = objectKeys[i]
                    const currentValue = obj[currentKey]
                    if (currentKey !== 'dictionary') 
                    {
                        const newPath = [...path, currentKey]
                        traverse(currentValue, newPath)
                    }
                }
            }
        }
        
        const rootKeys = Object.keys(data)
        for (let i = 0; i < rootKeys.length; i++) 
        {
            const rootKey = rootKeys[i]
            const rootValue = data[rootKey]
            traverse(rootValue, [rootKey])
        }
        return languages
    }

    const getPath = (data, languageName) => 
    {
        // Get path of root->languageName
        const traverse = (obj, path) => 
        {
            if (obj && typeof obj === 'object') 
            {
                const objectKeys = Object.keys(obj);
                for (let i = 0; i < objectKeys.length; i++) 
                {
                    const currentKey = objectKeys[i];
                    const currentValue = obj[currentKey];
                    if (currentKey !== 'dictionary') 
                    {
                        const newPath = [...path, currentKey];
                        
                        if (currentKey === languageName) 
                        {
                            return newPath; // Found the language, return the path
                        }
                        
                        // Recursively search in the current value
                        const result = traverse(currentValue, newPath);
                        if (result) 
                        {
                            return result; // If found in recursion, return it
                        }
                    }
                }
            }
            return null; // Not found in this branch
        };
        
        // Navigate all root keys
        const rootKeys = Object.keys(data);
        for (let i = 0; i < rootKeys.length; i++) 
        {
            const rootKey = rootKeys[i];
            const rootValue = data[rootKey];
            const result = traverse(rootValue, [rootKey]);
            if (result) 
            {
                return result; // Return the first match found
            }
        }
        
        return null; // Language not found
    };

    const getScoringData = (correctPath, guessPath) => 
    {
        // Handle null paths
        if (!correctPath || !guessPath) 
        {
            return {};
        }

        // Find the common ancestor (last common element in both paths)
        let commonAncestorIndex = -1;
        const minLength = Math.min(correctPath.length, guessPath.length);
        
        for (let i = 0; i < minLength; i++) 
        {
            if (correctPath[i] === guessPath[i]) 
            {
                commonAncestorIndex = i;
            }
            else 
            {
                break; // Stop at first difference
            }
        }

        // If no common ancestor found, return empty
        if (commonAncestorIndex === -1) 
        {
            return {};
        }

        // Build the tree structure starting from common ancestor
        const buildPathTree = (path, startIndex, nodeType) => 
        {
            if (startIndex >= path.length) 
            {
                return {};
            }

            const currentNode = path[startIndex];
            const result = 
            {
                [currentNode]: 
                {
                    nodeType: nodeType, // 'correct', 'guess', or 'common'
                    dictionary: [], // Empty for now, could be populated if needed
                    ...buildPathTree(path, startIndex + 1, nodeType)
                }
            };

            return result;
        };

        // Create the final data structure
        const finalData = {};
        const commonAncestor = correctPath[commonAncestorIndex];

        // Start building from the common ancestor
        const correctSubTree = buildPathTree(correctPath, commonAncestorIndex, 'correct');
        const guessSubTree = buildPathTree(guessPath, commonAncestorIndex, 'guess');

        // Merge the trees, handling the common parts
        const mergeNode = (node1, node2) => 
        {
            const merged = { ...node1 };
            
            Object.keys(node2).forEach(key => 
            {
                if (key in merged) 
                {
                    // If both have the same key, merge recursively
                    if (typeof merged[key] === 'object' && typeof node2[key] === 'object') 
                    {
                        merged[key] = mergeNode(merged[key], node2[key]);
                    }
                }
                else 
                {
                    // Add new key from node2
                    merged[key] = node2[key];
                }
            });
            
            return merged;
        };

        // Merge the correct and guess subtrees
        const mergedTree = mergeNode(correctSubTree, guessSubTree);
        
        // Mark common nodes
        const markCommonNodes = (tree, correctPath, guessPath, currentIndex) => 
        {
            if (currentIndex >= correctPath.length || currentIndex >= guessPath.length) 
            {
                return tree;
            }

            const currentNode = correctPath[currentIndex];
            if (currentNode === guessPath[currentIndex] && tree[currentNode]) 
            {
                tree[currentNode].nodeType = 'common';
                markCommonNodes(tree[currentNode], correctPath, guessPath, currentIndex + 1);
            }
            
            return tree;
        };

        const finalTree = markCommonNodes(mergedTree, correctPath, guessPath, commonAncestorIndex);

        return finalTree;
    };

    const scoringData = getScoringData(
        getPath(languageData, correctLanguage),
        getPath(languageData, guessLanguage)
    )
    
    console.log(scoringData)

    return (
        <DraggableTreeContainer>
            <div className="flex justify-center" style={{ gap: '200px' }}>
                {Object.entries(scoringData).map(([rootName, rootData]) => (
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