// Wait for the DOM to be fully loaded before running the script
document.addEventListener('DOMContentLoaded', () => {

  // Get references to the interactive elements
  const locationInput = document.getElementById('location-input');
  const generateButton = document.getElementById('generate-button');
  const messageOutput = document.getElementById('message-output');
  const resultsContainer = document.getElementById('results-container');
  
  // This variable will hold the complete data of the selected location
  let selectedLocation = null;

// --- Helper Function: Debounce ---
  // Prevents the API from being called on every keystroke
  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func.apply(this, args);
      }, delay);
    };
  };

  // --- Function to Fetch and Display Location Suggestions ---
  const handleLocationSearch = async (query) => {
    if (query.length < 3) {
      resultsContainer.innerHTML = '';
      resultsContainer.classList.add('hidden');
      return;
    }

    const endpoint = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5`;

    try {
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      displayResults(data);
    } catch (error) {
      console.error('Error fetching location data:', error);
      resultsContainer.innerHTML = '<div class="p-3 text-gray-500">Could not fetch results.</div>';
      resultsContainer.classList.remove('hidden');
    }
  };

  // --- Function to render the results in the dropdown ---
  const displayResults = (locations) => {
    resultsContainer.innerHTML = ''; // Clear previous results
    if (locations.length === 0) {
      resultsContainer.classList.add('hidden');
      return;
    }

    locations.forEach(location => {
      const resultItem = document.createElement('div');
      resultItem.className = 'result-item';
      resultItem.textContent = location.display_name;
      // Store data directly on the element for easy access
      resultItem.dataset.lat = location.lat;
      resultItem.dataset.lon = location.lon;
      resultItem.dataset.name = location.display_name;

      resultItem.addEventListener('click', () => {
        // A location has been selected
        selectedLocation = {
          name: resultItem.dataset.name,
          lat: parseFloat(resultItem.dataset.lat),
          lon: parseFloat(resultItem.dataset.lon),
        };
        
        // Update input field and hide dropdown
        locationInput.value = selectedLocation.name;
        resultsContainer.innerHTML = '';
        resultsContainer.classList.add('hidden');
      });

      resultsContainer.appendChild(resultItem);
    });

    resultsContainer.classList.remove('hidden');
  };

  // Attach the debounced search function to the input event
  locationInput.addEventListener('input', debounce((event) => {
    // When user types, reset the selected location
    selectedLocation = null;
    handleLocationSearch(event.target.value);
  }, 300));
  
  // Hide results if user clicks elsewhere on the page
  document.addEventListener('click', (event) => {
    if (!resultsContainer.contains(event.target) && event.target !== locationInput) {
      resultsContainer.classList.add('hidden');
    }
  });

  // Handle the button click
  generateButton.addEventListener('click', () => {
    // Clear any previous message
    messageOutput.textContent = '';
    messageOutput.classList.remove('text-red-500', 'text-green-600');

    if (selectedLocation) {
      // If a location has been selected from the dropdown
      console.log('Generating report for:', selectedLocation);
      messageOutput.textContent = `Generating report for: ${selectedLocation.name} (Lat: ${selectedLocation.lat.toFixed(4)}, Lon: ${selectedLocation.lon.toFixed(4)})`;
      messageOutput.classList.add('text-green-600');
      
      // In a real app, you would use selectedLocation.lat and selectedLocation.lon to call your weather API
      
    } else {
      // If no location has been selected or the input is invalid
      console.log('No valid location selected.');
      messageOutput.textContent = 'Please type a location and select it from the list.';
      messageOutput.classList.add('text-red-500');
    }
  });
});
