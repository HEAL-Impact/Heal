package reports

import "testing"

func TestNewCaseCodeIsValid(t *testing.T) {
	for i := 0; i < 200; i++ {
		code, err := NewCaseCode()
		if err != nil {
			t.Fatal(err)
		}
		if !ValidCaseCode(code) {
			t.Fatalf("generated invalid code %q", code)
		}
	}
}

func TestValidCaseCode(t *testing.T) {
	cases := map[string]bool{
		"HEAL-7K2-Q9":  true,
		"HEAL-7K2-Q":   false,
		"HEAL-0K2-Q9":  false, // 0 is excluded
		"HEAL-7I2-Q9":  false, // I is excluded
		"heal-7k2-q9":  false,
		"HEAL-7K2-Q9 ": false,
	}
	for code, want := range cases {
		if got := ValidCaseCode(code); got != want {
			t.Errorf("ValidCaseCode(%q) = %v, want %v", code, got, want)
		}
	}
}

func TestCipherRoundTripAndBinding(t *testing.T) {
	c, err := NewCipher("a-long-test-secret-value")
	if err != nil {
		t.Fatal(err)
	}
	sealed, err := c.Seal([]byte(`{"description":"test"}`), "HEAL-7K2-Q9")
	if err != nil {
		t.Fatal(err)
	}
	plain, err := c.Open(sealed, "HEAL-7K2-Q9")
	if err != nil || string(plain) != `{"description":"test"}` {
		t.Fatalf("round trip failed: %q, %v", plain, err)
	}
	if _, err := c.Open(sealed, "HEAL-ABC-DE"); err == nil {
		t.Fatal("ciphertext opened under a different case code")
	}
}

func TestNewCipherRejectsShortSecret(t *testing.T) {
	if _, err := NewCipher("short"); err == nil {
		t.Fatal("expected an error for a short secret")
	}
}
