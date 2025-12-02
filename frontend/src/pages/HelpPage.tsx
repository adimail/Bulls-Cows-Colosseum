import BackToLobby from "../components/BackToLobby";

export default function HelpPage() {
  return (
    <div
      className="min-h-screen bg-image-overlay text-parchment font-roman"
      style={{
        backgroundImage:
          "url(https://plus.unsplash.com/premium_photo-1722201172121-a36b8ea02866?q=80&w=1287&auto=format&fit=crop)",
      }}
    >
      <div className="pillar-side left-0 border-r border-stone-800"></div>
      <div className="pillar-side right-0 border-l border-stone-800"></div>

      <div className="p-4 md:p-8 max-w-4xl mx-auto relative z-10">
        <BackToLobby />

        <header className="mb-12 text-center mt-12">
          <h1 className="text-4xl md:text-5xl font-cinzel font-bold text-gold-gradient mb-4 drop-shadow-lg">
            Rules of Engagement
          </h1>
          <div className="h-1 w-32 bg-gradient-to-r from-transparent via-amber-600 to-transparent mx-auto"></div>
        </header>

        <div className="card-legendary p-8 md:p-12 space-y-12">
          <section>
            <h2 className="text-xl md:text-2xl font-cinzel text-amber-500 mb-6 border-b border-stone-800 pb-2">
              I. The Objective
            </h2>
            <p className="text-lg text-stone-300 leading-relaxed">
              You must decipher your opponent's secret 4-digit code before they
              decipher yours. The code consists of four{" "}
              <strong className="text-amber-100">unique digits</strong>.
            </p>
          </section>

          <section>
            <h2 className="text-xl md:text-2xl font-cinzel text-amber-500 mb-6 border-b border-stone-800 pb-2">
              II. The Feedback
            </h2>
            <p className="text-base text-stone-300 mb-4">
              After every strike (guess), the gods will grant you insight:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-stone-900/50 p-6 border border-amber-900/30">
                <h3 className="text-lg font-cinzel font-bold text-amber-500 mb-2">
                  BULL (B)
                </h3>
                <p className="text-stone-400">
                  A correct digit in the{" "}
                  <strong className="text-white">correct position</strong>.
                  <br />
                  <span className="text-sm italic text-stone-500">
                    "A direct hit!"
                  </span>
                </p>
              </div>
              <div className="bg-stone-900/50 p-6 border border-stone-800">
                <h3 className="text-lg font-cinzel font-bold text-stone-400 mb-2">
                  COW (C)
                </h3>
                <p className="text-stone-400">
                  A correct digit, but in the{" "}
                  <strong className="text-white">wrong position</strong>.
                  <br />
                  <span className="text-sm italic text-stone-500">
                    "A glancing blow."
                  </span>
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl md:text-2xl font-cinzel text-amber-500 mb-6 border-b border-stone-800 pb-2">
              III. Example
            </h2>
            <div className="bg-black/40 p-6 border border-stone-800 font-mono text-base">
              <p className="mb-2">
                Enemy Secret: <span className="text-amber-500">1234</span>
              </p>
              <p className="mb-4">
                Your Guess: <span className="text-stone-300">1452</span>
              </p>
              <div className="h-px bg-stone-800 w-full mb-4"></div>
              <ul className="space-y-2 text-stone-400">
                <li>
                  <span className="text-amber-500 font-bold">1</span> is a Bull
                  (Correct spot)
                </li>
                <li>
                  <span className="text-stone-300 font-bold">4</span> is a Cow
                  (Wrong spot)
                </li>
                <li>
                  <span className="text-stone-300 font-bold">2</span> is a Cow
                  (Wrong spot)
                </li>
                <li className="pt-2 font-cinzel text-amber-100">
                  Result: 1 Bull, 2 Cows
                </li>
              </ul>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
