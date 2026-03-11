import asyncio
import json

import modules.data as data
import modules.recommendation as recommendation

async def main():
    result = await recommendation.give_recommendation({
        "source": "I am a professional saxophone player who wants to go to an event.", # Example source text
        "sentences": ["Basketball Tryouts Friday 6pm", "Live Jazz Night at the Student Union", "Intro to Python Workshop"], # Example sentences to compare against the source
    })

    highest_sentence = result["highest"]["sentence"]

    print("=== Recommendation Result ===")
    print(f"Recommendation: {highest_sentence}") # The sentence with the highest similarity score to the source text
    print(f"Inference Time: {result['generation_time']} seconds") # The time taken to compute the recommendation (very fast)
    print(f"Full JSON Result: {json.dumps(result, indent=2)}") # The scores are between -1 and 1, where 1 means the sentence is very similar to the source, and -1 means it is very different.
    print("=============================")

asyncio.run(main())