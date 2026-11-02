import User from "@/models/user.model";
import connectDB from "@/lib/mongoose";

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

export async function GET() {
  try {
    await connectDB();
    
    const users = await User.find({ accountStatus: "active" })
      .select("username streak solvedProblems easyproblemssolved mediumproblemssolved hardproblemssolved")
      .lean();

    // Calculate metrics for each user
    const leaderboard = users.map((user, index) => {
      const totalSolved = user.easyproblemssolved + user.mediumproblemssolved + user.hardproblemssolved;
      const streak = user.streak?.current || 0;
      
      // Calculate tier based on total problems solved
      let tier = "THRALL";
      let mmr = 1000 + (totalSolved * 10);
      
      if (totalSolved >= 100) {
        tier = "GOD OF WAR";
        mmr = 3000 + (totalSolved * 5);
      } else if (totalSolved >= 50) {
        tier = "AESIR GRANDMASTER";
        mmr = 2500 + (totalSolved * 8);
      } else if (totalSolved >= 25) {
        tier = "EINHERJAR MASTER";
        mmr = 2000 + (totalSolved * 10);
      } else if (totalSolved >= 10) {
        tier = "VALKYRIE ELITE";
        mmr = 1500 + (totalSolved * 15);
      } else if (totalSolved >= 5) {
        tier = "JARL CHAMPION";
        mmr = 1200 + (totalSolved * 12);
      }

      // Generate initials
      const initials = user.username
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

      // Calculate win rate (mock based on streak and problems solved)
      const winRate = totalSolved > 0 ? Math.min(99.9, 70 + (streak * 0.5) + (totalSolved * 0.1)).toFixed(1) : "0.0";

      return {
        rank: `#${String(index + 1).padStart(2, "0")}`,
        init: initials,
        name: user.username.toUpperCase(),
        clan: "Clan: Valhalla Warriors",
        tier: `${tier} (${mmr} MMR)`,
        win: `${winRate}%`,
        streak: streak > 0 ? `${streak} WINS IN A ROW` : "0 WINS",
        weapon: "C++23 (GCC)",
        hot: streak >= 5,
      };
    });

    // Sort by total problems solved (descending)
    leaderboard.sort((a, b) => {
      const aMmr = parseInt(a.tier.match(/\((\d+) MMR\)/)?.[1] || 0);
      const bMmr = parseInt(b.tier.match(/\((\d+) MMR\)/)?.[1] || 0);
      return bMmr - aMmr;
    });

    // Update ranks after sorting
    leaderboard.forEach((user, index) => {
      user.rank = `#${String(index + 1).padStart(2, "0")}`;
    });

    return json(leaderboard.slice(0, 10)); // Return top 10
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return json({ error: "Failed to fetch leaderboard" }, 500);
  }
}
