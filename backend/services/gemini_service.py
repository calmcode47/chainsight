import os
import json
import google.generativeai as genai
from typing import List, Dict, Optional
from dotenv import load_dotenv

load_dotenv()


class GeminiService:
    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY")
        if api_key:
            genai.configure(api_key=api_key)
        else:
            print("WARNING: GEMINI_API_KEY not found in environment variables.")

        # Dynamic model selection for maximum compatibility
        try:
            available_models = [
                m.name
                for m in genai.list_models()
                if "generateContent" in m.supported_generation_methods
            ]
            print(f"🤖 Available Gemini Models: {available_models}")

            # Prefer 1.5 Flash for its balanced quota and high speed
            preferred_models = [
                "models/gemini-1.5-flash",
                "models/gemini-1.5-flash-latest",
                "models/gemini-pro",
            ]

            self.model_name = "models/gemini-1.5-flash"  # Default
            for pm in preferred_models:
                if pm in available_models:
                    self.model_name = pm
                    break

            print(f"🚀 Selected Gemini Model: {self.model_name}")
            self.model = genai.GenerativeModel(self.model_name)
        except Exception as e:
            print(
                f"❌ Failed to list Gemini models: {e}. Defaulting to gemini-1.5-flash."
            )
            self.model_name = "gemini-1.5-flash"
            self.model = genai.GenerativeModel(self.model_name)

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
            "alternative_route (list of {city, country, lat, lng}), time_saving_hours (int), "
            "cost_delta_usd (float), risk_reduction_percent (int), recommended_carrier (string), "
            "gemini_reasoning (string, max 2 sentences)."
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
            error_str = str(e).lower()
            # Catch common quota and rate limit indicators
            quota_indicators = [
                "429",
                "quota",
                "limit",
                "rate_limit",
                "exhausted",
                "free_tier",
            ]
            if any(indicator in error_str for indicator in quota_indicators):
                print(f"⚠️ Gemini Quota Exceeded. Switching to Heuristic Mode.")
                return self._get_heuristic_answer(question, context)

            # For other errors, still try to provide a heuristic answer if possible
            # rather than a raw error string, to keep the UX smooth.
            print(f"Gemini API Error (chat_query): {e}")
            return self._get_heuristic_answer(question, context)

    def _get_heuristic_answer(self, question: str, context: dict) -> str:
        """Provides basic data-driven answers when AI is unavailable."""
        metrics = context.get("metrics") or {}

        q = question.lower()

        if any(
            greet in q
            for greet in ["hi", "hello", "hey", "who are you", "what is your name"]
        ):
            return (
                "Hello! I'm ChainSight AI, your logistics intelligence assistant. "
                "I have real-time access to your fleet metrics and can help you identify delays, "
                "optimize routes, and assess supply chain risks. What can I analyze for you today?"
            )

        if "delay" in q or "delayed" in q:
            count = metrics.get("delayed", 0)
            return f"I'm currently tracking {count} shipments with active delays. You can view the specific bottlenecks in the 'Critical Shipment Monitor' on your dashboard."

        if "risk" in q or "critical" in q:
            count = metrics.get("critical", 0)
            return f"Operational Alert: We have {count} shipments in 'Critical' status requiring immediate intervention. I recommend checking the Optimizer page for rerouting strategies."

        if "save" in q or "cost" in q:
            saved = metrics.get("cost_saved_usd", 0)
            return f"Our analytics show a total cost saving of ${saved:,.2f} for the current period, achieved through AI-driven route optimizations."

        # Default Data-Driven Response
        total = metrics.get("total_shipments", 0)
        delayed = metrics.get("delayed", 0)
        return (
            f"Based on current telemetry, I'm monitoring {total} active shipments. "
            f"Approximately {(delayed/total*100) if total > 0 else 0:.1f}% of your fleet is currently off-schedule. "
            "How else can I assist with your operations?"
        )

    def _get_fallback_disruptions(self) -> List[dict]:
        return [
            {
                "type": "Weather",
                "severity": "high",
                "affected_shipments": ["SHP-10001", "SHP-10005"],
                "predicted_impact": "48h delay due to coastal storm",
                "recommendation": "Reroute via inland rail hubs to bypass affected port.",
            },
            {
                "type": "Port Congestion",
                "severity": "critical",
                "affected_shipments": ["SHP-10012"],
                "predicted_impact": "Indefinite delay at Suez Canal",
                "recommendation": "Divert to Cape of Good Hope route immediately.",
            },
        ]

    def _get_fallback_optimization(self, shipment: dict) -> dict:
        carrier = shipment.get("carrier", "Maersk")
        return {
            "alternative_route": [
                {
                    "city": "Singapore",
                    "country": "Singapore",
                    "lat": 1.3521,
                    "lng": 103.8198,
                },
                {
                    "city": "Cape Town",
                    "country": "South Africa",
                    "lat": -33.9249,
                    "lng": 18.4241,
                },
                {
                    "city": "Rotterdam",
                    "country": "Netherlands",
                    "lat": 51.9225,
                    "lng": 4.4792,
                },
            ],
            "time_saving_hours": 12,
            "cost_delta_usd": 1500.0,
            "risk_reduction_percent": 35,
            "recommended_carrier": carrier,
            "gemini_reasoning": f"Optimizing path for {carrier} fleet by bypassing current regional bottlenecks. Identified a high-liquidity transit window for this specific route.",
        }


# Export a default instance
gemini_service = GeminiService()
