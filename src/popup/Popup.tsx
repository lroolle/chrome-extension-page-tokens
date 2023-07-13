import { useState, useEffect } from 'react'
import './Popup.css'

function App() {
  const [articleContent, setArticleContent] = useState('')
  const [articleText, setArticleText] = useState('')
  const [copied, setCopied] = useState(false)

  // Function to copy the article text to the clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(articleText).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000) // Hide the prompt after 2 seconds
    })
  }

  // Function to get the article content from the content script
  const getArticleContent = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      if (tabs[0].id) {
        chrome.tabs.sendMessage(tabs[0].id, { type: 'getArticleContent' }, function (response) {
          setArticleContent(response.articleContent)
          setArticleText(response.articleText)
        })
      }
    })
  }

  // Get the article content when the component mounts
  useEffect(() => {
    getArticleContent()
  }, [])

  return (
    <main>
      <div
        dangerouslySetInnerHTML={{ __html: articleContent }}
        style={{
          fontFamily: 'Courier, monospace',
          margin: '0 auto',
          padding: '20px',
          width: '100%',
          maxHeight: '70%',
          overflowY: 'auto',
        }}
      ></div>

      <button
        onClick={copyToClipboard}
        style={{
          position: 'fixed',
          right: '0',
          bottom: '0',
          padding: '10px 20px',
          fontSize: '20px',
          cursor: 'pointer',
        }}
      >
        Copy
      </button>

      {copied && (
        <div
          style={{
            position: 'fixed',
            right: '20px',
            bottom: '60px',
            padding: '10px',
            backgroundColor: '#4CAF50',
            color: 'white',
            fontSize: '20px',
            borderRadius: '5px',
            display: 'block',
          }}
        >
          Copied to clipboard!
        </div>
      )}
    </main>
  )
}

export default App
