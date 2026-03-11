import asyncio
import json

import modules.data as data
import modules.recommendation as recommendation

async def main():
    result = await recommendation.give_recommendation({
        "source": "I am a professional saxophone player who wants to go to an event.", # Example source text
        "sentences": ["Basketball Tryouts Friday 6pm", "Live Jazz Night at the Student Union", "Intro to Python Workshop", "Tax filing workshop for small business owners"], # Example sentences to compare against the source
        "normalize": True # Whether to normalize the text before computing similarity, with default being False; normalizing will use similarity score range between 0 and 1, while not normalizing will use similarity score range between -1 and 1
    })

    highest_sentence = result["highest"]["sentence"]

    print("=== Recommendation Result ===")
    print(f"Recommendation: {highest_sentence}") # The sentence with the highest similarity score to the source text
    print(f"Inference Time: {result['generation_time']} seconds") # The time taken to compute the recommendation (very fast)
    print(f"Full JSON Result: {json.dumps(result, indent=2)}")
    print("=============================")

asyncio.run(main())