import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bitcoin, Brain, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ParticleBackground } from "@/components/ParticleBackground";
import { toast } from "sonner";

const STX_ADDRESS_REGEX = /^S[PM][A-Z0-9]{20,}$/i;
const BTC_ADDRESS_REGEX = /^(bc1|[13])[a-zA-Z0-9]{20,}$/i;

const Index = () => {
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem("aibtcsigview:last-address");
    if (saved) setAddress(saved);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = address.trim();
    if (!cleaned) {
      toast.error("Please enter a wallet address");
      return;
    }

    if (cleaned.includes("...") || (!STX_ADDRESS_REGEX.test(cleaned) && !BTC_ADDRESS_REGEX.test(cleaned))) {
      toast.error("Please enter a valid BTC or STX address");
      return;
    }

    setLoading(true);
    localStorage.setItem("aibtcsigview:last-address", cleaned);
    navigate(`/dashboard?address=${encodeURIComponent(cleaned)}`);
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-4 grid-bg overflow-hidden">
      <ParticleBackground />

      <div className="relative z-10 flex flex-col items-center max-w-2xl w-full animate-fade-in">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-primary/20 border border-primary/40 flex items-center justify-center glow-orange">
              <Bitcoin className="w-7 h-7 text-primary" />
            </div>
            <Brain className="w-5 h-5 text-success absolute -top-1 -right-1" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            <span className="text-gradient-orange">AIBTC</span>
            <span className="text-foreground">SigView</span>
          </h1>
        </div>

        {/* Tagline */}
        <p className="text-muted-foreground text-lg md:text-xl mb-10 text-center">
          Real-time Intelligence for Your AIBTC Agent
        </p>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="w-full max-w-xl space-y-4">
          <div className="glass-card p-2 flex gap-2">
            <Input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter BTC or STX Agent Wallet Address (bc1q... or SP2Z...)"
              className="flex-1 border-0 bg-transparent text-foreground placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0 h-12 text-base"
            />
            <Button type="submit" variant="glow" size="lg" disabled={loading} className="px-6 h-12 text-base">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  Load Dashboard
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>

          <p className="text-muted-foreground text-sm text-center">
            Supports Bitcoin & Stacks addresses. Data fetched live from AIBTC APIs.
          </p>
        </form>

        {/* Quick demo link */}
        <button
          type="button"
          onClick={() => setAddress("bc1qd90yysnw98t2wz0sy53hmh8vvkhmskq7ftxzcv")}
          className="mt-8 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          Try with a demo address →
        </button>
      </div>
    </div>
  );
};

export default Index;
