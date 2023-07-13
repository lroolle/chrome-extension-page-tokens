import { useState, useEffect } from 'react'
import './Options.css'

function App() {
  const [crx, setCrx] = useState('create-chrome-ext')
  const [maxTokens, setMaxTokens] = useState('0') // Initialize maxTokens state as a string

  // Fetch the maxTokens value from Chrome storage when the component mounts
  useEffect(() => {
    chrome.storage.sync.get(['maxTokens'], function (result) {
      setMaxTokens(result.maxTokens || '0')
    })
  }, [])

  // Handle changes to the maxTokens input field
  const handleMaxTokensChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value
    setMaxTokens(newValue)

    // Save the maxTokens value to Chrome storage
    chrome.storage.sync.set({ maxTokens: newValue }, function () {
      console.log('Max tokens value is set to ' + newValue)
    })
  }

  return (
    <main style={{ width: '300px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
      <h2 style={{ textAlign: 'center', color: '#444' }}>GPT ReadPilot</h2>

      <div
        style={{
          display: 'flex', // Add this line to align the label and input on the same line
          justifyContent: 'space-between', // Add this line to distribute the space between the label and input
          alignItems: 'center', // Add this line to align the label and input vertically
          backgroundColor: '#f9f9f9',
          padding: '20px',
          borderRadius: '5px',
          boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)',
        }}
      >
        <label htmlFor="maxTokens" style={{ marginBottom: '0px', color: '#666' }}>
          Max Tokens:
        </label>
        <input
          id="maxTokens"
          type="text"
          name="maxTokens"
          value={maxTokens}
          onChange={handleMaxTokensChange}
          style={{
            width: '50%', // Reduce the width of the input field
            padding: '10px',
            fontSize: '16px',
            border: '1px solid #ddd',
            borderRadius: '5px',
          }}
        />
      </div>
    </main>
  )
}

export default App
