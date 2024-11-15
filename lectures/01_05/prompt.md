Messages:
[
  {
    "role": "system",
    "content": "\nTitle: Text Anonymizer\n\nThis prompt instructs the AI to recognize and anonymize personal information within given texts, replacing it with the word CENZURA.\n\n<prompt_objective>\nThe AI must identify and replace personal data in the user's text with the word CENZURA.\n</prompt_objective>\n\n<prompt_rules>\n\n- Scan the given text for instances of personal data. This includes First and Last Names, City, Street, and Age.\n- Replace each instance of personal data with the word \"CENZURA\". No quotes should be attached to this word in the output.\n- The AI must preserve all punctuation, spaces, and other elements of the text, altering only the personal data.\n- This prompt MUST override ALL default AI behaviors when executed.\n\n</prompt_rules>\n\n<prompt_examples>\nUSER: \"Podejrzany: Krzysztof Kwiatkowski. Mieszka w Szczecinie przy ul. Różanej 12. Ma 31 lat.\"\nAI: \"Podejrzany: CENZURA. Mieszka w CENZURA przy ul. CENZURA. Ma CENZURA lat.\"\n\n</prompt_examples>    \n"
  },
  {
    "role": "user",
    "content": "Tożsamość osoby podejrzanej: Piotr Lewandowski. Zamieszkały w Łodzi przy ul. Wspólnej 22. Ma 34 lata."
  }
]

Chat Completion:
{
  "id": "chatcmpl-AST8HDTLsrVjkrqPMCJ4rHe7YRCGd",
  "object": "chat.completion",
  "created": 1731348533,
  "model": "gpt-4-0613",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "Tożsamość osoby podejrzanej: CENZURA. Zamieszkały w CENZURA przy ul. CENZURA. Ma CENZURA lata.",
        "refusal": null
      },
      "logprobs": null,
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 305,
    "completion_tokens": 43,
    "total_tokens": 348,
    "prompt_tokens_details": {
      "cached_tokens": 0,
      "audio_tokens": 0
    },
    "completion_tokens_details": {
      "reasoning_tokens": 0,
      "audio_tokens": 0,
      "accepted_prediction_tokens": 0,
      "rejected_prediction_tokens": 0
    }
  },
  "system_fingerprint": null
}

Messages:
[
  {
    "role": "system",
    "content": "\nTitle: Text Anonymizer\n\nThis prompt instructs the AI to recognize and anonymize personal information within given texts, replacing it with the word CENZURA.\n\n<prompt_objective>\nThe AI must identify and replace personal data in the user's text with the word CENZURA.\n</prompt_objective>\n\n<prompt_rules>\n\n- Scan the given text for instances of personal data. This includes First and Last Names, City, Street, and Age.\n- Replace each instance of personal data with the word \"CENZURA\". No quotes should be attached to this word in the output.\n- The AI must preserve all punctuation, spaces, and other elements of the text, altering only the personal data.\n- This prompt MUST override ALL default AI behaviors when executed.\n\n</prompt_rules>\n\n<prompt_examples>\nUSER: \"Podejrzany: Krzysztof Kwiatkowski. Mieszka w Szczecinie przy ul. Różanej 12. Ma 31 lat.\"\nAI: \"Podejrzany: CENZURA. Mieszka w CENZURA przy ul. CENZURA. Ma CENZURA lat.\"\n\n</prompt_examples>    \n"
  },
  {
    "role": "user",
    "content": "Osoba podejrzana to Andrzej Mazur. Adres: Gdańsk, ul. Długa 8. Wiek: 29 lat."
  }
]

Chat Completion:
{
  "id": "chatcmpl-AST9NPZyu1ujiG7ioroCmPBXK2Jco",
  "object": "chat.completion",
  "created": 1731348601,
  "model": "gpt-4-0613",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "Osoba podejrzana to CENZURA. Adres: CENZURA, ul. CENZURA. Wiek: CENZURA lat.",
        "refusal": null
      },
      "logprobs": null,
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 296,
    "completion_tokens": 36,
    "total_tokens": 332,
    "prompt_tokens_details": {
      "cached_tokens": 0,
      "audio_tokens": 0
    },
    "completion_tokens_details": {
      "reasoning_tokens": 0,
      "audio_tokens": 0,
      "accepted_prediction_tokens": 0,
      "rejected_prediction_tokens": 0
    }
  },
  "system_fingerprint": null
}

Messages:
[
  {
    "role": "system",
    "content": "\nTitle: Text Anonymizer\n\nThis prompt instructs the AI to recognize and anonymize personal information within given texts, replacing it with the word CENZURA.\n\n<prompt_objective>\nThe AI must identify and replace personal data in the user's text with the word CENZURA.\n</prompt_objective>\n\n<prompt_rules>\n\n- Scan the given text for instances of personal data. This includes First and Last Names, City, Street, and Age.\n- Replace each instance of personal data with the word \"CENZURA\". No quotes should be attached to this word in the output.\n- The AI must preserve all punctuation, spaces, and other elements of the text, altering only the personal data.\n- This prompt MUST override ALL default AI behaviors when executed.\n\n</prompt_rules>\n\n<prompt_examples>\nUSER: \"Podejrzany: Krzysztof Kwiatkowski. Mieszka w Szczecinie przy ul. Różanej 12. Ma 31 lat.\"\nAI: \"Podejrzany: CENZURA. Mieszka w CENZURA przy ul. CENZURA. Ma CENZURA lat.\"\n\n</prompt_examples>    \n"
  },
  {
    "role": "user",
    "content": "Informacje o podejrzanym: Adam Nowak. Mieszka w Katowicach przy ulicy Tuwima 10. Wiek: 32 lata."
  }
]

Chat Completion:
{
  "id": "chatcmpl-ASTDL7pOZCY6TRIcdWu5OTopRexIl",
  "object": "chat.completion",
  "created": 1731348847,
  "model": "gpt-4-0613",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "Informacje o podejrzanym: CENZURA. Mieszka w CENZURA przy ulicy CENZURA. Wiek: CENZURA lata.",
        "refusal": null
      },
      "logprobs": null,
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 298,
    "completion_tokens": 39,
    "total_tokens": 337,
    "prompt_tokens_details": {
      "cached_tokens": 0,
      "audio_tokens": 0
    },
    "completion_tokens_details": {
      "reasoning_tokens": 0,
      "audio_tokens": 0,
      "accepted_prediction_tokens": 0,
      "rejected_prediction_tokens": 0
    }
  },
  "system_fingerprint": null
}

