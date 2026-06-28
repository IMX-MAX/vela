"use client";

import Link from "next/link";
import { ChatCircle, Lightning, Sparkle, CaretDown } from "@phosphor-icons/react";
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

  const [openFaq, setOpenFaq] = useState(null);

  const faqs = [
    { question: "Can I use Vela with my existing email?", answer: "Yes, you can connect your existing Gmail or Outlook account to Vela. Vela acts as a layer on top of your current provider, so you don't have to change your email address." },
    { question: "How does the AI work?", answer: "Our AI models are specially trained on email workflows to understand context, draft replies, and summarize long threads, all while keeping your data private and secure." },
    { question: "Is it secure?", answer: "Absolutely. We don't train our AI on your personal data, and all emails are encrypted. Our models are hosted with strict data privacy laws." },
    { question: "Who is behind Vela?", answer: "Vela is built by a small, dedicated team of engineers and designers who were frustrated with the state of modern email clients." },
    { question: "May I join the beta program?", answer: "We are currently rolling out beta access to users on our waitlist. Sign up today to reserve your spot." }
  ];

  return (
    <div className="min-h-screen bg-white text-[#2B302F] selection:bg-gray-200 selection:text-black flex flex-col relative overflow-x-hidden">
      
      {/* Background Gradient */}
      <div className="absolute top-0 left-0 right-0 h-[800px] bg-gradient-to-b from-[#6a7c79] via-[#9eb0ad] to-white pointer-events-none -z-10"></div>

      <MarketingNavbar />
      
      <main className="w-full flex-1 flex flex-col items-center">
        <section className="pt-40 md:pt-48 pb-20 md:pb-24 px-6 md:px-12 w-full max-w-[1200px] mx-auto text-center flex flex-col items-center z-10">
          <h1 className="text-[2.25rem] sm:text-4xl md:text-[3.5rem] lg:text-[4.2rem] font-semibold tracking-tight leading-[1.2] mb-8 text-white max-w-4xl mx-auto flex flex-wrap justify-center items-center gap-x-2 md:gap-x-3 gap-y-2">
            <span>The</span>
            <span className="inline-flex items-center justify-center bg-[#5c6d6a] text-white rounded-xl md:rounded-[20px] w-10 h-8 md:w-[60px] md:h-[48px] shadow-sm align-middle">
              <ChatCircle weight="fill" className="w-5 h-5 md:w-7 md:h-7" />
            </span>
            <span>next generation</span>
            <span className="inline-flex items-center justify-center bg-white text-black rounded-xl md:rounded-[20px] w-10 h-8 md:w-[60px] md:h-[48px] shadow-sm align-middle">
              <Lightning weight="fill" className="w-5 h-5 md:w-7 md:h-7" />
            </span>
            <span>of email</span>
            <span className="inline-flex items-center justify-center bg-[#b8c2c0] text-[#414A48] rounded-xl md:rounded-[20px] w-10 h-8 md:w-[60px] md:h-[48px] shadow-sm align-middle">
              <Sparkle weight="fill" className="w-5 h-5 md:w-7 md:h-7" />
            </span>
            <span>is here.</span>
          </h1>
          <p className="text-white/90 max-w-xl text-lg font-medium mb-10 leading-relaxed">
            Lightning fast, AI powered, and designed to help you get through your inbox in record time.
          </p>
          <div className="flex items-center justify-center gap-4 mb-6">
            <Link href="/login" className="bg-white text-black px-6 py-2.5 rounded-full font-semibold text-[14px] shadow-[0_2px_10px_rgba(0,0,0,0.1)] hover:shadow-md transition-shadow">
              Get started
            </Link>
            <Link href="/resources/vs-the-world" className="bg-transparent text-white border border-white/30 px-6 py-2.5 rounded-full font-semibold text-[14px] hover:bg-white/10 transition-colors">
              Learn more
            </Link>
          </div>

          <p className="text-[13px] text-white/70 font-medium">Free to use, no credit card required.</p>
        </section>

        {/* Feature 1 */}
        <section className="py-24 px-6 md:px-12 w-full max-w-[1000px] mx-auto text-center flex flex-col items-center">
          <h2 className="text-[32px] font-semibold tracking-tight text-black mb-4">One place for all your emails</h2>
          <p className="text-gray-500 font-medium text-[15px] mb-14">Stop juggling 5 different email apps and bring them all into one place for the ultimate inbox.</p>
          <div className="w-full rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.06)] border border-gray-200/60 bg-white">
            <img src="/1.png" alt="Mailbox" className="w-full h-auto block" />
          </div>
        </section>

        {/* Feature 2 */}
        <section className="py-24 px-6 md:px-12 w-full max-w-[1000px] mx-auto text-center flex flex-col items-center">
          <h2 className="text-[32px] font-semibold tracking-tight text-black mb-4">Do the easy things.. really well</h2>
          <p className="text-gray-500 font-medium text-[15px] mb-14 max-w-2xl mx-auto leading-relaxed">Vela was built around keyboard shortcuts from day one. You'll zip through your inbox faster than ever before. Select 500 emails and mark them all as read in 300 milliseconds.</p>
          <div className="w-full rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.06)] border border-gray-200/60 bg-white">
            <img src="/2.png" alt="Command Palette" className="w-full h-auto block" />
          </div>
          <p className="text-[13px] text-gray-400 font-medium mt-8 max-w-2xl text-left leading-relaxed">It's not just shortcuts; it's a fluid interface that anticipates what you want to do. Navigate your inbox, manage threads, and organize your life with unprecedented speed.</p>
        </section>

        {/* Feature 3 & 4 (AI) */}
        <section className="py-24 px-6 md:px-12 w-full max-w-[1000px] mx-auto text-center flex flex-col items-center">
          <h2 className="text-[32px] font-semibold tracking-tight text-black mb-4">AI wherever you are</h2>
          <p className="text-gray-500 font-medium text-[15px] mb-14 max-w-2xl mx-auto leading-relaxed">Vela is built to bring AI everywhere in your email workflow. Ask it to find emails for you, draft emails, and even summarize threads.</p>
          
          <div className="w-full max-w-3xl mx-auto flex flex-col gap-10">
            <div className="w-full rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.06)] border border-gray-200/60 bg-white">
              <img src="/3.png" alt="AI Search Bar" className="w-full h-auto block" />
            </div>
            
            <div className="text-[13px] text-gray-400 font-semibold tracking-widest uppercase">And then</div>

            <div className="w-full rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.06)] border border-gray-200/60 bg-white">
              <img src="/4.png" alt="AI Search Results" className="w-full h-auto block" />
            </div>
          </div>
        </section>

        {/* Feature 5 */}
        <section className="py-24 px-6 md:px-12 w-full max-w-[1000px] mx-auto text-center flex flex-col items-center">
          <h2 className="text-[32px] font-semibold tracking-tight text-black mb-4">Write beautiful emails</h2>
          <p className="text-gray-500 font-medium text-[15px] mb-14 max-w-2xl mx-auto leading-relaxed">Our markdown editor allows you to write beautiful, rich emails without ever having to touch a mouse.</p>
          <div className="w-full max-w-[800px] rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.06)] border border-gray-200/60 bg-white">
            <img src="/5.png" alt="Composer" className="w-full h-auto block" />
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-32 px-6 md:px-12 w-full max-w-[800px] mx-auto flex flex-col">
          <h2 className="text-[32px] font-semibold tracking-tight text-black mb-16 text-center">Questions</h2>
          <div className="flex flex-col gap-0 w-full border-t border-gray-200">
            {faqs.map((faq, i) => (
              <div key={i} className="border-b border-gray-200">
                <button 
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full py-6 flex items-center justify-between text-left focus:outline-none group"
                >
                  <span className="font-semibold text-black text-[16px] group-hover:text-gray-600 transition-colors">{faq.question}</span>
                  <CaretDown size={16} weight="bold" className={`text-gray-400 transition-transform duration-300 ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                <div 
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${openFaq === i ? 'max-h-40 pb-6 opacity-100' : 'max-h-0 opacity-0'}`}
                >
                  <p className="text-gray-500 font-medium text-[15px] leading-relaxed pr-8">{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 px-6 md:px-12 w-full text-center flex flex-col items-center">
          <h2 className="text-[32px] font-semibold tracking-tight text-black mb-4">Give your inbox the love<br />that it deserves</h2>
          <p className="text-gray-500 font-medium text-[15px] mb-10">Try Vela for free today. It takes 10 seconds to create an account.</p>
          <Link href="/login" className="bg-[#415351] hover:bg-[#2c3837] text-white px-8 py-3 rounded-full font-semibold text-[15px] transition-colors shadow-md">
            Get started &rarr;
          </Link>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
