from litellm import completion
from app.core.config import settings


class LLMService:

    def chat(self, question: str, context: str):

        prompt = f"""
You are an AI assistant.
Answer the question only using the provided context and give detailed and motivated answer to user.

Context:
{context}

Question:
{question}

If the answer is not present in the context, say:
"I don't have enough information."
"""

        response = completion(
            model=settings.MODEL_NAME,
            api_key=settings.MISTRAL_API_KEY,
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        )

        return response.choices[0].message.content