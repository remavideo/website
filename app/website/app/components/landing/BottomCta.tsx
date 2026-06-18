import { Button, Input } from "@heroui/react";
import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { joinWaitlist } from "../../server/waitlist";

export function BottomCta() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || pending) return;
    setPending(true);
    setError(null);
    try {
      await joinWaitlist({ data: { email } });
      setSubmitted(true);
    } catch {
      setError("Something went wrong — please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <section id="waitlist" className="py-28">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* The CTA is itself a broadcast monitor */}
        <div className="scanlines relative rounded-3xl bg-screen border border-screen-line overflow-hidden px-6 sm:px-14 py-16 text-center shadow-[0_32px_80px_-32px_rgba(20,12,6,0.6)]">
          <div className="absolute inset-0 bg-[radial-gradient(110%_100%_at_50%_0%,#34200f_0%,#160f0a_55%,#0c0b09_100%)]" />
          <div className="absolute inset-x-0 top-0 smpte-strip h-[3px] opacity-80" />

          <div className="relative">
            <div className="inline-flex items-center gap-2 mb-7 font-mono text-[11px] tracking-[0.18em] text-[#a2967f]">
              <span className="tally-pulse w-2 h-2 rounded-full bg-[#f85149]" />
              EARLY ACCESS
            </div>

            <h2 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-[#f7f2e7] mb-5 leading-[1.08]">
              Your first pipeline,
              <br />
              live in <span className="text-[#ff7a42]">five minutes.</span>
            </h2>

            <p className="text-[#bfb49c] text-lg leading-relaxed mb-10 max-w-md mx-auto">
              Join the waitlist for hosted rema, or grab the open-source version
              and run it yourself today. No credit card, no lock-in.
            </p>

            {submitted ? (
              <div className="caption-bar inline-block rounded-[3px] px-4 py-2 text-sm tracking-wide">
                YOU'RE ON THE LIST — WE'LL BE IN TOUCH.
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
              >
                <Input
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onValueChange={setEmail}
                  size="lg"
                  variant="bordered"
                  classNames={{
                    inputWrapper:
                      "border-[#3e372c] bg-[#191613] hover:border-[#5a5044] focus-within:!border-[#ff7a42]",
                    input:
                      "text-[#f3eee3] placeholder:text-[#857a66] font-mono text-sm",
                  }}
                  required
                />
                <Button
                  type="submit"
                  size="lg"
                  isLoading={pending}
                  className="font-semibold px-7 shrink-0 bg-[#ff7a42] text-[#1c0d04]"
                  endContent={pending ? undefined : <ArrowRight size={15} />}
                >
                  Get early access
                </Button>
              </form>
            )}

            {error && (
              <p className="mt-4 text-xs text-[#ff7a42]" role="alert">
                {error}
              </p>
            )}

            <p className="mt-6 text-xs text-[#857a66]">
              Self-hosting is{" "}
              <span className="text-[#bfb49c]">coming soon</span>.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
