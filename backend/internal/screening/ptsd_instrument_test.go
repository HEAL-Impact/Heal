package screening

import "testing"

func TestScorePtsd(t *testing.T) {
	tests := []struct {
		name    string
		answers []int
		score   int
		band    string
		wantErr bool
	}{
		{name: "all zero", answers: []int{0, 0, 0, 0, 0, 0, 0, 0}, score: 0, band: "low"},
		{name: "top of low", answers: []int{2, 2, 2, 2, 2, 0, 0, 0}, score: 10, band: "low"},
		{name: "bottom of moderate", answers: []int{2, 2, 2, 2, 2, 1, 0, 0}, score: 11, band: "moderate"},
		{name: "top of moderate", answers: []int{4, 4, 4, 4, 4, 0, 0, 0}, score: 20, band: "moderate"},
		{name: "bottom of high", answers: []int{4, 4, 4, 4, 4, 1, 0, 0}, score: 21, band: "high"},
		{name: "maximum", answers: []int{4, 4, 4, 4, 4, 4, 4, 4}, score: 32, band: "high"},
		{name: "too few answers", answers: []int{1, 1, 1}, wantErr: true},
		{name: "answer above scale", answers: []int{5, 0, 0, 0, 0, 0, 0, 0}, wantErr: true},
		{name: "negative answer", answers: []int{-1, 0, 0, 0, 0, 0, 0, 0}, wantErr: true},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			score, band, err := ScorePtsd(tt.answers)
			if tt.wantErr {
				if err == nil {
					t.Fatalf("expected an error, got score %d band %q", score, band)
				}
				return
			}
			if err != nil {
				t.Fatalf("unexpected error: %v", err)
			}
			if score != tt.score || band != tt.band {
				t.Errorf("got (%d, %q), want (%d, %q)", score, band, tt.score, tt.band)
			}
		})
	}
}
