import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";

function isValidEmail(s: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (String(body._gotcha ?? "").trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  const authClient = await createServerClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();
  if (!user || !user.email) {
    return NextResponse.json({ error: "Please sign in to leave a review." }, { status: 401 });
  }

  const email = user.email.trim().toLowerCase();
  const localPart = email.split("@")[0] ?? "Customer";
  const normalizedName =
    localPart
      .replace(/[._-]+/g, " ")
      .trim()
      .split(/\s+/)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ")
      .slice(0, 80) || "Customer";
  const review = String(body.review ?? "").trim();
  const ratingRaw = Number(body.rating);
  const page = String(body.page ?? "").slice(0, 2048);

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }
  if (!Number.isInteger(ratingRaw) || ratingRaw < 1 || ratingRaw > 5) {
    return NextResponse.json({ error: "Please choose a rating from 1 to 5 stars." }, { status: 400 });
  }
  if (review.length < 20 || review.length > 1200) {
    return NextResponse.json(
      { error: "Review should be between 20 and 1200 characters." },
      { status: 400 }
    );
  }

  try {
    const { error } = await authClient.from("customer_reviews").insert({
      name: normalizedName,
      email: email || null,
      rating: ratingRaw,
      review,
      page: page || null,
      source: "website",
      status: "pending",
    });

    if (error) {
      console.error("customer_reviews insert:", error);
      return NextResponse.json(
        { error: "We could not save your review right now. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("reviews POST:", error);
    return NextResponse.json(
      { error: "We could not submit your review right now. Please try again." },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !anonKey) {
      return NextResponse.json({ reviews: [] });
    }

    const requestUrl = new URL(request.url);
    const limitParam = Number(requestUrl.searchParams.get("limit"));
    const limit = Number.isFinite(limitParam)
      ? Math.max(1, Math.min(12, Math.floor(limitParam)))
      : 6;

    const supabase = createClient(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data, error } = await supabase
      .from("customer_reviews")
      .select("id,name,rating,review,source,created_at")
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(limit);

    const { data: ratingRows, error: ratingError } = await supabase
      .from("customer_reviews")
      .select("rating")
      .eq("status", "approved")
      .limit(2000);

    if (error || ratingError) {
      console.error("reviews GET:", error ?? ratingError);
      return NextResponse.json({ error: "Could not load reviews." }, { status: 500 });
    }

    const ratings = (ratingRows ?? []).map((row) => Number((row as { rating: number }).rating)).filter(Boolean);
    const totalApproved = ratings.length;
    const overallRating = totalApproved
      ? Number((ratings.reduce((sum, value) => sum + value, 0) / totalApproved).toFixed(1))
      : null;

    return NextResponse.json({
      reviews: data ?? [],
      summary: {
        overall_rating: overallRating,
        total_reviews: totalApproved,
      },
    });
  } catch (error) {
    console.error("reviews GET:", error);
    return NextResponse.json({ error: "Could not load reviews." }, { status: 500 });
  }
}
