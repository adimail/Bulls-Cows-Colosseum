package game

import (
	"crypto/rand"
	"math/big"
	mrand "math/rand"
	"time"
)

type PlayerID string

const (
	Player1 PlayerID = "p1"
	Player2 PlayerID = "p2"
)

type Guess struct {
	Code      string `json:"code"`
	Bulls     int    `json:"bulls"`
	Cows      int    `json:"cows"`
	Timestamp int64  `json:"timestamp"`
}

type PlayerState struct {
	ID       PlayerID `json:"id"`
	Name     string   `json:"name"`
	Secret   string   `json:"secret"`
	Guesses  []Guess  `json:"guesses"`
	IsWinner bool     `json:"isWinner"`
	IsReady  bool     `json:"isReady"`
}

type GameState struct {
	RoomCode   string       `json:"roomCode"`
	Status     string       `json:"status"`
	Turn       PlayerID     `json:"turn"`
	OwnerID    PlayerID     `json:"ownerId"`
	P1         *PlayerState `json:"p1"`
	P2         *PlayerState `json:"p2"`
	Spectators int          `json:"spectators"`
	Winner     string       `json:"winner,omitempty"`
}

func NewGame(roomCode string) *GameState {
	return &GameState{
		RoomCode: roomCode,
		Status:   "waiting",
		Turn:     Player1,
		OwnerID:  Player1,
		P1:       &PlayerState{ID: Player1, Guesses: []Guess{}},
		P2:       &PlayerState{ID: Player2, Guesses: []Guess{}},
	}
}

func (g *GameState) SetSecret(pid PlayerID, secret string) {
	if pid == Player1 {
		g.P1.Secret = secret
		g.P1.IsReady = true
	} else {
		g.P2.Secret = secret
		g.P2.IsReady = true
	}

	if g.P1.IsReady && g.P2.IsReady {
		g.Status = "active"
		g.Turn = Player1
	}
}

func (g *GameState) MakeGuess(pid PlayerID, code string) {
	var guesser, opponent *PlayerState
	if pid == Player1 {
		guesser = g.P1
		opponent = g.P2
	} else {
		guesser = g.P2
		opponent = g.P1
	}

	bulls, cows := CalculateBullsCows(code, opponent.Secret)
	guess := Guess{
		Code:      code,
		Bulls:     bulls,
		Cows:      cows,
		Timestamp: time.Now().UnixMilli(),
	}

	guesser.Guesses = append([]Guess{guess}, guesser.Guesses...)

	if bulls == 4 {
		g.Status = "completed"
		guesser.IsWinner = true
		g.Winner = string(pid)
		g.P1.IsReady = false
		g.P2.IsReady = false
	} else {
		if g.Turn == Player1 {
			g.Turn = Player2
		} else {
			g.Turn = Player1
		}
	}
}

func (g *GameState) Reset() {
	if g.P2.Name != "" {
		g.Status = "setup"
	} else {
		g.Status = "waiting"
	}
	g.Turn = Player1
	g.P1.Secret = ""
	g.P1.Guesses = []Guess{}
	g.P1.IsWinner = false
	g.P1.IsReady = false
	g.P2.Secret = ""
	g.P2.Guesses = []Guess{}
	g.P2.IsWinner = false
	g.P2.IsReady = false
	g.Winner = ""
}

func CalculateBullsCows(guess, secret string) (int, int) {
	bulls := 0
	cows := 0
	secretArr := []rune(secret)
	guessArr := []rune(guess)

	for i := 0; i < 4; i++ {
		if guessArr[i] == secretArr[i] {
			bulls++
			secretArr[i] = 'X'
			guessArr[i] = 'Y'
		}
	}

	for i := 0; i < 4; i++ {
		if guessArr[i] != 'Y' {
			for j := 0; j < 4; j++ {
				if guessArr[i] == secretArr[j] {
					cows++
					secretArr[j] = 'X'
					break
				}
			}
		}
	}

	return bulls, cows
}

func GenerateRoomCode() string {
	const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	const length = 6
	b := make([]byte, length)
	for i := range b {
		n, err := rand.Int(rand.Reader, big.NewInt(int64(len(charset))))
		if err != nil {
			b[i] = charset[mrand.Intn(len(charset))]
			continue
		}
		b[i] = charset[n.Int64()]
	}
	return string(b)
}

func IsValidSecret(code string) bool {
	if len(code) != 4 {
		return false
	}
	seen := make(map[rune]bool)
	for _, r := range code {
		if r < '0' || r > '9' {
			return false
		}
		if seen[r] {
			return false
		}
		seen[r] = true
	}
	return true
}
