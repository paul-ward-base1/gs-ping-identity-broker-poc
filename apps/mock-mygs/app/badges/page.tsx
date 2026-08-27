import { auth } from "@/auth";

const badges = [
  { name: "First Aid", status: "earned", emoji: "🩹" },
  { name: "Outdoor Explorer", status: "earned", emoji: "🌲" },
  { name: "Digital Leadership", status: "earned", emoji: "💻" },
  { name: "Financial Literacy", status: "earned", emoji: "💰" },
  { name: "Environmental Steward", status: "in-progress", emoji: "🌍" },
  { name: "STEM Innovator", status: "in-progress", emoji: "🔬" },
  { name: "Community Builder", status: "earned", emoji: "🤝" },
  { name: "Cybersecurity", status: "in-progress", emoji: "🔒" },
  { name: "Culinary Arts", status: "earned", emoji: "🍳" },
  { name: "Robotics", status: "locked", emoji: "🤖" },
  { name: "Aviation", status: "locked", emoji: "✈️" },
  { name: "Space Science", status: "locked", emoji: "🚀" },
];

export default async function BadgesPage() {
  await auth();

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">My Badges</h1>
      <p className="text-gray-500 mb-8">Track your badge progress and achievements.</p>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {badges.map((badge) => (
          <div
            key={badge.name}
            className={`rounded-lg border p-4 text-center transition-shadow ${
              badge.status === "earned"
                ? "bg-white border-blue-200 shadow-sm hover:shadow-md"
                : badge.status === "in-progress"
                  ? "bg-amber-50 border-amber-200"
                  : "bg-gray-100 border-gray-200 opacity-50"
            }`}
          >
            <div className="text-4xl mb-2">{badge.emoji}</div>
            <h3 className="font-medium text-sm text-gray-800">{badge.name}</h3>
            <span
              className={`inline-block mt-2 text-xs px-2 py-0.5 rounded-full font-medium ${
                badge.status === "earned"
                  ? "bg-blue-100 text-blue-700"
                  : badge.status === "in-progress"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-gray-200 text-gray-500"
              }`}
            >
              {badge.status === "earned"
                ? "Earned"
                : badge.status === "in-progress"
                  ? "In Progress"
                  : "Locked"}
            </span>
          </div>
        ))}
      </div>

      <p className="mt-6 text-sm text-gray-400 text-center">Mock data for PoC demonstration.</p>
    </div>
  );
}
