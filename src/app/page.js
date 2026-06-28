"use client";

import Link from "next/link";
import { ChatCircleDots, Lightning, Atom, CaretDown, ArrowRight } from "@phosphor-icons/react";
import MarketingNavbar from "@/components/MarketingNavbar";
import MarketingFooter from "@/components/MarketingFooter";
import { useAuthStore } from "@/lib/store";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const { user, checkAuth } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (user) {
      router.push("/inbox");
    }
  }, [user, router]);

  const [openFaq, setOpenFaq] = useState(0);

  const faqs = [
    { question: "AI is spotty. How do I know this will be different?", answer: "An AI tool is only as good as the models behind it. We've built Vela to support these models best possible. They aren't trained to do everything, and that's what makes them different. General LLMs have to do everything - writing code, essays, etc. Our models have been trained to excel in one thing only: emails. AI is not perfect, and even Vela can sometimes make mistakes, but in our testing, it's been pretty dang good." },
    { question: "What is your refund policy?", answer: "Because Vela provides immediate access to digital services and AI-generated content, refunds are generally not provided for accounts that have actively used the Service after purchase. If you believe you were charged in error or experienced a technical issue, you may request a refund review by contacting us in the support form (found in settings). Refund requests are reviewed on a case-by-case basis. We reserve the right to deny refund requests in cases of abuse, excessive usage, policy violations or repeated refund attempts." },
    { question: "Does Vela respect my privacy?", answer: "Yes. We never see your emails, and your client makes all the gmail api calls, never touching our cloud. Our entire backend database has 2 tables." },
    { question: "Is Vela free?", answer: "We offer a 7-day free trial on the Pro plan so you can experience the full power of Vela before committing." },
    { question: "Why command palette?", answer: "A command palette allows you to navigate and perform actions across the entire app without taking your hands off the keyboard, making you incredibly fast." },
    { question: "Why do I need an AI for my emails?", answer: "Email volume is constantly growing. AI helps you cut through the noise, summarize long threads, and draft replies instantly, saving you hours every week." }
  ];

  return (
    <div className="min-h-screen bg-white text-[#2B302F] selection:bg-gray-200 selection:text-black flex flex-col relative overflow-x-hidden z-0">
      
      {/* Background Gradient */}
      <div className="absolute top-0 left-0 right-0 h-[800px] bg-gradient-to-b from-[#50686C] to-white pointer-events-none -z-10"></div>

      <MarketingNavbar />
      
      <main className="w-full flex-1 flex flex-col items-center">
        {/* Hero Section */}
        <section className="pt-40 md:pt-48 pb-20 md:pb-24 px-6 md:px-12 w-full max-w-[1200px] mx-auto text-center flex flex-col items-center">
          <h1 className="text-[2.25rem] sm:text-4xl md:text-[3.5rem] lg:text-[4.2rem] font-semibold tracking-tight leading-[1.2] mb-8 text-white max-w-4xl mx-auto flex flex-wrap justify-center items-center gap-x-2 md:gap-x-3 gap-y-2">
            <span>The</span>
            <span className="inline-flex items-center justify-center bg-white/20 text-white rounded-[14px] md:rounded-[20px] w-10 h-8 md:w-[60px] md:h-[48px] align-middle backdrop-blur-sm">
              <ChatCircleDots weight="fill" className="w-5 h-5 md:w-7 md:h-7" />
            </span>
            <span>next generation</span>
            <span className="inline-flex items-center justify-center bg-white/20 text-white rounded-[14px] md:rounded-[20px] w-10 h-8 md:w-[60px] md:h-[48px] align-middle backdrop-blur-sm">
              <Lightning weight="fill" className="w-5 h-5 md:w-7 md:h-7" />
            </span>
            <span>of email</span>
            <span className="inline-flex items-center justify-center bg-white/20 text-white rounded-[14px] md:rounded-[20px] w-10 h-8 md:w-[60px] md:h-[48px] align-middle backdrop-blur-sm">
              <Atom weight="bold" className="w-5 h-5 md:w-7 md:h-7" />
            </span>
            <span>is here.</span>
          </h1>
          <p className="text-[#3c4a47] md:text-white/90 max-w-xl text-[15px] font-medium mb-10 leading-relaxed mix-blend-color-burn md:mix-blend-normal">
            Dealing with your cluttered inbox shouldn't feel like a full time<br/>job. Vela actually understands your inbox.
          </p>
          <div className="flex items-center justify-center gap-4 mb-6">
            <Link href="https://tally.so/r/Meg52p" target="_blank" rel="noopener noreferrer" className="bg-white text-[#414a48] px-5 py-2 rounded-full font-semibold text-[13px] shadow-[0_2px_10px_rgba(0,0,0,0.1)] hover:shadow-md transition-shadow flex items-center gap-1.5">
              Join the waitlist <ArrowRight weight="bold" />
            </Link>
            <Link href="/resources/vs-the-world" className="bg-transparent text-white border border-white/40 px-5 py-2 rounded-full font-semibold text-[13px] hover:bg-white/10 transition-colors">
              Learn more
            </Link>
          </div>
          <p className="text-[11px] text-[#4a5e5a] md:text-white/60 font-medium mix-blend-color-burn md:mix-blend-normal">Start with a 7-day free trial on the Pro plan. Cancel anytime.</p>
        </section>

        {/* Feature 1 */}
        <section className="py-24 px-6 md:px-12 w-full max-w-[1000px] mx-auto text-center flex flex-col items-center">
          <h2 className="text-[32px] md:text-[36px] font-semibold tracking-tight text-black mb-3">One place for all your emails</h2>
          <p className="text-gray-400 font-medium text-[14px] mb-14 max-w-2xl mx-auto">Copying and pasting your emails into LLMs is a waste of time. Vela fixes this.</p>
          <div className="w-full rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.06)] border border-gray-200/60 bg-white">
            <img src="/1.png" alt="Mailbox" className="w-full h-auto block" />
          </div>
        </section>

        {/* Feature 2 */}
        <section className="py-24 px-6 md:px-12 w-full max-w-[1000px] mx-auto text-center flex flex-col items-center">
          <h2 className="text-[32px] md:text-[36px] font-semibold tracking-tight text-black mb-3">Do the easy things... really well</h2>
          <p className="text-gray-400 font-medium text-[14px] mb-14 max-w-2xl mx-auto leading-relaxed">Vela can summarize and reply to emails for you. Our agents have been trained to specifically perform in their own fields, allowing our email ai agents to find details others miss.</p>
          <div className="w-full rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.06)] border border-gray-200/60 bg-white">
            <img src="/2.png" alt="Command Palette" className="w-full h-auto block" />
          </div>
          <div className="w-full mt-6 max-w-[700px] text-left self-start">
            <p className="text-[12px] text-gray-400 font-medium leading-relaxed">Our summarization and reply models are able to do their job exceptionally well because<br/>of the proprietary training and context it has.</p>
          </div>
        </section>

        {/* Feature 3 & 4 (AI) */}
        <section className="py-24 px-6 md:px-12 w-full max-w-[1000px] mx-auto text-center flex flex-col items-center">
          <h2 className="text-[32px] md:text-[36px] font-semibold tracking-tight text-black mb-3">AI wherever you are</h2>
          <p className="text-gray-400 font-medium text-[14px] mb-14 max-w-2xl mx-auto leading-relaxed">Hit ⌘ (ctrl) + k anywhere in the app to bring up the Command Palette. Search anything,<br/>navigate the app, or ask AI. Literally anything.</p>
          
          <div className="w-full max-w-3xl mx-auto flex flex-col items-center gap-8">
            <div className="w-full rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.06)] border border-gray-200/60 bg-white">
              <img src="/3.png" alt="AI Search Bar" className="w-full h-auto block" />
            </div>
            
            <div className="text-[13px] text-gray-400 font-medium">and then...</div>

            <div className="w-full rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.06)] border border-gray-200/60 bg-white">
              <img src="/4.png" alt="AI Search Results" className="w-full h-auto block" />
            </div>
          </div>
        </section>

        {/* Feature 5 */}
        <section className="py-24 px-6 md:px-12 w-full max-w-[1000px] mx-auto text-center flex flex-col items-center">
          <h2 className="text-[32px] md:text-[36px] font-semibold tracking-tight text-black mb-3">Write beautiful emails</h2>
          <p className="text-gray-400 font-medium text-[14px] mb-14 max-w-2xl mx-auto leading-relaxed">By yourself, or using AI. Our email composer supports markdown, and has a native AI tools / menu.</p>
          <div className="w-full max-w-[800px] rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.06)] border border-gray-200/60 bg-white">
            <img src="/5.png" alt="Composer" className="w-full h-auto block" />
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-32 px-6 md:px-12 w-full max-w-[700px] mx-auto flex flex-col">
          <h2 className="text-[32px] md:text-[36px] font-semibold tracking-tight text-black mb-16 text-center">Questions</h2>
          <div className="flex flex-col gap-0 w-full">
            {faqs.map((faq, i) => (
              <div key={i} className="border-b border-gray-100 last:border-b-0">
                <button 
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full py-6 flex items-center justify-between text-left focus:outline-none group"
                >
                  <span className="font-semibold text-black text-[14px] group-hover:text-gray-600 transition-colors">{faq.question}</span>
                  <CaretDown size={14} weight="bold" className={`text-gray-300 transition-transform duration-300 ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                <div 
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${openFaq === i ? 'max-h-40 pb-6 opacity-100' : 'max-h-0 opacity-0'}`}
                >
                  <p className="text-gray-500 font-medium text-[13px] leading-relaxed pr-8">{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 px-6 md:px-12 w-full text-center flex flex-col items-center">
          <h2 className="text-[32px] md:text-[36px] font-semibold tracking-tight text-black mb-3">Give your inbox the love<br />that it deserves</h2>
          <p className="text-gray-400 font-medium text-[14px] mb-10">Try vela for free, and fight back against your mountain of emails.</p>
          <Link href="https://tally.so/r/Meg52p" target="_blank" rel="noopener noreferrer" className="bg-[#5a6c68] hover:bg-[#4a5c58] text-white px-6 py-2.5 rounded-full font-semibold text-[13px] transition-colors shadow-sm flex items-center gap-1.5">
            Join the waitlist <ArrowRight weight="bold" />
          </Link>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
