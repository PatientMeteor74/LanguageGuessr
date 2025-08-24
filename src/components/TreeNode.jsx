import { useState, useRef, useEffect } from 'react'
import languageData from '../language-tree.json'

function TreeNode({ name, data, level = 0 }) 
{
    // Check if this node has children (non-dictionary keys)
    const hasChildren = data && typeof data === 'object' && Object.keys(data).some(key => key !== 'dictionary');
    
    // Get children (all keys except 'dictionary')
    const children = hasChildren ? Object.entries(data).filter(([key]) => key !== 'dictionary') : [];
    
    return (
        <div className="flex flex-col items-center">
            <div className="text-center whitespace-nowrap px-2 py-1">
                {name}
            </div>
            
            {hasChildren && children.length > 0 && (
                <div className="mt-16"> {/* Increased vertical spacing */}
                    <div className="flex justify-center" style={{ gap: '80px' }}> {/* Much larger horizontal spacing */}
                        {children.map(([childName, childData]) => (
                            <TreeNode 
                                key={childName}
                                name={childName} 
                                data={childData} 
                                level={level + 1}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default TreeNode;