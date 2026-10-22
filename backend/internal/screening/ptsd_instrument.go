// Package screening holds the scoring rules for self-screening instruments.
package screening

import "fmt"

// MOCK instrument: placeholder items and cut-offs for exercising the workflow.
// Not clinically validated. Keep in sync with lib/screening/ptsd-instrument.ts.
const (
	PtsdInstrumentID = "ptsd-mock-v1"
	PtsdItemCount    = 8
	PtsdMaxAnswer    = 4
	ptsdModerateMin  = 11
	ptsdHighMin      = 21
)

// PresentationModes are the ways a screening can be delivered to the patient.
var PresentationModes = map[string]bool{"text": true, "audio": true, "avatar": true}

// ScorePtsd validates the answers and returns the total score and severity band.
func ScorePtsd(answers []int) (int, string, error) {
	if len(answers) != PtsdItemCount {
		return 0, "", fmt.Errorf("expected %d answers, got %d", PtsdItemCount, len(answers))
	}
	total := 0
	for i, answer := range answers {
		if answer < 0 || answer > PtsdMaxAnswer {
			return 0, "", fmt.Errorf("answer %d must be between 0 and %d", i+1, PtsdMaxAnswer)
		}
		total += answer
	}
	switch {
	case total >= ptsdHighMin:
		return total, "high", nil
	case total >= ptsdModerateMin:
		return total, "moderate", nil
	default:
		return total, "low", nil
	}
}
