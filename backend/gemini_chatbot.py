import os
import json
import google.generativeai as genai
from dotenv import load_dotenv
import gc
import atexit
import signal
import sys

# Load environment variables
load_dotenv()

class GeminiCropChatbot:
    def __init__(self):
        self._cleanup_handler = lambda signum, frame: self.cleanup()
        # Get API key from environment variable or use the provided one
        self.api_key = os.getenv("GOOGLE_API_KEY")
        
        if not self.api_key:
            print("Error: GOOGLE_API_KEY environment variable not set")
            self.api_key_error = True
            return
            
        try:
            print(f"Initializing Gemini API with key: {self.api_key[:5]}...")
            
            # Configure the Gemini API
            genai.configure(api_key=self.api_key)
            
            # Load crop knowledge
            self.crop_knowledge = self._load_crop_knowledge()
            
            # List available models and select an appropriate one
            try:
                print("Listing available models...")
                models = genai.list_models()
                model_names = [model.name for model in models]
                
                # Define preferred models in order of preference
                preferred_models = [
                    "models/gemini-1.5-pro",
                    "models/gemini-1.5-flash",
                    "models/gemini-1.5-pro-latest",
                    "models/gemini-1.5-flash-latest",
                    "models/gemini-2.0-pro-exp",
                    "models/gemini-2.0-flash"
                ]
                
                # Try to find one of our preferred models
                self.model_name = None
                for preferred in preferred_models:
                    if preferred in model_names:
                        self.model_name = preferred
                        print(f"Found preferred model: {self.model_name}")
                        break
                
                # If no preferred model found, use the first available Gemini model
                if not self.model_name:
                    gemini_models = [name for name in model_names if "gemini" in name.lower()]
                    if gemini_models:
                        self.model_name = gemini_models[0]
                        print(f"Using available model: {self.model_name}")
                    else:
                        raise ValueError("No Gemini models found in your account")
                
            except Exception as e:
                print(f"Error selecting model: {e}")
                raise
            
            # Initialize model
            print(f"Creating model with name: {self.model_name}")
            self.model = genai.GenerativeModel(self.model_name)
            
            # Test with a simple prompt
            print("Testing model with simple prompt...")
            test_response = self.model.generate_content("Hello, how are you?")
            print(f"Test response: {test_response.text[:50]}...")
            
            self.api_key_error = False
            print("Gemini API initialized successfully!")

            # Register cleanup handlers
            signal.signal(signal.SIGINT, self._cleanup_handler)
            signal.signal(signal.SIGTERM, self._cleanup_handler)
            atexit.register(self.cleanup)
            
        except Exception as e:
            print(f"Error initializing Gemini API: {e}")
            self.api_key_error = True
    
    def _load_crop_knowledge(self):
        """Load crop-specific knowledge base"""
        knowledge_path = os.path.join(os.path.dirname(__file__), 'crop_knowledge.json')
        
        if os.path.exists(knowledge_path):
            with open(knowledge_path, 'r') as f:
                return json.load(f)
        else:
            print("Warning: crop_knowledge.json not found. Using default knowledge.")
            # Return a minimal default knowledge base
            return {
                "crops": {
                    "tomato": {
                        "diseases": ["early blight", "late blight"],
                        "care": "Water regularly, provide full sun."
                    }
                },
                "general_care": {
                    "watering": "Most crops need 1-2 inches of water per week."
                }
            }
    
    def _create_system_prompt(self, user_input):
        """Create a system prompt with agricultural knowledge and user input"""
        # Extract key information from knowledge base
        crops_info = "\n".join([
            f"- {crop}: Diseases: {', '.join(info['diseases'])}. Care: {info['care']}"
            for crop, info in self.crop_knowledge["crops"].items()
        ])
        
        general_care = "\n".join([
            f"- {topic.replace('_', ' ').title()}: {info}"
            for topic, info in self.crop_knowledge["general_care"].items()
        ])
        
        # Create the prompt with system instructions and user query
        return f"""You are an agricultural expert assistant for a Crop Monitoring App. 
Your role is to provide helpful advice about crop care, disease identification, and farming practices.

KEY CROP INFORMATION:
{crops_info}

GENERAL CARE:
{general_care}

When responding to users:
1. Be concise and practical in your advice
2. Suggest relevant tips for crop health based on the user's question
3. If you don't know something specific, acknowledge it and provide general best practices
4. Focus on organic and sustainable farming practices when possible

User Question: {user_input}

Your helpful response:"""
    
    def get_response(self, user_input):
        """Generate a response to the user input using Gemini"""
        # Check if API key is missing or there was an initialization error
        if self.api_key_error:
            return {
                "response": "I'm sorry, the AI service is currently unavailable. Please check your API key configuration.",
                "source": "error"
            }
        
        try:
            # Create a complete prompt with system instructions and user input
            prompt = self._create_system_prompt(user_input)
            
            # Generate content
            print(f"Sending prompt to Gemini: {user_input[:30]}...")
            response = self.model.generate_content(prompt)
            
            return {
                "response": response.text,
                "source": "gemini"
            }
            
        except Exception as e:
            print(f"Error generating Gemini chatbot response: {e}")
            error_message = str(e)
            
            # Provide a more helpful error message
            if "quota" in error_message.lower():
                error_msg = "I'm sorry, we've exceeded our quota for AI requests. Please try again later."
            elif "permission" in error_message.lower() or "access" in error_message.lower():
                error_msg = "I'm sorry, there's an authentication issue with our AI service. Please check the API key configuration."
            elif "network" in error_message.lower() or "connection" in error_message.lower():
                error_msg = "I'm sorry, there's a network issue connecting to the AI service. Please check your internet connection."
            else:
                error_msg = "I'm sorry, there was an error processing your request. We'll use our backup system instead."
            
            return {
                "response": error_msg,
                "source": "error"
            }
    
    def cleanup(self):
        """Clean up resources to prevent gRPC shutdown warnings"""
        print("Cleaning up Gemini API resources...")
        # Force garbage collection
        gc.collect()
    
    def __del__(self):
        # Explicit cleanup when object is destroyed
        self.cleanup()

# Create a singleton instance
chatbot = GeminiCropChatbot()

# Set up signal handlers
def signal_handler(sig, frame):
    print('Received shutdown signal, cleaning up...')
    chatbot.cleanup()
    sys.exit(0)

signal.signal(signal.SIGINT, signal_handler)
signal.signal(signal.SIGTERM, signal_handler)

# Register cleanup function
atexit.register(chatbot.cleanup)

# Example usage
if __name__ == "__main__":
    # Test the chatbot
    print("Testing chatbot...")
    response = chatbot.get_response("How do I care for tomato plants?")
    print(f"Response: {response['response']}")
    print(f"Source: {response['source']}")