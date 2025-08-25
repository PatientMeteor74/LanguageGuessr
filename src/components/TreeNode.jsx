import { useState, useRef, useEffect } from 'react'
import languageData from '../language-tree.json'

function TreeNode({ name, data, level = 0 }) 
{
    // Check if this node has children (non-dictionary keys)
    const hasChildren = data && typeof data === 'object' && Object.keys(data).some(key => key !== 'dictionary');
    const nodeRef = useRef(null);
    const [nodeWidth, setNodeWidth] = useState(0);

    useEffect(() => 
    {
        if (nodeRef.current) 
        {
            const width = nodeRef.current.getBoundingClientRect().width;
            setNodeWidth(width);
        }
    }, [name]);

    // Calculate spacing based on combined widths of children
    const children = hasChildren ? Object.entries(data).filter(([key]) => key !== 'dictionary') : [];
    const totalChildrenWidth = children.length * 80;
    const spacing = Math.max(80, totalChildrenWidth / children.length);

    return (
        <div className="flex flex-col items-center">
            <div className="text-center whitespace-nowrap px-2 py-1">
                {name}
            </div>
            
            {hasChildren && children.length > 0 && (
                <div className="mt-16">
                    <div className="flex justify-center" style={{ gap: `${spacing}px` }}>
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