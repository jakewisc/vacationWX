// Wait for the DOM to be fully loaded before running the script
document.addEventListener('DOMContentLoaded', () => {

  // Get references to the interactive elements
  const locationInput = document.getElementById('location-input');
  const generateButton = document.getElementById('generate-button');
  const messageOutput = document.getElementById('message-output');

  // This variable will hold the value of the input, similar to React state
  let location = '';

  // Update the 'location' variable whenever the user types in the input
  locationInput.addEventListener('input', (event) => {
    location = event.target.value;
  });

  // Handle the button click
  generateButton.addEventListener('click', () => {
    // Clear any previous message
    messageOutput.textContent = '';
    messageOutput.classList.remove('text-red-500', 'text-green-600');

    if (location.trim()) {
      // If a location is entered, show a confirmation message
      console.log('Generating report for:', location);
      messageOutput.textContent = `Generating report for: ${location}...`;
      messageOutput.classList.add('text-green-600');
      
      // In a real app, you would call your weather API here
      
    } else {
      // If no location is entered, ask the user for one
      console.log('No location entered.');
      messageOutput.textContent = 'Please enter a location first.';
      messageOutput.classList.add('text-red-500');
    }
  });

});
