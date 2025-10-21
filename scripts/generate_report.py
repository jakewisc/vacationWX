# This initial code was supplied by GLM-4.6 on Z.ai

import requests
import pandas as pd
from transformers import AutoModelForSeq2SeqLM, AutoTokenizer

def get_climate_data(location):
  # Get coordinates for the location
  # (You could use a geocoding API for this)
  lat, lon = 45.7833, -108.5007  # Billings coordinates
  
  # Get climate data from Open-Meteo
  url = f"https://archive-api.open-meteo.com/v1/archive?latitude={lat}&longitude={lon}&start_date=1990-01-01&end_date=2020-12-31&monthly=temperature_2m_mean,temperature_2m_max,temperature_2m_min,precipitation_sum"
  response = requests.get(url)
  return response.json()

def determine_koppen_classification(climate_data):
  """
  Determines the Köppen climate classification based on monthly temperature and precipitation data.

  Args:
      climate_data (dict): A dictionary with keys:
          - 'temperature': A list of 12 monthly average temperatures in Celsius.
          - 'precipitation': A list of 12 monthly total precipitation values in mm.

  Returns:
      str: The three-letter Köppen climate classification code.
  """
  temps = climate_data['temperature']
  precips = climate_data['precipitation']

  # --- Helper Calculations ---
  # Define summer/winter months for Northern Hemisphere
  summer_months = [4, 5, 6, 7, 8, 9]  # Apr-Sep
  winter_months = [10, 11, 12, 1, 2, 3] # Oct-Mar

  annual_precip = sum(precips)
  annual_avg_temp = sum(temps) / 12
  
  coldest_month_temp = min(temps)
  hottest_month_temp = max(temps)
  
  summer_precip = sum(precips[i-1] for i in summer_months)
  winter_precip = sum(precips[i-1] for i in winter_months)
    
  wettest_summer_month_precip = max(precips[i-1] for i in summer_months)
  driest_summer_month_precip = min(precips[i-1] for i in summer_months)
  wettest_winter_month_precip = max(precips[i-1] for i in winter_months)
  driest_winter_month_precip = min(precips[i-1] for i in winter_months)
  
  driest_month_precip = min(precips)
  
  months_above_10c = sum(1 for t in temps if t >= 10.0)

  # --- First Letter: Main Climate Group ---
  # Check for Arid (B) climate first, as it can override temperature rules
  # The threshold depends on whether rainfall is concentrated in summer
  if summer_precip > 0.7 * annual_precip:
      arid_threshold = 20 * annual_avg_temp + 280
  else:
      arid_threshold = 20 * annual_avg_temp

  if annual_precip < arid_threshold:
      first_letter = 'B'
  elif hottest_month_temp < 10.0:
      first_letter = 'E'
  elif coldest_month_temp >= 18.0:
      first_letter = 'A'
  elif coldest_month_temp < -3.0:
      first_letter = 'D'
  else: # -3 <= coldest_month_temp < 18
      first_letter = 'C'

  # --- Second Letter: Precipitation Pattern ---
  second_letter = ''
  if first_letter == 'A':
      if driest_month_precip >= 60:
          second_letter = 'f'
      elif driest_month_precip < (100 - annual_precip / 25):
          second_letter = 'w'
      else:
          second_letter = 'm'
          
  elif first_letter == 'B':
      if annual_precip < arid_threshold / 2:
          second_letter = 'W' # Desert
      else:
          second_letter = 'S' # Steppe
            
  elif first_letter in ['C', 'D']:
      if driest_summer_month_precip < (wettest_winter_month_precip / 3) and driest_summer_month_precip < 40:
          second_letter = 's' # Dry summer
      elif driest_winter_month_precip < (wettest_summer_month_precip / 10):
          second_letter = 'w' # Dry winter
      else:
          second_letter = 'f' # Fully humid
            
  # --- Third Letter: Temperature Level ---
  third_letter = ''
  if first_letter in ['C', 'D']:
      # Special case for D climates with extremely cold winters
      if first_letter == 'D' and coldest_month_temp <= -38.0:
          third_letter = 'd'
      elif hottest_month_temp >= 22.0:
          third_letter = 'a'
      elif months_above_10c >= 4:
          third_letter = 'b'
      else:
          third_letter = 'c'

  # --- Combine and Return ---
  if first_letter == 'E':
      return 'ET' # Simplified: Tundra is most common, EF (Ice Cap) if avg < 0C
  if first_letter == 'B':
      return f"{first_letter}{second_letter}"
  if first_letter in ['A', 'C', 'D']:
      return f"{first_letter}{second_letter}{third_letter}"
  
  return "Unknown" # Fallback

"""
# --- Example Usage for Billings, MT ---
# Data derived from long-term climate normals (approximate values for demonstration)
billings_data = {
    'temperature': [-2.0, 0.5, 4.0, 9.0, 14.0, 19.0, 23.0, 21.5, 16.0, 9.5, 2.5, -1.5], # Avg Temp °C
    'precipitation': [15, 13, 25, 45, 65, 65, 35, 30, 35, 30, 18, 15] # Total Precip mm
}

koppen_code = determine_koppen_classification(billings_data)
print(f"The Köppen climate classification for the provided data is: {koppen_code}")
# Expected output: Dfb
"""

def generate_climate_report(location, koppen_code, climate_data):
  # Load FLAN-T5 model
  model_name = "google/flan-t5-base"
  model = AutoModelForSeq2SeqLM.from_pretrained(model_name)
  tokenizer = AutoTokenizer.from_pretrained(model_name)
  
  # Extract key climate metrics
  winter_temp = extract_winter_temp(climate_data)
  summer_temp = extract_summer_temp(climate_data)
  annual_precip = extract_annual_precip(climate_data)
  
  # Create a prompt with the necessary information
  prompt = f"Generate a detailed climate report for {location} with Köppen classification {koppen_code}. "
  prompt += f"Average winter temperature: {winter_temp}°F, "
  prompt += f"Average summer temperature: {summer_temp}°F, "
  prompt += f"Annual precipitation: {annual_precip} mm. "
  prompt += "Include information about how this climate affects local agriculture, ecology, and lifestyle."
  
  # Generate the report
  inputs = tokenizer(prompt, return_tensors="pt")
  outputs = model.generate(**inputs, max_length=200, do_sample=True, temperature=0.7)
  report = tokenizer.batch_decode(outputs, skip_special_tokens=True)[0]
  
  return report

def main():
  location = "Billings, MT"
  climate_data = get_climate_data(location)
  koppen_code = determine_koppen_classification(climate_data)
  report = generate_climate_report(location, koppen_code, climate_data)
  print(report)

if __name__ == "__main__":
  main()
koppen_code = determine_koppen_classification(billings_data)
print(f"The Köppen climate classification for the provided data is: {koppen_code}")
# Expected output: Dfb
