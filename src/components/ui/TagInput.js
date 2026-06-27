import React, { useState } from 'react';
import './TagInput.css';

export default function TagInput({ tags, setTags, placeholder }) {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === 'Backspace' && inputValue === '' && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    
    // Split by comma, newline, or space
    const newValues = pastedText.split(/[,\n\s]+/).map(t => t.trim()).filter(t => t);
    
    setTags(prev => {
      const existingValues = new Set(prev.map(p => p.value));
      const added = newValues
        .filter(v => !existingValues.has(v))
        .map(v => ({ value: v, isSample: false }));
        
      return [...prev, ...added];
    });
  };

  const addTag = (text) => {
    const trimmed = text.trim();
    if (trimmed && !tags.some(t => t.value === trimmed)) {
      setTags([...tags, { value: trimmed, isSample: false }]);
    }
    setInputValue('');
  };

  const removeTag = (index) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  return (
    <div className="tag-input-container">
      {tags.map((tag, i) => (
        <div key={i} className={`tag-chip ${tag.isSample ? 'sample-tag' : 'user-tag'}`}>
          <span className="tag-text">{tag.value}</span>
          <button type="button" className="tag-remove" onClick={() => removeTag(i)}>
            &times;
          </button>
        </div>
      ))}
      <input
        type="text"
        className="tag-input-field"
        placeholder={tags.length === 0 ? placeholder : ""}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        onBlur={() => addTag(inputValue)}
      />
    </div>
  );
}
