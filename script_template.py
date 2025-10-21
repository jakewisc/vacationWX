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
    # Process climate data to determine Köppen classification
    # This would implement the Köppen classification rules
    # For simplicity, just returning a placeholder
    return "Dfb"

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

"""
prompt: I want to build a tool that generates a weather & climate report for an area. Part of that is a Köppen climate classification. For a Billings MT input, I would get an output something like "Billings, Montana, has a Köppen climate classification of Dfb, indicating a humid continental climate characterized by long, cold winters and mild to warm summers. Average winter temperatures often fall below freezing, while summer highs can exceed 75°F (24°C), particularly in July. Precipitation is spread throughout the year, with peak rainfall occurring in late spring and early summer, averaging about 455 mm (17.9 inches) annually. The city also receives around 59 inches of snowfall each year, experiencing significant temperature variability due to Chinook winds. This climate influences the local agriculture, ecology, and lifestyle of its residents." Evaluate low/zero cost tools, like Huggingface models, that could accomplish this with or combined with Python.
-> For a low-cost solution, I recommend the hybrid approach of using Open-Meteo for climate data, implementing the Köppen classification rules in Python, and using FLAN-T5 from Hugging Face for text generation. This combination provides a good balance of accuracy, flexibility, and cost-effectiveness.
"""
