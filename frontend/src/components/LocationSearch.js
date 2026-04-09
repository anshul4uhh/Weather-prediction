import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const LocationSearch = ({ onSearch, disabled }) => {
  const [searchInput, setSearchInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceTimer = useRef(null);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  // Fetch suggestions from API
  const fetchSuggestions = async (query) => {
    if (query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/search/suggestions`,
        { params: { q: query } }
      );
      setSuggestions(response.data);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Suggestions error:', error);
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchInput(value);

    // Clear suggestions if input is empty or less than 2 chars
    if (value.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      setLoading(false);
    } else {
      // Debounce API call - wait 500ms after user stops typing
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      
      setLoading(true);
      debounceTimer.current = setTimeout(() => {
        fetchSuggestions(value);
      }, 500);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    // Clear any pending debounce timer immediately
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
      debounceTimer.current = null;
    }
    
    // Clear UI state immediately
    setSuggestions([]);
    setShowSuggestions(false);
    setLoading(false);
    
    // Call search immediately with the selected suggestion
    onSearch(suggestion.name);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    
    // Clear any pending debounce timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
      debounceTimer.current = null;
    }
    
    if (searchInput.trim()) {
      onSearch(searchInput);
      setSearchInput('');
      setSuggestions([]);
      setShowSuggestions(false);
      setLoading(false);
    }
  };

  const handleBlur = () => {
    // Delay hiding to allow suggestion click to register
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  };

  return (
    <form onSubmit={handleSearch} style={{ maxWidth: 600, margin: '0 auto 16px', display: 'flex', gap: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 16, padding: '8px 8px 8px 20px', backdropFilter: 'blur(10px)' }}>
      <div className="search-input-wrapper" style={{ flex: 1, position: 'relative' }}>
        <input
          type="text"
          className="search-input"
          placeholder="Search any city — London, Tokyo, Mumbai…"
          value={searchInput}
          onChange={handleInputChange}
          onFocus={() => {
            if (searchInput.length >= 2 && suggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
          onBlur={handleBlur}
          disabled={disabled}
          autoComplete="off"
          style={{ width: '100%', padding: '12px 16px', background: 'transparent', border: 'none', outline: 'none', color: '#f1f5f9', fontSize: 16, fontFamily: 'inherit' }}
        />
        {loading && <span className="search-spinner" />}

        {showSuggestions && suggestions.length > 0 && (
          <div className="suggestions-list" style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'rgba(26,42,72,0.95)', border: '1px solid rgba(255,255,255,0.08)', borderTop: 'none', maxHeight: 400, overflowY: 'auto', zIndex: 1000, marginTop: -1, borderRadius: '0 0 16px 16px', backdropFilter: 'blur(10px)' }}>
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="suggestion-item"
                onClick={() => handleSuggestionClick(suggestion)}
                style={{ padding: '14px 20px', cursor: 'pointer', transition: 'background-color 0.2s ease', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
              >
                <div className="suggestion-name" style={{ color: '#f1f5f9', fontWeight: 600, fontSize: 14, marginBottom: 4 }}>📍 {suggestion.name}</div>
                <div className="suggestion-address" style={{ color: '#64748b', fontSize: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{suggestion.display_name}</div>
              </div>
            ))}
          </div>
        )}
      </div>
      <button
        type="submit"
        disabled={disabled}
        style={{ padding: '10px 24px', background: '#4f9cf9', color: '#0a1628', fontWeight: 700, fontSize: 14, border: 'none', borderRadius: 10, cursor: 'pointer', transition: 'opacity 0.2s', whiteSpace: 'nowrap' }}
      >
        {disabled ? 'Loading…' : 'Search →'}
      </button>
    </form>
  );
};

export default LocationSearch;
