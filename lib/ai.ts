export interface UserData {
  gender: string;
  goal: string;
  workoutDays: string;
  birthdate: string;
  height_ft: string;
  weight_kg: string;
}

export interface NutritionPlan {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  waterIntakeLiters: number;
  tips: string[];
}

export const generateNutritionPlan = async (userData: UserData): Promise<NutritionPlan> => {
  const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  if (!GEMINI_API_KEY) {
    throw new Error('Missing Expo Public Gemini API Key in .env');
  }

  const prompt = `
    You are an expert, highly accurate AI nutritionist and fitness coach.
    Carefully analyze the following user profile:
    - Gender: ${userData.gender}
    - Goal: ${userData.goal}
    - Workout Frequency: ${userData.workoutDays} per week
    - Birthdate: ${userData.birthdate} 
    - Height: ${userData.height_ft} ft
    - Weight: ${userData.weight_kg} kg

    Based on these metrics, generate a daily nutrition blueprint tailored for their goal.
    
    SAFETY CONSTRAINTS:
    1. 'calories' MUST NOT be below 1200 or above 4000.
    2. 'protein', 'carbs', and 'fats' must be realistically distributed macro equivalents for the total calories.
    3. 'waterIntakeLiters' should be scientifically within a healthy daily range (e.g. 2.0 to 4.5).
    4. Provide strictly 3-5 actionable short 'tips'.

    Return ONLY a raw JSON object (with no markdown wrapping, no \`\`\`json backticks, just the exact JSON).
    The JSON structure MUST tightly map to this exact interface:
    {
      "calories": number,
      "protein": number,
      "carbs": number,
      "fats": number,
      "waterIntakeLiters": number,
      "tips": string[]
    }
  `;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            response_mime_type: "application/json",
            temperature: 0.2
          }
        })
      }
    );

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data?.error?.message || 'Gemini API evaluation completely failed.');
    }

    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    console.log("RAW AI RESPONSE:", rawText);
    
    if (!rawText) {
      throw new Error("No structured output received from Gemini.");
    }

    // Clean any potential erroneous backticks dynamically if the model ignores the instruction natively.
    const cleanJsonString = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    
    let parsedData: NutritionPlan;
    try {
      parsedData = JSON.parse(cleanJsonString);
      console.log("PARSED PLAN:", parsedData);
    } catch (parseError) {
      console.error("Failed to parse Gemini response as JSON:", rawText);
      throw new Error("AI returned invalid JSON structure.");
    }

    if (
      typeof parsedData.calories !== 'number' ||
      typeof parsedData.protein !== 'number' ||
      typeof parsedData.carbs !== 'number' ||
      typeof parsedData.fats !== 'number' ||
      typeof parsedData.waterIntakeLiters !== 'number' ||
      !Array.isArray(parsedData.tips)
    ) {
      console.error("Parsed data does not match the strict schema requirements:", parsedData);
      throw new Error("Parsed data does not match the strict schema requirements.");
    }

    return parsedData;
  } catch (error) {
    console.error("AI Generation Engine Error: ", error);
    throw error;
  }
};
