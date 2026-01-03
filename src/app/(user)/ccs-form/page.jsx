import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { CCSForm } from "./_components/ccs-form";

export const metadata = {
  title: "CCS Form - Centralized Cluster System",
  description:
    "Form untuk merekodkan mutarobbi yang mufaraqah/dibuang dari halaqoh",
};

export default async function CCSFormPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect("/sign-in");
  }

  return (
    <div className="flex flex-col">
      <h1 className="text-2xl font-bold mb-2">
        Centralized Cluster System (CCS)
      </h1>
      <p className="text-muted-foreground mb-6">
        Borang untuk merekodkan data mutarobbi yang mufaraqah/dibuang dari
        halaqoh program
      </p>

      <CCSForm />
    </div>
  );
}
