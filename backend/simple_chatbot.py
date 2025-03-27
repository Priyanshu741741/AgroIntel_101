class SimpleCropChatbot:
    """A simple rule-based fallback chatbot for when the API is unavailable"""
    
    def __init__(self):
        self.responses = {
            "tomato": "Tomatoes need full sun and consistent watering. Common diseases include early blight and late blight. Water at the base to avoid leaf wetness.",
            "potato": "Potatoes need well-drained soil and consistent moisture. Watch for signs of late blight which appears as dark water-soaked spots on leaves.",
            "corn": "Corn requires full sun and consistent moisture. Plant in blocks rather than rows for better pollination.",
            "disease": "Common plant diseases include powdery mildew, leaf spot, and blight. Look for discoloration, spots, or unusual growths on leaves.",
            "water": "Most crops need 1-2 inches of water per week. Water deeply and less frequently to encourage deeper root growth.",
            "fertilize": "Use balanced fertilizer for most crops. Nitrogen promotes leaf growth, phosphorus supports root and fruit development, and potassium improves overall plant health.",
            "soil": "Good soil contains organic matter, has proper drainage, and the right pH for your crops. Most vegetables prefer slightly acidic soil with pH 6.0-6.8.",
            "pest": "Common garden pests include aphids, caterpillars, and beetles. Inspect plants regularly and consider companion planting to deter pests.",
            "care": "Basic plant care includes proper watering, adequate sunlight, appropriate fertilization, and regular monitoring for pests and diseases."
        }
    
    def get_response(self, user_input):
        user_input = user_input.lower()
        
        # Check for keyword matches
        for keyword, response in self.responses.items():
            if keyword in user_input:
                return {
                    "response": response,
                    "source": "fallback"
                }
        
        # Default response if no keywords match
        return {
            "response": "I can provide information about common crops like tomatoes, potatoes, and corn, as well as general advice about watering, fertilizing, soil care, and pest management. What would you like to know about?",
            "source": "fallback"
        }

# Create a singleton instance
simple_chatbot = SimpleCropChatbot()