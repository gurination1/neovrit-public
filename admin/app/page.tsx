import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

type Lead = {
  id: string;
  created_at: string;
  operative: string;
  email: string;
  whatsapp: string | null;
  institute: string | null;
  role: string | null;
  objective: string | null;
  vr_headsets: string | null;
  deploy_window: string | null;
  live_demo: string | null;
};

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Kolkata",
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

function formatIst(value: string) {
  return dateFormatter.format(new Date(value));
}

export default async function Home() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing Supabase environment variables");
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const leads = (data ?? []) as Lead[];

  return (
    <main className="min-h-screen px-6 py-8 md:px-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <header className="flex flex-col gap-2 border border-white/10 bg-white/3 px-6 py-5">
          <p className="text-xs uppercase tracking-[0.42em] text-[#00D4FF]">
            Neovrit Command
          </p>
          <h1 className="font-[family-name:var(--font-unbounded)] text-2xl uppercase tracking-[0.12em] text-[#EEF2FF] md:text-3xl">
            TOTAL SIGNALS: {leads.length}
          </h1>
        </header>

        <div className="overflow-x-auto border border-white/10 bg-black/20">
          <table className="min-w-full border-collapse text-left text-sm">
            <thead className="border-b border-white/10 bg-white/4 text-[#00D4FF]">
              <tr>
                <th className="px-4 py-3 font-medium">Date/Time</th>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">WhatsApp</th>
                <th className="px-4 py-3 font-medium">Institute</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Objective</th>
                <th className="px-4 py-3 font-medium">Headsets</th>
                <th className="px-4 py-3 font-medium">Deploy Window</th>
                <th className="px-4 py-3 font-medium">Live Demo</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead, index) => (
                <tr
                  key={lead.id}
                  className={index % 2 === 0 ? "bg-white/3 text-white" : "bg-white/7 text-white/90"}
                >
                  <td className="px-4 py-3 align-top whitespace-nowrap">
                    {formatIst(lead.created_at)}
                  </td>
                  <td className="px-4 py-3 align-top">{lead.operative}</td>
                  <td className="px-4 py-3 align-top">{lead.email}</td>
                  <td className="px-4 py-3 align-top">{lead.whatsapp || "—"}</td>
                  <td className="px-4 py-3 align-top">{lead.institute || "—"}</td>
                  <td className="px-4 py-3 align-top">{lead.role || "—"}</td>
                  <td className="px-4 py-3 align-top">{lead.objective || "—"}</td>
                  <td className="px-4 py-3 align-top">{lead.vr_headsets || "—"}</td>
                  <td className="px-4 py-3 align-top">{lead.deploy_window || "—"}</td>
                  <td className="px-4 py-3 align-top">{lead.live_demo || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
