package sheets

import (
	"context"
	"fmt"
	"log/slog"
	"os"
	"time"

	"github.com/adimail/colosseum/internal/game"
	"github.com/joho/godotenv"
	"golang.org/x/oauth2/google"
	"google.golang.org/api/option"
	"google.golang.org/api/sheets/v4"
)

const sheetName = "Games"

type GameRecord struct {
	Timestamp string `json:"timestamp"`
	P1Name    string `json:"p1Name"`
	P2Name    string `json:"p2Name"`
	Winner    string `json:"winner"`
}

type Service struct {
	sheetsService *sheets.Service
	spreadsheetID string
}

func New() (*Service, error) {
	// Load .env file
	if err := godotenv.Load(); err != nil {
		slog.Warn("no .env file found")
	}

	// Get spreadsheet ID from environment
	spreadsheetID := os.Getenv("SPREADSHEET_ID")
	if spreadsheetID == "" {
		return nil, fmt.Errorf("SPREADSHEET_ID not set in environment")
	}

	// Get credentials JSON from environment
	credsJSON := os.Getenv("GOOGLE_CREDENTIALS_JSON")
	if credsJSON == "" {
		return nil, fmt.Errorf("GOOGLE_CREDENTIALS_JSON not set in environment")
	}

	ctx := context.Background()

	// Parse credentials from JSON string
	creds, err := google.CredentialsFromJSON(ctx, []byte(credsJSON), sheets.SpreadsheetsScope)
	if err != nil {
		return nil, fmt.Errorf("unable to parse credentials: %v", err)
	}

	// Create Sheets service
	srv, err := sheets.NewService(ctx, option.WithCredentials(creds))
	if err != nil {
		return nil, fmt.Errorf("unable to retrieve Sheets client: %v", err)
	}

	return &Service{
		sheetsService: srv,
		spreadsheetID: spreadsheetID,
	}, nil
}

func (s *Service) RecordGame(gs *game.GameState) {
	var winnerName string
	if gs.Winner == string(game.Player1) {
		winnerName = gs.P1.Name
	} else {
		winnerName = gs.P2.Name
	}

	row := &sheets.ValueRange{
		Values: [][]interface{}{
			{
				time.Now().UTC().Format(time.RFC3339),
				gs.P1.Name,
				gs.P2.Name,
				winnerName,
			},
		},
	}

	_, err := s.sheetsService.Spreadsheets.Values.Append(
		s.spreadsheetID,
		sheetName,
		row,
	).ValueInputOption("USER_ENTERED").Do()

	if err != nil {
		slog.Error("failed to record game to Google Sheets", "error", err)
	} else {
		slog.Info("successfully recorded game to Google Sheets", "room", gs.RoomCode)
	}
}

func (s *Service) GetRecentGames(limit int) ([]GameRecord, error) {
	readRange := fmt.Sprintf("%s!A:D", sheetName)

	resp, err := s.sheetsService.Spreadsheets.Values.Get(s.spreadsheetID, readRange).Do()
	if err != nil {
		return nil, fmt.Errorf("unable to retrieve data from sheet: %v", err)
	}

	var records []GameRecord
	if len(resp.Values) <= 1 {
		return records, nil
	}

	startIndex := len(resp.Values) - 1
	count := 0

	for i := startIndex; i > 0 && count < limit; i-- {
		row := resp.Values[i]
		if len(row) < 4 {
			continue
		}

		record := GameRecord{
			Timestamp: fmt.Sprintf("%v", row[0]),
			P1Name:    fmt.Sprintf("%v", row[1]),
			P2Name:    fmt.Sprintf("%v", row[2]),
			Winner:    fmt.Sprintf("%v", row[3]),
		}

		records = append(records, record)
		count++
	}

	return records, nil
}
