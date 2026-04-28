import os
import json
import google.generativeai as genai
from typing import List, dict, Optional
from dotenv import load_dotenv

load_dotenv()

class GeminiService:
    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY")
        if api_key:
            genai.configure(api_key=api_key)
        else:
            print("WARNING: GEMINI_API_KEY not found in environment variables.")
        
        # Using Gemini 1.5 Flash for speed and cost-efficiency
        self.model = genai.GenerativeModel('gemini-1.5-flash')

    async def analyze_disruptions(self, shipments: List[dict]) -> List[dict]:
        """Identifies top 5 highest-risk disruptions from shipment data."""
        system_context = (
            "You are an expert supply chain analyst AI. Analyze the provided shipments and identify "
            "the top 5 highest-risk disruptions. For each, provide: disruption type, severity "
            "(low/medium/high/critical), affected shipment IDs, predicted impact, and a one-sentence "
            "recommended action. Return ONLY a valid JSON array."
        )
        
        prompt = f"Context: {system_context}\n\nShipments Data: {json.dumps(shipments)}"
        
        try:
            if not os.getenv("GEMINI_API_KEY"):
                return self._get_fallback_disruptions()

            response = self.model.generate_content(prompt)
            # Basic JSON extraction in case Gemini wraps it in ```json ... ```
            text = response.text.strip()
            if "```json" in text:
                text = text.split("```json")[1].split("```")[0].strip()
            
            return json.loads(text)
        except Exception as e:
            print(f"Gemini API Error (analyze_disruptions): {e}")
            return self._get_fallback_disruptions()

    async def optimize_route(self, shipment: dict) -> dict:
        """Recommends an alternative route for a specific shipment."""
        system_context = (
            "You are a logistics optimization AI. Given this shipment's current route, recommend "
            "the single best alternative route. Consider: weather avoidance, congestion bypass, "
            "cost efficiency, and time savings. Return ONLY a valid JSON object with fields: "
            "alternative_waypoints (list of {city, country, lat, lng}), time_saving_hours (int), "
            "cost_delta_usd (float), risk_reduction_percent (int), recommended_carrier (string), "
            "reasoning (string, max 2 sentences)."
        )
        
        prompt = f"Context: {system_context}\n\nShipment Detail: {json.dumps(shipment)}"
        
        try:
            if not os.getenv("GEMINI_API_KEY"):
                return self._get_fallback_optimization(shipment)

            response = self.model.generate_content(prompt)
            text = response.text.strip()
            if "```json" in text:
                text = text.split("```json")[1].split("```")[0].strip()
            
            return json.loads(text)
        except Exception as e:
            print(f"Gemini API Error (optimize_route): {e}")
            return self._get_fallback_optimization(shipment)

    async def chat_query(self, question: str, context: dict) -> str:
        """Answers natural language supply chain questions using metrics context."""
        system_prompt = (
            "You are ChainSight AI, a supply chain operations expert. Answer concisely in 2-3 sentences "
            "using the provided live supply chain metrics. Be specific with numbers."
        )
        
        prompt = f"System: {system_prompt}\nContext: {json.dumps(context)}\nUser Question: {question}"
        
        try:
            if not os.getenv("GEMINI_API_KEY"):
                return "ChainSight AI is currently in offline mode. Please configure your GEMINI_API_KEY."

            response = self.model.generate_content(prompt)
            return response.text.strip()
        except Exception as e:
            return f"I'm sorry, I encountered an error processing your query: {str(e)}"

    def _get_fallback_disruptions(self) -> List[dict]:
        return [
            {
                "type": "Weather",
                "severity": "high",
                "affected_shipments": ["SHP-10001", "SHP-10005"],
                "predicted_impact": "48h delay due to coastal storm",
                "recommendation": "Reroute via inland rail hubs to bypass affected port."
            },
            {
                "type": "Port Congestion",
                "severity": "critical",
                "affected_shipments": ["SHP-10012"],
                "predicted_impact": "Indefinite delay at Suez Canal",
                "recommendation": "Divert to Cape of Good Hope route immediately."
            }
        ]

    def _get_fallback_optimization(self, shipment: dict) -> dict:
        return {
            "alternative_waypoints": [
                {"city": "Singapore", "country": "Singapore", "lat": 1.3521, "lng": 103.8198},
                {"city": "Cape Town", "country": "South Africa", "lat": -33.9249, "lng": 18.4241},
                {"city": "Rotterdam", "country": "Netherlands", "lat": 51.9225, "lng": 4.4792}
            ],
            "time_saving_hours": 12,
            "cost_delta_usd": 1500.0,
            "risk_reduction_percent": 35,
            "recommended_carrier": shipment.get("carrier", "Maersk"),
            "reasoning": "Avoiding the congested Suez Canal by taking the Cape route, reducing risk of multi-week delays."
        }

# Export a default instance
gemini_service = GeminiService()
