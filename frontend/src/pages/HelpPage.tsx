import { useNavigate } from "react-router-dom";

export default function HelpPage() {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen bg-image-overlay text-parchment font-roman"
      style={{
        backgroundImage:
          "url(https://plus.unsplash.com/premium_photo-1722201172121-a36b8ea02866?q=80&w=1287&auto=format&fit=crop)",
      }}
    >
      <div className="p-4 md:p-8 max-w-4xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-3xl md:text-5xl font-cinzel text-bronze mb-4">
            How to Play
          </h1>
          <button
            onClick={() => navigate(-1)}
            className="text-stone-light hover:text-bronze transition-colors"
          >
            &larr; Go Back
          </button>
        </header>

        <div className="space-y-8 bg-dark-card/80 backdrop-blur-sm p-6 md:p-8 border border-bronze/30">
          <section>
            <h2 className="text-2xl md:text-3xl font-cinzel text-stone-light mb-4 border-b border-bronze/20 pb-2">
              The Objective
            </h2>
            <p className="text-lg text-stone-light leading-relaxed">
              Be the first player to guess your opponent's secret 4-digit code.
              The code must contain four unique digits (e.g., 1234 is valid, but
              1123 is not).
            </p>
          </section>

          <section>
            <h2 className="text-2xl md:text-3xl font-cinzel text-stone-light mb-4 border-b border-bronze/20 pb-2">
              Gameplay
            </h2>
            <ol className="list-decimal list-inside space-y-4 text-stone-light text-lg">
              <li>
                <strong className="text-parchment">Set Your Secret:</strong> At
                the start, both players secretly choose a 4-digit number with
                unique digits.
              </li>
              <li>
                <strong className="text-parchment">Take Turns Guessing:</strong>{" "}
                Players take turns guessing their opponent's code. Each guess
                must also be a 4-digit number with unique digits.
              </li>
              <li>
                <strong className="text-parchment">
                  Receive Feedback (Bulls & Cows):
                </strong>{" "}
                After each guess, you'll receive feedback:
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                  <li>
                    <strong className="text-bronze">Bull (B):</strong> A correct
                    digit in the correct position.
                  </li>
                  <li>
                    <strong className="text-bronze">Cow (C):</strong> A correct
                    digit but in the wrong position.
                  </li>
                </ul>
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl md:text-3xl font-cinzel text-stone-light mb-4 border-b border-bronze/20 pb-2">
              Example
            </h2>
            <p className="text-lg text-stone-light mb-4">
              Let's say the opponent's secret code is{" "}
              <strong className="font-nums text-bronze tracking-wider">
                1234
              </strong>
              .
            </p>
            <p className="text-lg text-stone-light">
              If you guess{" "}
              <strong className="font-nums text-parchment tracking-wider">
                1452
              </strong>
              , the feedback would be:
            </p>
            <div className="mt-2 bg-dark-stone/50 p-4 border border-bronze/20">
              <p className="text-xl text-center font-bold text-bronze">
                1 Bull, 2 Cows
              </p>
              <ul className="list-disc list-inside text-stone-light mt-2">
                <li>
                  The digit <strong className="font-nums">1</strong> is a Bull
                  (correct digit, correct position).
                </li>
                <li>
                  The digit <strong className="font-nums">4</strong> is a Cow
                  (correct digit, wrong position).
                </li>
                <li>
                  The digit <strong className="font-nums">2</strong> is a Cow
                  (correct digit, wrong position).
                </li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl md:text-3xl font-cinzel text-stone-light mb-4 border-b border-bronze/20 pb-2">
              Winning the Game
            </h2>
            <p className="text-lg text-stone-light leading-relaxed">
              The first player to correctly guess the opponent's code (achieving
              4 Bulls) wins the game.
            </p>
          </section>

          <section>
            <h2 className="text-2xl md:text-3xl font-cinzel text-stone-light mb-4 border-b border-bronze/20 pb-2">
              Online Play
            </h2>
            <ul className="list-disc list-inside space-y-3 text-stone-light text-lg">
              <li>
                <strong className="text-parchment">Create a Game:</strong> From
                the lobby, click "Create New Game", enter your name, and you'll
                get a unique room code to share with a friend.
              </li>
              <li>
                <strong className="text-parchment">Join a Game:</strong> Enter a
                room code from a friend, or join any open game from the Public
                Lobby list.
              </li>
              <li>
                <strong className="text-parchment">Spectate:</strong> If a game
                is already full, you can watch it by clicking the "Spectate"
                button.
              </li>
              <li>
                <strong className="text-parchment">Rematch:</strong> After a
                game ends, both players will have the option to play again.
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
