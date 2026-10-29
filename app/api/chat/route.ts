import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          error: 'GEMINI_API_KEY not configured.',
          text: 'The Bhavani AI assistant is currently connecting to the institute server. Please ensure your Gemini API key is configured in the environment settings.',
        },
        { status: 200 }
      );
    }

    const body = await req.json();
    const { messages, role = 'student', context = {} } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Messages array is required.' },
        { status: 400 }
      );
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    // Build role-specific institutional system instructions
    let systemInstruction = '';

    if (role === 'teacher') {
      systemInstruction = `You are "Bhavani Faculty AI" — the official executive academic and operational copilot for teachers and faculty at Bhavani Science Classes (Virar West, Mumbai).
Institute Profile: Premier science coaching institute for Classes 8, 9, 10, 11, 12, JEE Mains & Advanced, NEET-UG, and MHT-CET. "Concept First • Academic Excellence".

Live Institutional Context & Data:
${JSON.stringify(context, null, 2)}

Your Core Capabilities for Faculty:
1. Student Data Query: When a teacher asks about any student or all students, provide their comprehensive data from context (full name, roll number, batch, contact info, attendance percentage, fee payment/due status, and recent test performance).
2. Teacher / Faculty Data Query: When asked about teachers or staff, provide the full faculty roster from context (name, subjects taught, qualifications, phone, email).
3. Class & Lecture Activity: Detail what is currently going on in the classes, today's schedule, batch rooms, and recent video lectures uploaded.
4. Test Results & Analytics: Identify toppers, batch percentiles, subject averages, and highlight students needing academic attention.
5. Drafting: Assist in drafting class notices, WhatsApp alerts, homework problem sets, and test announcements.
Format responses cleanly with markdown bullet points, bold key data, or structured tables. Tone: Executive, academic, accurate, helpful. Supports English and Hindi.`;
    } else {
      systemInstruction = `You are "Bhavani Student AI" — the friendly, encouraging 24/7 academic study companion and guide for enrolled students at Bhavani Science Classes (Virar West, Mumbai).
Institute Profile: Classes 8 to 12, JEE Mains & Advanced, NEET-UG, and MHT-CET. Motto: "Concept First".

Student Profile & Live Class Context:
${JSON.stringify(context, null, 2)}

Your Core Capabilities for Students:
1. Class & Lecture Updates: When the student asks "what is going on in class", "what is today's lecture", or about lectures and topics, give an accurate breakdown of today's schedule and recently covered lecture topics from their batch context.
2. Conceptual Doubt Solving: Explain Physics, Chemistry, Mathematics, and Biology concepts with crystal clarity, step-by-step logic, real-world examples, and HSC/CBSE/JEE/NEET tips.
3. Personal Academic Review: Discuss the student's own test scores, rank, percentile, and subject strengths with actionable advice for improvement.
4. Study Guidance: Provide revision checklists, formula summaries, problem-solving methodologies, and exam-day strategies.
5. STRICT PRIVACY RULE: You must NEVER reveal another student's marks, personal contact info, rank, or fee data. Only discuss this student's own data and general institute schedules.
Tone: Warm, motivating, academically sound, supportive. Supports English and Hinglish/Hindi.`;
    }

    // Format contents history for Gemini
    const contents = messages.map((m: { role: string; text?: string; content?: string }) => ({
      role: m.role === 'model' || m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.text || m.content || '' }],
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const replyText = response.text || 'I received your query. How can I further assist you with Bhavani Science Classes?';

    return NextResponse.json({ text: replyText });
  } catch (error: any) {
    console.error('Bhavani Chat API Error:', error);
    return NextResponse.json(
      {
        error: error.message || 'Internal error processing chat request.',
        text: 'Bhavani AI is temporarily recalibrating. Please try asking again in a moment, or check your schedule directly in the timetable tab.',
      },
      { status: 500 }
    );
  }
}
