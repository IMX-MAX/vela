import { redirect } from "next/navigation";

export default function SettingsBasePage({ searchParams }) {
  const query = new URLSearchParams(searchParams).toString();
  redirect(`/inbox/settings/profile${query ? `?${query}` : ""}`);
}
