console.info('[ext]gpt-page-token: content script loaded')
import { encode } from 'gpt-tokenizer'
import { Readability } from '@mozilla/readability'

// Function to create the token counter div
function createTokenCounterDiv(articleTokens: number[], pageTokens: number[]) {
  const div = document.createElement('div')
  let tokens = articleTokens.length > 0 ? articleTokens.length : pageTokens.length
  div.textContent = `${tokens}`
  div.title = `Article tokens: ${articleTokens.length}, Webpage tokens: ${pageTokens.length}`
  div.id = 'token-counter' // Add an id for CSS targeting
  return div
}

// Function to create the article content modal
function createArticleContentModal(articleContent: string, articleText: string) {
  // Create the modal structure
  const modal = document.createElement('div')
  modal.id = 'article-content-modal'
  modal.style.display = 'none' // Initially hide the modal
  modal.style.position = 'fixed'
  modal.style.zIndex = '10001'
  modal.style.left = '0'
  modal.style.top = '0'
  modal.style.width = '100%'
  modal.style.height = '100%'
  modal.style.overflow = 'auto'
  modal.style.backgroundColor = 'rgba(0,0,0,0.4)' // Semi-transparent black background

  const modalContent = document.createElement('div')
  modalContent.style.backgroundColor = '#fefefe'
  modalContent.style.margin = '15% auto'
  modalContent.style.padding = '20px'
  modalContent.style.border = '1px solid #888'
  modalContent.style.width = '60%' // Limit width
  modalContent.style.maxHeight = '70%' // Limit height
  modalContent.style.overflowY = 'auto' // Add scrollbar if content is too long
  modalContent.style.fontFamily = 'Courier, monospace' // Set font to Courier

  // Create the copy button
  const copyButton = document.createElement('button')
  copyButton.textContent = 'Copy'
  copyButton.style.position = 'fixed'
  copyButton.style.right = '0'
  copyButton.style.bottom = '0'
  copyButton.style.padding = '10px 20px'
  copyButton.style.fontSize = '18px'
  copyButton.style.cursor = 'pointer'

  // Create the prompt
  const prompt = document.createElement('div')
  prompt.textContent = 'Copied to clipboard!'
  prompt.style.display = 'none' // Initially hide the prompt
  prompt.style.position = 'fixed'
  prompt.style.right = '20px'
  prompt.style.bottom = '60px' // Position it above the copy button
  prompt.style.padding = '10px'
  prompt.style.backgroundColor = '#4CAF50' // Green background
  prompt.style.color = 'white' // White text
  prompt.style.fontSize = '16px'
  prompt.style.borderRadius = '5px'

  copyButton.onclick = () => {
    navigator.clipboard
      .writeText(articleText) // Copy the article text to the clipboard
      .then(() => {
        // Show the prompt and hide it after 2 seconds
        prompt.style.display = 'block'
        setTimeout(() => {
          prompt.style.display = 'none'
        }, 2000)
      })
      .catch((err) => {
        console.error('Could not copy text: ', err)
      })
  }

  // Insert the copy button, prompt, and article content into the modal
  modalContent.innerHTML = articleContent
  modalContent.appendChild(copyButton)
  modal.appendChild(modalContent)
  document.body.appendChild(prompt) // Append the prompt to the body

  return modal
}

// Function to style the token counter div
function styleTokenCounterDiv(div: HTMLElement) {
  div.style.position = 'fixed'
  div.style.right = '0px'
  div.style.bottom = '42px'
  div.style.padding = '20px'
  div.style.backgroundColor = 'rgba(249, 249, 249, 0.5)' // More transparent background
  div.style.border = '0' // Remove border
  div.style.zIndex = '10000'
  div.style.borderRadius = '10px'
  div.style.fontFamily = 'Courier, monospace' // Set font to Courier
  div.style.fontSize = '24px'
  div.style.color = '#000000' // Initial font color
  div.style.transition = 'background-color 0.2s ease-in-out' // Add transition
}

// Function to handle mouseover event
function handleMouseOver(event: Event) {
  const div = event.target as HTMLElement
  div.style.backgroundColor = 'rgba(249, 249, 249, 0.8)' // Increase opacity on mouseover
  const modal = document.getElementById('article-content-modal')
  if (modal) {
    modal.style.display = 'block' // Show the modal
  }
}

// Function to handle mouseout event
function handleMouseOut(event: Event) {
  const div = event.target as HTMLElement
  div.style.backgroundColor = 'rgba(249, 249, 249, 0.5)' // Decrease opacity on mouseout
  const modal = document.getElementById('article-content-modal')
  if (modal) {
    modal.style.display = 'none' // Hide the modal
  }
}

// Function to handle click event
function handleClick(event: Event) {
  const div = event.target as HTMLElement
  const modal = document.getElementById('article-content-modal')
  if (modal) {
    if (modal.style.display === 'none') {
      modal.style.display = 'block' // Show the modal
    } else {
      modal.style.display = 'none' // Hide the modal
    }
  }
}

// Function to handle click event outside of modal
function handleOutsideClick(event: Event) {
  const modal = document.getElementById('article-content-modal')
  if (modal && event.target === modal) {
    modal.style.display = 'none' // Hide the modal
  }
}

// Extract the main content of the page
function extractArticleContent() {
  let documentClone = document.cloneNode(true) as Document
  let article = new Readability(documentClone).parse()
  return article
}

let article = extractArticleContent()
const articleText = article?.textContent || ''
const articleContent = article?.content || ''

// Get the whole page text
const pageText = document.body.textContent || ''

// Encode text into tokens
const articleTokens = encode(articleText)
const pageTokens = encode(pageText)

// Create and style the token counter div
const tokenCounterDiv = createTokenCounterDiv(articleTokens, pageTokens)
styleTokenCounterDiv(tokenCounterDiv)

// Create the article content modal
const articleContentModal = createArticleContentModal(articleContent, articleText)

// Add click event listener
tokenCounterDiv.addEventListener('click', handleClick)
window.addEventListener('click', handleOutsideClick)

// Append the divs to the body of the webpage
document.body.appendChild(tokenCounterDiv)
document.body.appendChild(articleContentModal)

// Get the maxTokens value from Chrome storage
chrome.storage.sync.get(['maxTokens'], function (result) {
  // Check if the token count exceeds the max tokens
  let tokens = articleTokens.length > 0 ? articleTokens : pageTokens
  if (tokens.length > result.maxTokens) {
    // Change the font color of the div
    tokenCounterDiv.style.color = '#FF6347' // Tomato color
  }
})
