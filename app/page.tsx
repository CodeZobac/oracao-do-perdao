import OracaoCalendar from "@/components/oracao-calendar";

import { LanguageProvider } from "@/lib/language-context";

export default function Home() {
  return <LanguageProvider><OracaoCalendar /></LanguageProvider>;
}
