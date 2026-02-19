import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateScript } from "@/lib/ai/openai";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { theme, prompt } = body;

    if (!theme || !prompt) {
      return NextResponse.json(
        { error: "Theme and prompt are required" },
        { status: 400 }
      );
    }

    const script = await generateScript(theme, prompt);
    return NextResponse.json({ script });
  } catch (error) {
    console.error("Generate script error:", error);
    return NextResponse.json(
      { error: "Failed to generate script" },
      { status: 500 }
    );
  }
}
