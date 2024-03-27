let buffer = ''; // Define and initialize buffer variable
let stopCommunication = false; // Define and initialize stopCommunication variable
const maxSentences = 3; // Maximum number of sentences to display

// Queue to store the last three sentences
const sentenceQueue = [];

// Function to update the output element with received serial data and speak it with customized speed and pitch
function updateOutput(data) {
  if (stopCommunication) return; // Exit function if serial communication is stopped
  const outputElement = document.getElementById('output');
  buffer += data; // Append received data to buffer
  // Check if buffer contains a complete sentence (ending with a period)
  if (buffer.includes('.')) {
    // Split buffer into complete sentences and process each one
    const sentences = buffer.split('.');
    buffer = sentences.pop(); // Store incomplete sentence in buffer
    // Process complete sentences
    sentences.forEach((sentence, index) => {
      const trimmedSentence = sentence.trim(); // Remove leading/trailing whitespace
      if (trimmedSentence !== '') {
        const isLastSentence = index === sentences.length - 1; // Check if it's the last sentence
        sentenceQueue.push({ text: trimmedSentence, isLast: isLastSentence }); // Add sentence to the queue
        if (sentenceQueue.length > maxSentences) {
          sentenceQueue.shift(); // Remove oldest sentence if queue exceeds max size
        }
        // Update output with the last three sentences
        outputElement.innerHTML = sentenceQueue.map(item => `<span class="sentence${item.isLast ? ' last-sentence' : ''}">${item.text}</span>`).join('');
      }
    });
    // Optionally, you can scroll to the bottom of the output element
    outputElement.scrollTop = outputElement.scrollHeight;
  }
}

// Function to request permission to connect to a serial port
async function requestSerialPermission() {
  try {
    // Request access to the serial port
    const port = await navigator.serial.requestPort();
    // Open the serial port
    await port.open({ baudRate: 9600 });
    // Start reading data from the serial port
    const reader = port.readable.getReader();
    while (!stopCommunication) { // Loop until stopCommunication flag is true
      const { value, done } = await reader.read();
      if (done) break; // Exit loop if reader is done
      const data = new TextDecoder().decode(value); // Decode received data
      updateOutput(data); // Update output with received data and speak it
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log('No port selected by the user.');
    } else {
      console.error('Error:', error);
    }
  }
}

// Event listener for the connect button to request permission to connect to a serial port
document.getElementById('connectButton').addEventListener('click', requestSerialPermission);

// Event listener for the stop button to stop serial communication
document.getElementById('stopButton').addEventListener('click', () => {
  stopCommunication = true; // Set stopCommunication flag to true
});
